/**
 * 首页常见问题。
 *
 * 用原生 <details>/<summary> 而不是自己写受控组件：折叠是浏览器原生行为，
 * 不引客户端 JS 也能展开，键盘与读屏默认可用。首页其余部分都是静态导出，
 * 为一个折叠面板把整个区块变成客户端组件并不划算。
 */
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface FaqItem {
  question: string;
  answer: string;
}

export function Faq({ items, className }: { items: FaqItem[]; className?: string }) {
  if (items.length === 0) return null;

  return (
    <div className={cn('mx-auto max-w-3xl space-y-3', className)}>
      {items.map((item) => (
        <details
          key={item.question}
          // overflow-hidden：展开后答案自带上边框，圆角由外层裁切，不必逐个角写半径
          className="group overflow-hidden rounded-xl border border-fd-border bg-fd-card"
        >
          {/*
            反馈只给可操作的那一行：整张卡变色会让人以为答案区也能点，
            而真正能触发折叠的只有 summary。
          */}
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-semibold transition-colors hover:bg-fd-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--cn-brand)]/50 [&::-webkit-details-marker]:hidden">
            {item.question}
            <ChevronDown
              aria-hidden
              className="size-4 shrink-0 text-fd-muted-foreground transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <p className="border-t border-fd-border/60 px-6 py-4 text-sm leading-relaxed text-fd-muted-foreground">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
