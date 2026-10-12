export const siteLayout = {
  standard: 'mx-auto w-full max-w-6xl px-6',
  reading: 'mx-auto w-full max-w-5xl px-6',
  content: 'mx-auto w-full max-w-[69rem]',
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
