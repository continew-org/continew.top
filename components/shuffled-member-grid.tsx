'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import type { TeamMember } from '@/lib/team';
import { TeamMemberCard } from './team-member-card';

/**
 * SSR 阶段 useLayoutEffect 无效且 React 会告警，故服务端退化为 useEffect；
 * 客户端用 useLayoutEffect —— 在水合后、浏览器绘制**之前**完成重排，
 * 这样访问者看不到「先一个顺序、再跳成另一个顺序」的闪烁。
 */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Fisher-Yates 洗牌。 */
function shuffle<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * 成员卡片网格：每次页面加载都重新洗牌，让每位成员的曝光位置长期均匀。
 *
 * 构建期（静态导出）渲染的顺序用于 SSR/SEO，客户端加载后再洗一次 ——
 * 因此每次刷新看到的顺序都不同。
 *
 * @param fixedFirst 为 true 时保留首位不动（核心成员区用，Creator 固定第一）。
 */
export function ShuffledMemberGrid({
  members,
  fixedFirst,
}: {
  members: TeamMember[];
  fixedFirst?: boolean;
}) {
  // 初始值必须与服务端渲染结果一致，否则水合会不匹配
  const [order, setOrder] = useState(members);

  useIsomorphicLayoutEffect(() => {
    setOrder(
      fixedFirst && members.length > 1
        ? [members[0], ...shuffle(members.slice(1))]
        : shuffle(members),
    );
  }, []);

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {order.map((m) => (
        <TeamMemberCard key={m.name} member={m} />
      ))}
    </div>
  );
}
