import Image from 'next/image';
import type { Metadata } from 'next';
import {
  Check,
  Handshake,
  Heart,
  Minus,
  Server,
  Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import {
  afdianUrl,
  getActiveStrategic,
  getCompanions,
  getCurrentResourcePartners,
  getResourceNeeds,
  getStrategicSeats,
  type ResolvedResourceNeed,
} from '@/lib/sponsors';
import { assertSponsorAssetsExist } from '@/lib/sponsors-assets';
import { CompanionDirectory } from '@/components/sponsor/companion-directory';
import { MiniVisual } from '@/components/sponsor/resource-card';
import { PageContainer, PageIntro, PageNextLinks, Section } from '@/components/site-primitives';
import { ActionLink } from '@/components/site-actions';
import { cn } from '@/lib/cn';

export const metadata: Metadata = {
  title: '支持 ContiNew',
  description: '认识那些让 ContiNew 持续迭代的支持者，或以资金、资源和长期合作支持开源项目。'
};

const contactAnchor = '#contact';

interface Benefit {
  label: string;
  /** 两类支持都有；缺省表示开源合作伙伴专属的当期权益。 */
  both?: boolean;
}

const BENEFITS: Benefit[] = [
  { label: '名字永久列入官网支持者名录', both: true },
  { label: '加入 ContiNew 开源支持者交流群', both: true },
  { label: '每月一次：通过全部官方交流群群发推广' },
  { label: '每月一次：公众号推文介绍或转发' },
  { label: '享有专属需求沟通与反馈通道' },
  { label: '演示站工作台首页轮播展示位' },
  { label: '文档站全部内容页的目录区展示位（Logo + 名称，常驻不轮播）' },
  { label: '官网支持页的 Logo + 一句话业务介绍' },
  { label: '项目 README 的 Sponsors 区展示 Logo' },
  { label: '版本发布公告与项目动态中的致谢署名' },
  { label: '每月一份站点访问数据摘要（PV / UV / 趋势）' },
];

interface Tier {
  key: 'strategic' | 'infrastructure' | 'supporter';
  name: string;
  icon: ReactNode;
  seats?: string;
  price: string;
  summary: string;
  requirement?: string;
  action: ReactNode;
}

function buildTiers(strategicRemaining: number): Tier[] {
  return [
    {
      key: 'supporter',
      name: '个人支持者',
      icon: <Heart className="size-5" aria-hidden />,
      seats: '名额不限',
      price: '¥20 / 月起',
      summary: '以个人身份支持持续维护。名字会进入永久支持者名录，也可以选择匿名。',
      action: (
        <ActionLink href={afdianUrl} className="mt-5 w-full">在爱发电支持</ActionLink>
      ),
    },
    {
      key: 'strategic',
      name: '开源合作伙伴',
      icon: <Handshake className="size-5" aria-hidden />,
      seats:
        strategicRemaining > 0
          ? `限量 ${getStrategicSeats()} 席 · 剩 ${strategicRemaining} 席`
          : `限量 ${getStrategicSeats()} 席 · 已满`,
      price: '¥500 / 月起 · 按月续费',
      summary: '以持续资金支持项目，也获得面向开发者的品牌展示与约定内的推广权益。',
      requirement:
        '品牌名称 + 官方链接 + 一句话业务介绍；广告图 680×320（2:1）+ 透明底 Logo PNG/SVG 高 ≥80px',
      action: (
        <ActionLink href={contactAnchor} variant="primary" className="mt-5 w-full">聊聊合作</ActionLink>
      ),
    },
    {
      key: 'infrastructure',
      name: '资源合作伙伴',
      icon: <Server className="size-5" aria-hidden />,
      price: '按项目当前需求提供资源',
      summary: '以服务器、云服务或 Token 额度等资源，支撑演示环境与日常开发。',
      action: (
        <ActionLink href={contactAnchor} className="mt-5 w-full">提供资源支持</ActionLink>
      ),
    },
  ];
}

const SUPPORT_USES = [
  '承担网站域名及服务器运营成本',
  '采购开发工具与 Token 服务',
  '投入更多精力进行项目开发',
  '提供更优质的技术支持',
  '持续优化代码质量与开发体验',
  '研发更多实用功能与模块',
];

const TIER_ACCENTS = {
  supporter: {
    icon: 'border-amber-300/70 bg-amber-500/10 text-amber-700 dark:border-amber-500/30 dark:text-amber-300',
    line: 'from-amber-400/70',
  },
  strategic: {
    icon: 'border-[var(--cn-brand-line)] bg-[var(--cn-brand-soft)] text-[var(--cn-brand)]',
    line: 'from-[var(--cn-brand)]/70',
  },
  infrastructure: {
    icon: 'border-teal-400/50 bg-teal-500/10 text-teal-700 dark:border-teal-500/30 dark:text-teal-300',
    line: 'from-teal-400/70',
  },
} as const;

function TierCard({ tier, className }: Readonly<{ tier: Tier; className?: string }>) {
  const accent = TIER_ACCENTS[tier.key];
  return (
    <div
      className={cn(
        'relative flex flex-col overflow-hidden rounded-2xl border border-fd-border bg-fd-card p-6',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute inset-x-0 top-0 h-px bg-gradient-to-r to-transparent',
          accent.line,
        )}
      />
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              'flex size-10 items-center justify-center rounded-xl border',
              accent.icon,
            )}
          >
            {tier.icon}
          </span>
          <h3 className="font-semibold">{tier.name}</h3>
        </div>
        {tier.seats && (
          <span className="shrink-0 rounded-full border border-fd-border bg-fd-muted px-2.5 py-0.5 text-xs text-fd-muted-foreground">
            {tier.seats}
          </span>
        )}
      </div>

      <p className="mt-4 text-sm font-medium text-fd-foreground">{tier.price}</p>
      <p className="mt-2.5 text-sm leading-relaxed text-fd-muted-foreground">{tier.summary}</p>
      {tier.key === 'infrastructure' && <ResourceNeedsList />}
      <div className="flex-1" />
      {tier.requirement && (
        <p className="mt-4 border-t border-fd-border/60 pt-3 text-sm leading-6 text-fd-muted-foreground">
          需提供：{tier.requirement}
        </p>
      )}
      {tier.action}
    </div>
  );
}

