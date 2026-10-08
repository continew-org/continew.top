import Link from 'next/link';
import type { Metadata } from 'next';
import { getBlogPostsGrouped, type BlogPost } from '@/lib/blog-source';
import {
  cardHover,
  PageContainer,
  PageHeader,
  PageNextLinks,
  Section,
} from '@/components/site-primitives';
import { cn } from '@/lib/cn';

export const metadata: Metadata = {
  title: '官方博客',
  description: 'ContiNew 版本更新、项目动态、社区故事与安全通告。',
};

/**
 * 分类配色遵守色彩预算：默认中性色，只有「安全通告」用红色（语义色，需要被一眼识别）。
 * 此前版本更新/项目动态/社区动态/头脑风暴/安全通告各用一种彩色，5 种色相把页面切碎了。
 */
const ALERT_CATEGORY = '安全通告';

function PostCard({ post }: { post: BlogPost }) {
  const alert = post.category === ALERT_CATEGORY;
  return (
    <li>
      <Link
        href={post.url}
        /*
         * hover 反馈此前是三重叠加：整卡 bg-fd-accent 变色 + 边框转主色 + 标题转主色，
         * 一动全动，显得闹。这里收敛为「极淡底色 + 半强度边框」的一次性反馈，
         * 并与全站卡片共用 cardHover（见 components/site-primitives.tsx）。
         */
        className={cn('block rounded-xl border border-fd-border p-5', cardHover)}
      >
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {/*
              卡片上不挂「置顶」胶囊：置顶文章只出现在置顶区块内（年份分组会跳过），
              看到这张卡时区块标题已经说明了一切，再标一次属于重复表达。
            */}
            {/*
              浅色主题下 --color-fd-muted(96.1%) 与 --color-fd-background(96%) 几乎同色，
              胶囊底色看不见、只剩一行灰字。加一道中性边框把标签形状补回来（不引入新色相）。
            */}
            <span
              className={cn(
                'rounded-full border px-2.5 py-0.5 text-xs font-medium',
                alert
                  ? 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400'
                  : 'border-fd-border bg-fd-muted text-fd-muted-foreground',
              )}
            >
              {post.category}
            </span>
            {post.original === false && (
              <span className="rounded-full border border-fd-border bg-fd-muted px-2.5 py-0.5 text-xs text-fd-muted-foreground">
                转载
              </span>
            )}
          </div>
          {/*
            不展示作者：20 篇里 19 篇作者相同，逐卡重复一个名字是纯噪音；
            转载文章已由「转载」标签交代来源。
          */}
          <time className="shrink-0 text-xs tabular-nums text-fd-muted-foreground">
            {post.date}
          </time>
        </div>
        {/*
          标题字重从 font-semibold + sm:text-lg 降到 font-medium + text-base：
          20 张卡片逐张压着又黑又粗的标题，视觉重量盖过了分类与日期，扫读时没有层次。
        */}
        <h3 className="mt-2.5 text-base font-medium leading-snug">{post.title}</h3>
        {post.description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-fd-muted-foreground">
            {post.description}
          </p>
        )}
      </Link>
    </li>
  );
}

function PostList({ posts }: { posts: BlogPost[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard key={post.url} post={post} />
      ))}
    </ul>
  );
}

export default async function BlogIndexPage() {
  const { pinned, years } = await getBlogPostsGrouped();
  const total = pinned.length + years.reduce((n, y) => n + y.posts.length, 0);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Blog"
        title="官方博客"
        /*
         * 首屏统计卡片已移除（同 /users）：20 篇文章 / 5 个分类 / 一个日期当数字用，
         * 量级撑不起三张大卡。数字降级为描述里的一句话。
         */
        description={`版本更新、项目动态、社区故事与安全通告，都在这里。目前共 ${total} 篇文章，按年份排列。`}
      />

      {pinned.length > 0 && (
        <Section title="置顶" className="mt-12">
          <PostList posts={pinned} />
        </Section>
      )}

      {years.map((group) => (
        // 年份只是分组标记，用 Section 默认标题即可 —— 曾试过 text-2xl 粗体大数字，抢了文章标题的戏。
        <Section key={group.year} title={group.year} description={`${group.posts.length} 篇`}>
          <PostList posts={group.posts} />
        </Section>
      ))}

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
