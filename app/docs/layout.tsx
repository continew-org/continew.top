import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { getLayoutTabs } from 'fumadocs-ui/layouts/shared';
import { baseOptions } from '@/lib/layout.shared';
import { buildDefaultDocsUrl } from '@/lib/shared';
import { hasVersions } from '@/lib/docs-sections';
import { getStarSummary } from '@/lib/site-stats';
import type { ReactNode } from 'react';

/**
 * 项目 / 版本下拉的图标包装。
 *
 * 图标尺寸不来自图标本身，而来自外层盒子：移动端 36px、桌面 20px，
 * 故图标必须撑满盒子（`size-full`）才能跟着一起缩放。上游 getLayoutTabs 默认
 * 也套这样一层，但它只在自动收录的 tab 上生效——下方手动补的 Admin tab 一旦
 * 漏掉这层，就会按 Lucide 自身的 24px 渲染：移动端小得与其余项目不成比例，
 * 桌面还会溢出 20px 的盒子。故把包装收在这一处，两条路径共用。
 *
 * 移动端再留 6px 内缩，让图标落在 24px——即 Lucide 的设计网格，缩放比 1:1、
 * 描边正好 2px。盒子是上游给的 36px 触达尺寸，但图标若跟着放大（28px 是 1.167×、
 * 36px 是 1.5×），描边与圆角就落在半像素上，边缘发虚、看着失真。
 */
const tabIcon = (icon: ReactNode) => (
  <div className="size-full [&_svg]:size-full max-md:p-1.5">{icon}</div>
);

export default async function Layout({ children }: Readonly<LayoutProps<'/docs'>>) {
  const tree = source.getPageTree();
  const tabs = getLayoutTabs(tree, {
    transform: (option, node) => ({
      ...option,
      icon: node.icon ? tabIcon(node.icon) : undefined,
    }),
  });
  // 没有直属页面的版本化项目不会被 getLayoutTabs 自动收录。
  for (const node of tree.children) {
    if (node.type !== 'folder' || !node.root || !node.$ref?.folder) continue;
    if (tabs.some((tab) => tab.$folder === node)) continue;
    if (!hasVersions(node.$ref.folder)) continue;
    const url = buildDefaultDocsUrl(node.$ref.folder);
    tabs.unshift({
      title: node.name,
      icon: node.icon ? tabIcon(node.icon) : undefined,
      description: node.description,
      url,
      $folder: node,
    });
  }

  // 构建期拉取一次（lib/site-stats.ts 有结果缓存），导航栏据此渲染全平台 Star 数
  const stars = await getStarSummary();

  return (
    <DocsLayout
      tree={tree}
      tabs={tabs}
      {...baseOptions(stars, { docs: true })}
    >
      {children}
    </DocsLayout>
  );
}
