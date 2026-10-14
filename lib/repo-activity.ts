import { fetchJson, getGithubRepos, githubPlatform, mapLimit } from './platform-api';

/**
 * 社区活动统计：GitHub Star 累计趋势、提交热力图、活跃贡献者。
 *
 * 与 lib/site-stats.ts 的分工：那里管「有多少」（Star 总数、贡献者总数），
 * 这里管「动得多快」（增长曲线、提交节奏、还在提交的人）。
 *
 * 全部在构建期拉取，结果固化进 HTML。任一数据拿不到就标记 live: false，
 * 由页面决定不渲染——**绝不画一条假曲线、也不显示错误信息给访问者**。
 */

const DAY_MS = 86_400_000;

/** 活动窗口：过去一年。热力图与「近一年贡献者」取自同一批提交记录。 */
const ACTIVITY_WINDOW_DAYS = 365;

/** 「活跃贡献者」的判定窗口。 */
const ACTIVE_WINDOW_DAYS = 90;

/** 提交列表每页条数（GitHub 上限 100）。 */
const COMMITS_PER_PAGE = 100;

/**
 * 单仓库最多翻页数。
 *
 * 现在要拉**全历史**：实测 continew-admin 一个仓库就有 1266 次提交（13 页），
 * 整组织 32 页。上限按「再活跃也不可能超过」来定；真撞到上限说明分页逻辑
 * 或窗口口径出了问题，此时宁可少算，也不要让构建无限翻页。
 */
const MAX_COMMIT_PAGES = 30;

/**
 * 提交历史的起点：2022-12-08 的首次提交（见 `lib/timeline.ts` 的 `maintenanceStartDate`）。
 * 往前多留几天是给时区与日期边界留余量，多抓到的那几条不会落进任何统计窗口。
 */
const HISTORY_START = '2022-12-01';

/** stargazers 必须带这个 Accept 才有 `starred_at`，否则只返回用户对象。 */
const STAR_MEDIA_TYPE = 'application/vnd.github.star+json';

/**
 * 翻页并发批大小。
 *
 * 逐页串行翻是最慢的一环：continew-admin 一个仓库就有 22 页，
 * 按每页几百毫秒算，光它一个就占掉近十秒。stargazers 是按时间升序排的，
 * 但**页与页之间没有依赖**——只有「某一页不满 100 条」才说明到底了。
 *
 * 所以先单独取第 1 页（小仓库一次就结束，不浪费请求），确认满页后再按批并发。
 * 批大小取 4：末批最多浪费 3 个请求，换到的并发度足够把链路的吞吐喂满
 * （实测本机代理的吞吐上限约 5 请求/秒，并发再往上加只是徒增次级限流风险）。
 */
const PAGE_BATCH = 4;

/**
 * 日期一律按 **UTC** 归组。
 *
 * GitHub 接口返回的就是 UTC 时间戳，按 UTC 切天与接口口径一致；
 * 若按构建机本地时区切，同一批数据在开发者机器（CST）和 CI 容器（UTC）上
 * 会算出不同结果——同一份代码在两地构建出不同的图，是最难排查的那类问题。
 */
function toDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** 今天（UTC）的 `YYYY-MM-DD`。 */
function today(): string {
  return toDay(new Date());
}

/** `YYYY-MM-DD` 往前推 n 天的日期。 */
function daysBefore(day: string, n: number): string {
  return toDay(new Date(Date.parse(`${day}T00:00:00Z`) - n * DAY_MS));
}

/* ------------------------------ GitHub Star 趋势 ----------------------------- */

export interface StarTrendPoint {
  date: string;
  /** 截至当日的累计 Star 数。 */
  count: number;
}

export interface StarTrend {
  /** 从首个 Star 的前一天（0）到今天，逐日累计。 */
  points: StarTrendPoint[];
  /** 当前累计（应与导航栏的 GitHub 数字一致）。 */
  total: number;
  /** 近 30 天新增。 */
  last30: number;
  live: boolean;
}

