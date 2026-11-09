'use client';

import { useLiveStats, type LiveStats } from '@/lib/live-stats';
import type { PlatformKey } from '@/lib/platform-api';

/**
 * 实时 Star 数字：构建值直出首帧，挂载后若 stats.json 有对应数值则静默替换。
 *
 * 不自带包裹元素（输出纯文本节点），字号、颜色、tabular-nums 由调用点已有的
 * 容器决定——三处消费点（导航下拉、首页、时间线）的外观各不相同，
 * 组件只负责「这个数字是最新的」。
 */
export function LiveStarNumber({
  value,
  platform,
  suffix,
}: Readonly<{
  /** 构建期数值（兜底显示）。 */
  value: number;
  /** 指定平台则取该平台实时值；缺省取三平台合计。 */
  platform?: PlatformKey;
  /** 拼在数字后面的符号（如时间线的「+」）。 */
  suffix?: string;
}>) {
  const live = useLiveStats();
  return <>{format(resolve(value, live, platform))}{suffix}</>;
}

/** 实时值优先；缺键（平台拉取失败 / total 未生成）回落构建值。 */
function resolve(initial: number, stats: LiveStats | null, platform?: PlatformKey): number {
  if (!stats) return initial;
  const value = platform ? stats.platforms[platform] : stats.total;
  return typeof value === 'number' ? value : initial;
}

function format(value: number): string {
  return value.toLocaleString('en-US');
}
