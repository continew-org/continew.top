'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

const aboutLinks = [
  { text: '发展历程', url: '/timeline' },
  { text: '社区团队', url: '/team' },
  { text: '登记用户', url: '/users' },
];

/**
 * 「关于」下拉菜单（纵向紧凑列表）。
 *
 * 为什么不用 fumadocs 内置的 `type: 'menu'`：
 * 它把子项渲染成卡片，容器硬编码 `md:grid-cols-2 lg:grid-cols-3`，大屏下三张卡片横向平铺。
 * 那套卡片是给「图标 + 标题 + 一句说明」设计的，我们只有三个纯链接名，
 * 结果每张卡大片留白、横排显得散。容器样式无法从配置覆盖，故自建一个普通下拉。
 *
 * 同一套组件同时用于桌面导航栏（悬浮下拉）与移动端菜单（常显列表），
 * 靠 max-sm 断点切换：小屏隐藏触发按钮、列表去掉浮层样式直接铺开。
 */
export function NavAboutMenu() {
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
        className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground max-sm:hidden"
      >
        关于
        <ChevronDown
          className={cn('size-3.5 transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>
      <ul
        className={cn(
          'w-40 rounded-lg border border-fd-border bg-fd-popover p-1 text-sm shadow-md',
          'sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:z-50',
          open ? 'block' : 'hidden',
          // 移动端菜单里：常显、去掉浮层外观
          'max-sm:mt-1 max-sm:block max-sm:w-full max-sm:border-0 max-sm:bg-transparent max-sm:p-0 max-sm:shadow-none',
        )}
      >
        {aboutLinks.map((link) => (
          <li key={link.url}>
            <Link
              href={link.url}
              // 点击后收起（不用 effect 监听 pathname：会触发 react-hooks/set-state-in-effect）
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-1.5 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
            >
              {link.text}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
