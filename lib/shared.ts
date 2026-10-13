import { createGetUrl } from 'fumadocs-core/source';
import { docSections, docSourceRepos, getDefaultVersion, hasVersions } from './docs-sections';

export const appName = 'ContiNew';
export const appDescription =
  'ContiNew（Continue New）系列项目，依托开源协作模式，持续迭代优化，持续提供开箱即用、舒适的开发体验。';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

// ContiNew 开源组织信息（官网仓库为 continew-org/continew.top）
export const gitConfig = {
  user: 'continew-org',
  repo: 'continew.top',
  branch: 'main',
};

export const siteUrl = 'https://continew.top';

/**
 * 当前版本文档的入口路径（含版本段）。
 *
 * /docs 根、首页「文档」入口等处都以此为准——它们是同一个语义：去看最新文档。
 * 关键字眼是「最新」：抽 6.0 之后主角会换人，届时只需在 lib/docs-sections.ts
 * 调整版本顺序（首个即默认版本），此处与引用它的页面自动跟上，不必逐个文件排查。
 *
 * 版本段不可省：`/docs/admin` 保留为旧地址兼容跳转，导航应直达版本目录。
 */
export const currentDocsUrl = buildDefaultDocsUrl(docSections[0]?.key);

export function buildDefaultDocsUrl(sectionKey: string | undefined): string {
  if (!sectionKey) return docsRoute;
  const version = getDefaultVersion(sectionKey);
  return version ? `${docsRoute}/${sectionKey}/${version}` : `${docsRoute}/${sectionKey}`;
}

/**
 * 用户登记入口：ContiNew Admin 仓库的登记 Issue（固定帖里有统一格式，比 issues 列表页更好填）。
 *
 * 此前首页与 /users 页各写一份，而且指向了**不同平台**（首页 Gitee、/users GitHub）——
 * 同一个「登记」动作有两个落点。统一到这里后，换地址只改一处。
 */
export const registerUrl = `https://github.com/${gitConfig.user}/continew-admin/issues/83`;

/**
 * 留言征集入口：官网仓库的固定征集帖。
 *
 * 与 registerUrl 是同一类东西——把用户领到一个有格式说明的固定帖上填，
 * 而不是丢给 issues 列表页让人自己猜。区别只在于去处：
 * 登记帖的条目进 data/users.json，留言帖的进 data/messages.json。
 *
 * 首页「社区声音」区块的引导入口指向这里。写成常量而不是在页面里散写链接，
 * 是因为这个地址会随仓库迁移而变，页面里散写就会漏改。
 */
export const messageUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}/issues/6`;

/**
 * 在线演示环境地址。
 *
 * 旧站把「在线演示」指向文档里的 demo 说明页（注意事项 + 账号密码），
 * 但新站文档目前只有各分区的 index，没有 demo 页，那个链接是 404。
 * 而点「在线演示」的人要的是**看产品**，不是读说明——直接给演示地址。
 * 演示环境的注意事项属于文档，等文档补齐后再从文档侧挂过去。
 */
export const demoUrl = 'https://admin.continew.top';

/**
 * 推荐参与贡献的平台顺序：GitHub → AtomGit → Gitee。
 *
 * 与 lib/site-stats.ts 的 PLATFORMS **同序**，保证导航星数下拉与参与贡献弹层
 * 两处列出的平台顺序一致——同一个社区，推荐顺序不该在两处打架。
 *
 * desc 是**平台本身的一句话介绍**，不是「本站在这个平台的状态」。
 * 早先写的是「同步镜像，同样接受反馈与提交」，问题有两个：一是「镜像」这个
 * 词把两个平台降级成了附属品，而它们的定位其实是各自独立的服务；二是读者
 * 真正想知道的是「这是个什么平台」，不是「我们在这里同步得勤不勤」。
 */
export const contributePlatforms = [
  {
    key: 'github',
    name: 'GitHub',
    desc: '全球最大的开发者社区',
    url: `https://github.com/${gitConfig.user}`,
  },
  {
    key: 'atomgit',
    name: 'AtomGit',
    desc: '开放原子开源基金会运营的代码托管平台',
    url: 'https://atomgit.com/continew',
  },
  {
    key: 'gitee',
    name: 'Gitee',
    desc: '国内主流代码托管平台，企业开发者聚集',
    url: 'https://gitee.com/continew',
  },
] as const;

