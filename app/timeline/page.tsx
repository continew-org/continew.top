import type { Metadata } from 'next';
import { GitCommitHorizontal } from 'lucide-react';
import { TimelineContent } from '@/components/timeline/timeline-content';
import { PageContainer, PageNextLinks } from '@/components/site-primitives';
import {
  getCommitActivity,
  getGithubStarTrend,
} from '@/lib/repo-activity';
import { getStarSummary } from '@/lib/site-stats';
import { getTimeline, getTimelineByYear, maintenanceStartDate, type TimelineItem } from '@/lib/timeline';

export const metadata: Metadata = {
  title: '发展历程',
  description: '从 2022 年 12 月的一次项目初始化开始 —— 记录 ContiNew 的发版节奏、成长轨迹，以及那些被认可的瞬间。',
};

/**
 * 荣誉类：平台奖项（honor）与 Star 里程碑（star）。
 * 用于顶部「平台荣誉」统计 —— 两者都是外部认可的体现。
 * 注意：重大版本发布（great）不计入，那是项目自身节奏，不是荣誉。
 */
function isHonor(type?: TimelineItem['type']) {
  return type === 'honor' || type === 'star';
}

// 静态导出：在构建期（模块求值）计算一次，避免在渲染中调用 Date.now()（不纯）。
const all = getTimeline();
const totalDays = Math.ceil((Date.now() - new Date(maintenanceStartDate).getTime()) / 86400000);
const honorCount = all.filter((item) => isHonor(item.type)).length;

export default async function TimelinePage() {
  const groups = getTimelineByYear();

  /*
   * 三份数据并发拉取，都在构建期执行（静态导出）。
   *
   * Star 趋势与提交热力图打的是同一批 GitHub 接口，`lib/repo-activity.ts` 里按 URL
   * 缓存了 Promise，重复入口不会变成重复请求。GitHub 接口有限流，这些重复必须省掉。
   *
   * 任一失败都有各自的降级：Star 当前值走快照、两张图整块不渲染，
   * 页面不会因为有接口不通就缺一大块。
   */
  const [stars, trend, activity] = await Promise.all([
    getStarSummary(),
    getGithubStarTrend(),
    getCommitActivity(),
  ]);

  return (
    <PageContainer className="overflow-x-clip">
      <TimelineContent
        groups={groups}
        stars={stars}
        trend={trend}
        activity={activity}
        totalDays={totalDays}
        honorCount={honorCount}
        startYear={maintenanceStartDate.slice(0, 4)}
      />

      <p className="mt-20 flex items-center justify-center gap-2 text-sm text-fd-muted-foreground">
        <GitCommitHorizontal className="size-4 text-[var(--cn-brand)]" aria-hidden />
        故事仍在继续，欢迎一起来写下一笔。
      </p>

      <PageNextLinks
        links={[
          {
            href: '/users',
            title: '登记用户',
            description: '看看有哪些企业与团队正在生产环境使用 ContiNew。',
          },
          {
            href: '/sponsor',
            title: '支持我们',
            description: '了解赞助方式与权益，帮助项目持续迭代下去。',
          },
        ]}
      />
    </PageContainer>
  );
}