/**
 * 重建 GitHub 组织累计 Star 曲线。
 *
 * ## 为什么要逐页翻 stargazers
 *
 * GitHub 没有 Star 历史接口：`/stats/*` 那一族里没有 star_history，
 * 仓库接口只给当前值。唯一能拿到时间轴的地方是 stargazers 列表——
 * 带上 `application/vnd.github.star+json` 时每条会多一个 `starred_at`，
 * 按日累加即得真实的累计曲线（实测组织共 33 页）。
 *
 * 该接口**要求认证**（未认证直接 401，与 media type 无关），所以这条链路
 * 强依赖构建期注入 GITHUB_TOKEN；拿不到就 live: false，页面不画图。
 *
 * ## 口径
 *
 * - 覆盖**组织全部公开仓库**（含归档），与 `getStarSummary` 的 GitHub 项同源，
 *   这样曲线终点与导航栏的星数是同一个数；
 * - 曲线**只增不减**：stargazers 列表只有「当前还星着的人」，取消 Star 无法还原。
 *   这是 star-history 类工具的通行口径，不是本项目的缺陷，页面图注里要讲清楚。
 */
export async function getGithubStarTrend(): Promise<StarTrend> {
  const empty: StarTrend = { points: [], total: 0, last30: 0, live: false };

  const repos = await getGithubRepos();
  if (!repos || repos.length === 0) return empty;

  // 每个仓库内部必须按页序取（批内可并发），仓库之间并发；5 是经验值：
  // 再多也不会更快（吞吐由链路决定），只会更接近 GitHub 的次级限流。
  const perRepo = await mapLimit(repos, 5, async (repo) => fetchStargazerDays(repo.name));

  if (perRepo.every((days) => days === null)) {
    console.warn('[repo-activity] Star 历史拉取失败：全部仓库都没拿到 stargazers。');
    return empty;
  }

  const failed = perRepo.filter((days) => days === null).length;
  if (failed > 0) {
    console.warn(
      `[repo-activity] Star 历史有 ${failed} 个仓库拉取失败；曲线会略低于实际值。`,
    );
  }

  const starredPerDay = new Map<string, number>();
  for (const days of perRepo) {
    for (const day of days ?? []) {
      starredPerDay.set(day, (starredPerDay.get(day) ?? 0) + 1);
    }
  }
  if (starredPerDay.size === 0) return empty;

  const firstDay = [...starredPerDay.keys()].sort()[0];
  const end = today();

  const points: StarTrendPoint[] = [
    // 前置一个 0 点：曲线与面积从基线起笔，否则首日直接是 1，面积图左下角会缺一角
    { date: daysBefore(firstDay, 1), count: 0 },
  ];
  let running = 0;
  for (let day = firstDay; day <= end; day = daysBefore(day, -1)) {
    running += starredPerDay.get(day) ?? 0;
    points.push({ date: day, count: running });
  }

  const cutoff = daysBefore(end, 30);
  const atCutoff = points.find((point) => point.date >= cutoff)?.count ?? running;

  return { points, total: running, last30: running - atCutoff, live: true };
}

/** 单个仓库的全部 Star 日期（含重复，一天可被多人 Star）。全失败返回 null。 */
async function fetchStargazerDays(repo: string): Promise<string[] | null> {
  const days: string[] = [];
  const pageUrl = (page: number) =>
    `https://api.github.com/repos/${githubPlatform.org}/${repo}/stargazers?per_page=100&page=${page}`;

  /** 收一页数据；返回 true 表示这页不满、后面没有了。 */
  const collect = (data: unknown): boolean => {
    if (!Array.isArray(data)) return true;
    for (const item of data as Array<{ starred_at?: string }>) {
      if (item?.starred_at) days.push(item.starred_at.slice(0, 10));
    }
    return data.length < 100;
  };

  const first = await fetchJson(pageUrl(1), { accept: STAR_MEDIA_TYPE, retries: 2 });
  if (!Array.isArray(first)) return null;
  if (collect(first)) return days;

  for (let base = 2; ; base += PAGE_BATCH) {
    const batch = await Promise.all(
      Array.from({ length: PAGE_BATCH }, (_, offset) =>
        fetchJson(pageUrl(base + offset), { accept: STAR_MEDIA_TYPE, retries: 2 }),
      ),
    );
    // 必须按页序处理：某一页失败或不满就得停下，否则会把后面的页错位拼进来
    for (const data of batch) {
      if (collect(data)) return days;
    }
  }
}

