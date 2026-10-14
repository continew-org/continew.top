import type { ActiveContributors, StarTrend } from '@/lib/repo-activity';
import { cn } from '@/lib/cn';
import { siteType } from '@/lib/site-design';
import { ActivityStatGrid, type ActivityStat } from './stat-grid';

/**
 * 「最近的增长」这组读数。
 *
 * 与年份切换器下面那组的分工：那组跟着选中的窗口变（回答「那段时间怎么样」），
 * 这组**始终相对今天**（回答「现在还在不在涨」）。
 *
 * 增量是这里唯一的信息量来源——累计数字全站已经到处都是（首页数据带、团队页、
 * Hero 统计），累计 Star 只说明「来过多少人」，近 30 天新增才说明「还在不在涨」。
 */
export function ActivityStats({
  last30Commits,
  starTrend,
  active,
  recentRegistered,
}: Readonly<{
  /** 近 30 天提交数；提交记录拿不到时传 null，这一项就不显示。 */
  last30Commits: number | null;
  starTrend: StarTrend;
  active: ActiveContributors;
  recentRegistered: number;
}>) {
  const stats: ActivityStat[] = [];

  if (starTrend.live) {
    stats.push({ label: '近 30 天新增 Star', value: starTrend.last30.toLocaleString() });
  }
  if (last30Commits !== null) {
    stats.push({ label: '近 30 天提交', value: last30Commits.toLocaleString() });
  }
  if (active.live) {
    stats.push({
      label: '近 90 天活跃贡献者',
      value: active.recent.toLocaleString(),
      // 与「近一年」并列才看得出趋势：只有 5 这个数字，读者不知道是多是少
      note: `近一年 ${active.yearly} 人`,
    });
  }
  /*
   * 登记用**一年**窗口，与另外三项的 30 / 90 天不同（窗口由调用方传入）。
   *
   * 实测最近一次登记在 2025-12-19，近 90 天与近 180 天都是 0。把一个 0 摆在
   * 「近 30 天提交 119」旁边，读者读到的是「这个项目没人用了」——但真实情况是
   * 登记入口本身没在推广，两个数字说的根本不是一回事。窗口写进标签，值才不误导。
   */
  stats.push({ label: '近一年新增登记', value: recentRegistered.toLocaleString() });

  return (
    <div>
      <h3 className={cn('text-fd-muted-foreground', siteType.cardTitle)}>最近的增长</h3>
      <div className="mt-4">
        <ActivityStatGrid stats={stats} />
      </div>
    </div>
  );
}
