import Link from 'next/link';
import type { Metadata } from 'next';
import { Check, Crown, Handshake, Heart, Minus, Server, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  afdianUrl,
  getActiveStrategic,
  getActiveSupporters,
  getPastSupporters,
  getResourceNeeds,
  getResourcePartners,
  getStrategicSeats,
  groupResourceByNeed,
  type ResolvedResourceNeed,
} from '@/lib/sponsors';
import { assertSponsorAssetsExist } from '@/lib/sponsors-assets';
import { CompanyCard } from '@/components/sponsor/company-card';
import { MiniVisual, ResourceNeedCard } from '@/components/sponsor/resource-card';
import { SupporterChips } from '@/components/sponsor/supporter-chip';
import {
  PageContainer,
  PageHeader,
  PageNextLinks,
  Section,
} from '@/components/site-primitives';
import { cn } from '@/lib/cn';

export const metadata: Metadata = {
  title: '成为赞助者',
  description: '赞助 ContiNew 系列开源项目，助力项目长远发展，同时为你的品牌提供展示机会。',
};

/**
 * 「联系洽谈」的落点：页内二维码区块。
 *
 * 不跳转外链——赞助沟通本来就要来回聊，扫码关注公众号/进群比丢一个表单或 Issue 更直接，
 * 也和旧站的做法一致（旧站 discussion 页挂的就是公众号二维码）。
 *
 * 注意：这是**页内锚点**，不能加 target="_blank"（会在新标签重开本站再跳锚点）。
 */
const contactAnchor = '#contact';

/**
 * 权益按「曝光 / 数据 / 关系」分组，而不是列一串位置名。
 *
 * 【为什么这么分】
 * 旧版四档卖的全是"位置"——首屏、侧边栏顶部、演示站轮播。位置有三个致命问题：
 *   1. 无法证明价值：赞助商问"这位置值多少钱"，答不上来；
 *   2. 不可控：演示站不在本仓库，写了也兑现不了；
 *   3. 零和排他：一写"超 2 位随机轮播"，单家曝光立刻减半，赞助商觉得自己亏了。
 * 换成三件事之后，每一件都是**可交付、可证明**的，且成本主要在时间不在版面。
 */
/**
 * 对比表的一行权益。
 *
 * 【为什么改成一张表】
 * 之前各档各列权益，有些其实是同一件事只是措辞不同，并排看反而让人觉得"这俩差不多"。
 * 一张表同一件事只写一行，谁有谁没有在同一把尺子下比，差异被整体放大。
 */
interface Benefit {
  label: string;
  /** 两档都有。缺省表示仅「开源合作伙伴」享有。 */
  both?: boolean;
}

const BENEFITS: Benefit[] = [
  { label: '名字列入官网支持者名单', both: true },
  { label: '加入 ContiNew 开源共鸣者交流群', both: true },
  /*
   * 群发是整张表里最值钱的一条：展示位是「等人来看」，群发是「推到眼前」。
   * 频率沿用旧站的"每月一次"：再高就变成打扰，群会散。
   */
  { label: '每月一次：通过全部官方交流群群发推广' },
  { label: '每月一次：公众号推文介绍或转发' },
  { label: '赞助方提出的需求与问题优先评估' },
  { label: '演示站工作台首页轮播展示位' },
  { label: '文档站全部内容页的目录区展示位（Logo + 名称，常驻不轮播）' },
  { label: '官网「成为赞助者」页的 Logo + 一句话业务介绍' },
  { label: '项目 README 的 Sponsors 区展示 Logo' },
  { label: '版本发布公告与项目动态中的致谢署名' },
  { label: '每月一份站点访问数据摘要（PV / UV / 趋势）' },
];

interface Tier {
  key: 'strategic' | 'infrastructure' | 'supporter';
  name: string;
  icon: ReactNode;
  /** 席位 / 名额标签。资源合作伙伴不占付费席位，故不展示。 */
  seats?: string;
  /** 价格文案。 */
  price: string;
  /** 一句话定位：这档适合谁。 */
  summary: string;
  highlight?: boolean;
  /** 需要对方提供的素材，可选——个人支持者不要求任何东西。 */
  requirement?: string;
  /** 该档的下一步动作。 */
  action: ReactNode;
}

