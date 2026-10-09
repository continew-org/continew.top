import { createGetUrl } from 'fumadocs-core/source';

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

// 文档唯一权威源：各文档分区 -> 其内容所在的项目仓库。
// 文档页「在 GitHub 编辑」链接按分区映射到对应项目仓库的 docs/ 目录，
// 而非本仓库（content/docs/ 为构建期汇聚产物，不提交）。
export const docSourceRepos: Record<string, { repo: string; branch: string }> = {
  starter: { repo: 'continew-starter', branch: 'dev' },
  admin: { repo: 'continew-admin', branch: 'dev' },
  app: { repo: 'continew-app', branch: 'dev' },
};

/**
 * 生成文档页在其源仓库的「在 GitHub 编辑」链接。
 * page.slugs[0] 为分区名；命中映射则指向对应项目仓库的 docs/，
 * 未命中（如文档总入口页）返回 undefined，由调用方隐藏编辑入口。
 */
export function getEditOnGithubUrl(page: { slugs: string[]; path: string }): string | undefined {
  const section = page.slugs[0];
  const source = section ? docSourceRepos[section] : undefined;
  if (!source) return undefined;
  // page.path 形如 starter/guide/getting-started.mdx，去掉分区前缀即源仓库 docs/ 内相对路径
  const pathInRepo = page.path.slice(section.length + 1);
  return `https://github.com/${gitConfig.user}/${source.repo}/blob/${source.branch}/docs/${pathInRepo}`;
}

// 文档页在各代码托管平台的「打开/编辑」链接。host 为平台前缀（组织路径不同平台可能不同）。
// 各平台组织路径：GitHub 为 continew-org，AtomGit 与 Gitee 为 continew。
export function getEditOnHostUrl(
  page: { slugs: string[]; path: string },
  host: 'github' | 'atomgit' | 'gitee',
): string | undefined {
  const section = page.slugs[0];
  const source = section ? docSourceRepos[section] : undefined;
  if (!source) return undefined;
  const pathInRepo = page.path.slice(section.length + 1);
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
