import { gitConfig } from './shared';

/**
 * 各代码托管平台的 Star 统计。
 *
 * 构建期（静态导出）拉取一次，结果固化进 HTML。
 * 任一平台拉取失败（CI 无外网、平台限流、超时）时回落到 `SNAPSHOT` 快照值，
 * 保证构建不失败、数字不归零。
 */

export interface PlatformStar {
  key: 'github' | 'gitee' | 'atomgit';
  name: string;
  url: string;
  count: number;
}

export interface StarSummary {
  total: number;
  platforms: PlatformStar[];
  /** 是否全部平台都在构建期拉取成功（false 表示部分或全部用了快照）。 */
  live: boolean;
}

interface PlatformSource {
  key: PlatformStar['key'];
  name: string;
  org: string;
  url: string;
  /** 组织仓库列表接口，用于统计 Star。 */
  api: (org: string) => string;
  /** 单个仓库的贡献者列表接口，用于统计贡献者。 */
  contributorsApi: (org: string, repo: string) => string;
  /** 贡献者主页地址（各平台用户主页路径不同）。 */
  profile: (login: string) => string;
}

/**
 * 平台清单。**数组顺序即全站的展示顺序**：GitHub → AtomGit → Gitee（社区的推荐顺序）。
 * 各平台组织路径不同：GitHub 为 continew-org，Gitee / AtomGit 为 continew。
 * 与 lib/shared.ts 的 getEditOnHostUrl 保持同一口径。
 */
const PLATFORMS: PlatformSource[] = [
  {
    key: 'github',
    name: 'GitHub',
    org: gitConfig.user,
    url: `https://github.com/${gitConfig.user}`,
    api: (org) => `https://api.github.com/orgs/${org}/repos?per_page=100&type=public`,
    contributorsApi: (org, repo) =>
      `https://api.github.com/repos/${org}/${repo}/contributors?per_page=100&anon=1`,
    profile: (login) => `https://github.com/${login}`,
  },
  {
    key: 'atomgit',
    name: 'AtomGit',
    org: 'continew',
    url: 'https://atomgit.com/continew',
    api: (org) => `https://api.atomgit.com/api/v5/orgs/${org}/repos?per_page=100`,
    contributorsApi: (org, repo) =>
      `https://api.atomgit.com/api/v5/repos/${org}/${repo}/contributors`,
    profile: (login) => `https://atomgit.com/${login}`,
  },
  {
    key: 'gitee',
    name: 'Gitee',
    org: 'continew',
    url: 'https://gitee.com/continew',
    api: (org) => `https://gitee.com/api/v5/orgs/${org}/repos?per_page=100`,
    contributorsApi: (org, repo) => `https://gitee.com/api/v5/repos/${org}/${repo}/contributors`,
    profile: (login) => `https://gitee.com/${login}`,
  },
];

/**
 * 快照兜底值（2026-10-08 实测：GitHub 2,768 / Gitee 2,044 / AtomGit 266）。
 * 仅在网络不可达时使用，建议每次发版前核对是否明显过期。
 */
const SNAPSHOT: Record<PlatformStar['key'], number> = {
  github: 2768,
  gitee: 2044,
  atomgit: 266,
};

/**
 * 统一的构建期 JSON 请求：10 秒超时 + 24 小时缓存，失败返回 null 由调用方回落快照。
 * GitHub 未认证限流 60 次/小时，配置 GITHUB_TOKEN 可提高到 5000 次/小时。
 *
 * 同 URL 在**一次构建内只发一次**：组织仓库列表就是个典型例子——统计 Star 要用、
 * 统计贡献者也要用，两个入口互不感知就会把同一个 URL 请求两遍。
 * 缓存的是 Promise 而不是结果，并发调用共享同一次请求，不会有人拿到「还没回来」的 null。
 */
const inflight = new Map<string, Promise<unknown | null>>();

export async function fetchJson(url: string): Promise<unknown | null> {
  let pending = inflight.get(url);
  if (!pending) {
    pending = requestJson(url);
    inflight.set(url, pending);
  }
  return pending;
}

