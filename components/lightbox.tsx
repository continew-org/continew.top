'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 附件图片点击放大遮罩层（静态导出无服务端，纯客户端实现）。
 *
 * 与成员赞赏弹层保持一致，用原生 `<dialog>` + `showModal()`：
 * Esc 关闭、焦点陷阱、背景 inert 都由浏览器提供；
 * 手写 `div[role="dialog"]` 做不到这些，而键盘用户是真实存在的。
 */
export function ImageLightbox({ src, alt }: { src: string; alt: string }) {
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
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`放大查看：${alt}`}
        className="group relative overflow-hidden rounded-lg border border-fd-border"
      >
        {/* 缩略图走原生 img：静态导出下不经过图片优化，且需要 lazy 加载 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="h-28 w-auto object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </button>
      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        aria-label={alt}
        // dialog 自身的点击区域即遮罩层，命中它就关闭；图片上的点击不冒泡到这里
        onClick={(event) => {
          if (event.target === ref.current) setOpen(false);
        }}
        className="m-auto max-h-full max-w-full bg-transparent backdrop:bg-black/70"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
        />
      </dialog>
    </>
  );
}
