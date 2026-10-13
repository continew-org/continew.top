/**
 * 文档分区与版本注册表 —— 文档站架构的唯一事实源。
 *
 * 目录形态与 URL 严格对应（`/docs/<分区>/<版本>/<页面>`）：
 *
 * ```
 * content/docs/admin/5.x/…  →  /docs/admin/5.x/…
 * content/docs/admin/4.x/…  →  /docs/admin/4.x/…
 * content/docs/starter/…    →  /docs/starter/…
 * ```
 *
 * ## 版本段怎么命名：key 是「线」，发布号是上游事实
 *
 * key 同时是目录名与 URL 路径段，所以它**一旦上线就不要改**（书签、外链、搜索结果都指着它）。
 * 按维护线命名：`5.x` 是正在开发的下一代，`4.x` 是已归档的 4 系列——封存时 5.x 只是
 * 标签变成「已归档」，再新增一条 `6.x`，不存在「重命名目录」这一步。
 *
 * 显示名（`title`）走另一套：「版本号（状态）」，`5.0（开发中）` / `4.x（已归档）`。
 * 其中开发中的版本号需要跟着上游发版手动更新，URL 段不动。
 *
 * 具体发布号（4.2.x 分支、v4.2.0 tag）属于上游事实，写在 ref / versionTag / versionLabel 上，
 * 不参与 URL。两者不要互相顶替：key 写成发布号会把「一条线一份文档」的 URL 钉死在某个
 * 小版本上，后续每个小版本都得改链接；ref 写成 key 则会指到一个不存在的分支。
 *
 * ## 版本机制：为什么采用 Fumadocs 的 Root Type
 *
 * Admin 存在多个并存版本（开发中的 5.x、已归档的 4.x），版本之间的关系是
 * **同一份文档的不同快照**——读者读到一半切过去，应当落在另一个版本的同一页，
 * 而不是被丢回首页。
 *
 * Fumadocs 对此有内置支持：把各版本目录的 meta.json 标为同一个 root type
 * （`"root": "version"`），它们在 UI 上就不再是一排并列的「项目标签」，而是侧边栏
 * 顶部的版本下拉，且切换时按**结构投影**定位到对侧同路径页（缺失则回落该版本首页）。
 * 官方说明见 docs navigation » Versioning » Root Type。
 *
 * 代价：同类型的版本目录必须位于同一个父文件夹之下，故 Admin 的 URL 多出版本段
 * （`/docs/admin/manual/system` → `/docs/admin/5.x/manual/system`）。
 * 这是官方机制的约束，换来的是「真正的版本切换」而非「伪装的并列分区」。
 *
 * ## 如何封存一个新版本
 *
 * 在目标分区下新增版本目录 + 一条版本配置即可，其余各处（拉取、切换器、编辑链接、
 * llms 排除、链接校准、归档提示）自动就位：
 *
 * ```ts
 * versions: [
 *   …,
 *   { key: '4.x', repo: 'continew-admin', ref: '4.2.x', archived: true, versionTag: 'v4.2.0' },
 * ]
 * ```
 *
 * 两处目录名必须同步，改名时容易漏（漏了不会报错，只会静默丢内容）：
 *
 * 1. `content/docs/<分区>/meta.json` 的 `pages` 列出各版本目录名——名单与实际目录
 *    不一致时该分区会被剪成空目录，进而从导航与 llms.txt 里整段消失；
 * 2. 各版本目录下的 `index.mdx`——`/docs/<分区>/<版本>` 这个入口 URL 由它承载，
 *    导航与首页「快速上手」都指向它。
 */

/**
 * 一个版本的文档。
 *
 * key 同时是目录名与 URL 路径段，按维护线命名（`5.x`），改它等于改线上 URL——
 * 发布号（`4.2.x` / `v4.2.0`）走 ref 与 versionTag，不要写进 key。
 */
