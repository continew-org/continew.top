import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * 全站页面骨架原语。
 *
 * 这批二级页面（发展历程 / 登记用户 / 社区团队 / 赞助 / 博客）此前各自手写容器与间距，
 * 出现 max-w-3xl、max-w-4xl、max-w-5xl 三套宽度与 py-16、py-20 两套纵向间距，
 * 视觉节奏对不齐。统一收敛到本文件的原语后，各页只关心内容结构。
 */

/**
 * 卡片 hover 反馈的统一写法：极淡底色 + 半强度边框，一次性过渡。
 *
 * 此前各页各写一套（有的只把边框拉到 100% 主色、背景不动），观感一硬一软，
 * 读者能明显感觉到「这个卡片 hover 起来有点毛边」。这里收敛成一份，新增卡片直接用它。
 */
export const cardHover =
  'transition-colors hover:border-fd-primary/50 hover:bg-fd-accent/30';

/** 统一页面容器：单一最大宽度 + 单一左右留白 + 单一纵向节奏。 */
export function PageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn(
        'relative mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-16 sm:py-20',
        className,
      )}
    >
      {/*
        页顶极淡品牌色光晕：与首页 Hero 的 radial-gradient 呼应，让内容页与首页共享同一视觉语言。
        饱和度刻意压到 7% —— 只提供「这不是纯文档页」的氛围，不参与信息表达。
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_oklab,var(--color-fd-primary)_7%,transparent),transparent_70%)]"
      />
      {children}
    </main>
  );
}

export interface PageStat {
  value: string;
  label: string;
  /** 可选图标：给数字一个视觉锚点，避免四项纯文字排排坐。 */
  icon?: ReactNode;
}

/**
 * 统一页面头。
 * stats 用于把该页最有力的数字提炼到首屏（信任状），避免读者一进页就掉进长列表。
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  stats,
  actions,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  stats?: PageStat[];
  actions?: ReactNode;
  /** 渲染在页面头末尾，用于补充 stats 无法表达的明细（如分平台数据）。 */
  children?: ReactNode;
}) {
  return (
    <header className="text-center">
      {eyebrow && (
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-fd-primary">{eyebrow}</p>
      )}
      <h1 className={cn('font-bold tracking-tight text-3xl sm:text-4xl', eyebrow && 'mt-3')}>
        {title}
      </h1>
      {description && (
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-fd-muted-foreground sm:text-base">
          {description}
        </p>
      )}
      {actions && <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{actions}</div>}
      {stats && stats.length > 0 && (
        <dl
          className={cn(
            'mt-10 grid grid-cols-2 gap-3',
            // 列数跟随实际项数，否则项数不足时会靠左排布、右侧留一大块空白
            stats.length === 2
              ? 'sm:grid-cols-2'
              : stats.length === 3
                ? 'sm:grid-cols-3'
                : 'sm:grid-cols-4',
          )}
        >
          {stats.map((stat) => (
            /*
              DOM 顺序为「标签 → 数值 → 图标」，再用 flex-col-reverse 反转为「图标 / 数值 / 标签」的视觉顺序：
              <dl> 规范要求 dt 必须出现在 dd 之前，而统计卡的设计是数值在上、标签在下，
              用 reverse 兼顾语义正确与视觉层级，读屏顺序为「标签 数值」，语义同样通顺。
            */
            <div
              key={stat.label}
              className="flex flex-col-reverse rounded-xl border border-fd-border bg-fd-card px-4 py-5 text-center transition-colors hover:border-fd-primary/40"
            >
              <dt className="mt-1 text-xs text-fd-muted-foreground">{stat.label}</dt>
              <dd className="text-2xl font-semibold tracking-tight tabular-nums">{stat.value}</dd>
              {stat.icon && (
                <div className="mx-auto mb-2.5 flex size-8 items-center justify-center rounded-lg bg-fd-primary/10 text-fd-primary">
                  {stat.icon}
                </div>
              )}
            </div>
          ))}
        </dl>
      )}
      {children}
    </header>
  );
}

/** 统一区块：标题 + 可选描述 + 可选右上角操作，区块间距固定。 */
export function Section({
  id,
  title,
  description,
  action,
  children,
  className,
}: {
  id?: string;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn('mt-16', className)}>
      {(title || action) && (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            {title && <h2 className="text-xl font-semibold tracking-tight">{title}</h2>}
            {description && (
              <p className="mt-2 text-sm text-fd-muted-foreground">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export interface NextLinkItem {
  href: string;
  title: string;
  description: string;
}

/**
 * 页面底部「接下来去哪」。
 * 此前各二级页面是孤岛，读者看完不知道下一步在哪，这里提供统一的出口。
 */
export function PageNextLinks({ links }: { links: NextLinkItem[] }) {
  if (links.length === 0) return null;
  return (
    <nav
      aria-label="继续浏览"
      className="mt-20 border-t border-fd-border pt-10"
    >
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-fd-muted-foreground">
        继续浏览
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-xl border border-fd-border p-5 transition-colors hover:border-fd-primary/60 hover:bg-fd-accent/40"
          >
            <div className="flex items-center gap-2 font-medium">
              {link.title}
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-fd-muted-foreground">
              {link.description}
            </p>
          </Link>
        ))}
      </div>
    </nav>
  );
}
