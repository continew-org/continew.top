/**
 * 极简 className 合并：过滤假值后拼接。
 * 官网页面类名无冲突覆盖需求，不引入 clsx / tailwind-merge 以免增加依赖。
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
