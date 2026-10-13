import { ExternalLink, Handshake, Heart, Server, type LucideIcon } from 'lucide-react';
import { sponsorLogoUrl, type Companion, type TierKey } from '@/lib/sponsors';
import { cardHover } from '@/components/site-primitives';
import { cn } from '@/lib/cn';
import { focusRing } from '@/lib/site-design';

const relationMeta: Record<
  TierKey,
  {
    label: string;
    icon: LucideIcon;
    iconClass: string;
    waveOuterClass: string;
    waveInnerClass: string;
    /** 无头像时代替首字的底色（与关系主题一致）。 */
    initialClass: string;
  }
> = {
  strategic: {
    label: '开源合作伙伴',
    icon: Handshake,
    iconClass: 'text-[var(--cn-brand)]',
    waveOuterClass: 'border-[var(--cn-brand-line)]',
    waveInnerClass: 'border-blue-400/15',
    initialClass: 'bg-[var(--cn-brand-soft)] text-[var(--cn-brand)]',
  },
  infrastructure: {
    label: '资源合作伙伴',
    icon: Server,
    iconClass: 'text-teal-600 dark:text-teal-400',
    waveOuterClass: 'border-teal-400/25',
    waveInnerClass: 'border-teal-300/15',
    initialClass: 'bg-teal-500/10 text-teal-700 dark:text-teal-300',
  },
  supporter: {
    label: '个人支持者',
    icon: Heart,
    iconClass: 'text-amber-600 dark:text-amber-400',
    waveOuterClass: 'border-amber-400/30',
    waveInnerClass: 'border-amber-300/20',
    initialClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  },
};

function getPrimaryRelation(companion: Companion): TierKey {
  if (companion.relations.includes('strategic')) return 'strategic';
  if (companion.relations.includes('infrastructure')) return 'infrastructure';
  return 'supporter';
}

function SupporterVisual({ companion }: Readonly<{ companion: Companion }>) {
  const className = 'size-10 shrink-0 rounded-xl';

  if (companion.logo) {
    return (
      <span
        className={`${className} flex items-center justify-center border border-fd-border bg-white p-2 shadow-sm`}
      >
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
      <span
        aria-hidden
        className={`${className} relative flex items-center justify-center overflow-hidden border border-fd-border bg-teal-500/10 text-sm font-semibold text-teal-700 shadow-sm dark:text-teal-300`}
      >
        {companion.name.slice(0, 1)}
        {/* 图片成功时覆盖首字；外链头像失效时，底层首字自然成为兜底。 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={companion.avatar}
          alt=""
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
        />
      </span>
    );
  }

  const relation = getPrimaryRelation(companion);
  const fallbackClass = relationMeta[relation].initialClass;

  return (
    <span
      aria-hidden
      className={`${className} flex items-center justify-center text-sm font-semibold ${fallbackClass}`}
    >
      {companion.name.slice(0, 1)}
    </span>
  );
}

function CardContent({ companion }: Readonly<{ companion: Companion }>) {
  const relation = getPrimaryRelation(companion);
  const accent = relationMeta[relation];

  return (
    <>
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute -right-8 -top-11 size-24 rounded-full border',
          accent.waveOuterClass,
        )}
      />
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute -right-1 -top-6 size-16 rounded-full border',
          accent.waveInnerClass,
        )}
      />

      <div className="relative z-10 flex items-start gap-3">
        <SupporterVisual companion={companion} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="min-w-0 break-words text-sm font-semibold leading-5 text-fd-foreground">
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
          <div className="mt-1 flex flex-wrap gap-x-2.5 gap-y-1">
            {companion.relations.map((item) => {
              const meta = relationMeta[item];
              const Icon = meta.icon;
              return (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 text-xs leading-5 text-fd-muted-foreground"
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
            aria-hidden
            className="mt-0.5 size-3.5 shrink-0 text-fd-muted-foreground/50 transition-colors group-hover:text-fd-foreground"
          />
        )}
      </div>

      {companion.description && (
        <p className="relative z-10 mt-3 text-xs leading-relaxed text-fd-muted-foreground">
          {companion.description}
        </p>
      )}

      {companion.resourceEntries.length > 0 && (
        <ul className="relative z-10 mt-3 space-y-1.5 border-t border-fd-border/60 pt-2.5">
          {companion.resourceEntries.map((entry) => (
            <li
              key={`${entry.need}-${entry.period}`}
              className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs"
            >
              <span className="inline-flex rounded-md bg-teal-500/10 px-1.5 py-0.5 font-medium text-teal-700 dark:text-teal-300">
                {entry.need}
              </span>
              {entry.detail && (
                <span className="break-words text-fd-muted-foreground">{entry.detail}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function HomepageSupporterCard({ companion }: { companion: Companion }) {
  const className = 'group relative block h-full min-h-32 overflow-hidden rounded-xl border border-fd-border bg-fd-card p-4 text-left';

  return companion.url ? (
    <a
      href={companion.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(className, cardHover, focusRing)}
    >
      <CardContent companion={companion} />
      <span className="sr-only">（在新窗口打开）</span>
    </a>
  ) : (
    <div className={className}>
      <CardContent companion={companion} />
    </div>
  );
}
