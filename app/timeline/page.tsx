import Image from 'next/image';
import type { Metadata } from 'next';
import { Award, CalendarDays, GitCommitHorizontal, Star, Trophy } from 'lucide-react';
import { getTimeline, getTimelineByYear, maintenanceStartDate, type TimelineItem } from '@/lib/timeline';
import { getStarSummary } from '@/lib/site-stats';
import { ImageLightbox } from '@/components/lightbox';
import { PageContainer, PageHeader, PageNextLinks, Section } from '@/components/site-primitives';
import { cn } from '@/lib/cn';

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

/** 时间线上的重点节点：在时间线上加重显示（实心节点 + 标题加粗）。 */
function isKeyNode(type?: TimelineItem['type']) {
  return type !== undefined;
}

function TypeBadge({ type }: { type?: TimelineItem['type'] }) {
  /*
   * 配色分工：荣誉走琥珀金（外部认可，最"贵重"，与 Creator 徽章同一语言）；
   * 里程碑走品牌色（项目自身的版本节奏）；Star 走黄色（Star 本身的语义色）。
   * 此前荣誉用主色、里程碑用金色，恰好反了。
   */
  if (type === 'honor') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
        <Trophy className="size-3" aria-hidden /> 荣誉
      </span>
    );
  }
  if (type === 'great') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-fd-primary/10 px-2 py-0.5 text-xs font-medium text-fd-primary">
        <Award className="size-3" aria-hidden /> 里程碑
      </span>
    );
  }
  if (type === 'star') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-400">
        <Star className="size-3" aria-hidden /> Star
      </span>
    );
  }
  return null;
}

// 静态导出：在构建期（模块求值）计算一次，避免在渲染中调用 Date.now()（不纯）。
const all = getTimeline();
const totalDays = Math.ceil((Date.now() - new Date(maintenanceStartDate).getTime()) / 86400000);
const honorCount = all.filter((item) => isHonor(item.type)).length;

export default async function TimelinePage() {
  const groups = getTimelineByYear();
  const stars = await getStarSummary();

  return (
    <PageContainer>
      <PageHeader
        eyebrow={`Since ${maintenanceStartDate.slice(0, 4)}`}
        title="发展历程"
        description="2022 年的冬天，一次再普通不过的项目初始化，成了这段旅程的起点。此后的每一次发版、每一个 Star、每一份来自平台和社区的认可，都被留在了这条时间线上。"
        stats={[
          {
            value: `${stars.total.toLocaleString()}+`,
            label: '累计 Star',
            icon: <Star className="size-4" aria-hidden />,
          },
          {
            value: totalDays.toLocaleString(),
            label: '持续维护（天）',
            icon: <CalendarDays className="size-4" aria-hidden />,
          },
          {
            value: String(honorCount),
            label: '平台荣誉',
            icon: <Trophy className="size-4" aria-hidden />,
          },
        ]}
      >
        {/* 分平台构成：总数是三平台求和，这里给出明细，避免读者对口径存疑 */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-fd-muted-foreground">
          {stars.platforms.map((platform) => (
            <a
              key={platform.key}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-fd-primary"
            >
              <span className="font-medium text-fd-foreground tabular-nums">
                {platform.count.toLocaleString()}
              </span>
              {platform.name}
            </a>
          ))}
        </div>
      </PageHeader>

      {groups.map(({ year, items }) => (
        <Section
          key={year}
          id={year}
          title={<span className="text-2xl font-bold text-fd-primary tabular-nums">{year}</span>}
          action={<span className="text-sm text-fd-muted-foreground">{items.length} 项</span>}
        >
          <ol className="relative flex flex-col gap-8 border-l border-fd-border pl-6">
            {items.map((item) => {
              const key = isKeyNode(item.type);
              return (
                <li key={`${item.date}-${item.title}`} className="relative">
                  {/* 时间线节点：外圈品牌色光晕 + 内点，荣誉类实色、其余半透明。
                      外层 16px，圆心落在竖线上，与右侧日期行（text-xs，行高 16px）中线对齐。 */}
                  <span
                    aria-hidden
                    className="absolute -left-[32px] top-0 flex size-4 items-center justify-center rounded-full bg-fd-primary/10 ring-1 ring-fd-primary/20"
                  >
                    <span
                      className={cn('size-2 rounded-full', key ? 'bg-fd-primary' : 'bg-fd-primary/50')}
                    />
                  </span>
                  {/* 统一内边距，保证有/无类型标记的条目左侧对齐（此前此处的浅色底块已按需求移除） */}
                  <div className="px-3 py-1.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-fd-muted-foreground">
                      <time className="font-medium tabular-nums">{item.date}</time>
                      {item.logo && (
                        <Image
                          src={item.logo}
                          alt=""
                          width={16}
                          height={16}
                          unoptimized
                          className="size-4 rounded-sm"
                        />
                      )}
                      <TypeBadge type={item.type} />
                    </div>
                    <h3 className={cn('mt-1.5 leading-snug', key ? 'font-semibold' : 'font-medium')}>
                      {item.title}
                    </h3>
                    {item.desc && (
                      <p className="mt-1.5 text-sm leading-relaxed text-fd-muted-foreground">
                        {item.desc}
                      </p>
                    )}
                    {item.attaches && item.attaches.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-3">
                        {item.attaches.map((src) => (
                          <ImageLightbox key={src} src={src} alt={item.title} />
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </Section>
      ))}

      <p className="mt-16 flex items-center justify-center gap-2 text-sm text-fd-muted-foreground">
        <GitCommitHorizontal className="size-4" aria-hidden />
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
