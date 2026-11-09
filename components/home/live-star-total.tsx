'use client';

import { useLiveStats } from '@/lib/live-stats';
import { AnimatedNumber } from './animated-number';

/**
 * 首页数据带的「全平台 Star」：AnimatedNumber 的实时值版本。
 *
 * 数值取 stats.json 的合计（部署机每小时刷新），取不到就用构建值——
 * 动画与数字的呈现规则完全交给 AnimatedNumber，这里只换输入。
 * 实时值通常在水合后、滚进视口前就位，不会看到二次滚动。
 */
export function LiveStarTotal({ value }: Readonly<{ value: number }>) {
  const live = useLiveStats();
  return <AnimatedNumber value={typeof live?.total === 'number' ? live.total : value} />;
}
