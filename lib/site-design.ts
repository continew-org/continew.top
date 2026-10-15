export const siteLayout = {
  standard: 'mx-auto w-full max-w-6xl px-6',
  reading: 'mx-auto w-full max-w-5xl px-6',
  home: 'mx-auto w-full max-w-6xl',
} as const;

/**
 * 名录与卡片网格的密度口径。
 *
 * 容器宽度只管外框，管不到网格；各页自写列数时，同一份内容会在不同页面被拉伸成
 * 不同的卡片宽度（团队页核心成员曾因此比同页共鸣者宽 52%）。密度统一走这里。
 *
 * 不用 `auto-rows-fr`：它让所有行等高，一张内容多的卡会把整块网格的行都撑高，
 * 其余卡片下方留出空白——行内卡片本就靠 `align-items: stretch` 等高，行间不必强行对齐。
 */
export const siteGrid = {
  /** 名录卡片网格：2 列起，桌面 3 列（净宽 1104px 下约 357px 一卡）。 */
  directory: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
  /** 分组型名录：左栏放组名与说明，右栏放卡片（右栏 768px，2 列约 376px）。 */
  grouped: 'grid gap-4 lg:grid-cols-[19rem_1fr] lg:gap-8',
  /** 2 人小组：2 列并限宽 48rem，卡片宽度与 3 列名录一致，不靠拉宽填行。 */
  pair: 'grid gap-4 sm:grid-cols-2 lg:max-w-3xl',
} as const;

export const siteType = {
  displayTitle: 'text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl',
  pageTitle: 'text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl',
  taskTitle: 'text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl',
  articleTitle: 'text-balance text-2xl font-bold leading-snug tracking-tight sm:text-3xl',
  pageDescription: 'text-base leading-7 text-fd-muted-foreground sm:text-lg sm:leading-8',
  sectionTitle: 'text-2xl font-semibold leading-8 tracking-tight',
  cardTitle: 'text-base font-semibold leading-6',
  body: 'text-base leading-7',
  compact: 'text-sm leading-6',
  meta: 'text-xs leading-5',
} as const;

export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cn-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-fd-background';

export const siteMotion = {
  feedback: 'transition-colors duration-[var(--cn-motion-duration-fast)]',
  arrow: 'transition-transform duration-[var(--cn-motion-duration-fast)] motion-safe:group-hover:translate-x-0.5',
} as const;
