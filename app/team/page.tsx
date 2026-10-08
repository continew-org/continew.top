import type { Metadata } from 'next';
import { ArrowRight, GitPullRequestArrow, UserPlus, Users } from 'lucide-react';
import { getCoreMembers, getEmeritiMembers, getPartnerMembers } from '@/lib/team';
import { ShuffledMemberGrid } from '@/components/shuffled-member-grid';
import { ContributorWall } from '@/components/contributor-wall';
import { gitConfig } from '@/lib/shared';
import { getContributorList, getContributorSummary } from '@/lib/site-stats';
import { PageContainer, PageHeader, PageNextLinks, Section } from '@/components/site-primitives';

export const metadata: Metadata = {
  title: '社区团队',
  description: 'ContiNew 核心团队成员、名誉核心团队成员、社区共鸣者与社区贡献者。',
};

/**
 * Fisher-Yates 洗牌（构建期）。
 *
 * 静态导出在构建时渲染一次，这里的洗牌决定 SSR/SEO 看到的首屏顺序；
 * 页面加载后 `ShuffledMemberGrid` 会在客户端再洗一次，因此每次刷新顺序都不同。
 */
function shuffle<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default async function TeamPage() {
  const core = getCoreMembers();
  const emeriti = getEmeritiMembers();
  const partners = getPartnerMembers();
  // 累计成员：官网在列的全部成员（核心 + 社区共鸣者 + 名誉核心团队成员）
  const totalMembers = core.length + partners.length + emeriti.length;
  // 贡献者：构建期拉取三平台提交者按用户名去重（口径见 lib/site-stats.ts）
  const contributors = await getContributorSummary();
  // 贡献者名单（头像墙）；拉取失败时为空数组，此时不渲染该区块
  const { list: contributorList } = await getContributorList();

  // 排序：core[0] 为 Creator，固定首位；其余核心成员、社区共鸣者、名誉核心团队成员一律随机，
  // 避免页面上形成固定的排名次序。
  const [creator, ...otherCore] = core;
  const orderedCore = creator ? [creator, ...shuffle(otherCore)] : [];
  const orderedPartners = shuffle(partners);
  const orderedEmeriti = shuffle(emeriti);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Our Team"
        title="社区团队"
        description="一群「代码洁癖」，用业余时间把 ContiNew 打磨得更「甜」。"
        stats={[
          {
            value: String(totalMembers),
            label: '累计成员',
            icon: <Users className="size-4" aria-hidden />,
          },
          {
            value: String(partners.length),
            label: '社区共鸣者',
            icon: <UserPlus className="size-4" aria-hidden />,
          },
          {
            value: String(contributors.total),
            label: '累计贡献者',
            icon: <GitPullRequestArrow className="size-4" aria-hidden />,
          },
        ]}
        actions={
          <a
            href={`https://github.com/${gitConfig.user}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
          >
            参与贡献
          </a>
        }
      />

      <Section
        title="核心团队成员"
        description="核心团队成员是那些积极参与维护一个或多个核心项目的人。他们对 ContiNew 的生态系统做出了重大贡献。"
        action={<span className="text-sm text-fd-muted-foreground">{core.length} 位</span>}
      >
        <ShuffledMemberGrid members={orderedCore} fixedFirst />
      </Section>

      {/* 名誉核心团队成员排在社区共鸣者之前：前者曾深度参与项目，后者是社区里的同路人 */}
      {emeriti.length > 0 && (
        <Section
          title="名誉核心团队成员"
          description="我们在此致敬过去曾做出过突出贡献的不再活跃的团队成员。"
          action={<span className="text-sm text-fd-muted-foreground">{emeriti.length} 位</span>}
        >
          <ShuffledMemberGrid members={orderedEmeriti} />
        </Section>
      )}

      {partners.length > 0 && (
        <Section
          title="社区共鸣者"
          description="特别值得一提的是，部分 ContiNew 社区成员的加入为平台注入了更多活力。我们与这些核心伙伴建立了更紧密的合作关系，经常就新功能开发和资讯发布等事宜进行密切协作。"
          action={<span className="text-sm text-fd-muted-foreground">{partners.length} 位</span>}
        >
          <ShuffledMemberGrid members={orderedPartners} />
        </Section>
      )}

      <Section
        title="社区贡献者"
        description="感谢每一位提交过代码、报告过问题、参与过讨论的朋友。ContiNew 的每一步都有你们的痕迹。"
        action={
          contributorList.length > 0 ? (
            <span className="text-sm text-fd-muted-foreground">{contributorList.length} 位</span>
          ) : null
        }
      >
        {contributorList.length > 0 ? (
          <ContributorWall contributors={contributorList} />
        ) : (
          /*
           * 构建期没拉到名单（如 CI / 本地网络访问不到 GitHub API）时给一个出口，
           * 而不是让区块空着。措辞保持中性，不把「拉取失败」暴露给访问者。
           */
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-dashed border-fd-border px-5 py-4">
            <p className="text-sm text-fd-muted-foreground">
              贡献者名单在构建时自动从 GitHub 获取，完整名单可前往组织主页查看。
            </p>
            <a
              href={`https://github.com/${gitConfig.user}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-fd-primary hover:underline"
            >
              在 GitHub 查看
              <ArrowRight className="size-4" aria-hidden />
            </a>
          </div>
        )}
      </Section>

      <PageNextLinks
        links={[
          {
            href: '/sponsor',
            title: '支持维护者',
            description: '通过各位成员的赞赏码请他们喝杯咖啡，或了解赞助权益。',
          },
          {
            href: '/timeline',
            title: '发展历程',
            description: '看看这群人一起把 ContiNew 做到了哪一步。',
          },
        ]}
      />
    </PageContainer>
  );
}
