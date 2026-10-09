'use client';

import { useEffect, useRef, useState } from 'react';
import { GitPullRequestArrow, X } from 'lucide-react';
import { AtomGitIcon, GiteeIcon, GitHubIcon } from '@/components/brand-icons';
import { contributePlatforms } from '@/lib/shared';

const PLATFORM_ICON = {
  github: GitHubIcon,
  gitee: GiteeIcon,
  atomgit: AtomGitIcon,
} as const;

/**
 * 「参与贡献」弹层：点击后选平台。
 *
 * 【为什么不再直接链到 GitHub】
 * 社区三个平台都在维护，直接链一个等于替用户做了决定，也把另外两个平台的贡献者
 * 排除在外。弹层把三个入口并列摆出来，同时标出推荐顺序。
 *
 * 【为什么不用手写 div[role=dialog]】
 * 原生 `<dialog>` + `showModal()` 自带 Esc 关闭、焦点陷阱、背景 inert。
 * 与 components/home/join-group-dialog.tsx 保持同一做法。
 *
 * 【为什么要显式 text-left】
 * `showModal()` 只把 dialog 提升到浏览器 top layer，**不改变 CSS 继承链**——
 * 它仍然继承 DOM 父节点的 text-align。本组件在 /team 页是放在 PageHeader 里的，
 * 而 PageHeader 是 `text-center`，弹层内容于是被带着居中，与首页那一份长得不一样。
 * 弹层的排版不该由调用位置决定，故在这里自己钉死。
 */
export function ContributeDialog({
  className,
  label = '参与贡献',
}: {
  className?: string;
  label?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) dialog.showModal();
    else dialog.close();
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        <GitPullRequestArrow className="size-4" aria-hidden />
        {label}
      </button>

      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        aria-label="选择平台参与贡献"
        // dialog 自身即遮罩层，点它就关闭；点内容区不冒泡到这里
        onClick={(event) => {
          if (event.target === ref.current) setOpen(false);
        }}
        className="m-auto w-[min(92vw,440px)] rounded-2xl border border-fd-border bg-fd-card p-6 text-left text-fd-foreground backdrop:bg-black/60"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">参与贡献</h2>
            <p className="mt-1 text-sm leading-relaxed text-fd-muted-foreground">
              提 Issue、提 PR、参与讨论，选一个你常用的平台。
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="关闭"
            className="shrink-0 rounded-lg p-1.5 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <ul className="mt-5 flex flex-col gap-2">
          {contributePlatforms.map((platform, index) => {
            const Icon = PLATFORM_ICON[platform.key];
            return (
              <li key={platform.key}>
                <a
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl border border-fd-border px-4 py-3 transition-colors hover:border-[var(--cn-brand-line)] hover:bg-[var(--cn-brand-soft)]"
                >
                  <Icon className="size-5 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{platform.name}</span>
                    <span className="block text-xs text-fd-muted-foreground">{platform.desc}</span>
                  </span>
                  {index === 0 && (
                    <span className="shrink-0 rounded-md bg-[var(--cn-brand-soft)] px-2 py-0.5 text-xs font-medium text-[var(--cn-brand)]">
                      推荐
                    </span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </dialog>
    </>
  );
}