export interface DocVersion {
  key: string;
  /** 侧边栏版本下拉中显示的名称。约定「版本号（状态）」：`5.0（开发中）`、`4.x（已归档）`。 */
  title: string;
  description: string;
  /** 内容所在 GitHub 仓库。 */
  repo: string;
  /** git 引用：开发分支（dev）或维护分支（如 4.2.x）。 */
  ref: string;
  /**
   * 是否为已封存版本。启用后：下拉标注「已归档」、页面顶部展示升级提示、
   * llms.txt 与 llms-full.txt 排除（避免 AI 工具学到过时配置）。
   *
   * 搜索索引仍收录——仍在用旧版本的人要靠它查资料，落地页有升级提示兜底。
   */
  archived?: boolean;
  /** 归档时的版本名（如 4.2.x），用于归档提示文案；缺省时用 ref。 */
  versionLabel?: string;
  /** 稳定发版 tag，用于把文中指向流动分支的外链钉到固定版本。 */
  versionTag?: string;
  /**
   * 跨仓库的版本级搭档。
   *
   * 文档里引用的往往不止本仓库源码（如 Starter 的类、前端仓库配置），而这些仓库各有
   * 发版节奏、tag 未必与本仓库一致，故逐条写明，不能简单复用 versionTag。
   */
  companions?: ReadonlyArray<{ repo: string; tag: string }>;
}

/** 一个文档分区：一组 Root Folder 中的一个项目（Admin / Starter / App）。 */
export interface DocSection {
  key: string;
  title: string;
  /**
   * 分区说明，仅供人读注册表用。
   *
   * **不是展示文案的来源**：非版本分区（starter / app）的名称、描述与图标由各自仓库的
   * `docs/meta.json` 决定，版本分区（admin）的版本行文案由下方 `versions` 决定。
   * 官网不覆盖分区层文案——上游改一句就该在站点生效，两处各写一份必然漂移。
   */
  description: string;
  /** 顶部项目切换器使用的 Lucide 图标名，同时决定其在 lib/source.ts 中的品牌配色。 */
  icon: string;
  /**
   * 版本列表。无版本管理的分区（内容尚在起步阶段的 App）留空，
   * 此时文档直接位于分区目录下，URL 不含版本段。
   */
  versions?: readonly DocVersion[];
  /** 版本化之前的无版本 URL 所对应的固定历史版本，不随最新版本切换。 */
  legacyVersion?: string;
  /** 无版本分区的内容源。分区一旦启用版本，此字段即失效以 versions 为准。 */
  repo?: string;
  ref?: string;
}

export const docSections: readonly DocSection[] = [
  {
    key: 'admin',
    title: 'ContiNew Admin',
    description: '多租户中后台管理系统框架',
    icon: 'LayoutDashboard',
    legacyVersion: '4.x',
    versions: [
      {
        key: '5.x',
        // 显示名约定「版本号（状态）」，与归档那档同构。开发中的版本号随上游推进手动更新
        // （5.0 → 5.1 …）——它是唯一需要跟着发版走的字段，URL 段始终是 5.x，不必同步改。
        title: '5.0（开发中）',
        // 描述行只说明「内容怎么维护」，不重复 title 里的状态词；长度按侧栏下拉一行取
        // （实测约 11 个汉字 / 114px 宽），见「版本段怎么命名」一节
        description: '文档随开发进度更新',
        repo: 'continew-admin',
        ref: 'dev',
      },
      {
        key: '4.x',
        title: '4.x',
        // 描述行说明「这条线停在哪」：系列名 + 归档时的发布 tag
        description: '4.x 系列，冻结于 v4.2.0',
        repo: 'continew-admin',
        ref: '4.2.x',
        archived: true,
        versionLabel: '4.2.x',
        versionTag: 'v4.2.0',
        // Admin 4.2.0 配套的 Starter 是 2.17.0（见该版本 release notes 的依赖升级条目）
        companions: [
          { repo: 'continew-admin-ui', tag: 'v4.2.0' },
          { repo: 'continew-starter', tag: 'v2.17.0' },
        ],
      },
    ],
  },
  {
    key: 'starter',
    title: 'ContiNew Starter',
    // 侧栏项目下拉里的一行描述：长度按侧栏宽度取（实测 114px 宽约 11 个汉字），按「是什么」写，不用空泛定语
    description: 'Spring Boot Starter 库',
    icon: 'Rocket',
    repo: 'continew-starter',
    ref: 'dev',
  },
  {
    key: 'app',
    title: 'ContiNew App',
    description: '多端工程脚手架',
    icon: 'Smartphone',
    repo: 'continew-app',
    ref: 'dev',
  },
];

