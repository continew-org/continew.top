import type { Metadata } from 'next';
import { Code2, Radio, Users } from 'lucide-react';
import {
  getCommunityResonators,
  getCoreMemberProjectGroups,
  getCoreMembers,
  getEmeritiMembers,
} from '@/lib/team';
import { ContributorWall } from '@/components/contributor-wall';
import { getContributorList, getContributorSummary } from '@/lib/site-stats';
import { PageContainer, PageIntro, PageNextLinks, Section } from '@/components/site-primitives';
import { ActionLink } from '@/components/site-actions';
import { ContributionPaths } from '@/components/team/contribution-paths';
import { MemberGrid } from '@/components/team/member-grid';
import { TeamNetworkVisual } from '@/components/team/team-network-visual';
import { siteGrid, siteType } from '@/lib/site-design';
import { cn } from '@/lib/cn';

export const metadata: Metadata = {
  title: '社区团队',
  description: '认识持续维护 ContiNew 的核心团队、社区共鸣者、名誉成员与代码贡献者，并找到适合自己的参与方式。',
};

export default async function TeamPage() {
  const core = getCoreMembers();
  const resonators = getCommunityResonators();
  const emeriti = getEmeritiMembers();
  const coreGroups = getCoreMemberProjectGroups(core);
  const [contributorSummary, contributorResult] = await Promise.all([
    getContributorSummary(),
    getContributorList(),
  ]);
  const contributorCount = contributorResult.list.length || contributorSummary.total;

  const stats = [
    { value: core.length, label: '核心团队成员', icon: Users },
    { value: resonators.length, label: '社区共鸣者', icon: Radio },
    { value: contributorCount, label: 'GitHub 代码贡献者', icon: Code2 },
  ];

  return (
    <PageContainer className="overflow-x-clip">
      <header className="relative overflow-hidden border-b border-fd-border/70 pb-12 sm:pb-16">
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 w-3/5 bg-[radial-gradient(circle_at_72%_54%,color-mix(in_oklab,var(--cn-brand)_8%,transparent),transparent_50%)]"
        />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
          <PageIntro
            className="cn-stagger"
            eyebrow="ContiNew 社区"
            title="一群人，把持续迭代变成日常"
            description="核心团队承担项目的持续维护，社区共鸣者通过交流、反馈、传播与协作带来更多可能。身份不同，但每一份参与都在让 ContiNew 继续向前。"
            actions={
              <>
                <ActionLink href="#maintainers" variant="primary">认识维护团队</ActionLink>
                <ActionLink href="#contribute">找到参与方式</ActionLink>
              </>
            }
          >
            <p className="mt-7 text-sm leading-6 text-fd-muted-foreground">
              社区身份不按提交数量评定，代码也不是唯一的参与方式。
            </p>
          </PageIntro>

          <TeamNetworkVisual core={core} resonators={resonators} emeriti={emeriti} />
        </div>

        <dl className="mt-10 grid grid-cols-3 divide-x divide-fd-border border-y border-fd-border/70 sm:mt-12">
          {stats.map(({ value, label, icon: Icon }) => (
            <div key={label} className="flex min-w-0 flex-col-reverse px-2 py-5 text-center sm:py-6">
              <dt className="mt-1.5 text-xs leading-5 text-fd-muted-foreground">
                {label}
              </dt>
              <dd className="flex items-center justify-center gap-2 text-xl font-bold tracking-tight text-[var(--cn-brand)] tabular-nums sm:text-3xl">
                <Icon className="hidden size-4 sm:block" aria-hidden />
                {value.toLocaleString()}
              </dd>
            </div>
          ))}
        </dl>
      </header>

      <Section
        id="maintainers"
        className="scroll-mt-24"
        title="谁在持续维护 ContiNew"
        description="以下范围按核心成员现有资料中的项目标注整理，表达长期参与方向，不表示唯一负责人、模块所有权或贡献排名。"
        action={
          <span className="rounded-full border border-fd-border bg-fd-card px-3 py-1 text-xs text-fd-muted-foreground">
            {core.length} 位核心成员
          </span>
        }
      >
        <div className="divide-y divide-fd-border/70">
          {coreGroups.map((group) => (
            <section
              key={group.key}
              aria-labelledby={`core-${group.key}`}
              className={cn(siteGrid.grouped, 'py-8 first:pt-0 last:pb-0')}
            >
              <div>
                <h3 id={`core-${group.key}`} className="font-semibold">
                  {group.label}
                </h3>
                <p className={cn('mt-1.5 text-fd-muted-foreground', siteType.compact)}>
                  {group.description}
                </p>
                <p className={cn('mt-2 text-fd-muted-foreground', siteType.meta)}>
                  {group.members.length} 位
                </p>
              </div>
              <MemberGrid members={group.members} kind="core" columns={2} />
            </section>
          ))}
        </div>
      </Section>

      <Section
        title="社区共鸣者"
        description="社区里积极交流、反馈、传播与协作的伙伴。有人也会提交代码，但这一身份不等同于核心维护者，也不承担核心维护责任。"
        action={<span className="text-sm text-fd-muted-foreground">{resonators.length} 位</span>}
      >
        <MemberGrid members={resonators} kind="resonator" />
      </Section>

      {emeriti.length > 0 && (
        <Section
          title="名誉核心团队成员"
          description="他们曾深度参与项目维护并留下重要贡献，目前不承担日常核心维护责任。我们在这里保留这段共同建设的历史。"
          action={<span className="text-sm text-fd-muted-foreground">{emeriti.length} 位</span>}
        >
          <MemberGrid members={emeriti} kind="emeritus" columns={2} />
        </Section>
      )}

      <Section
        id="contribute"
        className="scroll-mt-24"
        title="从一件具体的小事开始"
        description="代码、文档、反馈、答疑与分享都能带来价值。先选择你想做的事，再进入对应的项目或渠道。"
      >
        <ContributionPaths />
      </Section>

      <Section
        id="contributors"
        className="scroll-mt-24"
        title="代码贡献者"
        description="名单在站点构建时从 GitHub 组织公开仓库的 Contributors API 汇总，跨仓库按账号去重。它不覆盖只在 Gitee / AtomGit 提交，或只参与 Issue、讨论、评审与传播的伙伴。"
      >
        {contributorResult.list.length > 0 ? (
          <details className="group rounded-2xl border border-fd-border bg-fd-card">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium transition-colors hover:bg-fd-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--cn-brand)]/50 sm:px-6 [&::-webkit-details-marker]:hidden">
              <span>
                <span className="group-open:hidden">查看全部 {contributorResult.list.length} 位代码贡献者</span>
                <span className="hidden group-open:inline">收起代码贡献者名单</span>
              </span>
              <span className="shrink-0 text-xs font-normal text-fd-muted-foreground">
                构建时同步
              </span>
            </summary>
            <div className="border-t border-fd-border px-5 py-5 sm:px-6 sm:py-6">
              <ContributorWall contributors={contributorResult.list} celebrate={false} />
            </div>
          </details>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-dashed border-fd-border px-5 py-4">
            <p className="text-sm text-fd-muted-foreground">
              本次构建未取得完整名单。参与入口仍然可用，欢迎从适合你的方式开始。
            </p>
            <ActionLink href="#contribute" variant="text">查看参与方式</ActionLink>
          </div>
        )}
      </Section>

      <PageNextLinks
        links={[
          {
            href: '/sponsor',
            title: '支持 ContiNew',
            description: '了解项目支持方式，以及所有曾提供资金、资源与工具的支持者。',
          },
          {
            href: '/timeline',
            title: '发展历程',
            description: '看看这些人一起走过的版本、里程碑与社区时刻。',
          },
        ]}
      />
    </PageContainer>
  );
}
