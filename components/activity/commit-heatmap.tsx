import type { HeatmapWindow } from '@/lib/repo-activity';

/**
 * 提交热力图（GitHub 贡献日历的排法：列为周、行为星期）。
 *
 * ## 为什么整张图是一个 SVG
 *
 * 几百个格子如果用 div 网格，月份标签就得按列定位——那要么写内联 `style`，
 * 要么在 `app/global.css` 里另立一套 `cn-heatmap-*` 类。SVG 用属性就能表达几何，
 * 和 `TimelineGraph`、`TeamNetworkVisual` 的既有做法一致，也不必往全局样式里加东西。
 *
 * 定宽 + 横向滚动：窄屏（390px）下 54 列会被压成不到 7px，色阶就分辨不出来了。
 * 桌面端 SVG 会等比放大填满正文宽度，字号跟着变大，不会显得空旷。
 */

/** 单元格边长（viewBox 单位）。 */
const CELL = 11;
/** 格间距。 */
const GAP = 3;
/** 左侧留给星期标签的宽度。 */
const GUTTER = 20;
/** 顶部留给月份标签的高度。 */
const TOP = 16;
/**
 * 右侧留白。
 *
 * 月份标签从所在列的左边缘起笔，最后一列的「10 月」会写到网格右缘之外，
 * 不预留就被 SVG 边界裁掉——实测就是这么丢的。
 */
const PAD_RIGHT = 34;
const ROWS = 7;

/**
 * 网格固定按 54 列排版，不随窗口的实际列数变。
 *
 * 窗口的列数随起止日期变化：近一年 53 列、2026 年至今 42 列、2022 年只有 5 列。
 * 若让 SVG 按实际列数取宽再 `w-full` 拉伸，切到列数少的年份单元格会明显变大，
 * 看起来像被放大了一档；按 2022 年那 5 列去拉伸更是会得到 5 个巨大的格子。
 * 固定列数之后所有窗口的单元格尺寸一致，短窗口就自然地在右边留空。
 *
 * 54 这个数有依据：365 天的窗口从首个周日排到最后一个周六，最多跨 54 周。
 */
const COLUMNS = 54;
const WIDTH = GUTTER + COLUMNS * CELL + (COLUMNS - 1) * GAP + PAD_RIGHT;
const HEIGHT = TOP + ROWS * CELL + (ROWS - 1) * GAP;

/** 星期标签只标一 / 三 / 五，七行全标会把左边挤满。行号 0 是周日。 */
const WEEKDAY_LABELS = [
  { row: 1, label: '一' },
  { row: 3, label: '三' },
  { row: 5, label: '五' },
];

/**
 * 色阶档位。
 *
 * 用**固定阈值**而不是按当年的最大值取分位数，这一点在加了年份切换之后更关键：
 * 分位数会让每一年的颜色各自归一化，2024 年的 20 次提交与 2026 年的 3 次提交
 * 会画成同一个深度，年份之间就完全没法比了。固定阈值下深色格子多的那一年，
 * 就是真的更活跃。
 *
 * 阈值按实测分布划（1 次 29 天 / 2 次 18 天 / 3-5 次 25 天 / 6-10 次 9 天 /
 * 11 次以上 5 天），保证每一档都有实际使用。
 *
 * 只用一个色相、靠不透明度分档：深浅主题自动跟随 `--cn-brand`，不另写一份颜色。
 */
const LEVELS = [
  { min: 11, opacity: 1 },
  { min: 6, opacity: 0.72 },
  { min: 3, opacity: 0.46 },
  { min: 1, opacity: 0.24 },
] as const;

function levelOpacity(count: number): number | null {
  for (const level of LEVELS) {
    if (count >= level.min) return level.opacity;
  }
  return null;
}

export function CommitHeatmapChart({ heatmap }: Readonly<{ heatmap: HeatmapWindow | null }>) {
  if (!heatmap || heatmap.columns.length === 0) return null;

  const cellX = (column: number) => GUTTER + column * (CELL + GAP);
  const cellY = (row: number) => TOP + row * (CELL + GAP);

  return (
    <div data-cn-chart="commit-heatmap">
      {/*
       * 横向滚动区不做 tabIndex / 不暴露给读屏：色阶只表达强度，同样的信息
       * 由下方的读数行以文字给出（提交次数、有提交的天数、最活跃的一周）。
       * 让一个 aria-hidden 的区域可聚焦，比不可聚焦更糟。
       */}
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          aria-hidden
          // min-w 是上面 WIDTH 的像素值（807 = 54 列网格 + 右侧留白），
          // Tailwind 的任意值取不到变量，改 CELL / COLUMNS 时这里要跟着改
          className="h-auto w-full min-w-[807px] text-[var(--cn-brand)]"
        >
          <g className="fill-fd-muted-foreground font-mono">
            {WEEKDAY_LABELS.map(({ row, label }) => (
              <text key={label} x="0" y={cellY(row) + CELL - 2} fontSize="10">
                {label}
              </text>
            ))}
            {heatmap.monthLabels.map(({ column, label }) => (
              <text key={`${column}-${label}`} x={cellX(column)} y="11" fontSize="11">
                {label}
              </text>
            ))}
          </g>

          {heatmap.columns.map((column, columnIndex) => (
            <g key={column[0].date}>
              {column.map((cell, row) => {
                // 窗口之外（首个周日到起点之间的补齐格、以及终点之后的格子）不画：
                // 画成浅色会被读成「那天没有提交」，那是另一回事
                if (cell.count === null) return null;
                const opacity = levelOpacity(cell.count);
                return (
                  <rect
                    key={cell.date}
                    x={cellX(columnIndex)}
                    y={cellY(row)}
                    width={CELL}
                    height={CELL}
                    rx="2.5"
                    fill={opacity === null ? 'var(--color-fd-muted-foreground)' : 'currentColor'}
                    opacity={opacity ?? 0.16}
                  >
                    <title>
                      {cell.count > 0 ? `${cell.date} · ${cell.count} 次提交` : `${cell.date} · 无提交`}
                    </title>
                  </rect>
                );
              })}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
