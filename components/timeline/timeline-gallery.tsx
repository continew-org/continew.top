'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface TimelineGalleryProps {
  images: readonly string[];
  alt: string;
  variant: 'featured' | 'compact';
}

interface TimelineLightboxProps {
  images: readonly string[];
  alt: string;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onClose: () => void;
}

function imageAlt(alt: string, index: number, total: number) {
  return total > 1 ? `${alt}（第 ${index + 1} 张，共 ${total} 张）` : alt;
}

function TimelineLightbox({
  images,
  alt,
  activeIndex,
  onActiveIndexChange,
  onClose,
}: TimelineLightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const hasPrevious = activeIndex > 0;
  const hasNext = activeIndex < images.length - 1;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    closeButtonRef.current?.focus({ preventScroll: true });
  }, []);

  const close = () => dialogRef.current?.close();

  return (
    <dialog
      ref={dialogRef}
      aria-label={`${alt} 图片查看器`}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' && hasPrevious) {
          event.preventDefault();
          onActiveIndexChange(activeIndex - 1);
        }
        if (event.key === 'ArrowRight' && hasNext) {
          event.preventDefault();
          onActiveIndexChange(activeIndex + 1);
        }
      }}
      className="fixed inset-0 m-0 h-dvh w-dvw max-h-none max-w-none place-items-center bg-transparent p-3 text-white backdrop:bg-black/80 open:grid sm:p-8"
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={close}
        aria-label="关闭图片查看器"
        className="absolute top-3 right-3 z-10 flex size-11 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:top-6 sm:right-6"
      >
        <X className="size-5" aria-hidden />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            disabled={!hasPrevious}
            onClick={() => onActiveIndexChange(activeIndex - 1)}
            aria-label="查看上一张图片"
            className="absolute top-1/2 left-3 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 disabled:pointer-events-none disabled:opacity-25 sm:left-6"
          >
            <ChevronLeft className="size-6" aria-hidden />
          </button>
          <button
            type="button"
            disabled={!hasNext}
            onClick={() => onActiveIndexChange(activeIndex + 1)}
            aria-label="查看下一张图片"
            className="absolute top-1/2 right-3 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 disabled:pointer-events-none disabled:opacity-25 sm:right-6"
          >
            <ChevronRight className="size-6" aria-hidden />
          </button>
        </>
      )}

      <figure className="m-0 flex max-h-full max-w-full flex-col items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[activeIndex]}
          alt={imageAlt(alt, activeIndex, images.length)}
          className="block max-h-[calc(100dvh-6rem)] max-w-[calc(100dvw-2rem)] rounded-lg object-contain shadow-2xl sm:max-h-[calc(100dvh-8rem)] sm:max-w-[calc(100dvw-8rem)]"
        />
        {images.length > 1 && (
          <figcaption className="rounded-full bg-black/70 px-3 py-1 text-xs font-medium tabular-nums">
            {activeIndex + 1} / {images.length}
          </figcaption>
        )}
      </figure>
    </dialog>
  );
}

export function TimelineGallery({ images, alt, variant }: TimelineGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const featured = variant === 'featured';

  const restoreFocus = () => {
    const triggerIndex = activeIndex;
    setActiveIndex(null);
    if (triggerIndex === null) return;
    requestAnimationFrame(() => triggerRefs.current[triggerIndex]?.focus());
  };

  return (
    <>
      <div
        className={cn(
          'mt-4 grid gap-2.5',
          featured && images.length === 1 && 'max-w-3xl grid-cols-1',
          featured && images.length > 1 && 'grid-cols-1 sm:grid-cols-2',
          !featured && images.length === 1 && 'max-w-56 grid-cols-1',
          !featured && images.length > 1 && 'max-w-md grid-cols-2',
        )}
      >
        {images.map((src, index) => {
          const altText = imageAlt(alt, index, images.length);
          return (
            <button
              key={src}
              ref={(element) => {
                triggerRefs.current[index] = element;
              }}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`放大查看：${altText}`}
              className={cn(
                'group relative w-full overflow-hidden rounded-xl border border-fd-border bg-fd-muted/30 transition-colors hover:border-[var(--cn-brand-line)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cn-brand)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-fd-background',
                featured ? 'aspect-video' : 'aspect-4/3',
              )}
            >
              {/* 静态导出不经过图片优化；固定比例外框负责预留空间，避免加载时布局跳动。 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={altText}
                loading="lazy"
                decoding="async"
                className="size-full object-contain"
              />
              <span className="absolute right-2 bottom-2 flex size-8 items-center justify-center rounded-full bg-black/65 text-white opacity-90 transition-opacity group-hover:opacity-100" aria-hidden>
                <Maximize2 className="size-3.5" />
              </span>
            </button>
          );
        })}
      </div>

      {activeIndex !== null && (
        <TimelineLightbox
          images={images}
          alt={alt}
          activeIndex={activeIndex}
          onActiveIndexChange={setActiveIndex}
          onClose={restoreFocus}
        />
      )}
    </>
  );
}
