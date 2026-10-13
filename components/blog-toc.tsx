'use client';

import { TOCScrollArea, useTOCItems } from 'fumadocs-ui/components/toc';
import { TOCEmpty, TOCItem, TOCItems } from 'fumadocs-ui/components/toc/clerk';
import { AlignLeft } from 'lucide-react';

/**
 * 博客详情页的目录列表。
 *
 * 为什么自己组装而不是用现成的 DocsPage / TOC slot：
 * `layouts/*\/page` 的 DocsPage 都绑定各自 layout 的 context（spacious 版要 DocsLayout，
 * notebook 版也要 notebook DocsLayout），而博客页挂在 **HomeLayout** 下，
 * 直接用会抛 "Please use <DocsPage /> under <DocsLayout />" 并让整个页面 500。
 *
 * 这一层只依赖 TOCProvider 提供的 items，不碰任何 layout context，因此可以独立使用。
 */
/**
 * 目录标题由父级（服务端组件）传入：取自 @/lib/i18n 的文案表，
 * 与文档站侧边目录同源，避免两处各写一份。
 */
export function BlogToc({ title }: Readonly<{ title: string }>) {
  const items = useTOCItems();

  return (
    <div className="flex min-h-0 flex-col">
      <h3 className="inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground">
        <AlignLeft className="size-4" aria-hidden />
        {title}
      </h3>
      <TOCScrollArea>
        <TOCItems>
          {items.length === 0 && <TOCEmpty />}
          {items.map((item) => (
            <TOCItem key={item.url} item={item} />
          ))}
        </TOCItems>
      </TOCScrollArea>
    </div>
  );
}