/**
 * 档位文案在组件里构建，因为「剩余席位」依赖运行时读到的赞助商数据。
 *
 * 席位总数来自 data/sponsors.json 的 config.strategicSeats，
 * 「剩余 N 席」= 席位数 − 当前开源合作伙伴数量，不手填。
 */
function buildTiers(strategicRemaining: number): Tier[] {
  return [
    {
      key: 'strategic',
      /*
       * 展示名用「开源合作伙伴」：¥500/月 撑不起「战略」二字，名头比实质大；
       * 也不用「社区共建者」——会和出力的贡献者混为一谈。
       */
      name: '开源合作伙伴',
      icon: <Crown className="size-5" aria-hidden />,
      seats:
        strategicRemaining > 0
          ? `限量 ${getStrategicSeats()} 席 · 剩 ${strategicRemaining} 席`
          : `限量 ${getStrategicSeats()} 席 · 已满`,
      /*
       * 必须标价而不是「面议」：面议把定价权交给对方第一句话，历史上因此一直只卖出低价。
       * 500 是按演示站曝光量（单席约 12 万次/月 × 保守 CPM ¥4 ≈ ¥480）推出的锚，能拿出计算过程。
       */
      price: '¥500 / 月起 · 按月续费',
      highlight: true,
      action: (
        <a
          href={contactAnchor}
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
        >
          <Crown className="size-4" aria-hidden />
          聊聊合作
        </a>
      ),
      summary: '适合希望面向开发者持续曝光、并愿意长期支持项目的团队与企业。',
      requirement:
        '品牌名称 + 官方链接 + 一句话业务介绍；素材两种：广告图 680×320（2:1，用于演示站与赞助页）+ Logo 透明底 PNG/SVG 高 ≥80px（用于文档侧栏）',
    },
    {
      key: 'supporter',
      name: '个人支持者',
      icon: <Heart className="size-5" aria-hidden />,
      seats: '名额不限',
      // 与爱发电上的档位锁死同步：页面写一个数、点进去另一个数最容易让人掉头就走。
      price: '¥20 / 月起',
      action: (
        <a
          href={afdianUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-300 px-5 py-2.5 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50 dark:border-amber-500/40 dark:text-amber-300 dark:hover:bg-amber-500/10"
        >
          <Heart className="size-4" aria-hidden />
          在爱发电支持
        </a>
      ),
      summary: '适合想请维护者喝杯咖啡、并加入支持者社群的开发者。',
    },
    {
      key: 'infrastructure',
      name: '资源合作伙伴',
      icon: <Server className="size-5" aria-hidden />,
      price: '共建分布式演示环境',
      summary: '适合能提供服务器、云资源或 Token 额度的个人、团队与企业。',
      action: (
        <a
          href={contactAnchor}
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-teal-500/40 px-5 py-2.5 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-teal-500/10"
        >
          <Server className="size-4" aria-hidden />
          聊聊合作
        </a>
      ),
    },
  ];
}

/** 赞助款去向。 */
const SUPPORT_USES = [
  '承担网站域名及服务器运营成本',
  '投入更多精力进行项目开发',
  '采购开发工具与Token服务',
  '提供更优质的技术支持',
  '持续优化代码质量，开箱即用，持续提供舒适的开发体验',
  '研发更多实用功能与模块',
];

function TierCard({ tier, className }: { tier: Tier; className?: string }) {
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-xl border p-6',
        tier.highlight ? 'border-fd-primary/40 bg-fd-primary/[0.04]' : 'border-fd-border',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg border border-fd-border bg-fd-muted text-fd-muted-foreground">
            {tier.icon}
          </span>
          <h3 className={cn('font-semibold', tier.highlight && 'text-fd-primary')}>{tier.name}</h3>
        </div>
        {tier.seats && (
          <span
            className={cn(
              'shrink-0 rounded-full border px-2.5 py-0.5 text-xs',
              tier.highlight
                ? 'border-fd-primary/30 bg-fd-primary/10 text-fd-primary'
                : 'border-fd-border bg-fd-muted text-fd-muted-foreground',
            )}
          >
            {tier.seats}
          </span>
        )}
      </div>

      <p className="mt-3 text-sm font-medium text-fd-foreground">{tier.price}</p>
      <p className="mt-2.5 text-sm leading-relaxed text-fd-muted-foreground">{tier.summary}</p>

      {/* 资源档：需求清单紧跟 summary，提供者是迷你标识 */}
      {tier.key === 'infrastructure' && <ResourceNeedsList />}

      <div className="flex-1" />

      {tier.requirement && (
        <p className="mt-4 border-t border-fd-border/60 pt-3 text-xs text-fd-muted-foreground">
          需提供：{tier.requirement}
        </p>
      )}

      {tier.action}
    </div>
  );
}

