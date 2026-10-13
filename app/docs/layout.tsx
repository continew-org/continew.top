import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { getLayoutTabs } from 'fumadocs-ui/layouts/shared';
import { baseOptions } from '@/lib/layout.shared';
import { buildDefaultDocsUrl } from '@/lib/shared';
import { hasVersions } from '@/lib/docs-sections';
import { getStarSummary } from '@/lib/site-stats';

export default async function Layout({ children }: LayoutProps<'/docs'>) {
  const tree = source.getPageTree();
  const tabs = getLayoutTabs(tree);
  // 没有直属页面的版本化项目不会被 getLayoutTabs 自动收录。
  for (const node of tree.children) {
    if (node.type !== 'folder' || !node.root || !node.$ref?.folder) continue;
    if (tabs.some((tab) => tab.$folder === node)) continue;
    if (!hasVersions(node.$ref.folder)) continue;
    const url = buildDefaultDocsUrl(node.$ref.folder);
    tabs.unshift({
      title: node.name,
      icon: node.icon,
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
