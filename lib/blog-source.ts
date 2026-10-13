import { loader } from 'fumadocs-core/source';
import { defineDocs } from 'fumadocs-mdx/macro';
import { pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';
import { BLOG_CATEGORIES, type BlogCategory } from '@/lib/blog-meta';

// datetime 为本地时间字符串（如 2025-07-27 22:01），展示时只取日期部分。
const blogFrontmatterSchema = pageSchema.extend({
  author: z.string(),
  datetime: z.string(),
  category: z.enum(BLOG_CATEGORIES),
  originalLink: z.string().optional(),
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
  category: BlogCategory;
  originalLink?: string;
  original?: boolean;
}

export const blogSource = loader({
  baseUrl: '/blog',
  source: blog.toFumadocsSource(),
});

type BlogPage = ReturnType<typeof blogSource.getPages>[number];

/** 摘要最大长度（超出补省略号）。 */
const EXCERPT_LENGTH = 110;

/** 从正文自动提取摘要，供未填写 description 的历史文章展示和 SEO 使用。 */
export async function excerptOf(page: BlogPage): Promise<string> {
  const raw = await page.data.getText('processed');
  // 各字符类刻意排除边界字符（<、[、]、括号）：避免含歧义重复的正则在大段文本上
  // 出现超线性回溯（Sonar typescript:S8786）。行为与「直到下一个边界」的写法一致。
  const text = raw
    .replace(/```[\s\S]*?```/g, ' ') // 代码块
    .replace(/<[^<>]+>/g, ' ') // MDX / HTML 标签
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // 图片
    .replace(/\[([^[\]]+)\]\([^()]*\)/g, '$1') // 链接只留文字
    .replace(/^#{1,6}[ \t][^\n]*/gm, ' ') // 标题行
    .replace(/^[ \t]*[-*+|][ \t]?[^\n]*/gm, ' ') // 列表项与表格分隔行
    .replace(/[`*_~>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > EXCERPT_LENGTH ? `${text.slice(0, EXCERPT_LENGTH)}…` : text;
}

function sortableDatetime(datetime: string): string {
  const [date, time = ''] = datetime.split(' ');
  const [hour = '', minute = ''] = time.split(':');
  return `${date} ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
}

/** 全部博客文章，按发布时间倒序排列。 */
export async function getBlogPosts(): Promise<BlogPost[]> {
  const posts = await Promise.all(
    blogSource.getPages().map(async (page) => {
      const authoredDescription = page.data.description?.trim() || undefined;
      return {
        url: page.url,
        slugs: page.slugs,
        title: page.data.title,
        description: authoredDescription || (await excerptOf(page)),
        author: page.data.author,
        datetime: page.data.datetime,
        date: page.data.datetime.slice(0, 10),
        category: page.data.category,
        originalLink: page.data.originalLink,
        original: page.data.original,
      };
    }),
  );

  return posts.sort(
    (a, b) =>
      sortableDatetime(b.datetime).localeCompare(sortableDatetime(a.datetime)) ||
      a.url.localeCompare(b.url),
  );
}

export async function getBlogPostContext(url: string): Promise<{
  previous?: BlogPost;
  next?: BlogPost;
  related: BlogPost[];
}> {
  const posts = await getBlogPosts();
  const index = posts.findIndex((post) => post.url === url);
  if (index < 0) return { related: [] };

  const current = posts[index];
  const previous = posts[index + 1];
  const next = posts[index - 1];
  const excluded = new Set([url, previous?.url, next?.url]);
  const related = posts
    .filter((post) => post.category === current.category && !excluded.has(post.url))
    .slice(0, 3);

  return { previous, next, related };
}
