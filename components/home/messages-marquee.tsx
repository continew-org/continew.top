import type { Message } from '@/lib/messages';
import { cn } from '@/lib/cn';
import { focusRing } from '@/lib/site-design';

/**
 * 用户留言跑马灯（横向滚动卡片）。
 *
 * 与登记用户跑马灯共用同一套 CSS 动画（见 app/global.css）。
 * 这里刻意不做自动轮播式的「一屏一张」：留言的价值在于**密度**——
 * 一眼能扫到三张不同人的原话，比精致地展示一张更有说服力。
 */
function MessageCard({ message }: Readonly<{ message: Message }>) {
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
}: Readonly<{
  messages: Message[];
  className?: string;
}>) {
  if (messages.length === 0) return null;

  return (
    <div className={cn('cn-marquee-host space-y-3', className)}>
      <section
        aria-label="社区留言，键盘聚焦后可用左右方向键横向浏览"
        // 横向滚动区必须可聚焦：键盘才能用方向键浏览、并让动画停住（WCAG 2.2.2 的暂停机制）。
        // 指针点击不进入静态浏览态，见 app/global.css 的 :has(:focus-visible) 规则。
        tabIndex={0} // NOSONAR: 非交互元素带 tabIndex 在此属有意为之
        className={cn('cn-marquee-viewport cn-marquee-fade rounded-lg p-1', focusRing)}
      >
        <ul className="cn-marquee cn-marquee-messages flex w-max list-none items-stretch p-0">
          {/* key 取留言内容：留言是人工维护的静态数据，内容唯一，不必退化为数组下标。 */}
          {messages.map((message) => (
            <li key={`a-${message.content}`} className="mr-4">
              <MessageCard message={message} />
            </li>
          ))}
          {/* 副本没有辅助技术或键盘入口；静态浏览模式下完全隐藏。 */}
          {messages.map((message) => (
            <li key={`b-${message.content}`} aria-hidden inert className="cn-marquee-copy mr-4">
              <MessageCard message={message} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
