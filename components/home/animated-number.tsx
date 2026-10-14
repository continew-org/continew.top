'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 数据带的滚动计数：进入视口后从 0 滚到真实值。
 *
 * SSR 直出最终值而非 0：无 JS / 水合失败时数字照常可读，SEO 与读屏拿到真实数字，
 * 且首帧与服务端一致不会 mismatch。动画在水合完成后由 IntersectionObserver 触发，
 * 起跑瞬间才落到 0，此前的终值用户还没看清，不会感知到跳变。
 *
 * 手写 rAF 而非引计数库：一个 easeOutCubic + requestAnimationFrame 就够，
 * 与项目「新增依赖先看有没有同类」的约定一致。
 * reduced-motion 下直接保持终值不动画。
 */
export function AnimatedNumber({ value }: Readonly<{ value: number }>) {
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();

        const duration = 900;
        const start = performance.now();
        const tick = (now: number) => {
          const k = Math.min(1, (now - start) / duration);
          // easeOutCubic：起步快、收尾缓，数字「冲到位再稳住」比匀速自然
          const eased = 1 - Math.pow(1 - k, 3);
          setDisplay(Math.round(value * eased));
          if (k < 1) raf = requestAnimationFrame(tick);
        };
        setDisplay(0);
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <span ref={ref} className="tabular-nums">
      {display.toLocaleString('en-US')}
    </span>
  );
}
