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
          className="group rounded-xl border border-fd-border bg-fd-card px-6 py-5 transition-colors hover:border-fd-primary/40"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
            {item.question}
            <ChevronDown
              aria-hidden
              className="size-4 shrink-0 text-fd-muted-foreground transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-fd-muted-foreground">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
