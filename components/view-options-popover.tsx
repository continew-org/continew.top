'use client';

import { useMemo } from 'react';
import { usePathname } from 'fumadocs-core/framework';
import { ChevronDown, ExternalLinkIcon, TextIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from 'fumadocs-ui/components/ui/popover';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { getEditOnHostUrl } from '@/lib/shared';
import {
  AtomGitIcon,
  ChatGptIcon,
  CursorIcon,
  DeepSeekIcon,
  GiteeIcon,
  GitHubIcon,
} from '@/components/brand-icons';

// 轻量 classnames 合并（避免依赖 fumadocs 内部 utils 路径）。
function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * AI 工具入口。
 *
 * 三家都提供了公开的带参入口，把提示词拼进 URL 直接跳转即可，**不需要**「复制提示词、
 * 再打开首页」那种折中做法：
 *
 * - DeepSeek：`?q=`
 * - ChatGPT：`?prompt=&hints=search`（与 fumadocs 官方 page-actions 的写法一致）
 * - Cursor：`link/prompt?text=`（Cursor 官方的 prompt deeplink，同上）
 */
interface AiTarget {
  /** 显示名。 */
  label: string;
  /** 图标。 */
  icon: React.ReactNode;
  /** 该工具的官方带参入口：把提示词拼进去即可直接跳转。 */
  href: (prompt: string) => string;
}

const AI_TARGETS: AiTarget[] = [
  {
    label: '在 DeepSeek 中打开',
    icon: <DeepSeekIcon />,
    href: (prompt) => `https://chat.deepseek.com/?${new URLSearchParams({ q: prompt })}`,
  },
  {
    label: '在 Cursor 中打开',
    icon: <CursorIcon />,
    href: (prompt) => `https://cursor.com/link/prompt?${new URLSearchParams({ text: prompt })}`,
  },
  {
    label: '在 ChatGPT 中打开',
    icon: <ChatGptIcon />,
    href: (prompt) => `https://chatgpt.com/?${new URLSearchParams({ prompt, hints: 'search' })}`,
  },
];

interface ViewOptionsPopoverProps {
  /** 原始 Markdown/MDX 内容地址（View as Markdown）。 */
  markdownUrl?: string;
  /** 文档页信息（用于生成各代码托管平台的打开链接）。 */
  page: { slugs: string[]; path: string };
  /** 站点基础地址，用于拼接给 AI 阅读的页面 URL。 */
  siteUrl?: string;
  /** 触发按钮的额外 class。 */
  className?: string;
  /** 触发按钮文案（默认「打开」）。 */
  children?: React.ReactNode;
}

export function ViewOptionsPopover({
  markdownUrl,
  page,
  siteUrl = 'https://continew.top',
  className,
  children,
}: Readonly<ViewOptionsPopoverProps>) {
  const pathname = usePathname();

  const githubUrl = useMemo(() => getEditOnHostUrl(page, 'github'), [page]);
  const atomgitUrl = useMemo(() => getEditOnHostUrl(page, 'atomgit'), [page]);
  const giteeUrl = useMemo(() => getEditOnHostUrl(page, 'gitee'), [page]);

  /*
   * 给 AI 的提示词指向**页面 URL**，不指向 /llms.mdx 的 Markdown 路由：后者按
   * application/octet-stream 下发，AI 抓取时可能当成下载而读不到正文；页面是 HTML，
   * 任何抓取方都能读。fumadocs 官方的 page-actions 同样用页面 URL。
   */
  const prompt = useMemo(() => {
    const pageUrl = `${siteUrl}${pathname}`;
    return `请阅读以下文档内容，并回答我接下来提出的问题：\n\n${pageUrl}`;
  }, [pathname, siteUrl]);

  const linkItems = useMemo(() => {
    const items: { label: string; href: string; icon?: React.ReactNode }[] = [];
    if (markdownUrl) items.push({ label: '以 Markdown 查看', href: markdownUrl, icon: <TextIcon /> });
    if (githubUrl) items.push({ label: '在 GitHub 中打开', href: githubUrl, icon: <GitHubIcon /> });
    if (atomgitUrl) items.push({ label: '在 AtomGit 中打开', href: atomgitUrl, icon: <AtomGitIcon /> });
    if (giteeUrl) items.push({ label: '在 Gitee 中打开', href: giteeUrl, icon: <GiteeIcon /> });
    return items;
  }, [markdownUrl, githubUrl, atomgitUrl, giteeUrl]);

  const itemClass =
    'text-sm p-2 rounded-lg inline-flex items-center gap-2 hover:text-fd-accent-foreground hover:bg-fd-accent [&_svg]:size-4';

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: 'secondary', size: 'sm' }),
          'gap-2 data-[popup-open]:bg-fd-accent data-[popup-open]:text-fd-accent-foreground',
          className,
        )}
      >
        {children ?? '打开'}
        <ChevronDown className="size-3.5 text-fd-muted-foreground" aria-hidden />
      </PopoverTrigger>
      <PopoverContent className="flex flex-col">
        {[
          ...linkItems.map((item) => ({ label: item.label, href: item.href, icon: item.icon })),
          ...AI_TARGETS.map((target) => ({
            label: target.label,
            href: target.href(prompt),
            icon: target.icon,
          })),
        ].map((item) => (
          <a
            key={item.label}
            href={item.href}
            rel="noreferrer noopener"
            target="_blank"
            className={cn(itemClass, 'text-start')}
          >
            {item.icon}
            {item.label}
            <span className="sr-only">（在新窗口打开）</span>
            <ExternalLinkIcon className="text-fd-muted-foreground size-3.5 ms-auto" aria-hidden />
          </a>
        ))}
      </PopoverContent>
    </Popover>
  );
}
