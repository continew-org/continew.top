'use client';

import { SidebarTrigger } from 'fumadocs-ui/components/sidebar/base';
import { SearchTrigger } from 'fumadocs-ui/layouts/shared/slots/search-trigger';
import { useSpaciousLayout } from 'fumadocs-ui/layouts/spacious';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { SidebarIcon } from 'lucide-react';
import { DocsVersionSwitcher } from '@/components/docs-version-switcher';

export function DocsMobileHeader(props: React.ComponentProps<'header'>) {
  const { slots } = useSpaciousLayout();
  return (
    <header
      {...props}
      id="nd-subnav"
      className="sticky top-(--fd-banner-height,0px) z-30 [grid-area:header] flex min-w-0 items-center gap-2 h-(--fd-header-height) px-3 bg-fd-card md:hidden"
    >
      <div className="min-w-0 flex-1 [&_button]:max-w-full [&_button]:truncate">
        <DocsVersionSwitcher fallback={<slots.navTitle className="inline-flex items-center gap-2.5 font-semibold" />} />
      </div>
      <SearchTrigger hideIfDisabled className="p-2" />
      <SidebarTrigger className={buttonVariants({ variant: 'ghost', size: 'icon-sm', className: 'p-2' })}>
        <SidebarIcon />
      </SidebarTrigger>
    </header>
  );
}
