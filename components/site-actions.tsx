import Link from 'next/link';
import { ArrowDown, ArrowRight, ExternalLink } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { focusRing, siteMotion } from '@/lib/site-design';

export type ActionVariant = 'primary' | 'secondary' | 'ghost' | 'text' | 'overlay';
export type ActionSize = 'sm' | 'md' | 'lg' | 'icon' | 'media';

type ActionIconOption = 'auto' | 'next' | 'down' | false;

/**
 * 行动控件的尾部图标：外链用「新窗口」，页内锚点与 icon="down" 用向下箭头，其余用右箭头。
 *
 * 抽成组件而不是「按条件选一个图标变量」：一是不在渲染期生成组件（React 编译器规则
 * react-hooks/static-components），二是顺带避开嵌套三元（Sonar typescript:S3358）。
 */
function ActionIcon({
  external,
  icon,
  href,
}: Readonly<{ external: boolean; icon: ActionIconOption; href: string }>) {
  if (external) {
    return <ExternalLink className="size-4 shrink-0" aria-hidden />;
  }
  if (icon === 'down' || href.startsWith('#')) {
    return <ArrowDown className="size-4 shrink-0" aria-hidden />;
  }
  return <ArrowRight className="size-4 shrink-0" aria-hidden />;
}

const variants: Record<ActionVariant, string> = {
  primary: 'border border-transparent bg-[var(--cn-brand)] text-[var(--cn-brand-on)] hover:bg-[var(--cn-brand-strong)]',
  secondary: 'border border-fd-border bg-fd-background hover:border-[var(--cn-brand-line)] hover:bg-fd-accent',
  ghost: 'border border-transparent hover:bg-fd-accent',
  overlay: 'border border-transparent bg-black/70 text-white hover:bg-black/90',
  text: 'text-[var(--cn-brand)] underline-offset-4 hover:underline',
};

const sizes: Record<ActionSize, { base: string; padding: string }> = {
  sm: { base: 'min-h-9 text-sm', padding: 'px-3 py-1.5' },
  md: { base: 'min-h-11 text-sm', padding: 'px-5 py-2.5' },
  lg: { base: 'min-h-12 text-base', padding: 'px-6 py-3' },
  icon: { base: 'size-11 shrink-0 text-sm', padding: 'p-2.5' },
  media: { base: 'min-h-11 min-w-11 text-sm', padding: 'p-0' },
};

export function actionStyles({
  variant = 'secondary',
  size = 'md',
  className,
}: {
  variant?: ActionVariant;
  size?: ActionSize;
  className?: string;
} = {}) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
    'disabled:pointer-events-none disabled:opacity-50',
    focusRing,
    siteMotion.feedback,
    variants[variant],
    sizes[size].base,
    variant === 'text' ? 'leading-6' : sizes[size].padding,
    className,
  );
}

export function Button({
  variant,
  size,
  className,
  type = 'button',
  ...props
}: Readonly<ComponentProps<'button'> & { variant?: ActionVariant; size?: ActionSize }>) {
  return (
    <button
      {...props}
      type={type}
      data-cn-control="button"
      className={actionStyles({ variant, size, className })}
    />
  );
}

export function ActionLink({
  href,
  children,
  variant,
  size,
  icon = 'auto',
  className,
  ...props
}: Omit<ComponentProps<'a'>, 'href' | 'target' | 'rel'> & {
  href: string;
  variant?: ActionVariant;
  size?: ActionSize;
  icon?: ActionIconOption;
}) {
  const external = /^https?:\/\//i.test(href) || href.startsWith('//');
  const native = external || /^(#|mailto:|tel:)/i.test(href);
  const content = (
    <>
      {children}
      {icon !== false && <ActionIcon external={external} icon={icon} href={href} />}
      {external && <span className="sr-only">（在新窗口打开）</span>}
    </>
  );
  const attributes = {
    ...props,
    'data-cn-control': 'link',
    className: actionStyles({ variant, size, className }),
  };

  return native ? (
    <a {...attributes} href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
      {content}
    </a>
  ) : (
    <Link {...attributes} href={href}>{content}</Link>
  );
}

export function FilterChip({
  selected,
  children,
  className,
  ...props
}: Readonly<Omit<ComponentProps<'button'>, 'aria-pressed' | 'type'> & { selected: boolean }>) {
  return (
    <button
      {...props}
      type="button"
      aria-pressed={selected}
      data-cn-control="filter"
      className={cn(
        'inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border px-4 py-2 text-sm font-medium disabled:pointer-events-none disabled:opacity-50',
        focusRing,
        siteMotion.feedback,
        selected
          ? 'border-[var(--cn-brand-line)] bg-[var(--cn-brand-soft)] text-[var(--cn-brand)]'
          : 'border-fd-border bg-fd-background text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground',
        className,
      )}
    >
      {children}
    </button>
  );
}
