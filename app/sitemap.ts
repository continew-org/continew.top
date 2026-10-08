import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { blogSource } from '@/lib/blog-source';
import { siteUrl } from '@/lib/shared';

export const dynamic = 'force-static';

/**
 * 站点地图。
 *
 * 除文档页外，官网各二级页面与博客文章也要收录——否则搜索引擎只能抓到首页和文档，
 * 新做的 /blog、/team、/timeline、/users、/sponsor 等同于隐形。
 */
interface StaticPage {
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;
  priority: number;
}

const STATIC_PAGES: StaticPage[] = [
  { path: '/docs', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/blog', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/team', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/timeline', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/users', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/sponsor', changeFrequency: 'monthly', priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // map 回调要显式标注返回类型，否则字面量里的 changeFrequency 会被推断成 string
  const docPages: MetadataRoute.Sitemap = source.getPages().map(
    (page): MetadataRoute.Sitemap[number] => ({
      url: `${siteUrl}${page.url}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    }),
  );

  const blogPages: MetadataRoute.Sitemap = blogSource.getPages().map(
    (page): MetadataRoute.Sitemap[number] => ({
      url: `${siteUrl}${page.url}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    }),
  );

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...STATIC_PAGES.map((page) => ({
      url: `${siteUrl}${page.path}`,
      lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...docPages,
    ...blogPages,
  ];
}
