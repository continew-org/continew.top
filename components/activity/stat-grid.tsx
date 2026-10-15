import { cn } from '@/lib/cn';
import { siteType } from '@/lib/site-design';

/**
 * 社区活跃度的读数网格：年份切换器下面那组（跟着选中的窗口变）。
 *
 * 单独成文件是因为读数的排版（字号、间距、`dt`/`dd` 语义）与热力图是两个关注点，
 * 合在一个组件里会让「画格子」和「排数字」互相牵制。
 */

export interface ActivityStat {
  label: string;
  value: string;
  note?: string;
}

/** `2026-10-04` → `10 月 4 日`。用于把「最活跃的一周」的周起始日写成读者看得懂的日期。 */
export function formatMonthDay(date: string): string {
  return `${Number(date.slice(5, 7))} 月 ${Number(date.slice(8, 10))} 日`;
}

export function ActivityStatGrid({ stats }: Readonly<{ stats: ActivityStat[] }>) {
  if (stats.length === 0) return null;

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
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
