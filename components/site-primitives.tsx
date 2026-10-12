import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { focusRing, siteLayout, siteMotion, siteType } from '@/lib/site-design';

export const cardHover =
  'transition-colors duration-[var(--cn-motion-duration-fast)] hover:border-[var(--cn-brand-line)] hover:bg-fd-accent/30';

export function PageContainer({
  children,
  variant = 'standard',
  className,
}: {
  children: ReactNode;
  variant?: 'standard' | 'reading';
  className?: string;
}) {
  return (
    <main
      data-cn-page={variant}
      className={cn('relative flex flex-1 flex-col py-16 sm:py-20', siteLayout[variant], className)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_oklab,var(--cn-brand)_7%,transparent),transparent_70%)]"
      />
      {children}
    </main>
  );
}

export interface PageStat {
  value: string;
  label: string;
  icon?: ReactNode;
}

export function PageIntro({
  eyebrow,
  title,
  description,
  variant = 'community',
  align = 'left',
  actions,
  children,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  variant?: 'community' | 'editorial' | 'task';
  align?: 'left' | 'center';
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('relative min-w-0', align === 'center' && 'text-center', className)}>
      {eyebrow && <p className="text-sm font-medium text-[var(--cn-brand)]">{eyebrow}</p>}
      <h1
        data-cn-title={variant}
        className={cn(
          variant === 'task' ? siteType.taskTitle : siteType.pageTitle,
          'max-w-3xl',
          Boolean(eyebrow) && 'mt-4',
          align === 'center' && 'mx-auto',
        )}
      >
        {title}
      </h1>
      {description && (
        <p className={cn('mt-5 max-w-2xl', siteType.pageDescription, align === 'center' && 'mx-auto')}>
          {description}
        </p>
      )}
      {actions && (
        <div className={cn('mt-8 flex flex-wrap items-center gap-3', align === 'center' && 'justify-center')}>
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}

export function PageHeader({
  stats,
  children,
  ...intro
}: Omit<Parameters<typeof PageIntro>[0], 'children'> & { stats?: PageStat[]; children?: ReactNode }) {
  return (
    <header className="relative">
      <PageIntro {...intro} />
      {stats && stats.length > 0 && (
        <dl className={cn('mt-10 grid grid-cols-2 gap-3', stats.length === 3 ? 'sm:grid-cols-3' : stats.length > 3 && 'sm:grid-cols-4')}>
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse rounded-xl border border-fd-border bg-fd-card px-4 py-5 text-center">
              <dt className={cn('mt-1 text-fd-muted-foreground', siteType.meta)}>{stat.label}</dt>
              <dd className="text-2xl font-semibold tracking-tight tabular-nums">{stat.value}</dd>
              {stat.icon && <div className="mx-auto mb-2.5 text-[var(--cn-brand)]">{stat.icon}</div>}
            </div>
          ))}
        </dl>
      )}
      {children}
    </header>
  );
}

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
            {title && <h2 className={siteType.sectionTitle}>{title}</h2>}
            {description && <p className={cn('mt-2 max-w-3xl text-fd-muted-foreground', siteType.compact)}>{description}</p>}
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

export function PageNextLinks({ links }: { links: NextLinkItem[] }) {
  if (links.length === 0) return null;
  return (
    <nav aria-label="继续浏览" className="mt-20 border-t border-fd-border pt-10">
      <p className={cn('font-medium text-fd-muted-foreground', siteType.meta)}>继续浏览</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={cn('group rounded-xl border border-fd-border p-5', cardHover, focusRing)}>
            <div className={cn('flex items-center gap-2', siteType.cardTitle)}>
              {link.title}
              <ArrowRight className={cn('size-4 shrink-0', siteMotion.arrow)} aria-hidden />
            </div>
            <p className={cn('mt-1.5 text-fd-muted-foreground', siteType.compact)}>{link.description}</p>
          </Link>
        ))}
      </div>
    </nav>
  );
}
