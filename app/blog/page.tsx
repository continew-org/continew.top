import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { BlogArchive } from '@/components/blog-archive';
import { BlogWechatDialog } from '@/components/blog-wechat-dialog';
import { PageContainer, PageNextLinks, cardHover } from '@/components/site-primitives';
import { getBlogPosts, type BlogPost } from '@/lib/blog-source';
import { cn } from '@/lib/cn';

export const metadata: Metadata = {
  title: '官方博客',
  description: 'ContiNew 版本更新、项目动态、社区故事与安全通告。',
};

function LatestPost({ post }: { post: BlogPost }) {
  return (
    <section aria-labelledby="latest-post-title" className="mt-14 sm:mt-16">
      <div className="mb-5 flex items-center gap-3">
        <h2 id="latest-post-title" className="text-sm font-semibold text-[var(--cn-brand)]">最新发布</h2>
        <span className="h-px flex-1 bg-fd-border" aria-hidden />
      </div>
      <Link
        href={post.url}
        className={cn(
          'group block rounded-2xl border border-fd-border bg-fd-card px-6 py-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cn-brand)]/50 sm:px-9 sm:py-9',
          cardHover,
        )}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fd-muted-foreground">
          <span className="font-medium text-[var(--cn-brand)]">{post.category}</span>
          <time dateTime={post.date} className="tabular-nums">{post.date}</time>
        </div>
        <h3 className="mt-5 max-w-3xl text-xl font-semibold leading-snug tracking-tight transition-colors group-hover:text-[var(--cn-brand)] sm:text-2xl">
          {post.title}
        </h3>
        {post.description && <p className="mt-4 max-w-2xl text-sm leading-relaxed text-fd-muted-foreground sm:text-base">{post.description}</p>}
        <span className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--cn-brand)]">
          阅读文章 <ArrowUpRight className="size-4" aria-hidden />
        </span>
      </Link>
    </section>
  );
}

export default async function BlogIndexPage() {
  const posts = await getBlogPosts();
  const latest = posts[0];

  return (
    <PageContainer>
      <header className="relative lg:flex lg:items-start lg:justify-between lg:gap-12">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">ContiNew 官方博客</h1>
          <p className="mt-5 text-base leading-relaxed text-fd-muted-foreground sm:text-lg">
            记录版本发布、项目决策、社区进展与安全通告。
            <br className="hidden sm:block" />
            了解 ContiNew 正在做什么，以及为什么这样做。
          </p>
          <BlogWechatDialog />
        </div>
        <div className="hidden shrink-0 text-center lg:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/qrcode/gzh.webp"
            width={258}
            height={258}
            alt="ContiNew 公众号二维码"
            className="mx-auto size-32 rounded-xl border border-fd-border bg-white object-contain p-1.5"
          />
          <p className="mt-2 text-xs text-fd-muted-foreground">微信扫码关注，获取项目更新</p>
        </div>
      </header>

      {latest && <LatestPost post={latest} />}
      <BlogArchive posts={posts} />

      <PageNextLinks
        links={[
          {
            href: '/docs/admin',
            title: '项目文档',
            description: '想上手？ContiNew Admin 的完整文档在这里。',
          },
          {
            href: '/timeline',
            title: '发展历程',
            description: '按时间线回顾 ContiNew 的每个关键节点。',
          },
        ]}
      />
    </PageContainer>
  );
}