async function requestJson(url: string): Promise<unknown | null> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'User-Agent': 'continew.top',
    };
    if (url.includes('api.github.com') && process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(10_000),
      next: { revalidate: 86_400 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * 组织下的公开仓库列表。
 *
 * 「统计 Star」和「统计贡献者」都要先拿到它，是两个入口、同一份数据；
 * 同 URL 的去重统一由 fetchJson 处理，这里只做类型收敛。
 */
async function fetchOrgRepos(platform: PlatformSource): Promise<unknown[] | null> {
  const data = await fetchJson(platform.api(platform.org));
  return Array.isArray(data) ? data : null;
}

/**
 * Star 汇总结果缓存。
 *
 * 导航栏的星数要在**每个 layout** 里拿到（首页 / 文档 / 博客 / 团队 / 登记用户 …），
 * 不缓存就会把同一套聚合跑上七八遍。fetchJson 已保证同 URL 只请求一次，
 * 这里省掉的是重复的 reduce 与对象构造。
 */
let starSummaryCache: Promise<StarSummary> | null = null;

export function getStarSummary(): Promise<StarSummary> {
  starSummaryCache ??= computeStarSummary();
  return starSummaryCache;
}

async function computeStarSummary(): Promise<StarSummary> {
  const results = await Promise.all(
    PLATFORMS.map(async (platform) => {
      const repos = await fetchOrgRepos(platform);
      const live = repos
        ? (repos as Array<{ stargazers_count?: number }>).reduce(
            (sum, repo) => sum + (repo.stargazers_count ?? 0),
            0,
          )
        : null;
      return {
        platform,
        count: live ?? SNAPSHOT[platform.key],
        ok: live !== null,
      };
    }),
  );

  return {
    total: results.reduce((sum, r) => sum + r.count, 0),
    platforms: results.map((r) => ({
      key: r.platform.key,
      name: r.platform.name,
      url: r.platform.url,
      count: r.count,
    })),
    live: results.every((r) => r.ok),
  };
}

/* --------------------------------- 贡献者统计 -------------------------------- */

export interface ContributorSummary {
  /** 三平台按用户名去重后的贡献者总数。 */
  total: number;
  platforms: PlatformStar[];
  live: boolean;
}

/**
 * 贡献者快照（2026-10-08 实测：GitHub 79 人）。仅在网络不可达时使用。
 * 只记 GitHub：贡献者口径已收敛为单平台，这里没有 Gitee / AtomGit 的值。
 */
const CONTRIBUTOR_SNAPSHOT: Partial<Record<PlatformStar['key'], number>> = {
  github: 79,
};
const CONTRIBUTOR_TOTAL_SNAPSHOT = 79;

/**
 * 镜像同步账号与机器人。Gitee 上存在一个名为「GitHub」的仓库同步账号，
 * 不剔除会把贡献者数字显著抬高。
 */
const BOT_LOGINS = new Set([
  'github',
  'gitee',
  'atomgit',
  'dependabot',
  'renovate',
  'github-actions',
  'actions-user',
  'web-flow',
]);

function isBot(login: string): boolean {
  const n = login.toLowerCase();
  return BOT_LOGINS.has(n) || n.includes('bot') || n.includes('[bot]');
}

interface ContributorLike {
  login?: string;
  name?: string;
  /**
   * 头像字段在各平台接口里名字不统一：GitHub / Gitee 用 `avatar_url`，
   * 部分接口可能用 `avatar` 或 `avatarUrl`。一律兼容，取不到就留空由页面退化展示。
   */
  avatar_url?: string;
  avatar?: string;
  avatarUrl?: string;
  html_url?: string;
  /**
   * Gitee / AtomGit 的贡献者接口还会返回 `email`。
   *
   * ⚠️ 明确不采集、不使用：一是它是个人隐私，出现在公开页面或构建产物里就是事故；
   * 二是有人会想到用它拼 Gravatar 补头像（md5(email)）——那等同于把成员邮箱
   * 间接写进 HTML（哈希可被彩虹表反查），绝不可取。没有头像就退化显示首字母。
   */
  email?: string;
  /** 该仓库内的贡献数（GitHub 口径 = 提交数）。接口可能不返回，缺省按 0 处理。 */
  contributions?: number;
}

/** 单个贡献者（页面展示用）。 */
export interface Contributor {
  /** 平台用户名，保留原始大小写。 */
  login: string;
  /** 头像地址；部分平台接口不返回，可能为空字符串。 */
  avatar: string;
  /** 该平台的个人主页。 */
  url: string;
  platform: PlatformStar['key'];
  /**
   * 该平台组织下的贡献总数（跨仓库累加）。
   *
   * 累加是必要的：同一个人会在 continew-admin / continew-starter 等多个仓库提交，
   * 只取单个仓库会显著低估他的贡献，排序也就排不准。
   */
  contributions: number;
}

/**
 * 并发执行，但限制同时在飞的请求数。
 *
 * 组织下仓库可能有二十来个：一次性 Promise.all 全打出去容易触发平台限流；
 * 而逐个 await 又太慢（构建期累计可达数十秒）。折中取并发 5。
 */
async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const worker = async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

/**
 * 拉取某平台组织下所有仓库的贡献者（平台内按用户名去重，剔除机器人与镜像账号）。
 */
async function fetchPlatformContributors(platform: PlatformSource) {
  const repos = await fetchOrgRepos(platform);
  if (!repos) {
    return { names: new Set<string>(), contributors: [] as Contributor[], ok: false, count: 0 };
  }

  const repoNames = (repos as Array<{ name?: string }>)
    .map((repo) => repo?.name)
    .filter((name): name is string => Boolean(name));

  const lists = await mapLimit(repoNames, 5, async (name) => {
    const list = await fetchJson(platform.contributorsApi(platform.org, name));
    return Array.isArray(list) ? (list as ContributorLike[]) : [];
  });

  const byLogin = new Map<string, Contributor>();
  for (const list of lists) {
    for (const c of list) {
      const login = (c?.login ?? c?.name ?? '').toString().trim();
      if (!login || isBot(login)) continue;
      const key = login.toLowerCase();
      const count = c?.contributions ?? 0;

      const existing = byLogin.get(key);
      if (existing) {
        // 同一人在多个仓库都有提交：累加，否则贡献度被严重低估、排序也就排不准
        existing.contributions += count;
        // 头像可能只有部分仓库的接口返回，取到就补上
        if (!existing.avatar) {
          existing.avatar = c?.avatar_url ?? c?.avatar ?? c?.avatarUrl ?? '';
        }
        continue;
      }

      byLogin.set(key, {
        login,
        avatar: c?.avatar_url ?? c?.avatar ?? c?.avatarUrl ?? '',
        url: c?.html_url ?? platform.profile(login),
        platform: platform.key,
        contributions: count,
      });
    }
  }

  return {
    names: new Set(byLogin.keys()),
    contributors: [...byLogin.values()],
    ok: byLogin.size > 0,
    count: byLogin.size,
  };
}

/**
 * 贡献者只从 GitHub 拉取（Star 统计仍用上面全部三个平台）。
 *
 * 各平台的仓库互为镜像，而 **AtomGit 的贡献者列表是跨平台汇总的**——里面大量账号
 * 并不属于 AtomGit，直接并入会显著抬高人数（实测 AtomGit 单项就有 64 人）。
 * GitHub 的 contributors 是该仓库的真实提交者，作为口径最可靠。
 *
 * 代价：只在 Gitee / AtomGit 提交过的贡献者会缺席。这是当前公开接口下最诚实的取舍。
 */
const CONTRIBUTOR_PLATFORMS = PLATFORMS.filter((platform) => platform.key === 'github');

/**
 * 平台贡献者拉取结果缓存。
 *
 * 一个页面常常既要统计数字又要名单（`getContributorSummary` + `getContributorList`），
 * 二者底层是同一批请求。这里缓存 Promise，保证构建期只真正拉一次——
 * 否则网络不通时会把超时时间翻倍（每个请求最多 10 秒 × 分批并发）。
 */
let platformContributorsCache: Promise<Awaited<ReturnType<typeof fetchPlatformContributors>>[]> | null =
  null;

function fetchAllPlatformContributors() {
  platformContributorsCache ??= Promise.all(
    CONTRIBUTOR_PLATFORMS.map(fetchPlatformContributors),
  ).then((results) => {
      const failed = results
        .map((r, i) => (r.ok ? null : CONTRIBUTOR_PLATFORMS[i].name))
        .filter((name): name is string => Boolean(name));
      if (failed.length > 0) {
        // 构建日志里留痕：否则部分平台失败时只会表现为「数字偏小」，很难排查
        console.warn(
          `[site-stats] 贡献者拉取失败的平台：${failed.join('、')}；已用其余平台数据或快照兜底。`,
        );
      }
      return results;
    },
  );
  return platformContributorsCache;
}

/**
 * 贡献者统计（数据源见 CONTRIBUTOR_PLATFORMS，目前只取 GitHub）。
 *
 * 口径：拉取组织下所有仓库的贡献者，按用户名（小写）去重，剔除镜像同步账号与机器人。
 *
 * 局限：只统计 GitHub，因此仅在 Gitee / AtomGit 提交过的贡献者会缺席。
 */
export async function getContributorSummary(): Promise<ContributorSummary> {
  const results = await fetchAllPlatformContributors();

  /*
   * 只有**全部**平台都失败才回落到快照。
   *
   * 早期实现是「任一平台失败就整体回落」，结果是国内网络访问 GitHub API 超时，
   * 就把 Gitee / AtomGit 拉到的真实数据也一起丢掉了 —— 一个平台不通不该拖垮全部。
   */
  if (results.every((r) => !r.ok)) {
    return {
      total: CONTRIBUTOR_TOTAL_SNAPSHOT,
      platforms: CONTRIBUTOR_PLATFORMS.map((p) => ({
        key: p.key,
        name: p.name,
        url: p.url,
        count: CONTRIBUTOR_SNAPSHOT[p.key] ?? 0,
      })),
      live: false,
    };
  }

  // names 已是平台内去重且剔除机器人的小写用户名
  const union = new Set<string>();
  for (const r of results) {
    for (const n of r.names) union.add(n);
  }

  return {
    total: union.size,
    platforms: CONTRIBUTOR_PLATFORMS.map((p, i) => ({
      key: p.key,
      name: p.name,
      url: p.url,
      // 拉取失败的平台用快照补位，避免明细里出现 0
      count: results[i].ok ? results[i].count : (CONTRIBUTOR_SNAPSHOT[p.key] ?? 0),
    })),
    live: results.every((r) => r.ok),
  };
}

/**
 * 三平台贡献者名单，供页面「社区贡献者」头像墙渲染。
 *
 * 与 `getContributorSummary` 的区别：后者只给统计数字，这里给出具体的人
 * （头像 + 个人主页）。
 *
 * 跨平台去重已随数据源收敛为单平台而不再需要；同一用户名只保留一条。
 *
 * 拉取失败时**才**返回空名单（live: false）：页面据此不渲染头像墙，
 * 避免出现一面空白墙或把错误信息暴露给访问者。
 * 注意判定是「全部平台都失败」——部分平台成功时仍返回已拿到的名单。
 */
export async function getContributorList(): Promise<{
  list: Contributor[];
  live: boolean;
}> {
  const results = await fetchAllPlatformContributors();

  if (results.every((r) => !r.ok)) return { list: [], live: false };

  const byLogin = new Map<string, Contributor>();
  for (const result of results) {
    for (const contributor of result.contributors) {
      const key = contributor.login.toLowerCase();
      if (!byLogin.has(key)) byLogin.set(key, contributor);
    }
  }

  /*
   * 排序：按贡献度（提交数）降序，同分再按用户名。
   *
   * 早期是「有头像的排前面 + 用户名排序」，理由是不让头像与首字母方块交错。
   * 但那是用视觉整齐换掉了信息——读者真正想知道的是「谁做了多少」。
   * 改按贡献度降序后，排在前面的天然是活跃贡献者（他们也基本都有头像），
   * 视觉与信息两头都占住了。
   */
  const list = [...byLogin.values()].sort(
    (a, b) => b.contributions - a.contributions || a.login.localeCompare(b.login),
  );

  return {
    list,
    live: results.every((r) => r.ok),
  };
}
