'use client';

import { useRef } from 'react';
import { QrCode, X } from 'lucide-react';

export function BlogWechatDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="mt-6 inline-flex items-center gap-2 rounded-lg border border-fd-border px-3.5 py-2 text-sm font-medium transition-colors hover:border-[var(--cn-brand-line)] hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cn-brand)]/50 lg:hidden"
      >
        <QrCode className="size-4" aria-hidden />
        关注公众号
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="blog-wechat-title"
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current.close();
        }}
        className="m-auto w-[min(92vw,360px)] rounded-2xl border border-fd-border bg-fd-card p-6 text-left text-fd-foreground backdrop:bg-black/60"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="blog-wechat-title" className="text-lg font-semibold">关注 ContiNew 公众号</h2>
            <p className="mt-1 text-sm text-fd-muted-foreground">获取项目更新与社区动态。</p>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="关闭"
            className="shrink-0 rounded-lg p-1.5 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cn-brand)]/50"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/qrcode/gzh.webp"
          width={258}
          height={258}
          alt="ContiNew 公众号二维码"
          className="mx-auto mt-6 size-56 rounded-xl border border-fd-border bg-white object-contain p-2"
        />
        <p className="mt-5 text-sm leading-relaxed text-fd-muted-foreground">
          长按保存二维码，再打开微信扫一扫，从相册选择图片识别。
        </p>
      </dialog>
    </>
  );
}
