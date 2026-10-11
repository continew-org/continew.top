import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';
import { Award, Star, Trophy } from 'lucide-react';
import { AtomGitIcon, GiteeIcon, GitHubIcon } from '@/components/brand-icons';
import { cn } from '@/lib/cn';
import type { PlatformStar, StarSummary } from '@/lib/site-stats';
import type { TimelineItem } from '@/lib/timeline';
import { TimelineGallery } from './timeline-gallery';

type TimelineType = NonNullable<TimelineItem['type']>;

interface TimelineYearGroup {
  year: string;
  items: TimelineItem[];
}

interface TimelineContentProps {
  groups: TimelineYearGroup[];
  stars: StarSummary;
  totalDays: number;
  honorCount: number;
  startYear: string;
}

interface EventTypeMeta {
  label: string;
  icon: LucideIcon;
  featured: boolean;
  badgeClassName: string;
  markerClassName: string;
  panelClassName?: string;
  titleClassName: string;
}

const eventTypeMeta = {
  honor: {
    label: '荣誉',
    icon: Trophy,
    featured: true,
    badgeClassName:
      'border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    markerClassName:
      'size-3.5 rounded-full border-2 border-amber-500 bg-fd-background shadow-[0_0_0_4px_color-mix(in_oklab,#f59e0b_12%,transparent)]',
    panelClassName: 'border-amber-500/25 bg-amber-500/[0.035]',
    titleClassName: 'text-lg font-semibold sm:text-xl',
  },
  great: {
    label: '里程碑',
    icon: Award,
    featured: true,
    badgeClassName:
      'border border-[var(--cn-brand-line)] bg-[var(--cn-brand-soft)] text-[var(--cn-brand)]',
    markerClassName:
      'size-3 rotate-45 rounded-[3px] bg-[var(--cn-brand)] shadow-[0_0_0_4px_color-mix(in_oklab,var(--cn-brand)_12%,transparent)]',
    panelClassName:
      'border-[var(--cn-brand-line)] bg-[color-mix(in_oklab,var(--cn-brand)_3%,transparent)]',
    titleClassName: 'text-lg font-semibold sm:text-xl',
  },
  star: {
    label: 'Star',
    icon: Star,
    featured: false,
    badgeClassName:
      'border border-yellow-500/25 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
    markerClassName:
      'size-2.5 rounded-full bg-yellow-500 shadow-[0_0_0_4px_color-mix(in_oklab,#eab308_10%,transparent)]',
    panelClassName: undefined,
    titleClassName: 'font-semibold',
  },
} satisfies Record<TimelineType, EventTypeMeta>;

const platformIcons: Record<PlatformStar['key'], LucideIcon | typeof AtomGitIcon> = {
  github: GitHubIcon,
  atomgit: AtomGitIcon,
  gitee: GiteeIcon,
};

function TimelineGraph() {
  return (
    <div
      aria-hidden
      className="relative hidden h-64 overflow-hidden rounded-2xl border border-fd-border/70 bg-fd-card/60 lg:block"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,color-mix(in_oklab,var(--cn-brand)_11%,transparent),transparent_58%)]" />
      <svg viewBox="0 0 360 256" className="relative size-full text-[var(--cn-brand)]">
        <path
          d="M92 224 C92 190 92 168 92 143 C92 116 75 111 75 85 C75 61 92 50 92 28"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M92 176 C138 176 128 125 177 125 C211 125 218 103 218 76"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          opacity=".42"
        />
        <path
          d="M92 109 C129 109 133 72 168 72 C195 72 202 51 202 35"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          opacity=".42"
        />
        <g fill="var(--color-fd-background)" stroke="currentColor" strokeWidth="2">
          <circle cx="92" cy="224" r="6" />
          <circle cx="92" cy="176" r="6" />
          <circle cx="92" cy="109" r="6" />
          <circle cx="92" cy="28" r="6" />
          <circle cx="177" cy="125" r="5" />
          <circle cx="218" cy="76" r="5" />
          <circle cx="168" cy="72" r="5" />
          <circle cx="202" cy="35" r="5" />
        </g>
        <g fill="currentColor">
          <circle cx="92" cy="176" r="2.5" />
          <circle cx="92" cy="109" r="2.5" />
          <circle cx="92" cy="28" r="2.5" />
        </g>
        <g className="fill-fd-muted-foreground font-mono text-[11px]">
          <text x="112" y="228">2022 · first commit</text>
          <text x="112" y="180">2023 · v1.0</text>
          <text x="340" y="80" textAnchor="end">2024 · organization</text>
          <text x="112" y="32">2025 · keep shipping</text>
        </g>
      </svg>
    </div>
  );
}