/* --------------------------------- 提交热力图 -------------------------------- */

export interface HeatmapCell {
  date: string;
  /** null 表示落在统计窗口之外（首个周日到窗口起点之间、以及窗口末尾之后的补齐格）。 */
  count: number | null;
}

export interface HeatmapMonthLabel {
  /** 该月份从第几列开始。 */
  column: number;
  label: string;
}

/** 一个统计窗口的热力图，连同这个窗口自己的读数。 */
export interface HeatmapWindow {
  /** 稳定标识：`recent` 或四位年份，用作切换控件的 key。 */
  key: string;
  /** 控件上的显示名。 */
  label: string;
  /** 窗口起止（含）。 */
  start: string;
  end: string;
  /** 按周分列，每列 7 天（周日 → 周六）。 */
  columns: HeatmapCell[][];
  monthLabels: HeatmapMonthLabel[];
  /** 窗口内提交总数。 */
  total: number;
  /** 有提交的天数，用来判断「节奏是密集还是零星」。 */
  activeDays: number;
  bestDay: { date: string; count: number } | null;
  bestWeek: { date: string; count: number } | null;
  /** 窗口内最长的一段「每周都有提交」的连续周数。 */
  longestStreakWeeks: number;
  /** 单日最大提交数，色阶按它分档。 */
  max: number;
}

export interface CommitActivityData {
  /** 窗口列表，**第一个是默认展示的**（近一年），其后按年份由新到旧。 */
  windows: HeatmapWindow[];
  /**
   * 近 30 天提交数。
   *
   * 它是**相对今天**的指标，不属于任何一个窗口——放进某个窗口里，
   * 切到 2024 年就会变成「2024 年 12 月那 30 天」，与「最近的势头」完全是两回事。
   */
  last30: number;
  live: boolean;
}

/** 单条提交记录（只保留画图与计数需要的两个字段）。 */
interface CommitRecord {
  date: string;
  login: string | null;
}

/**
 * 提交记录缓存。
 *
 * 热力图与活跃贡献者取自**同一批请求**，一个页面常常两处都要。
 * 不缓存 Promise 就会把同一年的提交列表翻两遍——那是几十次请求的浪费。
 */
let commitLogCache: Promise<CommitRecord[] | null> | null = null;

function getCommitLog(): Promise<CommitRecord[] | null> {
  commitLogCache ??= fetchCommitLog();
  return commitLogCache;
}

/**
 * 拉取组织过去一年的提交记录。
 *
 * ## 为什么不用 `stats/commit_activity`
 *
 * 那个接口一次请求就能拿到 52 周按日计数，看起来很划算，但它有个致命问题：
 * GitHub 对**没有缓存过统计的仓库**会返回 202 并让你稍后重试，而统计是懒计算的，
 * 冷仓库可能长时间不 ready。实测本地探针里 8 个仓库只有 1 个当场返回数据，
 * 其余 4 次重试全部耗尽——CI 冷环境下等于热力图只有零星几个仓库的数据。
 *
 * `/commits?since=` 没有这个问题：直接返回真实提交列表，分页稳定。
 * 代价是要翻页（实测整组织全历史 32 页），但换来的是「一定有数据」。
 *
 * 口径：**排除 fork、归档与空仓库**。
 * - 归档仓库（如 continew-admin-ui-arco）已经不再代表社区活动，算进来只会让热力图显得比实际热闹；
 * - 空仓库（`size` 为 0，如 continew-cloud）没有默认分支，`/commits` 返回 409，
 *   不提前跳过就会被记成「拉取失败」，在构建日志里留下一条永远存在的假警报。
 *
 * 注意这与 Star 曲线「含归档仓库」的口径不同：Star 要跟导航栏的总数对齐，
 * 活动则只反映还在写的代码。两处的取舍理由见各自注释。
 *
 * 拉的是**全历史**而不是近一年：热力图的年份切换要按年切片，一年一次请求是省不掉的，
 * 而多出来的 24 页换到的是「读者能自己回看每一年」。
 */
