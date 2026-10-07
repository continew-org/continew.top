import { llms, loader } from 'fumadocs-core/source';
import { icons } from 'lucide-react';
import { createElement } from 'react';
import { docsContentRoute, docsImageRoute, docsRoute } from './shared';
import { defineDocs } from 'fumadocs-mdx/macro';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';

// 各文档分区 Root Folder 图标的品牌配色（ContiNew 蓝绿系）。
// key 为 meta.json 中的 icon 名（lucide 图标名），value 为图标颜色。
const sectionIconColors: Record<string, string> = {
  LayoutDashboard: '#0057FE', // ContiNew 主蓝 —— Admin（主打）
  Rocket: '#307AF2', // 亮蓝 —— Starter
  Smartphone: '#12D2AC', // 青绿 —— App
};

// 自定义图标插件：将 meta.json 的图标名转为 Lucide 图标，并按分区映射品牌色。
// 与官方 lucideIconsPlugin 行为一致，额外注入 color，未命中映射的保持默认色。
function replaceIcon<T extends { icon?: unknown }>(node: T): T {
  if (typeof node.icon !== 'string') return node;
  const Icon = icons[node.icon as keyof typeof icons];
  if (!Icon) {
    console.warn(`[colored-icons-plugin] Unknown icon: ${node.icon}.`);
    return node;
  }
  const color = sectionIconColors[node.icon];
  return { ...node, icon: createElement(Icon, color ? { color } : {}) };
}

const coloredIconsPlugin = () => ({
  name: 'continew:colored-icons',
  transformPageTree: {
    file: replaceIcon,
    folder: replaceIcon,
    separator: replaceIcon,
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
