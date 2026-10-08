import { loader } from 'fumadocs-core/source';
import { defineDocs } from 'fumadocs-mdx/macro';
import { pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';

// 博客文章在通用 pageSchema 之上扩展的字段（对应旧站 VitePress posts frontmatter）。
// datetime 为本地时间字符串（如 2025-07-27 22:01），展示时只取日期部分。
const blogFrontmatterSchema = pageSchema.extend({
  author: z.string(),
  datetime: z.string(),
  category: z.string(),
  originalLink: z.string().optional(),
  top: z.boolean().optional(),
  original: z.boolean().optional(),
});

const blog = defineDocs({
  dir: 'content/blog',
  docs: {
    schema: blogFrontmatterSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

export interface BlogPost {
  url: string;
  slugs: string[];
  title: string;
  description?: string;
  author: string;
  /** 原始本地时间字符串，如 2025-07-27 22:01 */
  datetime: string;
  /** 展示用日期，如 2025-07-27 */
  date: string;
  category: string;
  originalLink?: string;
  top?: boolean;
  original?: boolean;
}

export const blogSource = loader({
  baseUrl: '/blog',
  source: blog.toFumadocsSource(),
});

type BlogPage = ReturnType<typeof blogSource.getPages>[number];

/** 摘要最大长度（超出补省略号）。 */
const EXCERPT_LENGTH = 110;

/**
 * 从正文自动提取摘要。
 *
 * 20 篇文章里只有 1 篇（安全通告）在 frontmatter 写了 description，
 * 其余 19 篇在列表页只剩一个标题，读者无法判断要不要点进去。
 * 逐篇补写会随时间腐烂（新文章照样忘写），故改为构建期从正文提取，一劳永逸。
 *
 * 导出给详情页复用：generateMetadata 同样需要一段摘要（SEO 与分享卡片），
 * 否则 19 篇文章的 OG description 为空。
 */
export async function excerptOf(page: BlogPage): Promise<string> {
  const raw = await page.data.getText('processed');
  const text = raw
    .replace(/```[\s\S]*?```/g, ' ') // 代码块
    .replace(/<[^>]+>/g, ' ') // MDX / HTML 标签
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // 图片
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // 链接只留文字
    .replace(/^#{1,6}\s+.*$/gm, ' ') // 标题行
    .replace(/^\s*[-*+|]\s?.*$/gm, ' ') // 列表项与表格分隔行
    .replace(/[`*_~>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > EXCERPT_LENGTH ? `${text.slice(0, EXCERPT_LENGTH)}…` : text;
}

/** 全部博客文章，按置顶优先、发布时间倒序排列。 */
export async function getBlogPosts(): Promise<BlogPost[]> {
  const posts = await Promise.all(
    blogSource.getPages().map(async (page) => ({
      url: page.url,
      slugs: page.slugs,
      title: page.data.title,
      // frontmatter 有 description 时优先用它（人工撰写通常比首段更贴题）。
      description: page.data.description || (await excerptOf(page)),
      author: page.data.author,
      datetime: page.data.datetime,
      date: page.data.datetime.slice(0, 10),
      category: page.data.category,
      originalLink: page.data.originalLink,
      top: page.data.top,
      original: page.data.original,
    })),
  );

  return posts.sort((a, b) => {
    if (!!a.top !== !!b.top) return a.top ? -1 : 1;
    return b.datetime.localeCompare(a.datetime);
  });
}

/** 按年份分组后的博客文章。 */
export interface BlogYearGroup {
  year: string;
  posts: BlogPost[];
}

/**
 * 置顶文章单独提出，其余按年份倒序分组。
 *
 * 暂不做页码分页：20 篇的量级下分页会把一半文章藏起来，而博客文章本就希望被读到；
 * 年份分组既能拆短页面、又保留全部曝光。将来篇数超过 30 再引入 /blog/page/[page] 真分页。
 */
export async function getBlogPostsGrouped(): Promise<{
  pinned: BlogPost[];
  years: BlogYearGroup[];
}> {
  const posts = await getBlogPosts();
  const pinned = posts.filter((p) => p.top);
  const years = new Map<string, BlogPost[]>();
  for (const post of posts) {
    if (post.top) continue;
    const year = post.date.slice(0, 4);
    const list = years.get(year);
    if (list) list.push(post);
    else years.set(year, [post]);
  }
  return {
    pinned,
    years: [...years.entries()]
      .map(([year, list]) => ({ year, posts: list }))
      .sort((a, b) => b.year.localeCompare(a.year)),
  };
}
