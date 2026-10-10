import type { Supporter } from '@/lib/sponsors';
import { cn } from '@/lib/cn';

/**
 * 个人支持者：一颗紧凑的胶囊——小头像 + 名字。
 *
 * 【为什么从长卡片改成胶囊】
 * 个人支持者这一档只有「头像 + 名字」两个信息，之前用与企业同款的横向长卡片，
 * 内容少、卡片长，大片留白没有任何意义，看着也不像「一个人」。
 * 胶囊只占内容本身的宽度，几个人排成一行紧凑、也更像一群同伴。
 * 不写金额、不写日期、不写任何说明；往期的胶囊与在支持的完全同款，只整体收轻颜色。
 */
function SupporterChip({
  supporter,
  muted = false,
}: {
  supporter: Supporter;
  muted?: boolean;
}) {
  const inner = (
    <>
      {supporter.avatar ? (
        // 外链头像，静态导出不经过图片优化，用原生 img
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={supporter.avatar}
          alt=""
          aria-hidden
          loading="lazy"
          className="size-9 rounded-full object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="flex size-9 items-center justify-center rounded-full bg-fd-muted text-sm font-semibold text-fd-muted-foreground"
        >
          {supporter.name.slice(0, 1)}
        </span>
      )}
      <span className="pr-0.5 text-[15px] font-medium">{supporter.name}</span>
    </>
  );

  const cls = cn(
    'inline-flex items-center gap-2.5 rounded-full border border-fd-border bg-fd-card py-1.5 pl-1.5 pr-4',
    muted ? 'text-fd-muted-foreground' : 'text-fd-foreground',
    supporter.url &&
      'transition-colors hover:border-[var(--cn-brand-line)] hover:bg-fd-accent/40',
  );

  return supporter.url ? (
    <a href={supporter.url} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <span className={cls}>{inner}</span>
  );
}

export function SupporterChips({
  supporters,
  muted = false,
}: {
  supporters: Supporter[];
  muted?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {supporters.map((supporter) => (
        <SupporterChip key={supporter.name} supporter={supporter} muted={muted} />
      ))}
    </div>
  );
}
