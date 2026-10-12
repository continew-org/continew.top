'use client';

import { FullSearchTrigger } from 'fumadocs-ui/layouts/shared/slots/search-trigger';
import type { FullSearchTriggerProps } from 'fumadocs-ui/layouts/shared/slots/search-trigger';
import { DocsVersionSwitcher } from '@/components/docs-version-switcher';

export function DocsSearchTrigger(props: FullSearchTriggerProps) {
  return (
    <div className="flex flex-col gap-2">
      <DocsVersionSwitcher />
      <FullSearchTrigger {...props} />
    </div>
  );
}
