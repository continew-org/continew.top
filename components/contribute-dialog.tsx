'use client';

import { useEffect, useRef, useState } from 'react';
import { GitPullRequestArrow, X } from 'lucide-react';
import { AtomGitIcon, GiteeIcon, GitHubIcon } from '@/components/brand-icons';
import { contributePlatforms } from '@/lib/shared';
import { ActionLink, Button } from '@/components/site-actions';
import { useBackdropDismiss } from '@/components/use-dialog-events';

const PLATFORM_ICON = {
  github: GitHubIcon,
  gitee: GiteeIcon,
  atomgit: AtomGitIcon,
} as const;

/**
 * 「参与贡献」弹层：点击后选平台。
 *
 * 不直接链 GitHub：三个平台都在维护，链一个等于替用户做了决定。弹层把三个入口
 * 并列摆出并标出推荐顺序。
 * 用原生 `<dialog>` + `showModal()`（自带 Esc 关闭、焦点陷阱、背景 inert），
 * 与 components/home/join-group-dialog.tsx 同一做法。
 * text-left 显式声明：`showModal()` 只提升层级、不改 CSS 继承链，本组件在 /team 页
 * 位于 `text-center` 的 PageHeader 里，不钉死就会被带歪，与首页那份长得不一样。
 */
export function ContributeDialog({
  className,
  label = '参与贡献',
}: Readonly<{
  className?: string;
  label?: string;
}>) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  useBackdropDismiss(ref, () => setOpen(false));

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) dialog.showModal();
    else dialog.close();
  }, [open]);

  return (
    <>
      <Button onClick={() => setOpen(true)} className={className}>
        <GitPullRequestArrow className="size-4" aria-hidden />
        {label}
      </Button>

      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        aria-label="选择平台参与贡献"
        className="m-auto w-[min(92vw,440px)] rounded-2xl border border-fd-border bg-fd-card p-6 text-left text-fd-foreground backdrop:bg-black/60"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">参与贡献</h2>
            <p className="mt-1 text-sm leading-relaxed text-fd-muted-foreground">
              提 Issue、提 PR、参与讨论，选一个你常用的平台。
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            aria-label="关闭"
            className="text-fd-muted-foreground hover:text-fd-foreground"
          >
            <X className="size-4" aria-hidden />
          </Button>
        </div>

        <ul className="mt-5 flex flex-col gap-2">
          {contributePlatforms.map((platform, index) => {
            const Icon = PLATFORM_ICON[platform.key];
            return (
              <li key={platform.key}>
                <ActionLink
                  href={platform.url}
                  onClick={() => setOpen(false)}
                  className="w-full text-left"
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
                </ActionLink>
              </li>
            );
          })}
        </ul>
      </dialog>
    </>
  );
}
