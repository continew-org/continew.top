import { cn } from '@/lib/cn';
import { siteType } from '@/lib/site-design';

/**
 * 社区活跃度的读数网格。
 *
 * 两个地方要用同一套排版：年份切换器下面那组（跟着选中的窗口变）和
 * 页面底部「最近的增长」那组（始终相对今天）。抽成一份，避免两处的字号、
 * 间距、`dt`/`dd` 语义各写一遍再慢慢跑偏。
 */

export interface ActivityStat {
  label: string;
  value: string;
  note?: string;
}

/**
 * `2026-10-04` → `10 月 4 日`。
 *
 * 「最活跃的一周」两处都要用它把周起始日写成读者看得懂的日期。
 */
export function formatMonthDay(date: string): string {
  return `${Number(date.slice(5, 7))} 月 ${Number(date.slice(8, 10))} 日`;
}

export function ActivityStatGrid({
  stats,
  columns = 4,
}: Readonly<{ stats: ActivityStat[]; columns?: 3 | 4 }>) {
  if (stats.length === 0) return null;

  return (
    <dl
      className={cn(
        'grid grid-cols-2 gap-x-6 gap-y-5',
        columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-4',
      )}
    >
      {stats.map((stat) => (
        <div key={stat.label} className="min-w-0">
          <dt className={cn('text-fd-muted-foreground', siteType.meta)}>{stat.label}</dt>
          <dd className="mt-1">
            <span className="block text-2xl font-bold tracking-tight text-[var(--cn-brand)] tabular-nums">
              {stat.value}
            </span>
            {stat.note && (
              <span className={cn('mt-0.5 block text-fd-muted-foreground', siteType.meta)}>
                {stat.note}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
