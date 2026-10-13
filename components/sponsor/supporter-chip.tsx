import { Heart } from 'lucide-react';
import type { Supporter } from '@/lib/sponsors';
import { cn } from '@/lib/cn';
import { focusRing } from '@/lib/site-design';

function SupporterChip({ supporter }: { supporter: Supporter }) {
  const inner = (
    <>
      {supporter.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={supporter.avatar}
          alt=""
          aria-hidden
          loading="lazy"
          className="size-9 rounded-full border border-amber-400/30 object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="flex size-9 items-center justify-center rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300"
        >
          <Heart className="size-4" />
        </span>
      )}
      <span className="pr-0.5 text-base leading-6 font-medium">{supporter.name}</span>
    </>
  );

  const cls = cn(
    'inline-flex items-center gap-2.5 rounded-full border border-amber-400/35 bg-amber-500/[0.06] py-1.5 pl-1.5 pr-4 text-amber-950 dark:text-amber-100',
    supporter.url && cn('transition-colors hover:border-amber-500/60 hover:bg-amber-500/10', focusRing),
  );

  return supporter.url ? (
    <a href={supporter.url} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <span className={cls}>{inner}</span>
  );
}

export function SupporterChips({ supporters }: Readonly<{ supporters: Supporter[] }>) {
  return (
    <div className="flex flex-wrap gap-2">
      {supporters.map((supporter) => (
        <SupporterChip key={supporter.name} supporter={supporter} />
      ))}
    </div>
  );
}
