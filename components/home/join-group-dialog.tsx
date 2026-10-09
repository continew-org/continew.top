'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

/**
 * 「加入交流群」弹层。
 *
 * 【为什么是弹层而不是跳转页面】
 * 这个动作的全部内容就是一张二维码。为它单独做一个路由，意味着一次跳转、一次返回，
 * 而用户回来后很可能已经离开了原来的位置。弹层留住了上下文。
 *
 * 【为什么不用手写 div[role=dialog]】
 * 原生 `<dialog>` + `showModal()` 自带 Esc 关闭、焦点陷阱、背景 inert，
 * 手写这三样很容易漏，而键盘用户是真实存在的。与 components/lightbox.tsx 保持同一做法。
 */
export function JoinGroupDialog({ className }: { className?: string }) {
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
        <MessageCircle className="size-4" aria-hidden />
        加入交流群
      </button>

      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        aria-label="加入 ContiNew 交流群"
        // dialog 自身即遮罩层，点它就关闭；点内容区不冒泡到这里
        onClick={(event) => {
          if (event.target === ref.current) setOpen(false);
        }}
        // text-left：showModal() 只提升层级、不改 CSS 继承，父级若有 text-center 会带歪弹层排版
        className="m-auto w-[min(92vw,520px)] rounded-2xl border border-fd-border bg-fd-card p-6 text-left text-fd-foreground backdrop:bg-black/60"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">加入 ContiNew 交流群</h2>
            <p className="mt-1 text-sm leading-relaxed text-fd-muted-foreground">
              与维护团队直接沟通，获取第一手动态；参与功能讨论和需求收集。
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

        {/* 静态导出下不经过图片优化，用原生 img */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/home/join-group.webp"
          alt="ContiNew 交流群二维码"
          className="mt-5 w-full rounded-xl border border-fd-border bg-white"
        />

        <p className="mt-4 text-xs leading-relaxed text-fd-muted-foreground">
          微信扫码加入。二维码若已过期，欢迎私信或添加 Charles 微信提醒。
        </p>
      </dialog>
    </>
  );
}
