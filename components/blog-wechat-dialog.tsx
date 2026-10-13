'use client';

import { useRef } from 'react';
import { QrCode, X } from 'lucide-react';
import { Button } from '@/components/site-actions';
import { useBackdropDismiss } from '@/components/use-dialog-events';
import { cn } from '@/lib/cn';
import { siteType } from '@/lib/site-design';

export function BlogWechatDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useBackdropDismiss(dialogRef, () => dialogRef.current?.close());

  return (
    <>
      <Button
        onClick={() => dialogRef.current?.showModal()}
        aria-haspopup="dialog"
        aria-controls="blog-wechat-dialog"
        className="mt-6 lg:hidden"
      >
        <QrCode className="size-4" aria-hidden />
        关注公众号
      </Button>
      <dialog
        id="blog-wechat-dialog"
        ref={dialogRef}
        aria-labelledby="blog-wechat-title"
        className="m-auto w-[min(92vw,360px)] rounded-2xl border border-fd-border bg-fd-card p-6 text-left text-fd-foreground backdrop:bg-black/60"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="blog-wechat-title" className={siteType.cardTitle}>关注 ContiNew 公众号</h2>
            <p className={cn('mt-1 text-fd-muted-foreground', siteType.compact)}>获取项目更新与社区动态。</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dialogRef.current?.close()}
            aria-label="关闭"
            className="text-fd-muted-foreground hover:text-fd-foreground"
          >
            <X className="size-4" aria-hidden />
          </Button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/qrcode/gzh.webp"
          width={258}
          height={258}
          alt="ContiNew 公众号二维码"
          className="mx-auto mt-6 size-56 rounded-xl border border-fd-border bg-white object-contain p-2"
        />
        <p className={cn('mt-5 text-fd-muted-foreground', siteType.compact)}>
          长按保存二维码，再打开微信扫一扫，从相册选择图片识别。
        </p>
      </dialog>
    </>
  );
}
