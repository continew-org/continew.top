'use client';

import { useMemo, useState } from 'react';
import { usePathname } from 'fumadocs-core/framework';
import { Check, ChevronDown, Copy, ExternalLinkIcon, TextIcon } from 'lucide-react';
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

// AI 工具入口。支持 URL 带 prompt 参数的（如 DeepSeek 的 ?q=）直接跳转；
// 不支持的（Cursor、ChatGPT 无公开标准带参接口）复制中文提示词到剪贴板并打开首页。
interface AiTarget {
  /** 显示名。 */
  label: string;
  /** 图标。 */
  icon: React.ReactNode;
  /** 打开方式：url 带参直接跳转，或 copy 复制提示词后打开首页。 */
  mode: 'url' | 'copy';
  /** mode=url 时的带参地址生成器；mode=copy 时的首页地址。 */
  url?: (prompt: string) => string;
  home?: string;
}

const AI_TARGETS: AiTarget[] = [
  {
    label: '在 DeepSeek 中打开',
    icon: <DeepSeekIcon />,
    mode: 'url',
    url: (prompt) => `https://chat.deepseek.com/?q=${encodeURIComponent(prompt)}`,
  },
  {
    label: '在 Cursor 中打开',
    icon: <CursorIcon />,
    mode: 'copy',
    home: 'https://cursor.com/',
  },
  {
    label: '在 ChatGPT 中打开',
    icon: <ChatGptIcon />,
    mode: 'copy',
    home: 'https://chatgpt.com/',
  },
];

interface ViewOptionsPopoverProps {
  /** 原始 Markdown/MDX 内容地址（View as Markdown）。 */
  markdownUrl?: string;
  /** 文档页信息（用于生成各代码托管平台的打开链接）。 */
  page: { slugs: string[]; path: string };
  /** 站点基础地址，用于拼接给 AI 阅读的正文 URL。 */
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
}: ViewOptionsPopoverProps) {
  const pathname = usePathname();
  const [copied, setCopied] = useState<string | null>(null);

  const githubUrl = useMemo(() => getEditOnHostUrl(page, 'github'), [page]);
  const atomgitUrl = useMemo(() => getEditOnHostUrl(page, 'atomgit'), [page]);
  const giteeUrl = useMemo(() => getEditOnHostUrl(page, 'gitee'), [page]);

  // 给 AI 的中文提示词：请其阅读当前文档页（正文 Markdown 地址）并回答相关问题。
  const prompt = useMemo(() => {
    const pageUrl = `${siteUrl}${pathname}`;
    const docUrl = markdownUrl ? `${siteUrl}${markdownUrl}` : pageUrl;
    return `请阅读以下文档内容，并回答我接下来提出的问题：\n\n${docUrl}`;
  }, [pathname, markdownUrl, siteUrl]);

  const handleOpenAi = async (target: AiTarget) => {
    if (target.mode === 'url' && target.url) {
      window.open(target.url(prompt), '_blank', 'noopener,noreferrer');
      return;
    }
    // copy 模式：复制中文提示词到剪贴板并打开首页
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(target.label);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      // 剪贴板不可用时仍打开首页
    }
    if (target.home) window.open(target.home, '_blank', 'noopener,noreferrer');
  };

  const linkItems = useMemo(() => {
    const items: { label: string; href: string; icon?: React.ReactNode }[] = [];
    if (markdownUrl) items.push({ label: '以 Markdown 查看', href: markdownUrl, icon: <TextIcon /> });
    if (githubUrl) items.push({ label: '在 GitHub 中打开', href: githubUrl, icon: <GitHubIcon /> });
    if (atomgitUrl) items.push({ label: '在 AtomGit 中打开', href: atomgitUrl, icon: <AtomGitIcon /> });
    if (giteeUrl) items.push({ label: '在 Gitee 中打开', href: giteeUrl, icon: <GiteeIcon /> });
    return items;
  }, [markdownUrl, githubUrl, atomgitUrl, giteeUrl]);

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
        <ChevronDown className="size-3.5 text-fd-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="flex flex-col">
        {linkItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            rel="noreferrer noopener"
            target="_blank"
            className="text-sm p-2 rounded-lg inline-flex items-center gap-2 hover:text-fd-accent-foreground hover:bg-fd-accent [&_svg]:size-4"
          >
            {item.icon}
            {item.label}
            <ExternalLinkIcon className="text-fd-muted-foreground size-3.5 ms-auto" />
          </a>
        ))}
        {AI_TARGETS.map((target) => (
          <button
            key={target.label}
            type="button"
            onClick={() => handleOpenAi(target)}
            className="text-sm p-2 rounded-lg inline-flex items-center gap-2 text-start hover:text-fd-accent-foreground hover:bg-fd-accent [&_svg]:size-4"
          >
            {copied === target.label ? <Check className="text-green-500" /> : target.icon}
            {copied === target.label ? '已复制提示词' : target.label}
            {target.mode === 'copy' ? (
              <Copy className="text-fd-muted-foreground size-3.5 ms-auto" />
            ) : (
              <ExternalLinkIcon className="text-fd-muted-foreground size-3.5 ms-auto" />
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
