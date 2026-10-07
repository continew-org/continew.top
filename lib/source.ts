import { llms, loader } from 'fumadocs-core/source';
import { icons } from 'lucide-react';
import { createElement } from 'react';
import { docsContentRoute, docsImageRoute, docsRoute } from './shared';
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

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [coloredIconsPlugin()],
});

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${page.url})

${await page.data.getText('processed')}`,
});
