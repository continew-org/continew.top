import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { getLayoutTabs } from 'fumadocs-ui/layouts/shared';
import { baseOptions } from '@/lib/layout.shared';
import { currentDocsUrl } from '@/lib/shared';
import { getStarSummary } from '@/lib/site-stats';

export default async function Layout({ children }: LayoutProps<'/docs'>) {
  const tree = source.getPageTree();
  const tabs = getLayoutTabs(tree);
  const admin = tree.children.find((node) => node.type === 'folder' && node.$ref?.folder === 'admin');
  if (admin?.type === 'folder') {
    tabs.unshift({
      title: admin.name,
      icon: admin.icon,
      description: admin.description,
      url: currentDocsUrl,
      $folder: admin,
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
