import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowRight,
  Award,
  Check,
  Coffee,
  Crown,
  Gem,
  Heart,
  Medal,
  Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { getSponsors, sponsorImageUrl, type Sponsor } from '@/lib/sponsors';
import { cardHover, PageContainer, PageHeader, PageNextLinks, Section } from '@/components/site-primitives';
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
 */
const contactAnchor = '#contact';

/**
 * 档位配色。
 *
 * 铂金/金牌/银牌是一组贵金属名，视觉上就得有「材质」区分，否则名字是白叫的：
 * 图标块用同色系渐变填充模拟抛光金属的高光。
 *
 * 上一版把铂金做成 slate 纯灰、银牌做成 zinc 灰 —— 两个贵金属档都是无彩色，
 * 全组里只有金牌的 amber 带得上材质联想，于是就它一个显得「洋气」。
 * 这版三个金属档统一走渐变：铂金取真实铂金的冷调白（#E5E4E2，带蓝的银白）、
 * 金牌琥珀金、银牌亮银，靠明度与光泽拉开，不新增色相（全站仍只有 amber 一个）。
 *
 * 独家不在金属序列里，不跟它们比颜色：主色在别处都是描边或文字，
 * 这里是全站唯一一次大面积实心使用 —— 靠「用量」而不是「色相」坐稳最高档。
 *
 * 曾经在卡片顶部还压了一条渐变色条（模拟金属高光），已移除：中间那截接近白的
 * 高光在浅色卡片上会和背景糊在一起，看着像「边框粗细不均」。档位辨识靠图标块足够。
 */
interface TierTone {
  /** 图标块：金属渐变底 + 深色图标 */
  icon: string;
  check: string;
}

const TONES: Record<'special' | 'platinum' | 'gold' | 'silver', TierTone> = {
  special: {
    icon: 'border-fd-primary bg-fd-primary text-fd-primary-foreground',
    check: 'text-fd-primary',
  },
  platinum: {
    icon: 'border-slate-300 bg-linear-to-br from-slate-50 to-slate-300 text-slate-700 dark:border-slate-600 dark:from-slate-700 dark:to-slate-900 dark:text-slate-200',
    check: 'text-slate-500 dark:text-slate-400',
  },
  gold: {
    icon: 'border-amber-300 bg-linear-to-br from-amber-100 to-amber-300 text-amber-800 dark:border-amber-500/40 dark:from-amber-500/25 dark:to-amber-700/25 dark:text-amber-300',
    check: 'text-amber-600 dark:text-amber-400',
  },
  silver: {
    icon: 'border-zinc-300 bg-linear-to-br from-zinc-100 to-zinc-300 text-zinc-700 dark:border-zinc-600 dark:from-zinc-700 dark:to-zinc-900 dark:text-zinc-200',
    check: 'text-zinc-500 dark:text-zinc-400',
  },
};

interface Tier {
  key: 'special' | 'platinum' | 'gold' | 'silver';
  name: string;
  icon: ReactNode;
  /** 席位说明：独家制造稀缺感，其余明示开放，避免让读者以为「都满了」。 */
  seats: string;
  /** 最高档用主色强调；其余保持中性，主色留给独家档与 CTA。 */
  highlight?: boolean;
  benefits: string[];
  requirement: string;
}

const tiers: Tier[] = [
  {
    key: 'special',
    name: '独家赞助者',
    icon: <Crown className="size-5" aria-hidden />,
    seats: '仅 1 席',
    highlight: true,
    benefits: [
      '官网首屏独家 Logo 展示位',
      '演示站首屏第一轮播位置',
      '官网所有内容页侧边栏顶部专属展示位',
      '主要产品独家发布：全部交流群群发 + 公众号转发（每月一次）',
    ],
    requirement: '品牌名称 + 官方链接 + Logo/图片素材（建议 SVG，340×160）+ 简短广告语',
  },
  {
    key: 'platinum',
    name: '铂金赞助者',
    icon: <Gem className="size-5" aria-hidden />,
    seats: '席位开放',
    benefits: [
      '官网首页显著位置 Logo 展示位',
      '演示站首页显著位置 Logo 展示位',
      '官网所有内容页侧边栏顶部显著展示位（超 2 位随机轮播）',
      '主要产品推广：全部交流群群发（每月一次）',
    ],
    requirement: '品牌名称 + 官方链接 + Logo/图片素材（建议 SVG，340×160）',
  },
  {
    key: 'gold',
    name: '金牌赞助者',
    icon: <Medal className="size-5" aria-hidden />,
    seats: '席位开放',
    benefits: [
      '官网首页大号 Logo 展示位',
      '官网所有内容页右侧大号 Logo 展示位',
      '主要产品推广：最新三个交流群群发（每月一次）',
    ],
    requirement: '品牌名称 + 官方链接 + Logo/图片素材（建议 SVG，220×70）',
  },
  {
    key: 'silver',
    name: '银牌赞助者',
    icon: <Award className="size-5" aria-hidden />,
    seats: '席位开放',
    benefits: ['官网所有内容页右侧小号 Logo 展示位'],
    requirement: '品牌名称 + 官方链接 + Logo/图片素材（建议 SVG，110×60）',
  },
];

