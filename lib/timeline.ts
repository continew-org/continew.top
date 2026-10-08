import timelineData from '@/data/timeline.json';

export interface TimelineItem {
  date: string;
  logo?: string;
  title: string;
  desc?: string;
  /**
   * 事件类型：
   * - great：重大版本发布（v1.0.0 / v2.0.0 …）
   * - star：Star 数达成
   * - honor：平台或机构授予的荣誉（榜单、奖项、计划认证）
   * - 不填：其他（社区活动、数据节点、组织事务）
   */
  type?: 'great' | 'star' | 'honor';
  attaches?: string[];
}

/** 全部里程碑，按日期倒序。 */
export function getTimeline(): TimelineItem[] {
  return (timelineData as TimelineItem[]).slice().sort((a, b) => b.date.localeCompare(a.date));
}

/** 项目维护起始日（旧站 TimelineHero「已持续维护 X 天」的基准）。 */
export const maintenanceStartDate = '2022-12-08';

/** 按年份分组（年份倒序，组内日期倒序）。 */
export function getTimelineByYear(): Array<{ year: string; items: TimelineItem[] }> {
  const groups = new Map<string, TimelineItem[]>();
  for (const item of getTimeline()) {
    const year = item.date.slice(0, 4);
    const list = groups.get(year) ?? [];
    list.push(item);
    groups.set(year, list);
  }
  return [...groups.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([year, items]) => ({ year, items }));
}
