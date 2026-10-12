import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/spacious';
import { getLayoutTabs } from 'fumadocs-ui/layouts/shared';
import { baseOptions } from '@/lib/layout.shared';
import { getStarSummary } from '@/lib/site-stats';
import { DocsSearchTrigger } from '@/components/docs-search-trigger';
import { SearchTrigger } from 'fumadocs-ui/layouts/shared/slots/search-trigger';
import { DocsMobileHeader } from '@/components/docs-mobile-header';

export default async function Layout({ children }: LayoutProps<'/docs'>) {
  // 项目切换器（顶部 / 侧边栏顶部下拉）：Admin / Starter / App 三个分区，
  // 各分区在 meta.json 标记 root: true 构成 Root Folder。
  //
  // 过滤掉 root type 为字符串（如 "version"）的目录：它们不是「项目」，
  // 而是同一项目的版本快照。不过滤的话 5.0 / 4.2 会与 Admin / Starter / App 并列，
  // 语义上变成第四个「项目」——版本切换的正确位置是侧边栏的版本下拉（见下）。
  const tabs = getLayoutTabs(source.getPageTree(), {
    transform: (option, node) => (typeof node.root === 'string' ? null : option),
  });

  // 构建期拉取一次（lib/site-stats.ts 有结果缓存），导航栏据此渲染全平台 Star 数
  const stars = await getStarSummary();

  return (
    <DocsLayout
      tree={source.getPageTree()}
      tabs={tabs}
      {...baseOptions(stars, { docs: true })}
      slots={{ header: DocsMobileHeader, searchTrigger: { sm: SearchTrigger, full: DocsSearchTrigger } }}
    >
      {children}
    </DocsLayout>
  );
}