/** 赞助款去向。写清楚钱花在哪，比反复强调「请支持我们」更有说服力。 */
const SUPPORT_USES = [
  '承担网站域名及服务器运营成本',
  '采购开发工具与服务',
  '提供更优质的技术支持',
  '投入更多精力进行项目开发',
  '持续优化代码质量，开箱即用，持续提供舒适的开发体验',
  '研发更多实用功能与模块',
];

function TierCard({
  tier,
  wide,
  className,
}: {
  tier: Tier;
  wide?: boolean;
  className?: string;
}) {
  const tone = TONES[tier.key];
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
          <span
            className={cn(
              'flex size-9 items-center justify-center rounded-lg border',
              tone.icon,
            )}
          >
            {tier.icon}
          </span>
          <h3 className={cn('font-semibold', tier.highlight && 'text-fd-primary')}>{tier.name}</h3>
        </div>
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
      </div>

      {/*
        权益文字从 text-fd-muted-foreground(45.1%) 提到 text-fd-foreground/80：
        原文全页灰字小号，读者只能看到档位名、读不出权益差异。
        flex-1 让权益区吃掉剩余高度，配合 grid 的 stretch 实现三档等高。
      */}
      <ul
        className={cn(
          'mt-4 flex-1 gap-x-6 gap-y-2 text-sm text-fd-foreground/80',
          wide ? 'grid sm:grid-cols-2' : 'flex flex-col',
        )}
      >
        {tier.benefits.map((benefit) => (
          <li key={benefit} className="flex gap-2">
            <Check className={cn('mt-0.5 size-4 shrink-0', tone.check)} aria-hidden />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 border-t border-fd-border/60 pt-3 text-xs text-fd-muted-foreground">
        需提供：{tier.requirement}
      </p>
    </div>
  );
}

/**
 * 赞助商广告语是带内联样式的 HTML 片段，这里只取纯文本——既避免把他们的配色带进页面，
 * 也避免为此引入 dangerouslySetInnerHTML（JSON 是外部可提 PR 改的，注入风险不值得冒）。
 * `<br/>` 先换成空格再strip，否则两句话会粘成一坨（"服务器！另有"）。
 */
function stripTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function SponsorCard({ sponsor, large }: { sponsor: Sponsor; large?: boolean }) {
  const description = sponsor.description ? stripTags(sponsor.description) : '';
  return (
    <a
      href={sponsor.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group flex flex-col items-center gap-3 rounded-xl border border-fd-border p-6',
        cardHover,
        // 独家档用横向大卡：它买的就是「展示位」，64px 的图标撑不起这个分量
        large && 'sm:flex-row sm:items-center sm:gap-6 sm:text-left',
        !large && 'text-center',
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={sponsorImageUrl(sponsor.img)}
        alt={sponsor.name}
        loading="lazy"
        className={cn(
          'w-auto max-w-full rounded-lg object-contain',
          large ? 'h-24 sm:h-28' : 'h-16',
        )}
      />
      <div className="min-w-0">
        <span className="text-sm font-medium group-hover:text-fd-primary">
          {sponsor.name}
        </span>
        {description && (
          <span
            className={cn(
              'mt-1 block leading-relaxed text-fd-muted-foreground',
              large ? 'text-sm' : 'text-xs',
            )}
          >
            {description}
          </span>
        )}
      </div>
    </a>
  );
}

export default function SponsorPage() {
  // 只展示真正有赞助者的档位，空档位聚合为一张邀请卡 —— 原先 4 档里 3 档各挂一个
  // 「虚位以待」，等于把「还没人赞助」这件事重复展示三遍。
  const activeTiers = tiers.filter((tier) => getSponsors(tier.key).length > 0);
  const openTiers = tiers.filter((tier) => getSponsors(tier.key).length === 0);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Sponsorship"
        title="成为赞助者"
        description="感谢您考虑支持 ContiNew 系列开源项目！ContiNew Admin 采用 Apache-2.0 开源许可协议，允许个人、企业免费用于商业用途。自 2022 年底首个项目发布以来，我们始终致力于持续迭代与优化，为此投入了大量的时间与无限的热爱。为了项目的长远发展，我们诚邀您的赞助，同时也为您的产品或品牌提供通过 ContiNew 展示的机会。"
        actions={
          <>
            <a
              href={contactAnchor}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-6 py-3 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
            >
              <Heart className="size-4" aria-hidden />
              联系洽谈赞助
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

      {/*
        赞助款去向单列一块：原文是紧跟在开场白后面的一整段，挤在页面头里会糊成一坨，
        拆成两列清单后读者能扫读。
      */}
      <Section title="您的支持将用于">
        <ul className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
          {SUPPORT_USES.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-fd-foreground/80">
              <Check className="mt-0.5 size-4 shrink-0 text-fd-primary" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="赞助等级与权益"
        description="赞助展示的转化效果受多种因素影响，我们无法保证具体的转化结果。"
      >
        {/*
          独家档整行独占、其余三档并排 —— 主次靠版面权重拉开，而不是靠颜色堆。
          卡片直接作为 grid 子项（此前多包了一层 div，导致 stretch 失效、三档高低不齐）。
        */}
        <div className="grid gap-5 lg:grid-cols-3">
          {tiers.map((tier) => (
            <TierCard
              key={tier.key}
              tier={tier}
              wide={tier.highlight}
              className={cn(tier.highlight && 'lg:col-span-3')}
            />
          ))}
        </div>

        {/*
          内容规范原本是 bg-fd-muted/50 + text-xs：浅色下 muted(96.1%) 与背景(96%) 同色，
          底色完全看不见，只剩一团 12px 灰字。改加边框并升到 text-sm。
        */}
        <div className="mt-6 rounded-xl border border-fd-border bg-fd-card p-5 text-sm leading-relaxed text-fd-muted-foreground">
          <p className="font-medium text-fd-foreground">内容规范</p>
          <p className="mt-1.5">
            建议推广与开发者相关的产品或服务（低代码平台、技术课程、开发工具、云服务、实体外设等）。
            拒绝推广违反法律法规、涉及灰色产业的产品，以及 IP 代理、上网工具等。
            为避免过度打扰，单日内交流群推广不超过两次。
          </p>
        </div>
      </Section>

      <Section title="当前赞助者" description="感谢他们为 ContiNew 提供的支持。">
        <div className="flex flex-col gap-8">
          {activeTiers.map((tier) => (
            <div key={tier.key} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={cn(tier.highlight ? 'text-fd-primary' : 'text-fd-muted-foreground')}
                >
                  {tier.icon}
                </span>
                <h3 className="text-sm font-semibold">{tier.name}</h3>
              </div>
              {/*
                只有一位赞助者时不再分两列——否则卡片占半宽、右半边空着，显得单薄。
              */}
              <div
                className={cn(
                  'grid gap-4',
                  getSponsors(tier.key).length > 1 && 'sm:grid-cols-2',
                )}
              >
                {getSponsors(tier.key).map((sponsor) => (
                  <SponsorCard key={sponsor.name} sponsor={sponsor} large={tier.highlight} />
                ))}
              </div>
            </div>
          ))}

          {openTiers.length > 0 && (
            <div className="rounded-xl border border-dashed border-fd-border p-6 text-center">
              <p className="text-sm font-medium">
                {openTiers.map((tier) => tier.name).join(' / ')} 席位开放中
              </p>
              <p className="mt-1.5 text-sm text-fd-muted-foreground">
                成为第一批支持者，让你的品牌出现在官网与演示站的显著位置。
              </p>
              <a
                href={contactAnchor}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-fd-primary hover:underline"
              >
                联系洽谈 <ArrowRight className="size-3.5" aria-hidden />
              </a>
            </div>
          )}
        </div>
      </Section>

      <Section
        id="contact"
        title="如何洽谈"
        description="扫码即可与维护团队取得联系，沟通赞助档位与展示细节。"
      >
        <div className="flex flex-col items-center gap-6 rounded-xl border border-fd-border p-6 sm:flex-row sm:items-center sm:gap-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/sponsor/qrcode_gzh.webp"
            alt="ContiNew 公众号二维码"
            loading="lazy"
            className="size-40 shrink-0 rounded-lg border border-fd-border bg-white object-contain p-1"
          />
          <div className="min-w-0 text-center sm:text-left">
            <ol className="flex flex-col gap-2 text-sm text-fd-foreground/80">
              <li>1. 微信扫码，关注 ContiNew 公众号</li>
              <li>2. 在公众号后台留言，说明意向档位</li>
              <li>3. 维护团队会与你对接细节，并邀请加入交流群</li>
            </ol>
            <p className="mt-3 text-xs leading-relaxed text-fd-muted-foreground">
              也可以到
              <Link href="/team" className="text-fd-primary hover:underline">
                社区团队
              </Link>
              页面，通过成员赞赏码直接支持。
            </p>
          </div>
        </div>
      </Section>

      <Section title="其他支持方式">
        <div className="flex items-start gap-3 rounded-xl border border-fd-border p-5">
          <Coffee className="mt-0.5 size-5 shrink-0 text-fd-primary" aria-hidden />
          <p className="text-sm leading-relaxed text-fd-muted-foreground">
            也可以到
            <Link href="/team" className="text-fd-primary hover:underline">
              社区团队
            </Link>
            页面，通过各位维护成员的赞赏码点上一杯咖啡，感谢他们的业余付出。
          </p>
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
