import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { DocsBody } from 'fumadocs-ui/page';
import { TOCProvider } from 'fumadocs-ui/components/toc';
import { InlineTOC } from 'fumadocs-ui/components/inline-toc';
import { BlogToc } from '@/components/blog-toc';
import { blogSource, excerptOf } from '@/lib/blog-source';
import { tocTitle } from '@/lib/i18n';
import { getMDXComponents } from '@/components/mdx';
import { siteUrl } from '@/lib/shared';

export default async function BlogPostPage(props: PageProps<'/blog/[...slug]'>) {
  const params = await props.params;
  const page = blogSource.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const date = page.data.datetime.slice(0, 10);
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
            </header>

            <div className="mt-6 lg:hidden">
              <InlineTOC items={toc}>{tocTitle}</InlineTOC>
            </div>

            <DocsBody className="mx-0 max-w-none pt-8">
              <MDX components={getMDXComponents()} />
            </DocsBody>

            <footer className="mt-16 border-t border-fd-border pt-8 text-center text-sm">
              <Link href="/blog" className="text-fd-primary hover:underline">
                ← 返回博客列表
              </Link>
            </footer>
          </article>

          {/* 目录列：固定宽度 224px，标题与条目样式由 components/blog-toc.tsx 对齐文档站。 */}
          <aside className="sticky top-24 hidden w-56 shrink-0 self-start ps-12 lg:block">
            <BlogToc title={tocTitle} />
          </aside>
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
    // 20 篇里 19 篇没写 description，回退到与列表页同源的正文摘要，保证分享卡片不空。
    description: page.data.description ?? (await excerptOf(page)),
    openGraph: {
      type: 'article',
      url: `${siteUrl}${page.url}`,
    },
  };
}
