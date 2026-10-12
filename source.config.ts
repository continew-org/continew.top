/**
 * fumadocs-mdx 的配置入口（默认会被自动发现）。
 *
 * ## 为什么要有这个文件
 *
 * MDX 的 remark / rehype 插件必须在这里登记，而不是传给 `createMDX()`——
 * next.config.mjs 里的那个 API 只认 `configPath`、`macro`、`index` 三个项，
 * 其余键会被静静忽略：传了 `mdxOptions` 不报错，但插件一个都不生效。
 * 这类「配了没反应」的失败很难察觉，因为构建照常通过、页面照常出来，
 * 只是该被改写的链接都留着原样。
 *
 * 这里不作 سبب MDX 相关的其它配置：业务侧数据与既有事实源都在 lib/docs-sections.ts。
 */

import { defineConfig } from 'fumadocs-mdx/config';
import {
  remarkArchiveDocLinks,
  rehypeArchiveDocLinks,
} from './lib/mdx-plugins/remark-archive-doc-links';

export default defineConfig({
  mdxOptions: {
    // remark 阶段覆盖 Markdown 行内链接与 JSX 组件属性（<Card href>）
    remarkPlugins: [remarkArchiveDocLinks],
    // rehype 阶段覆盖由后续插件展开出来的链接（如 gfm 表格内的 <a>）
    rehypePlugins: [rehypeArchiveDocLinks],
  },
});
