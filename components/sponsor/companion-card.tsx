import { ExternalLink, Handshake, Heart, Server, type LucideIcon } from 'lucide-react';
import { sponsorLogoUrl, type Companion, type TierKey } from '@/lib/sponsors';
import { cn } from '@/lib/cn';
import { cardHover } from '@/components/site-primitives';
import { focusRing, siteType } from '@/lib/site-design';

const relationMeta: Record<
  TierKey,
  {
    label: string;
    icon: LucideIcon;
    iconClass: string;
    waveOuterClass: string;
    waveInnerClass: string;
    hoverClass: string;
  }
> = {
  strategic: {
    label: '开源合作伙伴',
    icon: Handshake,
    iconClass: 'text-[var(--cn-brand)]',
    waveOuterClass: 'border-[var(--cn-brand-line)]',
    waveInnerClass: 'border-blue-400/20',
    hoverClass: 'hover:border-[var(--cn-brand-line)]',
  },
  infrastructure: {
    label: '资源合作伙伴',
    icon: Server,
    iconClass: 'text-teal-600 dark:text-teal-400',
    waveOuterClass: 'border-teal-400/30',
    waveInnerClass: 'border-[var(--cn-brand-line)]',
    hoverClass: 'hover:border-teal-500/40',
  },
  supporter: {
    label: '个人支持者',
    icon: Heart,
    iconClass: 'text-amber-600 dark:text-amber-400',
    waveOuterClass: 'border-amber-400/35',
    waveInnerClass: 'border-amber-300/25',
    hoverClass: 'hover:border-amber-400/50',
  },
};

function getPrimaryRelation(companion: Companion): TierKey {
  if (companion.relations.includes('strategic')) return 'strategic';
  if (companion.relations.includes('infrastructure')) return 'infrastructure';
  return 'supporter';
}

function CompanionVisual({ companion }: { companion: Companion }) {
  const className = 'size-11 shrink-0 rounded-xl';

  if (companion.logo) {
    return (
      <span className={`${className} flex items-center justify-center border border-fd-border bg-white p-2 shadow-sm`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sponsorLogoUrl(companion.logo)}
          alt=""
          aria-hidden
          loading="lazy"
          className="size-full object-contain"
        />
      </span>
    );
  }

  if (companion.avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={companion.avatar}
        alt=""
        aria-hidden
        loading="lazy"
        className={`${className} border border-fd-border object-cover shadow-sm`}
      />
    );
  }

  const primaryRelation = getPrimaryRelation(companion);
  const fallbackClass =
    primaryRelation === 'supporter'
      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
      : primaryRelation === 'infrastructure'
        ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300'
        : 'bg-[var(--cn-brand-soft)] text-[var(--cn-brand)]';

  return (
    <span
      aria-hidden
      className={`${className} flex items-center justify-center text-base font-semibold ${fallbackClass}`}
    >
      {companion.name.slice(0, 1)}
    </span>
  );
}

function CompanionCardContent({ companion }: { companion: Companion }) {
  const primaryRelation = getPrimaryRelation(companion);
  const accent = relationMeta[primaryRelation];

  return (
    <>
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute -right-9 -top-12 size-28 rounded-full border',
          accent.waveOuterClass,
        )}
      />
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute -right-1 -top-7 size-20 rounded-full border',
          accent.waveInnerClass,
        )}
      />

      <div className="relative z-10 flex items-start gap-3">
        <CompanionVisual companion={companion} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className={cn('min-w-0 flex-1 break-words text-fd-foreground', siteType.cardTitle)}>
              {companion.name}
            </h3>
            {companion.active && (
              <span
                title="持续支持中"
                aria-label="持续支持中"
                className="size-2 shrink-0 rounded-full bg-teal-500 shadow-[0_0_0_3px_color-mix(in_oklab,#14b8a6_12%,transparent)]"
              />
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-2.5 gap-y-1">
            {companion.relations.map((relation) => {
              const meta = relationMeta[relation];
              const Icon = meta.icon;
              return (
                <span
                  key={relation}
                  className="inline-flex items-center gap-1 text-xs text-fd-muted-foreground"
                >
                  <Icon className={cn('size-3', meta.iconClass)} aria-hidden />
                  {meta.label}
                </span>
              );
            })}
          </div>
        </div>
        {companion.url && (
          <ExternalLink
            className="mt-0.5 size-3.5 shrink-0 text-fd-muted-foreground/60 transition-colors group-hover:text-fd-foreground"
            aria-hidden
          />
        )}
      </div>

      {companion.description && (
        <p className="relative z-10 mt-3 text-sm leading-6 text-fd-muted-foreground">
          {companion.description}
        </p>
      )}

      {companion.resourceEntries.length > 0 && (
        <ul className="relative z-10 mt-3 space-y-2 border-t border-fd-border/60 pt-2.5">
          {companion.resourceEntries.map((entry) => (
            <li key={`${entry.need}-${entry.period}`} className="text-xs leading-5">
              <div className="flex items-start justify-between gap-2">
                <span className="inline-flex rounded-md bg-teal-500/10 px-1.5 py-0.5 font-medium text-teal-700 dark:text-teal-300">
                  {entry.need}
                </span>
                <span className="shrink-0 tabular-nums text-fd-muted-foreground">
                  {entry.period}
                </span>
              </div>
              {entry.detail && (
                <p className="mt-0.5 break-words text-fd-muted-foreground">{entry.detail}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function CompanionCard({ companion }: { companion: Companion }) {
  const accent = relationMeta[getPrimaryRelation(companion)];
  const primaryRelation = getPrimaryRelation(companion);
  const className = cn(
    'group relative block overflow-hidden rounded-xl border border-fd-border bg-fd-card p-4 text-left',
    primaryRelation === 'supporter' ? 'min-h-0' : 'h-full min-h-40',
    companion.url && cn(cardHover, accent.hoverClass, focusRing),
  );

  return companion.url ? (
    <a
      href={companion.url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      <CompanionCardContent companion={companion} />
      <span className="sr-only">（在新窗口打开）</span>
    </a>
  ) : (
    <div className={className}>
      <CompanionCardContent companion={companion} />
    </div>
  );
}