async function fetchCommitLog(): Promise<CommitRecord[] | null> {
  const repos = await getGithubRepos();
  if (!repos || repos.length === 0) return null;

  const active = repos.filter((repo) => !repo.archived && !repo.fork && repo.size > 0);
  if (active.length === 0) return null;

  const since = `${HISTORY_START}T00:00:00Z`;
  const perRepo = await mapLimit(active, 4, async (repo) => fetchRepoCommits(repo.name, since));

  if (perRepo.every((records) => records === null)) {
    console.warn('[repo-activity] 提交记录拉取失败：全部仓库都没拿到 commits。');
    return null;
  }

  const failed = perRepo.filter((records) => records === null).length;
  if (failed > 0) {
    // 留痕：部分仓库失败只会表现为「热力图偏淡」，不查日志根本看不出来
    console.warn(
      `[repo-activity] 提交记录有 ${failed} 个仓库拉取失败；热力图与活跃贡献者会低于实际值。`,
    );
  }

  return perRepo.flatMap((records) => records ?? []);
}

/** 单个仓库窗口内的提交记录。全失败返回 null（空仓库返回 409，视作 0 条）。 */
async function fetchRepoCommits(repo: string, since: string): Promise<CommitRecord[] | null> {
  const records: CommitRecord[] = [];
  for (let page = 1; page <= MAX_COMMIT_PAGES; page++) {
    const data = await fetchJson(
      `https://api.github.com/repos/${githubPlatform.org}/${repo}/commits?since=${since}&per_page=${COMMITS_PER_PAGE}&page=${page}`,
      { retries: 2 },
    );
    if (!Array.isArray(data)) return page === 1 ? null : records;
    for (const item of data as Array<{
      commit?: { author?: { date?: string } };
      author?: { login?: string } | null;
    }>) {
      const date = item?.commit?.author?.date;
      if (!date) continue;
      records.push({ date: date.slice(0, 10), login: item?.author?.login ?? null });
    }
    if (data.length < COMMITS_PER_PAGE) return records;
  }
  return records;
}

/**
 * 提交热力图的全部统计窗口：近一年 + 每个完整的过往年份。
 *
 * 为什么要按年切片而不是只给近一年：`/timeline` 是一页讲成长轨迹的页面，
 * 只给 12 个月的话，2024 年那段最密集的开发期在页面上完全看不到。
 * 代价是提交记录要拉全历史（32 页而不是 8 页），换到的是读者能自己回看每一年。
 *
 * 窗口列表由**数据**决定，不写死年份：项目从 2022-12 开始、今年是 2026，
 * 就得到 近一年 / 2025 / 2024 / 2023 / 2022。明年不用改代码。
 */