/**
 * 资源需求清单：需求与提供者画在同一行，提供者是迷你标识 + 名字。
 */
function ResourceNeedsList() {
  const needs = getResourceNeeds();
  const openCount = needs.filter((need) => !need.provider).length;

  return (
    <div className="mt-4">
      <p className="text-xs font-medium text-fd-muted-foreground">
        当前需求
        {openCount > 0 && (
          <span className="ml-1.5 font-normal text-teal-700 dark:text-teal-300">
            · 还有 {openCount} 项待支持
          </span>
        )}
      </p>
      <ul className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {needs.map((need) => (
          <li key={need.name} className="flex gap-2 text-xs leading-relaxed">
            {need.provider ? (
              <Check className="mt-[2px] size-3.5 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
            ) : (
              <span className="mt-[6px] size-1.5 shrink-0 rounded-full bg-teal-500 dark:bg-teal-400" aria-hidden />
            )}
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-x-1.5">
                <span
                  className={cn(
                    'font-medium',
                    need.provider ? 'text-fd-muted-foreground' : 'text-fd-foreground',
                  )}
                >
                  {need.name}
                </span>
                <span className="text-teal-700 dark:text-teal-300">{need.qty}</span>
              </span>
              {need.desc && <span className="mt-0.5 block text-fd-muted-foreground">{need.desc}</span>}
              <NeedProvider need={need} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 需求项的提供者：迷你标识 + 名字，或「待支持」。 */
function NeedProvider({ need }: { need: ResolvedResourceNeed }) {
  if (need.providerEntry) {
    const partner = need.providerEntry;
    const inner = (
      <>
        <MiniVisual partner={partner} />
        <span className="text-xs font-medium text-fd-foreground">{partner.name}</span>
      </>
    );
    return partner.url ? (
      <a
        href={partner.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-flex items-center gap-1.5 rounded-full px-0.5 py-0.5 transition-colors hover:bg-fd-accent"
      >
        {inner}
      </a>
    ) : (
      <span className="mt-1 inline-flex items-center gap-1.5 px-0.5 py-0.5">{inner}</span>
    );
  }
  return (
    <span className="mt-1.5 inline-flex items-center rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-medium text-teal-700 dark:text-teal-300">
      待支持
    </span>
  );
}

/**
 * 权益对比表。列顺序「个人 / 资源 → 开源」是一条升级路径；
 * 分「基础权益 / 开源专属」两组，先确认基础平等再看差异。
 */
function BenefitTable() {
  const shared = BENEFITS.filter((benefit) => benefit.both);
  const exclusive = BENEFITS.filter((benefit) => !benefit.both);

  const rows = (items: Benefit[]) =>
    items.map((benefit) => (
      <tr key={benefit.label} className="border-t border-fd-border/40">
        <td className="px-4 py-2.5 text-xs leading-relaxed text-fd-foreground/80 sm:text-sm">
          {benefit.label}
        </td>
        <td className="px-2 py-2.5 text-center">
          {benefit.both ? (
            <Check className="mx-auto size-4 text-fd-muted-foreground" aria-label="有" />
          ) : (
            <Minus className="mx-auto size-3.5 text-fd-muted-foreground/40" aria-label="无" />
          )}
        </td>
        <td className="px-2 py-2.5 text-center">
          <Check className="mx-auto size-4 text-[var(--cn-brand)]" aria-label="有" />
        </td>
      </tr>
    ));

  const groupRow = (label: string) => (
    <tr className="border-t border-fd-border/60 bg-fd-muted/25">
      <td colSpan={3} className="px-4 py-2 text-xs font-medium tracking-wide text-fd-muted-foreground">
        {label}
      </td>
    </tr>
  );

  return (
    <div className="mt-8 overflow-hidden rounded-xl border border-fd-border">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-fd-muted/40 text-xs">
            <th className="px-4 py-2.5 font-medium text-fd-muted-foreground">权益</th>
            <th className="w-24 px-2 py-2 text-center font-normal leading-tight text-fd-muted-foreground sm:w-28">
              <span className="block">个人支持者</span>
              <span className="mt-0.5 block">资源合作伙伴</span>
            </th>
            <th className="w-28 px-2 py-2.5 text-center font-medium text-[var(--cn-brand)] sm:w-32">
              开源合作伙伴
            </th>
          </tr>
        </thead>
        <tbody>
          {groupRow('基础权益')}
          {rows(shared)}
          {groupRow('开源合作伙伴专属')}
          {rows(exclusive)}
        </tbody>
      </table>
    </div>
  );
}

/** 区块小标题：图标 + 名字。 */
function GroupHeading({
  icon,
  children,
  hint,
  className,
}: {
  icon: ReactNode;
  children: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {icon}
      <h3 className="text-sm font-semibold">{children}</h3>
      {hint && <span className="text-xs text-fd-muted-foreground">{hint}</span>}
    </div>
  );
}

export default function SponsorPage() {
  assertSponsorAssetsExist();

  const strategic = getActiveStrategic();
  const resourcePartners = getResourcePartners();
  const resourceGroups = groupResourceByNeed(resourcePartners);
  const supporters = getActiveSupporters();
  const pastSupporters = getPastSupporters();
  const tiers = buildTiers(Math.max(getStrategicSeats() - strategic.length, 0));

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Sponsorship"
        title="成为赞助者"
        description="ContiNew Admin 采用 Apache-2.0 协议，个人与企业均可免费商用。自 2022 年底发布至今持续迭代，投入了大量时间与热爱。邀请你赞助，也为你的产品提供面向开发者的展示机会。"
        actions={
          <>
            <a
              href={contactAnchor}
              className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-6 py-3 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
            >
              <Crown className="size-4" aria-hidden />
              聊聊合作
            </a>
            <Link
              href="/team"
              className="inline-flex items-center gap-2 rounded-lg border border-fd-border px-6 py-3 text-sm font-medium transition-colors hover:bg-fd-accent"
            >
              <Users className="size-4" aria-hidden />
              先看社区团队
            </Link>
          </>
        }
      />

      {/* 赞助款去向：信任状而非决策依据，默认折起。 */}
      <Section>
        <details className="rounded-xl border border-fd-border bg-fd-card px-5 py-4">
          <summary className="cursor-pointer text-sm font-medium text-fd-foreground">
            您的支持将用于
          </summary>
          <ul className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
            {SUPPORT_USES.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-fd-foreground/80">
                <Check className="mt-0.5 size-4 shrink-0 text-fd-primary" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </details>
      </Section>

      {/*
        借鉴 Vue 赞助页：列档位**之前**先讲「为什么要掏这个钱」。
        企业栏第一条最有力：他的产品跑在你的项目上，项目健康对他有直接好处——
        把赞助从「花钱买广告」变成「给自己买保险」。
      */}
      <Section title="赞助能带来什么" description="赞助是双向的：项目获得持续维护的资源，你也获得与之匹配的价值。">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-fd-border bg-fd-card p-5">
            <div className="flex items-center gap-2">
              <Handshake className="size-4 text-[var(--cn-brand)]" aria-hidden />
              <h3 className="text-sm font-semibold">如果你是团队或企业</h3>
            </div>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-fd-foreground/80">
              <li>
                <span className="font-medium text-fd-foreground">
                  你的产品跑在 ContiNew 之上——它保持活跃维护，对你是最直接的保障。
                </span>
                <span className="text-fd-muted-foreground">
                  {' '}
                  这不是慈善，是给你的技术底座买一份持续维护。
                </span>
              </li>
              <li>面向开发者的曝光：演示站月均 8 万+ 独立访客，平均停留 7 分钟以上。</li>
              <li>
                「愿意支持开源」的品牌认知——对做开发者产品的团队，这是很难买到的无形资产。
              </li>
              <li>
                直接触达：每月一次官方交流群群发 + 公众号推文——不是等人来看，是推到眼前。
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-fd-border bg-fd-card p-5">
            <div className="flex items-center gap-2">
              <Heart className="size-4 text-amber-600 dark:text-amber-400" aria-hidden />
              <h3 className="text-sm font-semibold">如果你是个人开发者</h3>
            </div>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-fd-foreground/80">
              <li>
                如果它确实帮你提升了效率，就当作偶尔请维护者喝杯咖啡——
                <Link href="/team" className="text-fd-primary hover:underline">
                  社区团队
                </Link>
                页有每位成员的赞赏码与爱发电主页。
              </li>
              <li>名字列入官网支持者名单，并加入 ContiNew 开源共鸣者交流群。</li>
              <li>
                <span className="font-medium text-fd-foreground">还有一个同样有价值的做法：把这一页转给你的雇主。</span>
                <span className="text-fd-muted-foreground">
                  {' '}
                  企业的持续赞助能让项目走得更稳，你能起的作用可能比想象中大。
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Section>

      <Section
        title="合作方式"
        description="赞助展示的转化效果受多种因素影响，我们无法保证具体的转化结果，但会如实提供曝光数据。"
      >
        {/* 现金两档并排，资源档独占一行。 */}
        <div className="grid gap-5 lg:grid-cols-2">
          {tiers
            .filter((tier) => tier.key !== 'infrastructure')
            .map((tier) => (
              <TierCard key={tier.key} tier={tier} />
            ))}
        </div>

        <div className="mt-5">
          {tiers
            .filter((tier) => tier.key === 'infrastructure')
            .map((tier) => (
              <TierCard key={tier.key} tier={tier} />
            ))}
        </div>

        <BenefitTable />

        {/* 内容规范是细则，折起来。 */}
        <details className="mt-8 rounded-xl border border-fd-border bg-fd-card p-5 text-sm leading-relaxed text-fd-muted-foreground">
          <summary className="cursor-pointer font-medium text-fd-foreground">
            内容规范与展示说明
          </summary>
          <p className="mt-2.5">
            建议推广与开发者相关的产品或服务（低代码平台、技术课程、开发工具、云服务、实体外设等）。
            拒绝推广违反法律法规、涉及灰色产业的产品，以及 IP 代理、上网工具等。
            为避免过度打扰：交流群群发与公众号推广各每月不超过一次，内容需提前确认。
          </p>
          <p className="mt-2">
            展示位由同期合作伙伴共享、等比平铺展示（不做轮播）。席位按季度沟通确认，到期可续约；若不再继续，我们会把位置留给新的合作伙伴。
          </p>
        </details>
      </Section>

      {/*
        当前支持者。按关系分组——开源合作 / 资源合作 / 个人支持——是三种关系不是三档高低。
      */}
      <Section title="当前支持者" description="感谢他们为 ContiNew 提供的支持。">
        <div className="flex flex-col gap-8">
          {strategic.length > 0 && (
            <div className="flex flex-col gap-3">
              <GroupHeading
                icon={
                  <span className="text-[var(--cn-brand)]">
                    <Crown className="size-4" aria-hidden />
                  </span>
                }
                hint="按月资金支持"
              >
                开源合作伙伴
              </GroupHeading>
              <div className={cn('grid gap-3', strategic.length > 1 && 'sm:grid-cols-2')}>
                {strategic.map((sponsor) => (
                  <CompanyCard key={sponsor.name} sponsor={sponsor} />
                ))}
              </div>
            </div>
          )}

          {/*
            资源合作伙伴：**当前与往期同处一个列表**，当前在用的排在前面、带起止时间。
            这一份是持续累积的贡献履历，不做「在支持 / 往期」拆分，也不做视觉降级。
          */}
          {resourcePartners.length > 0 && (
            <div className="flex flex-col gap-3">
              <GroupHeading
                icon={
                  <span className="text-teal-600 dark:text-teal-400">
                    <Server className="size-4" aria-hidden />
                  </span>
                }
                hint="服务器与云资源支持"
              >
                资源合作伙伴
              </GroupHeading>
              <div className="grid gap-3 sm:grid-cols-2">
                {resourceGroups.map((group) => (
                  <ResourceNeedCard key={group.need} group={group} />
                ))}
              </div>
              <p className="text-xs text-fd-muted-foreground">
                当前在用的排在前面。演示环境长期在线，靠这些资源一路支撑；想体验请看{' '}
                <Link href="/demo" className="font-medium text-[var(--cn-brand)] hover:underline">
                  在线演示说明
                </Link>
                ，请勿在其中存放重要数据。
              </p>
            </div>
          )}

          {/* 个人支持者：紧凑胶囊，始终显示该组（哪怕空名单）。 */}
          <div className="flex flex-col gap-3">
            <GroupHeading
              icon={
                <span className="text-amber-600 dark:text-amber-400">
                  <Heart className="size-4" aria-hidden />
                </span>
              }
            >
              个人支持者
            </GroupHeading>
            {supporters.length > 0 ? (
              <SupporterChips supporters={supporters} />
            ) : (
              <p className="text-sm text-fd-muted-foreground">
                还没有个人支持者。
                <a
                  href={afdianUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 font-medium text-[var(--cn-brand)] hover:underline"
                >
                  成为第一位，你的名字会出现在这里 →
                </a>
              </p>
            )}
          </div>

          {/*
            往期支持者：胶囊与在支持的完全同款，只整体收轻颜色，不灰度、不加角标。
          */}
          {pastSupporters.length > 0 && (
            <div className="flex flex-col gap-3">
              <GroupHeading
                icon={
                  <span className="text-amber-600/70 dark:text-amber-400/70">
                    <Heart className="size-4" aria-hidden />
                  </span>
                }
                hint="支持过一段时间"
                className="text-fd-muted-foreground [&_h3]:text-fd-muted-foreground"
              >
                往期支持者
              </GroupHeading>
              <SupporterChips supporters={pastSupporters} muted />
            </div>
          )}
        </div>
      </Section>

      <Section
        id="contact"
        title="如何支持"
        description="扫码即可与维护团队取得联系，沟通合作档位与展示细节。"
      >
        <div className="flex flex-col items-center gap-6 rounded-xl border border-fd-border p-6 sm:flex-row sm:items-center sm:gap-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/qrcode/gzh.webp"
            alt="ContiNew 公众号二维码"
            loading="lazy"
            className="size-40 shrink-0 rounded-lg border border-fd-border bg-white object-contain p-1"
          />
          <div className="min-w-0 text-center sm:text-left">
            <ol className="flex flex-col gap-2 text-sm text-fd-foreground/80">
              <li>1. 微信扫码，关注 ContiNew 公众号</li>
              <li>2. 在公众号后台留言，说明意向档位</li>
              <li>3. 维护团队会与你对接细节，确认展示素材</li>
              <li>4. 通过爱发电按月订阅（支持微信 / 支付宝），次月起每月自动续费</li>
            </ol>
            <p className="mt-3 text-xs leading-relaxed text-fd-muted-foreground">
              也可以到
              <Link href="/team" className="text-fd-primary hover:underline">
                社区团队
              </Link>
              页面，通过各位维护成员的赞赏码请一杯咖啡，或通过其爱发电主页按月支持。
            </p>
          </div>
        </div>
      </Section>

      <PageNextLinks
        links={[
          {
            href: '/users',
            title: '登记用户',
            description: '看看有哪些企业与团队正在生产环境使用 ContiNew。',
          },
          {
            href: '/timeline',
            title: '发展历程',
            description: '了解这笔赞助将支撑一段怎样的开源旅程。',
          },
        ]}
      />
    </PageContainer>
  );
}
