'use client';

import { useMemo } from 'react';
import { getLayoutTabs } from 'fumadocs-ui/layouts/shared';
import { SidebarTabsDropdown } from 'fumadocs-ui/components/sidebar/tabs/dropdown';
import { useTreeContext, useTreePath } from 'fumadocs-ui/contexts/tree';

export function DocsVersionSwitcher({ fallback = null }: { fallback?: React.ReactNode }) {
  const { full: tree } = useTreeContext();
  const path = useTreePath();
  const versions = useMemo(
    () => getLayoutTabs(tree, {
      transform: (option, node) => typeof node.root === 'string' ? option : null,
    }),
    [tree],
  );

  return path.some((node) => node.type === 'folder' && typeof node.root === 'string')
    ? <SidebarTabsDropdown options={versions} />
    : fallback;
}