/** 内部使用：把分区及其版本摊平成源单元（版本分区下按版本展开）。 */
interface SourceUnit {
  /** `content/docs` 下的相对路径，同时也是 URL 去掉 `/docs/` 后的部分。 */
  dir: string;
  /** URL 上的 slug 段，如 ['admin', '5.x']。 */
  slugs: string[];
  section: DocSection;
  version?: DocVersion;
}

export const sourceUnits: readonly SourceUnit[] = docSections.flatMap(
  (section): SourceUnit[] => {
    if (!section.versions?.length) {
      return [
        {
          dir: section.key,
          slugs: [section.key],
          section,
          version: undefined,
        },
      ];
    }
    return section.versions.map((version) => ({
      dir: `${section.key}/${version.key}`,
      slugs: [section.key, version.key],
      section,
      version,
    }));
  },
);

/**
 * 内容目录 -> 拉取源（`repo@ref`），供 CI 组装 content/docs 使用。
 *
 * key 是 `content/docs` 下的相对路径（如 `admin/4.x`），不是分区名——
 * 同一仓库的不同版本会拉取到不同目录。
 */
export function getSourceTargets(): Array<{ dir: string; repo: string; ref: string }> {
  return sourceUnits.map(({ dir, section, version }) => ({
    dir,
    repo: version?.repo ?? section.repo ?? '',
    ref: version?.ref ?? section.ref ?? '',
  }));
}

/** 按 slug 取版本配置。命中版本分区（如 admin/4.x）则返回该版本，否则 undefined。 */
export function getDocVersion(sectionKey: string | undefined, versionKey: string | undefined) {
  if (!sectionKey) return undefined;
  return docSections
    .find((section) => section.key === sectionKey)
    ?.versions?.find((version) => version.key === versionKey);
}

/** 仅版本目录本身是 Root Type，不能把其下的普通目录标成版本根。 */
export function getVersionForFolderPath(folderPath: string): DocVersion | undefined {
  return sourceUnits.find(({ dir }) => dir === folderPath)?.version;
}

/** 该分区是否启用了版本机制。 */
export function hasVersions(sectionKey: string | undefined): boolean {
  if (!sectionKey) return false;
  return (docSections.find((section) => section.key === sectionKey)?.versions?.length ?? 0) > 0;
}

/** 分区的默认（最新）版本 key，用于 URL 缺省时的重定向。 */
export function getDefaultVersion(sectionKey: string): string | undefined {
  return docSections.find((section) => section.key === sectionKey)?.versions?.[0]?.key;
}

/**
 * 「在 GitHub 编辑」链接指向的仓库与 git 引用，按「分区/版本」二级 key 索引。
 *
 * 单一 key 不足以区分：admin/5.x 与 admin/4.x 指向同一仓库的不同分支。
 */
export const docSourceRepos: Record<
  string,
  { repo: string; branch: string; archived?: boolean }
> = Object.fromEntries(
  sourceUnits.map(({ slugs, section, version }) => [
    slugs.join('/'),
    {
      repo: version?.repo ?? section.repo ?? '',
      branch: version?.ref ?? section.ref ?? '',
      archived: version?.archived,
    },
  ]),
);

/** 按正在编译的文档目录选择版本，避免不同归档版本共享同一套改写规则。 */
export function getSourceUnitForFile(filePath: string) {
  const normalized = filePath.replaceAll('\\', '/');
  const marker = '/content/docs/';
  const index = normalized.lastIndexOf(marker);
  if (index < 0) return undefined;
  const relative = normalized.slice(index + marker.length);
  return sourceUnits.find(({ dir }) => relative.startsWith(`${dir}/`));
}

/** 仅将当前归档版本中指向 dev 的源码链接固定到与其配套的 tag。 */
export function getVersionTags(version: DocVersion): Record<string, string> {
  if (!version.archived || !version.versionTag) return {};
  return Object.fromEntries([
    [version.repo, version.versionTag],
    ...(version.companions ?? []).map(({ repo, tag }) => [repo, tag]),
  ]);
}
