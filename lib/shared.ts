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
