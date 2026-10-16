import type { StarTrend, StarTrendPoint } from '@/lib/repo-activity';
import { siteType } from '@/lib/site-design';
import { cn } from '@/lib/cn';

/**
 * GitHub 累计 Star 趋势。
 *
 * 取代了此前 Hero 右侧那张**装饰性的假曲线**（硬编码坐标 + 手写「2022 / 2023 / 2024」
 * 文本标签）。有了真实数据之后，那张图就是在向读者展示一条不存在的趋势，
 * 无论画得多好看都得换掉——这里保留它原有的位置、尺寸与卡片外观，只把内容换成真的。
 *
 * 手写 SVG 而非引入图表库：全仓没有图表依赖，`tests/design-system.test.mjs`
 * 还断言不许出现 `framer-motion` / `motion`，而 `TimelineGraph`、`TeamNetworkVisual`、
 * 赞助页的曲线都已经是手写 SVG 的先例。
 */

/** 采样上限：完整曲线有 1400 多个点，全画进 path 会让 HTML 白多出十几 KB，而图上看不出差别。 */
const MAX_POINTS = 160;

const WIDTH = 360;
const HEIGHT = 256;
const PAD = { top: 24, right: 16, bottom: 32, left: 16 };

/**
 * 年份刻度之间至少留多少 viewBox 单位。
 * 四位数字在 fontSize 11 下约 24 单位宽，留 30 才不挨在一起。
 */
const MIN_YEAR_TICK_GAP = 30;

/**
 * 按年放刻度：只在跨年处放，避免坐标轴上堆满数字。
 *
 * 挤在一起的刻度要丢掉前一个。曲线从 2022-12-07 起，首个「2022」与紧随其后的
 * 「2023」在图上只隔二十来天、几乎重合，两段文字会叠成「20(2)23」这种乱码。
 * 丢「2022」而不是「2023」：前者只代表年末那二十来天，信息量最低。
 */
function yearTicks(points: StarTrendPoint[], x: (date: string) => number) {
  const ticks: Array<{ year: string; x: number }> = [];
  let previous = '';
  for (const point of points) {
    const year = point.date.slice(0, 4);
    if (year !== previous) {
      ticks.push({ year, x: x(point.date) });
      previous = year;
    }
  }
  return ticks.filter((tick, index) => {
    const next = ticks[index + 1];
    return !next || next.x - tick.x >= MIN_YEAR_TICK_GAP;
  });
}

function samplePoints(points: StarTrendPoint[]): StarTrendPoint[] {
  if (points.length <= MAX_POINTS) return points;
  const step = Math.ceil(points.length / MAX_POINTS);
  const sampled = points.filter((_, index) => index % step === 0);
  // 末点必须保留：它既是曲线的终点，也是「累计 = 导航栏那个数」的凭据
  const last = points.at(-1);
  if (last !== undefined && sampled.at(-1) !== last) sampled.push(last);
  return sampled;
}

export function StarTrendChart({ trend }: Readonly<{ trend: StarTrend }>) {
  // 拿不到真实数据就不画：宁可这一格空着，也不给读者看一条编出来的趋势
  if (!trend.live || trend.points.length < 2) return null;

  const points = samplePoints(trend.points);
  const first = points[0];
  const last = points.at(-1);
  // 采样保留首尾点，这里判空只是把「两端一定在」交给类型系统
  if (!first || !last) return null;

  const t0 = Date.parse(`${first.date}T00:00:00Z`);
  const span = Math.max(Date.parse(`${last.date}T00:00:00Z`) - t0, 1);
  const peak = Math.max(last.count, 1);
  const plotWidth = WIDTH - PAD.left - PAD.right;
  const plotHeight = HEIGHT - PAD.top - PAD.bottom;
  const baseline = PAD.top + plotHeight;

  const x = (date: string) => PAD.left + ((Date.parse(`${date}T00:00:00Z`) - t0) / span) * plotWidth;
  const y = (count: number) => baseline - (count / peak) * plotHeight;
  const fixed = (value: number) => value.toFixed(1);

  const line = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${fixed(x(point.date))} ${fixed(y(point.count))}`)
    .join(' ');
  const area = `${line} L${fixed(x(last.date))} ${fixed(baseline)} L${fixed(x(first.date))} ${fixed(baseline)} Z`;

  const ticks = yearTicks(points, x);
  const startLabel = `${first.date.slice(0, 4)} 年 ${Number(first.date.slice(5, 7))} 月`;

  return (
    <figure data-cn-chart="star-trend">
      {/*
       * 卡片里不再叠一层品牌径向光晕。
       *
       * 那一层是从原来那张装饰假图继承下来的：当时图里只有几条线，需要一点氛围填充；
       * 现在曲线自带真实面积渐变，再叠一层就是同一个位置两重光晕——外层还有
       * PageContainer 的页面级光晕，三层叠起来只会显脏。装饰不为曲线服务时就该去掉。
       */}
      <div className="h-64 overflow-hidden rounded-2xl border border-fd-border/70 bg-fd-card/60">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={`GitHub 累计 Star 趋势：${startLabel}至今，从 0 增长到 ${trend.total.toLocaleString()}`}
          className="size-full text-[var(--cn-brand)]"
        >
          <defs>
            {/* currentColor 从 <svg> 继承品牌色，深浅主题自动跟随，不另写一份颜色 */}
            <linearGradient id="cn-star-trend-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>

          {ticks.map((tick) => (
            <line
              key={`grid-${tick.year}`}
              x1={fixed(tick.x)}
              x2={fixed(tick.x)}
              y1={PAD.top}
              y2={baseline}
              className="stroke-fd-border"
              strokeDasharray="2 5"
            />
          ))}

          <path d={area} fill="url(#cn-star-trend-area)" />
          <path d={line} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />

          <line
            x1={PAD.left}
            x2={WIDTH - PAD.right}
            y1={baseline}
            y2={baseline}
            className="stroke-fd-border"
          />

          {/* 终点挖孔：让曲线末端落在基色圆点上，而不是被自己的描边糊住 */}
          <circle
            cx={fixed(x(last.date))}
            cy={fixed(y(last.count))}
            r="4.5"
            fill="var(--color-fd-background)"
            stroke="currentColor"
            strokeWidth="2.5"
          />

          <g className="fill-fd-muted-foreground font-mono">
            {ticks.map((tick) => (
              <text
                key={`label-${tick.year}`}
                x={fixed(tick.x)}
                y={HEIGHT - 12}
                fontSize="11"
                textAnchor={tick.x > WIDTH - 40 ? 'end' : 'start'}
              >
                {tick.year}
              </text>
            ))}
          </g>
        </svg>
      </div>
      <figcaption className={cn('mt-3 text-fd-muted-foreground', siteType.meta)}>
        GitHub 组织公开仓库的累计 Star。
      </figcaption>
    </figure>
  );
}
