import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/spacious';
import { getLayoutTabs } from 'fumadocs-ui/layouts/shared';
import { baseOptions } from '@/lib/layout.shared';
import { getStarSummary } from '@/lib/site-stats';

export default async function Layout({ children }: LayoutProps<'/docs'>) {
  // 采用与 Fumadocs 官网一致的 spacious 布局。
  // 显式传入 getLayoutTabs：项目切换器显示当前选中项（图标+标题+描述），
  // 仅显示当前项目分支。各分区在 meta.json 标记 root: true 构成 Root Folder。
  const tabs = getLayoutTabs(source.getPageTree());

  // 构建期拉取一次（lib/site-stats.ts 有结果缓存），导航栏据此渲染全平台 Star 数
  const stars = await getStarSummary();

  return (
    <DocsLayout tree={source.getPageTree()} tabs={tabs} {...baseOptions(stars)}>
      {children}
    </DocsLayout>
  );
}
