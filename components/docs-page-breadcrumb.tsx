'use client';

import { useSidebar } from 'fumadocs-ui/components/sidebar/base';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { PageBreadcrumb } from 'fumadocs-ui/layouts/spacious/page';
import { Search } from 'lucide-react';
import type { ComponentProps } from 'react';

/**
 * 文档页面包屑插槽增强：
 * 在桌面端折叠侧边栏后，在左上角悬浮的展开按钮（ExpandSidebar）旁边紧邻渲染悬浮搜索按钮。
 * 侧边栏展开时（侧栏自带搜索框）自动隐藏，与 ExpandSidebar 的可见性同步。
 */
export function DocsPageBreadcrumb(props: ComponentProps<typeof PageBreadcrumb>) {
  const { collapsed } = useSidebar();
  const { setOpenSearch } = useSearchContext();

  return (
    <>
      {collapsed && (
        <button
          type="button"
          onClick={() => setOpenSearch(true)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring hover:bg-fd-accent hover:text-fd-accent-foreground size-8 text-fd-muted-foreground max-md:hidden"
          aria-label="打开搜索"
          title="搜索 (⌘K)"
        >
          <Search className="size-4" />
        </button>
      )}
      <PageBreadcrumb {...props} />
    </>
  );
}