/**
 * 文档页「在 GitHub 编辑」链接指向的源仓库与 git 引用，key 形如 `admin/4.x`。
 * 由唯一事实源派生，此处不再单独维护——见 lib/docs-sections.ts。
 *
 * 启用版本的分区按「分区/版本」二级 key 索引：admin/5.x 与 admin/4.x 指向
 * 同一仓库的不同 git 引用，单看分区名无法分辨。
 */
export { docSourceRepos } from './docs-sections';

/**
 * 解析页面所属的源单元与其在源仓库 docs/ 内的相对路径。
 *
 * ## 为什么按「分区/版本」二级匹配
 *
 * 同一个分区的多个版本指向同一仓库的不同 git 引用（admin/5.x→dev、admin/4.x→4.2.x），
 * 单看分区名无法分辨。启用版本的分区取前两段作 key，未启用的取第一段。
 */
function resolveSource(page: { slugs: string[]; path: string }) {
  const [section, ...rest] = page.slugs;
  if (!section) return undefined;

  const versioned = hasVersions(section);
  const key = versioned
    ? [section, rest[0]].filter(Boolean).join('/')
    : section;
  const source = docSourceRepos[key];
  if (!source) return undefined;

  // page.path 形如 admin/4.x/guide/upgrade.mdx，去掉分区/版本前缀即源仓库 docs/ 内相对路径。
  // 版本段的存在与否随分区而异，这里统一按「已消耗的 slug 数」截取，不在分区路径上做假设。
  const consumed = [section, versioned ? rest[0] : undefined].filter(Boolean).join('/');
  return { source, pathInRepo: page.path.slice(consumed.length + 1) };
}

/**
 * 生成文档页在其源仓库的「在 GitHub 编辑」链接。
 * 未命中映射（如文档总入口页）返回 undefined，由调用方隐藏编辑入口。
 */
export function getEditOnGithubUrl(page: { slugs: string[]; path: string }): string | undefined {
  const resolved = resolveSource(page);
  if (!resolved) return undefined;
  const { source, pathInRepo } = resolved;
  return `https://github.com/${gitConfig.user}/${source.repo}/blob/${source.branch}/docs/${pathInRepo}`;
}

// 文档页在各代码托管平台的「打开/编辑」链接。host 为平台前缀（组织路径不同平台可能不同）。
// 各平台组织路径：GitHub 为 continew-org，AtomGit 与 Gitee 为 continew。
export function getEditOnHostUrl(
  page: { slugs: string[]; path: string },
  host: 'github' | 'atomgit' | 'gitee',
): string | undefined {
  const resolved = resolveSource(page);
  if (!resolved) return undefined;
  const { source, pathInRepo } = resolved;
  if (host === 'github') {
    return `https://github.com/${gitConfig.user}/${source.repo}/blob/${source.branch}/docs/${pathInRepo}`;
  }
  if (host === 'atomgit') {
    return `https://atomgit.com/continew/${source.repo}/blob/${source.branch}/docs/${pathInRepo}`;
  }
  return `https://gitee.com/continew/${source.repo}/blob/${source.branch}/docs/${pathInRepo}`;
}

const getContentUrl = createGetUrl(docsContentRoute);

export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'content.md'];

  return { segments, url: getContentUrl(segments, page.locale) };
}

const getImageUrl = createGetUrl(docsImageRoute);

export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'image.png'];

  return { segments, url: getImageUrl(segments, page.locale) };
}
