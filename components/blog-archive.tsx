'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button, FilterChip } from '@/components/site-actions';
import { BLOG_CATEGORIES, type BlogCategory } from '@/lib/blog-meta';
import type { BlogPost } from '@/lib/blog-source';
import { cn } from '@/lib/cn';
import { focusRing, siteMotion, siteType } from '@/lib/site-design';

function groupByYear(posts: BlogPost[]) {
  const years = new Map<string, BlogPost[]>();
  for (const post of posts) {
    const year = post.date.slice(0, 4);
    const group = years.get(year);
    if (group) group.push(post);
    else years.set(year, [post]);
  }
  return [...years.entries()].map(([year, yearPosts]) => ({ year, posts: yearPosts }));
}

function CategoryLabel({ category }: Readonly<{ category: BlogCategory }>) {
  return (
    <span
      className={cn(
        siteType.meta,
        'font-medium',
        category === '安全通告' ? 'text-red-600 dark:text-red-400' : 'text-fd-muted-foreground',
      )}
    >
      {category}
    </span>
  );
}

export function BlogArchive({ posts }: Readonly<{ posts: BlogPost[] }>) {
  const [category, setCategory] = useState<BlogCategory | null>(null);
  const filtered = useMemo(
    () => (category ? posts.filter((post) => post.category === category) : posts),
    [category, posts],
  );
  const years = useMemo(() => groupByYear(filtered), [filtered]);

  return (
    <section aria-labelledby="blog-archive-title" className="mt-16 sm:mt-20">
      <div className="sm:flex sm:items-end sm:justify-between">
        <div>
          <h2 id="blog-archive-title" className={siteType.sectionTitle}>
            全部文章
          </h2>
          <p className={cn('mt-2 text-fd-muted-foreground', siteType.compact)}>按发布时间回看每一次更新。</p>
        </div>
        <p role="status" aria-live="polite" aria-atomic="true" className={cn('mt-3 text-fd-muted-foreground sm:mt-0', siteType.compact)}>
          {category ? `${category} · ${filtered.length} 篇` : `共 ${posts.length} 篇`}
        </p>
      </div>

      <div className="-mx-6 mt-7 overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <fieldset className="flex w-max items-center gap-2 py-1">
          <legend className="sr-only">按文章分类筛选</legend>
          <FilterChip selected={category === null} onClick={() => setCategory(null)}>
            全部
          </FilterChip>
          {BLOG_CATEGORIES.map((item) => (
            <FilterChip
              key={item}
              selected={category === item}
              onClick={() => setCategory(item)}
            >
              {item}
            </FilterChip>
          ))}
        </fieldset>
      </div>

      <div className="mt-12 space-y-14">
        {years.map(({ year, posts: yearPosts }) => (
          <section key={year} aria-labelledby={`blog-year-${year}`} className="border-t border-fd-border/70 pt-7 lg:grid lg:grid-cols-[6.5rem_minmax(0,1fr)] lg:gap-8">
            <div className="mb-5 lg:mb-0">
              <h3 id={`blog-year-${year}`} className={cn('tabular-nums', siteType.sectionTitle)}>
                {year}
              </h3>
              <p className="mt-1 text-fd-muted-foreground leading-5">{yearPosts.length} 篇</p>
            </div>
            <ol className="min-w-0">
              {yearPosts.map((post) => (
                <li key={post.url}>
                  <Link
                    href={post.url}
                    className={cn('group grid min-w-0 rounded-md border-b border-fd-border/70 py-5 first:pt-0 sm:grid-cols-[5.5rem_1rem_minmax(0,1fr)] sm:gap-x-5', focusRing)}
                  >
                    <time dateTime={post.date} className="tabular-nums text-fd-muted-foreground sm:pt-1 ">
                      {post.date.slice(5).replace('-', '.')}
                    </time>
                    <span aria-hidden className="relative hidden sm:block">
                      <span className="absolute -top-5 -bottom-5 left-1/2 w-px bg-fd-border/70" />
                      <span className="absolute left-1/2 top-1.5 size-2 -translate-x-1/2 rounded-full bg-[var(--cn-brand)] ring-4 ring-fd-background" />
                    </span>
                    <span className="min-w-0 p-2">
                      <span className="mt-2 block sm:mt-0"><CategoryLabel category={post.category} />{post.original === false && <span className={cn('ml-2 text-fd-muted-foreground', siteType.meta)}>转载</span>}</span>
                      <span className={cn('mt-1.5 block group-hover:text-[var(--cn-brand)] group-focus-visible:text-[var(--cn-brand)]', siteType.cardTitle, siteMotion.feedback)}>
                        {post.title}
                      </span>
                      {post.description && (
                        <span className={cn('mt-2 line-clamp-2 block text-fd-muted-foreground', siteType.compact)}>
                          {post.description}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-fd-border px-5 py-12 text-center">
            <p className={cn('font-medium', siteType.compact)}>暂无{category ? `“${category}”分类的` : ''}文章</p>
            {category && (
              <Button onClick={() => setCategory(null)} className="mt-5">
                查看全部文章
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
