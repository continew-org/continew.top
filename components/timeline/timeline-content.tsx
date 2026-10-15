import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';
import { Award, Star, Trophy } from 'lucide-react';
import { CommitActivity } from '@/components/activity/commit-activity';
import { StarTrendChart } from '@/components/activity/star-trend-chart';
import { AtomGitIcon, GiteeIcon, GitHubIcon } from '@/components/brand-icons';
import { cn } from '@/lib/cn';
import { PageIntro } from '@/components/site-primitives';
import { ActionLink } from '@/components/site-actions';
import { focusRing, siteType } from '@/lib/site-design';
import type { CommitActivityData, StarTrend } from '@/lib/repo-activity';
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
  trend: StarTrend;
  activity: CommitActivityData;
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

function TimelineHero({
  stars,
  trend,
  totalDays,
  honorCount,
  startYear,
}: Readonly<Pick<TimelineContentProps, 'stars' | 'trend' | 'totalDays' | 'honorCount' | 'startYear'>>) {
  const stats = [
    { value: `${stars.total.toLocaleString()}+`, label: '累计 Star' },
    { value: totalDays.toLocaleString(), label: '持续维护（天）' },
    { value: String(honorCount), label: '平台荣誉' },
  ];
  const hasTrend = trend.live && trend.points.length > 1;

  return (
    /*
     * Hero 不再自带 `border-b` 与底部内边距。
     *
     * 那条边线原本是 Hero 与年份列表之间唯一的分隔，但现在 Hero 之后先接「社区活跃度」
     * 这一段，边线加上双方各留的一份间距，就在两个区块中间堆出「一条线夹着一大段空白」。
     * 区块之间的距离统一交给各区块自己的 `mt`，Hero 只负责把自己的内容收尾。
     */
    <header className="relative">
      {/*
       * 右侧原先是一张装饰性的假曲线：硬编码的坐标与手写的「2022 / 2023 / 2024」标签。
       * 有了真实 Star 历史之后，它就是在向读者展示一条不存在的趋势，只能换掉。
       *
       * 同时去掉了原来的 `hidden lg:block`：装饰图藏起来不损失任何信息，
       * 真图藏起来等于移动端没有这个功能——而移动端才是多数访客。
       * 拉不到数据时 `StarTrendChart` 返回 null，网格退回单列，右侧不会留一片空白。
       */}
      <div
        className={cn(
          'grid items-center gap-12',
          hasTrend && 'lg:grid-cols-[minmax(0,1fr)_22rem]',
        )}
      >
        <PageIntro
          className="cn-stagger"
          eyebrow={<span className="font-mono">Since {startYear}</span>}
          title="发展历程"
          description="2022 年的冬天，一次再普通不过的项目初始化，成了这段旅程的起点。此后的每一次发版、每一个 Star、每一份来自平台和社区的认可，都被留在了这条时间线上。"
        />
        <StarTrendChart trend={trend} />
      </div>

      <dl className="mt-10 grid grid-cols-3 divide-x divide-fd-border border-y border-fd-border/70 sm:mt-12">
        {stats.map((stat) => (
          <div key={stat.label} className="flex min-w-0 flex-col-reverse px-2 py-5 text-center sm:py-6">
            <dt className="mt-1.5 text-xs leading-snug text-fd-muted-foreground sm:text-xs">
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
            <ActionLink key={platform.key} href={platform.url} variant="text">
              <PlatformIcon className="size-4" aria-hidden />
              <span className="font-semibold text-fd-foreground tabular-nums">
                {platform.count.toLocaleString()}
              </span>
              {platform.name}
            </ActionLink>
          );
        })}
      </div>
    </header>
  );
}

function YearNavigation({ groups }: Readonly<{ groups: TimelineYearGroup[] }>) {
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
            className={cn('inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 py-2 font-mono text-sm font-medium text-fd-muted-foreground transition-colors hover:bg-[var(--cn-brand-soft)] hover:text-[var(--cn-brand)]', focusRing)}
          >
            {year}
            <span className="text-xs tabular-nums opacity-65">{items.length}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

function TypeBadge({ type }: Readonly<{ type: TimelineType }>) {
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

function TimelineEntry({ item }: Readonly<{ item: TimelineItem }>) {
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

function TimelineYear({ year, items }: Readonly<TimelineYearGroup>) {
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

/**
 * 社区活跃度：提交热力图 + 该窗口自己的读数。
 *
 * 位置在 Hero 与年份导航之间——先总后分：这一块回答「这段历程现在走到哪了」，
 * 下面的年份列表才是逐条细节。年份导航是 sticky 的，把这一块放到它后面，
 * 它会跟着导航一起黏在顶部，和 Hero 的呼应就断了。
 */
function CommunityActivity({ activity }: Readonly<Pick<TimelineContentProps, 'activity'>>) {
  /*
   * 区块间距统一由本节的 `mt` 提供，本节不画分隔线：Hero 的边线已去掉（见 TimelineHero
   * 的注释），这里再加一条就会在同一个位置出现第二条线。年份导航与各个年份区块各自带
   * `border-y` / `border-t`，它们与相邻内容之间没有重复的线，所以那几处保持原样。
   */
  return (
    <section className="cn-reveal mt-14 sm:mt-16">
      <h2 className={siteType.sectionTitle}>社区活跃度</h2>
      <p className={cn('mt-2 max-w-3xl text-fd-muted-foreground', siteType.compact)}>
        提交节奏可以按年份回看，从 2022 年 12 月的第一次提交到现在。数据在每次构建时从 GitHub
        公开接口读取。
      </p>

      {activity.live && (
        <div className="mt-8">
          <CommitActivity windows={activity.windows} />
        </div>
      )}
    </section>
  );
}

export function TimelineContent({
  groups,
  stars,
  trend,
  activity,
  totalDays,
  honorCount,
  startYear,
}: Readonly<TimelineContentProps>) {
  return (
    <>
      <TimelineHero
        stars={stars}
        trend={trend}
        totalDays={totalDays}
        honorCount={honorCount}
        startYear={startYear}
      />
      <CommunityActivity activity={activity} />
      <YearNavigation groups={groups} />
      <div className="mt-14 space-y-16 sm:mt-16 sm:space-y-20">
        {groups.map((group) => (
          <TimelineYear key={group.year} {...group} />
        ))}
      </div>
    </>
  );
}