function ResourceNeedsList() {
  const needs = getResourceNeeds();
  const openCount = needs.filter((need) => !need.provider).length;

  return (
    <div className="mt-5 border-t border-fd-border/60 pt-4">
      <p className="text-xs font-medium text-fd-muted-foreground">
        当前需求
        {openCount > 0 && (
          <span className="ml-1.5 font-normal text-teal-700 dark:text-teal-300">
            · 还有 {openCount} 项待支持
          </span>
        )}
      </p>
      <ul className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
        {needs.map((need) => (
          <li key={need.name} className="flex gap-2 text-sm leading-6">
            {need.provider ? (
              <Check className="mt-[2px] size-3.5 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
            ) : (
              <span className="mt-[6px] size-1.5 shrink-0 rounded-full bg-teal-500" aria-hidden />
            )}
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-x-1.5">
                <span className="font-medium text-fd-foreground">{need.name}</span>
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

function NeedProvider({ need }: Readonly<{ need: ResolvedResourceNeed }>) {
  if (need.providerEntry) {
    const partner = need.providerEntry;
    const inner = (
      <>
        <MiniVisual partner={partner} />
        <span className="text-xs font-medium text-fd-foreground">{partner.name}</span>
      </>
    );
    return partner.url ? (
      <ActionLink href={partner.url} variant="text" className="mt-1">{inner}</ActionLink>
    ) : (
      <span className="mt-1 inline-flex items-center gap-1.5 px-0.5 py-0.5">{inner}</span>
    );
  }
  return (
    <span className="mt-1.5 inline-flex items-center rounded-full bg-teal-500/10 px-2 py-0.5 text-xs font-medium text-teal-700 dark:text-teal-300">
      待支持
    </span>
  );
}

function BenefitTable() {
  const shared = BENEFITS.filter((benefit) => benefit.both);
  const exclusive = BENEFITS.filter((benefit) => !benefit.both);

  const rows = (items: Benefit[]) =>
    items.map((benefit) => (
      <tr key={benefit.label} className="border-t border-fd-border/40">
        <td className="px-4 py-2.5 text-sm leading-6 text-fd-foreground/80">
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

  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-fd-border">
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
          <tr className="border-t border-fd-border/60 bg-fd-muted/25">
            <td colSpan={3} className="px-4 py-2 text-xs font-medium text-fd-muted-foreground">
              永久身份
            </td>
          </tr>
          {rows(shared)}
          <tr className="border-t border-fd-border/60 bg-fd-muted/25">
            <td colSpan={3} className="px-4 py-2 text-xs font-medium text-fd-muted-foreground">
              合作期间权益
            </td>
          </tr>
          {rows(exclusive)}
        </tbody>
      </table>
    </div>
  );
}

export default function SponsorPage() {
  assertSponsorAssetsExist();

  const companions = getCompanions();
  const strategic = getActiveStrategic();
  const currentResources = getCurrentResourcePartners();
  const tiers = buildTiers(Math.max(getStrategicSeats() - strategic.length, 0));
  const currentServer = currentResources.find((item) => item.need === '云服务器');
  const currentToken = currentResources.find((item) => item.need === 'Token Plan 或额度');
  const activeCount = companions.filter((companion) => companion.active).length;

  const activeSignals = [
    {
      icon: <Server className="size-4" aria-hidden />,
      label: '在线演示',
      value: currentServer ? `${currentServer.name} 提供云服务器` : '等待资源伙伴加入',
    },
    {
      icon: <Handshake className="size-4" aria-hidden />,
      label: '开发提效',
      value: currentToken
        ? `${currentToken.name} 提供 ${currentToken.detail ?? currentToken.need}`
        : '等待资源伙伴加入',
    },
    {
      icon: <Users className="size-4" aria-hidden />,
      label: '当前支持',
      value: `${activeCount} 位伙伴正在持续支持`,
    },
  ];

  return (
    <PageContainer>
      <header className="relative overflow-hidden border-b border-fd-border/70 pb-12 sm:pb-16">
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 w-3/5 bg-[radial-gradient(circle_at_72%_70%,color-mix(in_oklab,#12d2ac_9%,transparent),transparent_48%)]"
        />
        <svg
          aria-hidden
          viewBox="0 0 720 280"
          preserveAspectRatio="none"
          className="pointer-events-none absolute -right-28 bottom-0 h-64 w-[45rem] opacity-25 dark:opacity-20"
        >
          <path
            d="M-20 245 C 120 245, 112 75, 250 75 S 390 225, 515 150 S 635 38, 760 38"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[var(--cn-brand)]"
          />
          <path
            d="M-30 270 C 105 270, 145 145, 270 145 S 410 255, 535 190 S 650 92, 770 92"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[#12d2ac]"
          />
        </svg>

        <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <PageIntro
            className="cn-stagger"
            eyebrow={
              <span className="flex items-center gap-3">
                <Image src="/logo.svg" alt="" width={28} height={28} aria-hidden />
                ContiNew 支持者
              </span>
            }
            title={<>让持续迭代，<br />继续发生</>}
            description="有人贡献代码，有人提供服务器，有人按月支持。方式不同，但都让 ContiNew 走得更远。每一份公开支持，都会留在支持者名录中。"
            actions={
              <>
                <ActionLink href="#companions" variant="primary">查看支持者</ActionLink>
                <ActionLink href="#join">我也要支持</ActionLink>
              </>
            }
          >
            <p className="mt-7 text-sm leading-6 text-fd-muted-foreground">
              支持方式不同，感谢没有高低。
            </p>
          </PageIntro>

          <div className="relative rounded-2xl border border-fd-border/80 bg-fd-background/80 p-5 shadow-sm backdrop-blur sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">支持正在发生</p>
                <p className="mt-1 text-xs text-fd-muted-foreground">不是一面静止的 Logo 墙</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-2.5 py-1 text-xs font-medium text-teal-700 dark:text-teal-300">
                <span className="size-1.5 rounded-full bg-teal-500" aria-hidden />
                {/* 容器是 flex + gap，空白节点不参与布局；写上只为消除 JSX 空白歧义（S6772） */}
                {' '}
                持续中
              </span>
            </div>
            <div className="relative mt-6 space-y-5">
              <span
                aria-hidden
                className="absolute bottom-4 left-[17px] top-4 w-px bg-gradient-to-b from-[var(--cn-brand)] via-[#12d2ac] to-fd-border"
              />
              {activeSignals.map((signal) => (
                <div key={signal.label} className="relative flex items-center gap-3.5">
                  <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border border-fd-border bg-fd-background text-[var(--cn-brand)]">
                    {signal.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-fd-muted-foreground">{signal.label}</span>
                    <span className="mt-0.5 block truncate text-sm font-medium text-fd-foreground">
                      {signal.value}
                    </span>
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-fd-border/70 pt-4 text-xs leading-relaxed text-fd-muted-foreground">
              权益会随合作周期调整，支持者身份与支持记录会写进 ContiNew 年轮。
            </div>
          </div>
        </div>
      </header>

      <Section
        id="companions"
        className="scroll-mt-24"
        title="支持者名录"
        description="记录每一位曾为 ContiNew 提供支持的伙伴。"
        action={
          <span className="rounded-full border border-fd-border bg-fd-card px-3 py-1 text-xs text-fd-muted-foreground">
            永久名录 · {companions.length} 位
          </span>
        }
      >
        <CompanionDirectory companions={companions} />
      </Section>

      <Section
        id="join"
        className="scroll-mt-24"
        title="选择你的支持方式"
        description="无论选择哪一种，公开身份都会进入支持者名录。"
      >
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

        <div className="mt-10">
          <h3 className="text-base font-semibold">身份与当期权益</h3>
          <p className="mt-1.5 text-sm text-fd-muted-foreground">
            永久身份用于表达感谢；展示与推广权益按合作周期交付，两者分开记录。
          </p>
          <BenefitTable />
        </div>

        <div className="mt-6 grid items-start gap-3 sm:grid-cols-2">
          <details className="rounded-xl border border-fd-border bg-fd-card p-5 text-sm leading-relaxed text-fd-muted-foreground">
            <summary className="cursor-pointer font-medium text-fd-foreground">每一份支持如何被使用</summary>
            <ul className="mt-3 flex flex-col gap-2">
              {SUPPORT_USES.map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-[var(--cn-brand)]" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </details>
          <details className="rounded-xl border border-fd-border bg-fd-card p-5 text-sm leading-relaxed text-fd-muted-foreground">
            <summary className="cursor-pointer font-medium text-fd-foreground">合作边界与内容规范</summary>
            <p className="mt-3">
              支持会带来感谢、身份与约定内的展示权益，但不购买技术决策权、社区治理权或官方产品背书。合作相关需求享有专属沟通通道，是否进入路线图仍按社区价值、维护成本与项目规划评估。
            </p>
            <p className="mt-2">
              推广内容应与开发者相关，并需提前确认。拒绝违法违规、灰色产业、IP 代理及上网工具等内容。
            </p>
          </details>
        </div>
      </Section>

      <Section
        id="contact"
        className="scroll-mt-24"
        title="开始支持"
        description="个人支持可以直接订阅；资源支持与企业合作先和维护团队确认需求与展示细节。"
      >
        <div className="grid overflow-hidden rounded-2xl border border-fd-border bg-fd-card md:grid-cols-[0.85fr_1.15fr]">
          <div className="flex flex-col justify-center border-b border-amber-400/25 bg-amber-500/[0.06] p-6 md:border-r md:border-b-0 sm:p-8">
            <Heart className="size-5 text-amber-600 dark:text-amber-400" aria-hidden />
            <h3 className="mt-4 font-semibold">以个人身份支持</h3>
            <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground">
              无需提前沟通，在爱发电选择月度支持即可。需要公开展示时，我们会确认你的名称、头像与主页链接。
            </p>
            <ActionLink href={afdianUrl} variant="primary" className="mt-5 w-fit">前往爱发电</ActionLink>
          </div>
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/qrcode/gzh.webp"
              alt="ContiNew 公众号二维码"
              loading="lazy"
              className="size-36 shrink-0 rounded-xl border border-fd-border bg-white object-contain p-1"
            />
            <div>
              <div className="flex items-center gap-2">
                <Server className="size-4 text-teal-600 dark:text-teal-400" aria-hidden />
                <h3 className="font-semibold">资源支持或企业合作</h3>
              </div>
              <ol className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-fd-foreground/80">
                <li>1. 微信扫码，关注 ContiNew 公众号</li>
                <li>2. 在公众号后台留言，说明希望提供的支持</li>
                <li>3. 维护团队与你确认资源、素材与合作边界</li>
                <li>4. 支持生效后进入支持者名录，并交付约定权益</li>
              </ol>
            </div>
          </div>
        </div>
      </Section>

      <PageNextLinks
        links={[
          {
            href: '/team',
            title: '社区团队',
            description: '认识负责维护 ContiNew 的社区成员与贡献者。',
          },
          {
            href: '/timeline',
            title: '发展历程',
            description: '看看每一份支持正在陪伴一段怎样的开源旅程。',
          },
        ]}
      />
    </PageContainer>
  );
}
