import Link from 'next/link';
import { cardHover } from '@/components/site-primitives';
import { cn } from '@/lib/cn';
import { docSections } from '@/lib/docs-sections';
import { focusRing } from '@/lib/site-design';

export function AdminDocsEntry() {
  const versions = docSections.find(({ key }) => key === 'admin')?.versions ?? [];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {versions.map((version) => (
        <Link
          key={version.key}
          href={`/docs/admin/${version.key}`}
          className={cn('rounded-xl border border-fd-border bg-fd-card p-4', cardHover, focusRing)}
        >
          <strong className="block text-fd-foreground">{version.title}{version.archived ? '（已归档）' : '（当前）'}</strong>
          <span className="mt-1 block text-sm text-fd-muted-foreground">{version.description}</span>
        </Link>
      ))}
    </div>
  );
}
