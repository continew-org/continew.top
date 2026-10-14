import { llms, loader } from 'fumadocs-core/source';
import type { Folder } from 'fumadocs-core/page-tree';
import { icons } from 'lucide-react';
import { createElement } from 'react';
import { docsRoute } from './shared';
import { getDefaultVersion, getDocVersion, getVersionForFolderPath, hasVersions } from './docs-sections';
import { defineDocs } from 'fumadocs-mdx/macro';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';

// 各文档分区 Root Folder（顶部项目切换器）图标的品牌配色（ContiNew 蓝绿系）。
// 只染切换器里的项目图标；侧边栏页面图标不染（跟随文字色，选中时随主题变色）。
const sectionIconColors: Record<string, string> = {
  LayoutDashboard: '#0057FE', // ContiNew 主蓝 —— Admin（主打）
  Rocket: '#307AF2', // 亮蓝 —— Starter
  Smartphone: '#12D2AC', // 青绿 —— App
};

// 自定义图标插件：将 meta.json 的图标名转为 Lucide 图标。
// file（页面）图标保持默认色（不注入 color，随文字/选中态变色）；
// 仅 root folder（顶部项目切换器）按分区映射品牌色。
function replaceIcon(colorForRoot: boolean) {
  return <T extends { icon?: unknown }>(node: T): T => {
    if (typeof node.icon !== 'string') return node;
    const Icon = icons[node.icon as keyof typeof icons];
    if (!Icon) {
      console.warn(`[colored-icons-plugin] Unknown icon: ${node.icon}.`);
      return node;
    }
    const color = colorForRoot ? sectionIconColors[node.icon] : undefined;
    return { ...node, icon: createElement(Icon, color ? { color } : {}) };
  };
}

const coloredIconsPlugin = () => ({
  name: 'continew:colored-icons',
  transformPageTree: {
    file: replaceIcon(false), // 页面图标不染色，选中时随主题变色
    folder: replaceIcon(true), // root folder（项目切换器）染品牌色
    separator: replaceIcon(false),
  },
});

/**
 * 版本目录文案校正插件：把版本目录的 root type、显示名与描述由配置强制设定。
 *
 * ## 为什么必须在代码里兜
 *
 * 版本目录里的 meta.json 是 CI 从各仓库拉取的产物，每次同步都会被源仓库的版本
 * 原样覆盖，而那一层的身份是「版本目录」：`root: "version"`（版本互斥的关键）写在
 * 官网页的配置里、显示名必须是版本号、描述是版本状态、项目图标放到这里只会与侧栏
 * 的项目下拉重复。故在此按 lib/docs-sections.ts（唯一事实源）强制重写，
 * 无论源仓库那份 meta.json 写什么都不受影响。
 *
 * 这类回归格外隐蔽：构建照过、页面照出，只是「切换版本」悄悄没了。
 *
 * 分区（项目）层不做覆盖：starter / app 的名称、描述、图标由各自仓库的 `docs/meta.json`
 * 决定（admin 由本仓库的 `content/docs/admin/meta.json` 决定），官网不越权改写上游文案。
 */
const versionedSectionsPlugin = () => ({
  name: 'continew:versioned-sections',
  transformPageTree: {
    folder(node: Folder, folderPath: string): Folder {
      const version = getVersionForFolderPath(folderPath);
      if (!version) return node;

      return {
        ...node,
        // 同一 root type 是版本互斥的前提：同类型的 Root Folder 才能互换
        root: 'version',
        name: version.archived ? `${version.title}（已归档）` : version.title,
        description: version.description,
        // 版本是同一份文档的不同快照：带上项目图标，两个下拉看起来像同一个控件
        icon: undefined,
      };
    },
  },
});

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

// 更多信息见 https://fumadocs.dev/docs/headless/source-api
export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [coloredIconsPlugin(), versionedSectionsPlugin()],
});

