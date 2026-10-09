'use client';

import { useEffect, useRef, useState } from 'react';
import { Star } from 'lucide-react';
import { AtomGitIcon, GiteeIcon, GitHubIcon } from '@/components/brand-icons';
import type { PlatformStar } from '@/lib/site-stats';
import { cn } from '@/lib/cn';

const PLATFORM_ICON = {
  github: GitHubIcon,
  gitee: GiteeIcon,
  atomgit: AtomGitIcon,
} as const;

/**
 * 导航栏的全平台 Star 数（GitHub 那个「★ Star | 数字」），点击展开各平台。
 *
 * 【外观：照 GitHub 的语义，但套 Fumadocs 的尺寸】
 * 形状语义照搬 GitHub——左边是动作（Star）、右边是计数，这个组合已经被训练过，
 * 不用再教一遍。但**尺寸必须跟右侧那一排走**，否则就出问题：
 * 它左边是搜索框，再往左是主题切换，两者都是 `rounded-full + border + p-1/p-1.5`
 * 的镂空胶囊、内嵌一个圆角高亮块，总高都是 36px（26px 内容 + 8px padding + 2px 边框）。
 *
 * 早先这枚胶囊是 `rounded-md` + 左右两块纯色（灰底 + 白底）+ 中间一条竖线，
 * 高 26px——比邻居矮一截、圆角小一圈、还是实心的，三种差异叠在一起就显得没对齐。
 * 现在改成同构的「镂空圆角胶囊 + 内部高亮圆角块」，只保留「动作 | 计数」的分区：
 * 计数那个块用 bg-fd-muted，正好对应主题切换里选中项的浅灰底。
 * 尺寸节奏与主题切换逐像素对齐（h-6.5 内容 + p-1 + 边框 = 36px）。
 *
 * 【为什么是「一个综合数 + 下拉」而不是三个平台各显示一个数字】
 * 三个平台各挂一个数字，右侧会变成「图标 + 数字」重复三次的一排，桌面端已经偏挤，
 * 移动端更难放下。而且三个平台的数为什么不一样、加起来是多少，本身需要一句话解释——
 * 下拉里正好一并说清。综合数（全平台合计）也比任何单个平台的数字更有分量。
 *
 * 【位置】
 * lib/layout.shared.tsx 里这一项带 `secondary: true`。
 * Fumadocs 的 `isSecondary()` 用该字段决定渲染到导航栏左侧还是右侧，
 * 默认是 `type === 'icon'` 才靠右；custom 项不显式声明会落到左侧导航链接区里。
 */
export function NavStarCount({
  total,
  platforms,
}: {
  total: number;
  platforms: PlatformStar[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative list-none">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`全平台 ${total} 个 Star，展开查看各平台`}
        className="inline-flex items-center rounded-full border border-fd-border p-1 text-xs transition-colors hover:border-[var(--cn-brand-line)] max-sm:hidden"
      >
        <span className="flex h-6.5 items-center gap-1.5 rounded-full px-2.5 text-fd-muted-foreground">
          <Star className="size-3.5" aria-hidden />
          Star
        </span>
        <span className="flex h-6.5 items-center rounded-full bg-fd-muted px-2.5 font-semibold tabular-nums text-fd-foreground">
          {total.toLocaleString('en-US')}
        </span>
      </button>

      <ul
        className={cn(
          'w-52 rounded-lg border border-fd-border bg-fd-popover p-1 text-sm shadow-md',
          'sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:z-50',
          open ? 'block' : 'hidden',
          // 移动端菜单里：常显、去掉浮层外观
          'max-sm:mt-1 max-sm:block max-sm:w-full max-sm:border-0 max-sm:bg-transparent max-sm:p-0 max-sm:shadow-none',
        )}
      >
        {platforms.map((platform) => {
          const Icon = PLATFORM_ICON[platform.key];
          return (
            <li key={platform.key}>
              <a
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                // 点击后收起（不监听 pathname：会触发 react-hooks/set-state-in-effect）
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-md px-3 py-1.5 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
              >
                <Icon className="size-4 shrink-0" />
                <span className="flex-1 truncate">{platform.name}</span>
                <span className="shrink-0 tabular-nums text-fd-foreground">
                  {platform.count.toLocaleString('en-US')}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
