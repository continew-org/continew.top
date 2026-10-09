'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * 导航里的「赞助」入口（带皇冠图标）。
 *
 * 图标与赞助页「独家赞助者」档位保持一致（同为 Crown），让导航入口和落地页对得上；
 * 用皇冠而非心形，是因为这一栏本质是「赞助档位」的入口，心形更偏向「捐赠」，
 * 而这里点进去看到的是四档权益。
 *
 * 为什么不用内置导航项的 `icon` 字段：
 * HomeLayout 桌面端渲染普通导航项时是 `item.type === 'icon' ? item.icon : item.text` ——
 * 只有 `type: 'icon'` 才画图标，文字链接（`type: 'main'`）的 icon 会被直接丢掉，
 * 仅移动端菜单会渲染。想让桌面端也带图标，只能自建这一项。
 *
 * 样式对齐 fumadocs 的 main 导航项，颜色沿用全站规则：
 * 默认中性、hover 转前景色、命中当前页时转主色，不额外占品牌色预算。
 */
export function NavSponsorLink() {
  const pathname = usePathname();
  const active = pathname === '/sponsor';

  return (
    <Link
      href="/sponsor"
      aria-current={active ? 'page' : undefined}
      /*
       * 挂 data-active 而不是在 className 里写三元：
       * 高亮样式（品牌色 + 底部指示条）统一由 global.css 的 #nd-nav 规则负责，
       * 这样自建导航项与 fumadocs 内置的「文档 / 博客」长得一模一样，
       * 不会出现两种当前页样式。
       */
      data-active={active}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors',
        'text-fd-muted-foreground hover:text-fd-foreground',
      )}
    >
      <Crown className="size-4" aria-hidden />
      赞助
    </Link>
  );
}
