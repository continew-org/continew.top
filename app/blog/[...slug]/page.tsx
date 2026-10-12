import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { DocsBody } from 'fumadocs-ui/page';
import { TOCProvider } from 'fumadocs-ui/components/toc';
import { InlineTOC } from 'fumadocs-ui/components/inline-toc';
import { BlogToc } from '@/components/blog-toc';
import { DocsSponsorSlot } from '@/components/docs-sponsor-slot';
import { blogSource, excerptOf, getBlogPostContext, type BlogPost } from '@/lib/blog-source';
import { tocTitle } from '@/lib/i18n';
import { getMDXComponents } from '@/components/mdx';
import { siteUrl } from '@/lib/shared';
import { cardHover } from '@/components/site-primitives';
import { cn } from '@/lib/cn';

function NeighbourLink({ post, label, align = 'left' }: { post?: BlogPost; label: string; align?: 'left' | 'right' }) {
  if (!post) return null;
  return (
    <Link href={post.url} className={cn('block min-w-0 rounded-xl border border-fd-border p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cn-brand)]/50', cardHover, align === 'right' && 'sm:text-right')}>
      <span className="text-xs text-fd-muted-foreground">{label}</span>
      <span className="mt-2 block text-sm font-medium leading-snug">{post.title}</span>
    </Link>
  );
}

export default async function BlogPostPage(props: PageProps<'/blog/[...slug]'>) {
  const params = await props.params;
  const page = blogSource.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const date = page.data.datetime.slice(0, 10);
  const { previous, next, related } = await getBlogPostContext(page.url);
  const authoredDescription = page.data.description?.trim();
  /*
   * 大纲只收章节（H2 及以下）：文章标题已由页面头渲染，再进大纲就成了
   * 一个点了没反应的重复项（旧站迁移的正文首行本就带着一条与 title 重复的 H1）。
   */
  const toc = page.data.toc.filter((item) => item.depth > 1);

  /*
   * 目录（TOC）自组装，不能用 `layouts/*\/page` 的 DocsPage：
   * 它们都要求自己那套 DocsLayout 的 context，博客页挂在 HomeLayout 下会直接 500
   * （报错 "Please use <DocsPage /> under <DocsLayout />"，控制台上还伴随一条
   * "Encountered a script tag while rendering" 的次生噪音）。
   *
   * 桌面：右侧常驻目录（带滚动高亮）；移动：文章顶部放折叠的内联目录。
   */
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-16">
      <TOCProvider toc={toc}>
        {/*
          间距照文档站的做法：外层只留很小的 gap，主要间距由目录列的左内边距（ps-12）撑开，
          合计约 64px，与文档站 --fd-toc-width 列前的留白一致。
        */}
        <div className="flex items-start gap-4">
          <article className="min-w-0 flex-1">
            <header className="flex flex-col gap-4 border-b border-fd-border pb-8">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-fd-primary/10 px-2.5 py-0.5 font-medium text-fd-primary">
                  {page.data.category}
                </span>
                {page.data.original === false && (
                  <span className="rounded-full border border-fd-border bg-fd-muted px-2.5 py-0.5 text-fd-muted-foreground">
                    转载
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
                {page.data.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-fd-muted-foreground">
                <span>{page.data.author}</span>
                <span className="tabular-nums">{date}</span>
                {page.data.originalLink && (
                  <a
                    href={page.data.originalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fd-primary hover:underline"
                  >
                    公众号原文 →
                  </a>
                )}
              </div>
              {authoredDescription && (
                <p className="max-w-2xl text-base leading-relaxed text-fd-muted-foreground">
                  {authoredDescription}
                </p>
              )}
            </header>

            <div className="mt-6 lg:hidden">
              <InlineTOC items={toc}>{tocTitle}</InlineTOC>
            </div>

            <DocsBody className="mx-0 max-w-none pt-8">
              <MDX components={getMDXComponents()} />
            </DocsBody>

            <footer className="mt-16 border-t border-fd-border pt-8">
              {(previous || next) && (
                <nav aria-label="文章导航" className="grid gap-3 sm:grid-cols-2">
                  <NeighbourLink post={previous} label="上一篇" />
                  <NeighbourLink post={next} label="下一篇" align="right" />
                </nav>
              )}
              {related.length > 0 && (
                <section aria-labelledby="related-posts-title" className="mt-12">
                  <h2 id="related-posts-title" className="text-lg font-semibold">相关阅读</h2>
                  <ul className="mt-4 divide-y divide-fd-border/70">
                    {related.map((post) => (
                      <li key={post.url}>
                        <Link href={post.url} className="group block rounded-sm py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cn-brand)]/50">
                          <span className="text-xs tabular-nums text-fd-muted-foreground">{post.date}</span>
                          <span className="mt-1 block text-sm font-medium leading-snug group-hover:text-[var(--cn-brand)]">{post.title}</span>
                          {post.description && <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-fd-muted-foreground">{post.description}</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              <Link href="/blog" className="mt-10 inline-block rounded-sm text-sm text-[var(--cn-brand)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cn-brand)]/50">
                ← 返回全部文章
              </Link>
            </footer>
          </article>

          <div className="sticky top-20 hidden max-h-[calc(100dvh-6rem)] w-72 shrink-0 flex-col self-start ps-12 lg:flex">
            <BlogToc title={tocTitle} />
            <div className="shrink-0"><DocsSponsorSlot /></div>
          </div>
        </div>
      </TOCProvider>
    </main>
  );
}

export function generateStaticParams() {
  return blogSource.generateParams();
}

export async function generateMetadata(props: PageProps<'/blog/[...slug]'>): Promise<Metadata> {
  const params = await props.params;
  const page = blogSource.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description?.trim() || (await excerptOf(page)),
    openGraph: {
      type: 'article',
      url: `${siteUrl}${page.url}`,
    },
  };
}
