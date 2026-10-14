'use client';

import { useState } from 'react';
import { FilterChip } from '@/components/site-actions';
import type { HeatmapWindow } from '@/lib/repo-activity';
import { CommitHeatmapChart } from './commit-heatmap';
import { ActivityStatGrid, formatMonthDay, type ActivityStat } from './stat-grid';

/**
 * 社区活跃度：年份切换器 + 提交热力图 + 该窗口的读数。
 *
 * ## 为什么是客户端组件
 *
 * 切换年份要改状态，所以这里是全站少数的 `'use client'` 之一。但
 * **默认窗口（近一年）仍然是服务端渲染的**：首屏 HTML 里就有完整的格子与读数，
 * 无 JavaScript 时读者拿到的是一张完整的近一年热力图，只是不能切换年份。
 * 这与设计契约「无 JavaScript 时关键文本与数字仍可读」一致——切换是增强，不是前提。
 *
 * ## 为什么默认是「近一年」而不是当前年份
 *
 * 读者最先想知道的是「最近怎么样」。近一年这个窗口同时含着去年年末与今年，
 * 能把近期回升的势头完整呈现；而按自然年切会切掉去年 10~12 月，
 * 恰好丢掉势头开始的那一段。
 */
export function CommitActivity({ windows }: Readonly<{ windows: HeatmapWindow[] }>) {
  const [activeKey, setActiveKey] = useState(windows[0]?.key);
  const active = windows.find((item) => item.key === activeKey) ?? windows[0];
  if (!active) return null;

  const stats: ActivityStat[] = [
    { label: '提交次数', value: active.total.toLocaleString() },
    { label: '有提交的天数', value: active.activeDays.toLocaleString() },
    {
      label: '最活跃的一周',
      value: (active.bestWeek?.count ?? 0).toLocaleString(),
      note: active.bestWeek ? `${formatMonthDay(active.bestWeek.date)}那周` : undefined,
    },
    { label: '最长连续活跃', value: `${active.longestStreakWeeks} 周` },
  ];

  return (
    <div data-cn-chart="commit-activity">
      {/*
       * 年份切换器用 FilterChip：它自带 `aria-pressed` 与选中态，正是「筛选」语义。
       * 热力图本身是 aria-hidden 的，所以这个切换器就是读屏用户唯一的操作入口。
       */}
      <div role="group" aria-label="选择统计窗口" className="flex flex-wrap items-center gap-2">
        {windows.map((item) => (
          <FilterChip
            key={item.key}
            selected={item.key === active.key}
            onClick={() => setActiveKey(item.key)}
          >
            {item.label}
          </FilterChip>
        ))}
      </div>

      <div className="mt-6">
        <CommitHeatmapChart heatmap={active} />
      </div>

      {/*
       * aria-live：切换年份后读数会整组变化，读屏用户需要被念出新的数字，
       * 否则点完按钮页面「什么都没发生」。polite 不会打断当前朗读，
       * 且首屏加载时不会播报初始内容。
       */}
      <div className="mt-6" aria-live="polite">
        <ActivityStatGrid stats={stats} />
      </div>
    </div>
  );
}
