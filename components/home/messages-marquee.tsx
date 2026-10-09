import type { Message } from '@/lib/messages';
import { cn } from '@/lib/cn';

/**
 * 用户留言跑马灯（横向滚动卡片）。
 *
 * 与登记用户跑马灯共用同一套 CSS 动画（见 app/global.css）。
 * 这里刻意不做自动轮播式的「一屏一张」：留言的价值在于**密度**——
 * 一眼能扫到三张不同人的原话，比精致地展示一张更有说服力。
 */
function MessageCard({ message }: { message: Message }) {
  return (
    <figure className="flex h-full w-[340px] shrink-0 flex-col rounded-xl border border-fd-border bg-fd-card p-6">
      <blockquote className="flex-1 text-sm leading-relaxed text-fd-muted-foreground">
        {message.content}
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        {message.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={message.avatar}
            alt=""
            aria-hidden
            loading="lazy"
            className="size-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          // 无头像时退化为首字方块。刻意用中性色而非品牌色：
          // 留言卡里已有强调元素，头像再抢一次会让整片区域变花
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-fd-border bg-fd-muted text-sm font-semibold text-fd-muted-foreground"
          >
            {message.author.slice(0, 1)}
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{message.author}</span>
          <span className="block truncate text-xs text-fd-muted-foreground">
            {[message.title, message.region].filter(Boolean).join(' · ')}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

export function MessagesMarquee({
  messages,
  className,
}: {
  messages: Message[];
  className?: string;
}) {
  if (messages.length === 0) return null;

  return (
    <div className={cn('cn-marquee-host cn-marquee-fade', className)}>
      <ul
        className="cn-marquee flex w-max list-none items-stretch p-0"
        style={{ '--cn-marquee-duration': '72s' } as React.CSSProperties}
      >
        {messages.map((message, index) => (
          <li key={`a-${index}`} className="mr-4">
            <MessageCard message={message} />
          </li>
        ))}
        {messages.map((message, index) => (
          <li key={`b-${index}`} aria-hidden className="mr-4">
            <MessageCard message={message} />
          </li>
        ))}
      </ul>
    </div>
  );
}
