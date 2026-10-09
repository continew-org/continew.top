'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 数据带的滚动计数：进入视口后从 0 滚到真实值。
 *
 * 【为什么 SSR 直出最终值】
 * 首帧就渲染终值（而不是 0），保证：
 *   - 无 JS / 水合失败时数字照常可读（内容不赌在脚本上，与 cn-reveal 同一原则）；
 *   - SEO 与读屏拿到的是真实数字；
 *   - hydration 首帧与服务端一致，不会 mismatch。
 * 动画在水合完成后由 IntersectionObserver 触发——用户滚到数据带那一刻才起跑，
 * 起跑瞬间才落到 0，此前的「终值」用户还没来得及看清，不会感知到跳变。
 *
 * 【为什么手写 rAF 而不是引计数库】
 * 一个 easeOutCubic + requestAnimationFrame 就够，引库是为一个数字多拉一包依赖，
 * 与项目「新增依赖先看有没有同类」的约定相悖。
 *
 * 【reduced-motion】直接保持终值不动画——计数对读屏用户本来就该是终值。
 */
export function AnimatedNumber({ value }: { value: number }) {
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
