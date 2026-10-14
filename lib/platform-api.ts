import { gitConfig } from './shared';

/**
 * 各代码托管平台的公共数据层：平台注册表、构建期 JSON 请求、并发控制。
 *
 * 单独成模块是因为 Star 统计（lib/site-stats.ts）与社区活动统计（lib/repo-activity.ts）
 * 打的是同一批平台接口。而「同一 URL 在一次构建内只请求一次」这条约定必须只有一份实现：
 * 两个模块各写一套的话，组织仓库列表会被请求两遍——未认证限流只有 60 次/小时，
 * 重复请求不是浪费几毫秒，是直接把额度打满、数字回落快照。
 */

export type PlatformKey = 'github' | 'gitee' | 'atomgit';

export interface PlatformSource {
  key: PlatformKey;
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

/*
 * 各平台组织路径不同：GitHub 为 continew-org，Gitee / AtomGit 为 continew。
 * 与 lib/shared.ts 的 getEditOnHostUrl 保持同一口径。
 */
const github: PlatformSource = {
  key: 'github',
  name: 'GitHub',
  org: gitConfig.user,
  url: `https://github.com/${gitConfig.user}`,
  api: (org) => `https://api.github.com/orgs/${org}/repos?per_page=100&type=public`,
  contributorsApi: (org, repo) =>
    `https://api.github.com/repos/${org}/${repo}/contributors?per_page=100&anon=1`,
  profile: (login) => `https://github.com/${login}`,
};

const atomgit: PlatformSource = {
  key: 'atomgit',
  name: 'AtomGit',
  org: 'continew',
  url: 'https://atomgit.com/continew',
  api: (org) => `https://api.atomgit.com/api/v5/orgs/${org}/repos?per_page=100`,
  contributorsApi: (org, repo) => `https://api.atomgit.com/api/v5/repos/${org}/${repo}/contributors`,
  profile: (login) => `https://atomgit.com/${login}`,
};

const gitee: PlatformSource = {
  key: 'gitee',
  name: 'Gitee',
  org: 'continew',
  url: 'https://gitee.com/continew',
  api: (org) => `https://gitee.com/api/v5/orgs/${org}/repos?per_page=100`,
  contributorsApi: (org, repo) => `https://gitee.com/api/v5/repos/${org}/${repo}/contributors`,
  profile: (login) => `https://gitee.com/${login}`,
};

/**
 * 平台清单。**数组顺序即全站的展示顺序**：GitHub → AtomGit → Gitee（社区的推荐顺序）。
 */
export const PLATFORMS: PlatformSource[] = [github, atomgit, gitee];

export { github as githubPlatform };

/**
 * 可重试的失败与「确实拿不到」必须分开：前者重试一次可能就好了，
 * 后者重试只是在烧限流额度、把构建时间拉长。
 *
 * - 5xx、网络错误、超时：典型的瞬时故障；
 * - 403 / 429：GitHub 的**次级限流**就是这两个码（并发稍高就会触发，
 *   并带 `Retry-After` 提示）。它和「权限不足」共用 403，但本项目全部是
 *   读公开数据，权限类 403 在这里不会出现——重试两次的代价远小于图表整块消失。
 */
const RETRYABLE = Symbol('retryable');

function isRetryableStatus(status: number): boolean {
  return status >= 500 || status === 403 || status === 429;
}

/**
 * TLS 证书校验失败的错误码。
 *
 * 这类失败**重试一定没用**：证书链不会因为同一个进程里再试一次就变好。
 * 典型场景是本地装了 TLS 拦截代理（根证书不在 Node 自带的 CA 库里）或部署机缺根证书。
 * 不区分出来的话，每个 URL 会白重试 2 次——本地开发时实测 3 个 URL 刷出 9 条
 * `TypeError: fetch failed`，看着像代码坏了，其实是环境问题。
 */
const CERT_ERROR_CODES = new Set([
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
  'SELF_SIGNED_CERT_IN_CHAIN',
  'DEPTH_ZERO_SELF_SIGNED_CERT',
  'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
  'CERT_HAS_EXPIRED',
]);

/**
 * 判断一次网络异常是否值得重试。
 *
 * 错误码藏在 `cause` 链里（`TypeError: fetch failed` → `Error: unable to verify…`
 * → `{ code }`），所以沿着 cause 往下找几层，而不是只看最外层。
 */
function isRetryableError(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; current && depth < 5; depth++) {
    const code = (current as { code?: unknown }).code;
    if (typeof code === 'string' && CERT_ERROR_CODES.has(code)) return false;
    current = (current as { cause?: unknown }).cause;
  }
  return true;
}

/** 一次请求的间隔基数，重试时按次数线性退避。 */
const RETRY_DELAY_MS = 400;