export async function getCommitActivity(): Promise<CommitActivityData> {
  const log = await getCommitLog();
  if (!log) return { windows: [], last30: 0, live: false };

  const perDay = new Map<string, number>();
  for (const record of log) {
    perDay.set(record.date, (perDay.get(record.date) ?? 0) + 1);
  }
  if (perDay.size === 0) return { windows: [], last30: 0, live: false };

  const end = today();
  const last30Cutoff = daysBefore(end, 30);
  let last30 = 0;
  for (const [date, count] of perDay) {
    if (date >= last30Cutoff) last30 += count;
  }

  const windows: HeatmapWindow[] = [
    buildWindow('recent', '近一年', daysBefore(end, ACTIVITY_WINDOW_DAYS - 1), end, perDay),
  ];

  const firstDay = [...perDay.keys()].sort()[0];
  const firstYear = Number(firstDay.slice(0, 4));
  const currentYear = Number(end.slice(0, 4));

  /*
   * 从**去年**往前列，当年不单独成窗口。
   *
   * 当年的窗口是「1 月 1 日 → 今天」，而「近一年」是「今天往前 365 天 → 今天」——
   * 后者必然完整包含前者（今天减 365 天最早也只是去年 1 月上旬），所以当年那一格
   * 是近一年的子集：切过去只是把同一批数据换个起点看，纯属噪音。
   * 只有完整的过往年份才值得单独一格。
   */
  for (let year = currentYear - 1; year >= firstYear; year--) {
    /*
     * 首个年份从**第一次提交**起算，不是 1 月 1 日。
     *
     * 项目 2022-12-08 才初始化，若从 2022-01-01 起算，热力图会凭空多出约 48 列
     * 「零提交」——读者读到的是「那年很冷清」，而事实是那年项目还不存在。
     * 起始年份之外，这个 clamp 不生效（`${year}-01-01` 已大于首日）。
     */
    const yearStart = `${year}-01-01`;
    const start = yearStart < firstDay ? firstDay : yearStart;
    windows.push(buildWindow(String(year), `${year} 年`, start, `${year}-12-31`, perDay));
  }

  return { windows, last30, live: true };
}

/**
 * 构造一个窗口的热力图。
 *
 * 网格按 GitHub 自己的排法：**列为周、行为星期**，第一列从窗口起点所在的那个
 * 周日开始，最后一列是包含窗口终点的那一周。窗口之外（起点到首个周日之间、
 * 终点之后）的格子填 null，与「当天没有提交」区分开——否则热力图边上会
 * 凭空多出几天「零提交」。
 */
function buildWindow(
  key: string,
  label: string,
  start: string,
  end: string,
  perDay: Map<string, number>,
): HeatmapWindow {
  // 首列从窗口起点所在周的周日开始（UTC 的 getUTCDay：0 = 周日）
  const startDate = new Date(`${start}T00:00:00Z`);
  const firstSunday = daysBefore(start, startDate.getUTCDay());

  const columns: HeatmapCell[][] = [];
  for (let weekStart = firstSunday; weekStart <= end; weekStart = daysBefore(weekStart, -7)) {
    const column: HeatmapCell[] = [];
    for (let offset = 0; offset < 7; offset++) {
      const date = daysBefore(weekStart, -offset);
      column.push(
        date < start || date > end ? { date, count: null } : { date, count: perDay.get(date) ?? 0 },
      );
    }
    columns.push(column);
  }

  const inWindow = columns.flat().filter((cell) => cell.count !== null);
  const totals = columns.map((column) => column.reduce((sum, cell) => sum + (cell.count ?? 0), 0));
  const best = inWindow.reduce<HeatmapCell | null>(
    (top, cell) => ((cell.count ?? 0) > (top?.count ?? 0) ? cell : top),
    null,
  );
  const bestWeekIndex = totals.reduce((top, value, index) => (value > totals[top] ? index : top), 0);

  return {
    key,
    label,
    start,
    end,
    columns,
    monthLabels: buildMonthLabels(columns),
    total: inWindow.reduce((sum, cell) => sum + (cell.count ?? 0), 0),
    activeDays: inWindow.filter((cell) => (cell.count ?? 0) > 0).length,
    bestDay: best && (best.count ?? 0) > 0 ? { date: best.date, count: best.count ?? 0 } : null,
    bestWeek:
      totals[bestWeekIndex] > 0
        ? { date: columns[bestWeekIndex][0].date, count: totals[bestWeekIndex] }
        : null,
    longestStreakWeeks: longestStreak(totals),
    max: inWindow.reduce((top, cell) => Math.max(top, cell.count ?? 0), 0),
  };
}

/**
 * 月份标签之间至少隔几列。
 *
 * 一个「12 月」标签约占 2.1 列的宽度（字号 11、列距 14），留 3 列才不挤。
 */