const renderLlmsPage = async (page: ReturnType<typeof source.getPages>[number]) => {
  const [sectionKey, versionKey] = page.slugs;
  const version = getDocVersion(sectionKey, versionKey);
  const currentKey = sectionKey ? getDefaultVersion(sectionKey) : undefined;
  // 与页内归档提示（components/archive-notice.tsx）口径一致：线（key）进「本文是…」，
  // 发布 tag 进「冻结于…」。此处是给 AI/纯文本读的，写短句不加粗。
  const latestDocsHint = currentKey ? `最新文档：${docsRoute}/${sectionKey}/${currentKey}` : '';
  const notice = version?.archived
    ? `> 本文是 ${version.key} 的归档文档（冻结于 ${version.versionTag ?? version.versionLabel ?? version.ref}），不建议用于新项目。${latestDocsHint}\n\n`
    : '';
  return `# ${page.data.title} (${page.url})\n\n${notice}${await page.data.getText('processed')}`;
};

/**
 * 供路由使用的 llms 生成器，整站索引排除归档版本，逐页 Markdown 保留归档提示。
 *
 * fumadocs 的 llms(source) 内部直接从 loader 取整棵树（见 node_modules 里
 * llms.js 的 formatIndex），没有注入 post-filter 的口子。故这里自行拼装：
 * index 用过滤后的 children 逐节点调 indexNode（官方公开 API），
 * full 只需知道要不要收录，按 page.slugs[0] 判断即可。
 */
export const docsLlms = createFilteredLlms();

function createFilteredLlms() {
  const base = llms(source, { renderPage: renderLlmsPage });

  return {
    async index(): Promise<string> {
      const tree = source.getPageTree();
      const children = filterArchived(tree.children as unknown as Parameters<typeof base.indexNode>[0][]);
      const rendered = await Promise.all(children.map((node) => base.indexNode(node)));
      return [`# ${tree.name}`, '', ...rendered].join('\n');
    },
    async full(): Promise<string> {
      const pages = source.getPages().filter((page) => !isArchivedPage(page));
      const rendered = await Promise.all(pages.map((page) => renderLlmsPage(page)));
      return rendered.join('\n\n');
    },
    page: base.page,
  };
}

/**
 * 读取页面树目录的源文件路径，避免从可能被 meta.json 改写的 URL 反推归档版本。
 */
function folderKey(node: unknown): string | undefined {
  const ref = (node as { $ref?: { folder?: string } } | undefined)?.$ref;
  return typeof ref?.folder === 'string' && ref.folder.length > 0 ? ref.folder : undefined;
}

/** 该目录是否为已归档版本。找不到配置的（如普通分区、文档总入口）按非归档处理。 */
function isArchivedDirKey(dirKey: string | undefined): boolean {
  if (!dirKey) return false;
  const [sectionKey, versionKey] = dirKey.split('/');
  return getDocVersion(sectionKey, versionKey)?.archived ?? false;
}

/** 页面所属版本目录是否归档：版本分区取前两段，普通分区取第一段。 */
function isArchivedPage(page: { slugs: string[] }): boolean {
  const [sectionKey, ...rest] = page.slugs;
  if (!sectionKey) return false;
  const dirKey = hasVersions(sectionKey)
    ? [sectionKey, rest[0]].filter(Boolean).join('/')
    : sectionKey;
  return isArchivedDirKey(dirKey);
}

/**
 * 从 llms.txt 的页面树递归剔除归档版本目录及其子页。
 *
 * 版本目录位于 `admin` 分区之下，只筛顶层会漏掉 4.x；父分区剪空后一并去掉，
 * 避免留下无内容的标题。llms.txt / llms-full.txt 面向当前文档检索，
 * 同时收录 4.x 与 5.x 会让 AI 混用两个版本的配置说明；仅在聚合入口标注「归档」
 * 也不能保证模型读取正文时仍保留该上下文。旧版文档仍可按页从
 * `/llms.mdx/docs/admin/4.x/...` 读取。
 */
function filterArchived<T extends { type: string }>(nodes: T[]): T[] {
  const out: T[] = [];

  for (const node of nodes) {
    if (isArchivedDirKey(folderKey(node))) continue;

    const children = (node as unknown as { children?: T[] }).children;
    if (children) {
      const kept = filterArchived(children);
      // 分区下的版本全被剪掉后父节点变空，一并去掉（不留空标题）
      if (kept.length === 0) continue;
      out.push({ ...node, children: kept } as T);
      continue;
    }

    out.push(node);
  }

  return out;
}