export interface FetchJsonOptions {
  /**
   * 请求的 Accept。部分接口靠它切换响应形态（stargazers 要 `...star+json` 才有 `starred_at`），
   * 因此它参与缓存键——同一个 URL 用不同 Accept 拿到的结构不同，不能共享同一次请求。
   */
  accept?: string;
  /** 可重试失败的额外尝试次数，默认 0（沿用原有的一次性语义）。 */
  retries?: number;
}

/**
 * 统一的构建期 JSON 请求：10 秒超时 + 24 小时缓存，失败返回 null 由调用方自行降级。
 * GitHub 未认证限流 60 次/小时，配置 GITHUB_TOKEN 可提高到 5000 次/小时。
 *
 * 同 URL 在**一次构建内只发一次**：组织仓库列表就是个典型例子——统计 Star 要用、
 * 统计贡献者要用、活动统计也要用，几个入口互不感知就会把同一个 URL 请求好几遍。
 * 缓存的是 Promise 而不是结果，并发调用共享同一次请求，不会有人拿到「还没回来」的 null。
 *
 * 重试写在缓存内部（而不是包一层）：这样缓存里存的是「重试完的最终结果」，
 * 否则第一次失败被缓存住，后面再调用只会拿到同一个失败的缓存。
 */
const inflight = new Map<string, Promise<unknown>>();

export async function fetchJson(url: string, options: FetchJsonOptions = {}): Promise<unknown> {
  const accept = options.accept ?? 'application/json';
  const key = `${accept} ${url}`;
  let pending = inflight.get(key);
  if (!pending) {
    pending = requestJson(url, accept, options.retries ?? 0);
    inflight.set(key, pending);
  }
  return pending;
}

async function requestJson(url: string, accept: string, retries: number): Promise<unknown> {
  for (let attempt = 0; ; attempt++) {
    const result = await attemptJson(url, accept);
    if (result !== RETRYABLE) return result;
    if (attempt >= retries) return null;
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1)));
  }
}

async function attemptJson(url: string, accept: string): Promise<unknown | typeof RETRYABLE> {
  try {
    const headers: Record<string, string> = {
      Accept: accept,
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
    if (!res.ok) return isRetryableStatus(res.status) ? RETRYABLE : null;
    return await res.json();
  } catch (error) {
    return isRetryableError(error) ? RETRYABLE : null;
  }
}

/**
 * 组织下的公开仓库列表。
 *
 * 「统计 Star」「统计贡献者」「统计社区活动」都要先拿到它，是三个入口、同一份数据；
 * 同 URL 的去重统一由 fetchJson 处理，这里只做类型收敛。
 */
export async function getOrgRepos(platform: PlatformSource): Promise<unknown[] | null> {
  const data = await fetchJson(platform.api(platform.org));
  return Array.isArray(data) ? data : null;
}

/**
 * GitHub 组织仓库的元数据（只声明本项目真正读取的字段）。
 *
 * 组织仓库列表接口里另外两个字段是**坑**，将来想加指标时留意：
 * - `open_issues_count` 同时包含 Issue 与 Pull Request，直接标成「待处理 Issue」会把数字说小；
 * - 想拿关注者数**不要用 `watchers_count`**——它是 `stargazers_count` 的别名，
 *   取它等于把同一个 Star 数在页面上显示两遍；真实的关注者字段 `subscribers_count`
 *   在这个列表接口里**并不返回**，得逐仓库单独请求。
 */
export interface OrgRepoMeta {
  name: string;
  archived: boolean;
  fork: boolean;
  /**
   * 仓库体积（KB）。**空仓库为 0**，而空仓库没有默认分支，
   * `/commits` 之类的接口会返回 409——用它可以提前跳过，避免把 409
   * 误报成「拉取失败」。
   */
  size: number;
}

/**
 * GitHub 组织公开仓库的原始元数据。
 *
 * 与 Star 统计、贡献者统计共用同一次请求（fetchJson 按 URL 去重），
 * 所以「仓库概览」这类新指标不产生额外调用。
 */
export async function getGithubRepos(): Promise<OrgRepoMeta[] | null> {
  const repos = await getOrgRepos(github);
  if (!repos) return null;
  return repos.filter(
    (repo): repo is OrgRepoMeta =>
      typeof repo === 'object' && repo !== null && typeof (repo as OrgRepoMeta).name === 'string',
  );
}

/**
 * 并发执行，但限制同时在飞的请求数。
 *
 * 组织下仓库可能有二十来个：一次性 Promise.all 全打出去容易触发平台限流；
 * 而逐个 await 又太慢（构建期累计可达数十秒）。折中取并发 5。
 *
 * 每个 worker 领一个下标、跑完再领下一个：用递归续跑代替 while + await，
 * 并发上限仍由 worker 数封顶，行为与逐个领取完全一致。
 */
export async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const worker = async (): Promise<void> => {
    const index = cursor++;
    if (index >= items.length) return;
    results[index] = await fn(items[index]);
    await worker();
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
