export const BLOG_CATEGORIES = [
  '版本更新',
  '项目动态',
  '社区动态',
  '头脑风暴',
  '安全通告',
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];
