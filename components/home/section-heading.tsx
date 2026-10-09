import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * 首页区块标题（眉标 + 主张句 + 补充说明）。
 *
 * 首页此前每个区块各写一份标题结构，字号与间距逐步跑偏；
 * 这里统一成一份，区块只提供文案。
 *
 * 早期版本带 tone='dark' 分支，配合首页的深色带使用。深色带已去掉
 * （整页两块近黑底色把首页压住了），这个分支也就没有存在的必要——少一个参数，
 * 少一处「改了背景却忘了改标题颜色」的隐患。
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('cn-reveal mx-auto max-w-2xl text-center', className)}>
      {/* cn-reveal：滚进视口时淡入上移，纯 CSS，不支持的浏览器直接静态显示 */}
      {eyebrow && (
        <p className="text-sm font-medium tracking-[0.12em] text-[var(--cn-brand)]">
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          'text-balance font-bold tracking-tight text-3xl text-fd-foreground sm:text-4xl',
          eyebrow && 'mt-3',
        )}
      >
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-fd-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