const MIN_MONTH_LABEL_GAP = 3;

/**
 * 月份标签：列首日跨月的那一列标上月名。
 *
 * 按自然年切片时，首列往往是**上一年 12 月的那一天**所在的补位列（比如 2024 年的
 * 首列是 2023-12-31），它只含一两天却占掉一个「12 月」标签，紧接着第二列就是
 * 「1 月」——两段文字直接叠在一起，渲染出来是「121 月」。
 *
 * 所以标签要与**下一个**标签保持最小列距，挤在一起时丢掉前一个：
 * 那个只代表一两天补位日的标签，信息量本来就最低，丢它比丢「1 月」划算。
 * 这不是在凑数——一个月份少了标签仍能从相邻标签与格子位置读出来，
 * 两段文字叠在一起则是纯粹的乱码。
 */
function buildMonthLabels(columns: HeatmapCell[][]): HeatmapMonthLabel[] {
  const starts: HeatmapMonthLabel[] = [];
  let lastMonth = '';
  columns.forEach((column, index) => {
    const month = column[0].date.slice(0, 7);
    if (month !== lastMonth) {
      starts.push({ column: index, label: `${Number(month.slice(5, 7))} 月` });
      lastMonth = month;
    }
  });

  return starts.filter((item, index) => {
    const next = starts[index + 1];
    return !next || next.column - item.column >= MIN_MONTH_LABEL_GAP;
  });
}

/**
 * 窗口内最长的一段「每周都有提交」的连续周数。
 *
 * 不用「从今天往回数的当前连续」：那个指标只在最近的窗口里说得通，
 * 切到 2024 年会得到一个没有解释力的数字，而且年份之间也没法横向对比。
 * 取最长一段则每个窗口口径一致，读者能直接比较「哪一年更持续」。
 */
function longestStreak(totals: number[]): number {
  let best = 0;
  let current = 0;
  for (const total of totals) {
    current = total > 0 ? current + 1 : 0;
    if (current > best) best = current;
  }
  return best;
}

/* -------------------------------- 活跃贡献者 -------------------------------- */

export interface ActiveContributors {
  /** 近 90 天提交过代码的去重人数。 */
  recent: number;
  /** 近一年出现过的人数，与 recent 并列才说明「人还在不在」。 */
  yearly: number;
  live: boolean;
}

/**
 * 活跃贡献者。
 *
 * 与 `getContributorSummary` 的差别：那个给的是**历史累计**贡献者数（79 人），
 * 是「有多少人来过」；这里给的是**最近还在提交的人**，是「现在有多少人在做」。
 * 两个数字必须一起看——只放累计数，一个已经沉寂的项目也会显得很热闹。
 *
 * 判定依据是提交作者（`author.login`），所以只算在 GitHub 提交过代码的人：
 * 只报 Issue、参与讨论、写文档的人不在其中，这与项目一贯的「代码贡献者」口径一致。
 */
export async function getActiveContributors(): Promise<ActiveContributors> {
  const log = await getCommitLog();
  if (!log) return { recent: 0, yearly: 0, live: false };

  const yearlyCutoff = daysBefore(today(), ACTIVITY_WINDOW_DAYS);
  const recentCutoff = daysBefore(today(), ACTIVE_WINDOW_DAYS);
  const recent = new Set<string>();
  const yearly = new Set<string>();
  for (const record of log) {
    if (!record.login) continue;
    /*
     * 先按年窗口过滤，再判断 90 天。少了这一步 `yearly` 数的是**全部记录**的去重作者数：
     * 过去日志只有一年，两个口径碰巧相等，所以一直没暴露；改成拉全历史之后，
     * 它立刻变成「近一年 67 人」——67 是四年的累计人数，读者读到的却是最近一年。
     */
    if (record.date < yearlyCutoff) continue;
    yearly.add(record.login);
    if (record.date >= recentCutoff) recent.add(record.login);
  }

  return { recent: recent.size, yearly: yearly.size, live: true };
}