function TimelineHero({
  stars,
  totalDays,
  honorCount,
  startYear,
}: Pick<TimelineContentProps, 'stars' | 'totalDays' | 'honorCount' | 'startYear'>) {
  const stats = [
    { value: `${stars.total.toLocaleString()}+`, label: '累计 Star' },
    { value: totalDays.toLocaleString(), label: '持续维护（天）' },
    { value: String(honorCount), label: '平台荣誉' },
  ];

  return (
    <header className="relative border-b border-fd-border/70 pb-12 sm:pb-16">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="cn-stagger">
          <p className="font-mono text-sm font-medium text-[var(--cn-brand)]">Since {startYear}</p>
          <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            发展历程
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-fd-muted-foreground sm:text-lg">
            2022
            年的冬天，一次再普通不过的项目初始化，成了这段旅程的起点。此后的每一次发版、每一个
            Star、每一份来自平台和社区的认可，都被留在了这条时间线上。
          </p>
        </div>
        <TimelineGraph />
      </div>

      <dl className="mt-10 grid grid-cols-3 divide-x divide-fd-border border-y border-fd-border/70 sm:mt-12">
        {stats.map((stat) => (
          <div key={stat.label} className="flex min-w-0 flex-col-reverse px-2 py-5 text-center sm:py-6">
            <dt className="mt-1.5 text-[11px] leading-snug text-fd-muted-foreground sm:text-xs">
              {stat.label}
            </dt>
            <dd className="text-xl font-bold tracking-tight text-[var(--cn-brand)] tabular-nums sm:text-3xl">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-fd-muted-foreground">
        {stars.platforms.map((platform) => {
          const PlatformIcon = platformIcons[platform.key];
          return (
            <a
              key={platform.key}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-[var(--cn-brand)]"
            >
              <PlatformIcon className="size-3.5" />
              <span className="font-semibold text-fd-foreground tabular-nums">
                {platform.count.toLocaleString()}
              </span>
              {platform.name}
            </a>
          );
        })}
      </div>
    </header>
  );
}

function YearNavigation({ groups }: { groups: TimelineYearGroup[] }) {
  return (
    <nav
      aria-label="按年份浏览"
      className="sticky top-14 z-20 -mx-6 mt-10 overflow-x-auto border-y border-fd-border/70 bg-fd-background/90 px-6 backdrop-blur-md [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="mx-auto flex min-w-max items-center gap-1 py-2">
        <span className="mr-2 text-xs text-fd-muted-foreground">按年份</span>
        {groups.map(({ year, items }) => (
          <a
            key={year}
            href={`#${year}`}
            className="inline-flex items-baseline gap-1.5 rounded-md px-3 py-1.5 font-mono text-sm font-medium text-fd-muted-foreground transition-colors hover:bg-[var(--cn-brand-soft)] hover:text-[var(--cn-brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cn-brand)]/40"
          >
            {year}
            <span className="text-[10px] tabular-nums opacity-65">{items.length}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

function TypeBadge({ type }: { type: TimelineType }) {
  const meta = eventTypeMeta[type];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        meta.badgeClassName,
      )}
    >
      <Icon className="size-3" aria-hidden />
      {meta.label}
    </span>
  );
}

function TimelineEntry({ item }: { item: TimelineItem }) {
  const meta = item.type ? eventTypeMeta[item.type] : undefined;
  const featured = meta?.featured ?? false;

  return (
    <li className="relative pb-9 pl-7 last:pb-0 sm:pl-9">
      <span
        aria-hidden
        className={cn(
          'absolute -left-[9px] flex size-[18px] items-center justify-center',
          featured ? 'top-5' : 'top-0',
        )}
      >
        <span
          className={
            meta?.markerClassName ??
            'size-2 rounded-full bg-fd-muted-foreground/55 shadow-[0_0_0_4px_var(--color-fd-background)] ring-1 ring-fd-border'
          }
        />
      </span>

      <article
        className={cn(
          'min-w-0',
          featured && 'rounded-2xl border p-5 sm:p-6',
          featured && meta?.panelClassName,
        )}
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-fd-muted-foreground">
          <time dateTime={item.date} className="font-mono font-medium tabular-nums">
            {item.date}
          </time>
          {item.logo && (
            <Image
              src={item.logo}
              alt=""
              width={16}
              height={16}
              unoptimized
              className="size-4 rounded-sm"
            />
          )}
          {item.type && <TypeBadge type={item.type} />}
        </div>

        <h3
          className={cn(
            'mt-2 leading-snug',
            meta?.titleClassName ?? 'font-medium',
          )}
        >
          {item.title}
        </h3>
        {item.desc && (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-fd-muted-foreground">
            {item.desc}
          </p>
        )}
        {item.attaches && item.attaches.length > 0 && (
          <TimelineGallery
            images={item.attaches}
            alt={item.title}
            variant={featured ? 'featured' : 'compact'}
          />
        )}
      </article>
    </li>
  );
}

function TimelineYear({ year, items }: TimelineYearGroup) {
  return (
    <section
      id={year}
      className="cn-reveal scroll-mt-28 border-t border-fd-border/70 pt-10 lg:grid lg:grid-cols-[9rem_minmax(0,1fr)] lg:gap-10"
    >
      <div className="mb-7 self-start lg:sticky lg:top-28 lg:mb-0">
        <h2 className="font-mono text-3xl font-bold tracking-tight text-[var(--cn-brand)] tabular-nums">
          {year}
        </h2>
        <p className="mt-1.5 text-xs text-fd-muted-foreground">{items.length} 个节点</p>
      </div>
      <ol className="relative ml-2 min-w-0 border-l border-fd-border">
        {items.map((item) => (
          <TimelineEntry key={`${item.date}-${item.title}`} item={item} />
        ))}
      </ol>
    </section>
  );
}

export function TimelineContent({
  groups,
  stars,
  totalDays,
  honorCount,
  startYear,
}: TimelineContentProps) {
  return (
    <>
      <TimelineHero
        stars={stars}
        totalDays={totalDays}
        honorCount={honorCount}
        startYear={startYear}
      />
      <YearNavigation groups={groups} />
      <div className="mt-14 space-y-16 sm:mt-16 sm:space-y-20">
        {groups.map((group) => (
          <TimelineYear key={group.year} {...group} />
        ))}
      </div>
    </>
  );
}
