'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { BLOG_CATEGORIES, type BlogCategory } from '@/lib/blog-meta';
import type { BlogPost } from '@/lib/blog-source';
import { cn } from '@/lib/cn';

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

function CategoryLabel({ category }: { category: BlogCategory }) {
  return (
    <span
      className={cn(
        'text-xs font-medium',
        category === '安全通告' ? 'text-red-600 dark:text-red-400' : 'text-fd-muted-foreground',
      )}
    >
      {category}
    </span>
  );
}

export function BlogArchive({ posts }: { posts: BlogPost[] }) {
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
          <h2 id="blog-archive-title" className="text-2xl font-semibold tracking-tight">
            全部文章
          </h2>
          <p className="mt-2 text-sm text-fd-muted-foreground">按发布时间回看每一次更新。</p>
        </div>
        <p role="status" aria-live="polite" aria-atomic="true" className="mt-3 text-sm text-fd-muted-foreground sm:mt-0">
          {category ? `${category} · ${filtered.length} 篇` : `共 ${posts.length} 篇`}
        </p>
      </div>

      <div role="group" aria-label="按文章分类筛选" className="-mx-6 mt-7 overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max items-center gap-2 pb-1">
          <button
            type="button"
            aria-pressed={category === null}
            onClick={() => setCategory(null)}
            className={cn(
              'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cn-brand)]/50',
              category === null
                ? 'border-[var(--cn-brand-line)] bg-[var(--cn-brand-soft)] text-[var(--cn-brand)]'
                : 'border-fd-border text-fd-muted-foreground hover:text-fd-foreground',
            )}
          >
            全部
          </button>
          {BLOG_CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cn-brand)]/50',
                category === item
                  ? 'border-[var(--cn-brand-line)] bg-[var(--cn-brand-soft)] text-[var(--cn-brand)]'
                  : 'border-fd-border text-fd-muted-foreground hover:text-fd-foreground',
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12 space-y-14">
        {years.map(({ year, posts: yearPosts }) => (
          <section key={year} aria-labelledby={`blog-year-${year}`} className="border-t border-fd-border/70 pt-7 lg:grid lg:grid-cols-[6.5rem_minmax(0,1fr)] lg:gap-8">
            <div className="mb-5 lg:mb-0">
              <h3 id={`blog-year-${year}`} className="text-2xl font-semibold tracking-tight tabular-nums">
                {year}
              </h3>
              <p className="mt-1 text-xs text-fd-muted-foreground">{yearPosts.length} 篇</p>
            </div>
            <ol className="min-w-0">
              {yearPosts.map((post) => (
                <li key={post.url}>
                  <Link
                    href={post.url}
                    className="group grid min-w-0 border-b border-fd-border/70 py-5 first:pt-0 sm:grid-cols-[5.5rem_1rem_minmax(0,1fr)] sm:gap-x-5 focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cn-brand)]/50"
                  >
                    <time dateTime={post.date} className="text-xs tabular-nums text-fd-muted-foreground sm:pt-1">
                      {post.date.slice(5).replace('-', '.')}
                    </time>
                    <span aria-hidden className="relative hidden sm:block">
                      <span className="absolute -top-5 -bottom-5 left-1/2 w-px bg-fd-border/70" />
                      <span className="absolute left-1/2 top-1.5 size-2 -translate-x-1/2 rounded-full bg-[var(--cn-brand)] ring-4 ring-fd-background" />
                    </span>
                    <span className="min-w-0">
                      <span className="mt-2 block sm:mt-0"><CategoryLabel category={post.category} />{post.original === false && <span className="ml-2 text-xs text-fd-muted-foreground">转载</span>}</span>
                      <span className="mt-1.5 block text-base font-medium leading-snug transition-colors group-hover:text-[var(--cn-brand)] sm:text-lg">
                        {post.title}
                      </span>
                      {post.description && (
                        <span className="mt-2 line-clamp-2 block text-sm leading-relaxed text-fd-muted-foreground">
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
      </div>
    </section>
  );
}
