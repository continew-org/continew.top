import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowRight,
  Check,
  Crown,
  Handshake,
  Heart,
  Minus,
  Server,
  Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import {
  afdianUrl,
  getSponsors,
  getStrategicSeats,
  sponsorImageUrl,
  type Sponsor,
  type Supporter,
} from '@/lib/sponsors';
import { assertSponsorAssetsExist } from '@/lib/sponsors-assets';
import {
  cardHover,
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

/** 档位配色。战略档用品牌色，个人档用琥珀（"请喝杯咖啡"的联想）。 */
interface TierTone {
  icon: string;
  check: string;
}

const TONES = {
  strategic: {
    icon: 'border-[var(--cn-brand-line)] bg-[var(--cn-brand-soft)] text-[var(--cn-brand)]',
    check: 'text-[var(--cn-brand)]',
  },
  supporter: {
    icon: 'border-amber-300 bg-linear-to-br from-amber-100 to-amber-300 text-amber-800 dark:border-amber-500/40 dark:from-amber-500/25 dark:to-amber-700/25 dark:text-amber-300',
    check: 'text-amber-600 dark:text-amber-400',
  },
  infrastructure: {
    icon: 'border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-500/40 dark:bg-teal-500/15 dark:text-teal-300',
    check: 'text-teal-600 dark:text-teal-400',
  },
} satisfies Record<string, TierTone>;

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
 * 【为什么改成按「权益」组织，而不是让两档各列一串】
 * 之前两档各自列权益，问题正是你说的：有些其实是同一件事，只是措辞不同
 * （「群内与维护团队直接交流」vs「进入维护者交流群」），
 * 并排看反而让人觉得"这俩差不多"，于是高价档显得没道理。
 *
 * 改成一张表之后，同一件事只写一行，谁有谁没有在同一把尺子下比：
 * 重复被合并掉，差异被整体放大——¥500 贵在哪，一眼就能数出来。
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
   * 群发是整张表里最值钱的一条，放在专属组最前面。
   *
   * 展示位是「等人来看」，群发是「推到眼前」——开发者在群里是活的，
   * 一条群发的触达效率远高于侧栏里一块不声不响的 Logo。
   * 旧站四档就是围绕它分层的（独家→全部群+公众号、铂金→全部群、金牌→最新三个群），
   * 我之前只看了旧站导航没看赞助页，把这一条整个漏了。
   *
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
  /** 价格文案。战略档不标价——金额是谈出来的，写死只会把自己锚在低处。 */
  price: string;
  /**
   * 一句话定位：这档适合谁。
   *
   * 权益细节全部交给下方的对比表，卡片只负责「这是给谁的 + 多少钱 + 怎么开始」。
   * 卡片又列权益、下面又有表，同一件事读两遍，谁都不会认真看第二遍。
   */
  summary: string;
  highlight?: boolean;
  /**
   * 需要对方提供的素材。**可选**——个人支持者不要求任何东西，
   * 在爱发电订阅完就结束了，多一道登记就多一道流失。
   */
  requirement?: string;
  /**
   * 资源合作伙伴的「当前需求」清单：列出项目实际需要的基础设施，
   * 让有意支持的团队对得上号、知道还能支持什么。仅资源档使用。
   *
   * status：该项是否已被支持。不标的话读者看不出哪条还缺，想支持还得来问一句。
   * by：提供方名称，与 data/sponsors.json 的 infrastructure 条目对应。
   */
  needs?: {
    name: string;
    qty: string;
    desc?: string;
    status?: 'provided' | 'open';
    by?: string;
  }[];
  /**
   * 该档的下一步动作。
   *
   * 两档必须各有一个，因为它们的转化路径完全不同：个人支持点一下就能订阅完，
   * 战略合作要先聊。之前页面只在顶部放了一个笼统的「联系洽谈」，
   * 个人支持者点进去发现要加微信、要等回复——那一步就流失了。
   */
  action: ReactNode;
}

/**
 * 档位文案在组件里构建，因为「剩余席位」依赖运行时读到的赞助商数据。
 *
 * 席位总数来自 data/sponsors.json 的 config.strategicSeats（不再在代码里写死），
 * 「剩余 N 席」= 席位数 − 当前已展示的赞助商数量，不手填——手填的后果是页面写着
 * 「剩 2 席」而实际已经排满，这种错对潜在赞助商的杀伤力比不写还大。
 */
function buildTiers(strategicRemaining: number): Tier[] {
  return [
    {
      key: 'strategic',
      /*
       * 展示名从「战略合作伙伴」改为「开源合作伙伴」。
       *
       * 【为什么不要「战略」】
       * ¥500/月 的量级撑不起「战略」两个字——名头比实质大，谈的时候自己先虚，
       * 对方也会拿「战略」来要求战略级的回报（联合发布、定制开发、专人对接）。
       *
       * 【为什么不用「社区共建者」】
       * 社区里已经有「贡献者」（提交代码的）和「社区共鸣者」（团队成员）两个名分。
       * 付费展示位再叫「共建者」，等于把「付钱」和「出力」混为一谈——
       * 真正写代码的贡献者会有意见：我提了 PR 不算共建，他付了钱倒是共建？
       *
       * 「开源合作伙伴」说的是关系性质（一起做开源），既准确又不夸大。
       */
      name: '开源合作伙伴',
      /*
       * 与导航栏「赞助」入口用同一个皇冠图标（见 nav-sponsor-link.tsx）：
       * 读者在导航看到一个符号点进来，落地页最高档是同一个符号，视觉上接得上。
       * 皇冠在这里标示的是「限量 3 席的最高级档」，不是「尊贵」——
       * 所以档位名可以放轻，图标仍保留辨识度，两者不冲突。
       */
      icon: <Crown className="size-5" aria-hidden />,
      seats:
        strategicRemaining > 0
          ? `限量 ${getStrategicSeats()} 席 · 剩 ${strategicRemaining} 席`
          : `限量 ${getStrategicSeats()} 席 · 已满`,
      /*
       * 起价 ¥500/月，写死而不是「金额面议」。
       *
       * 【为什么必须标价】
       * 「面议」看起来灵活，实际是把定价权交给了对方的第一句话。历史上这里一直是
       * 100 元档，正是因为每次都要从头谈，而谈的时候手里没有任何数字做支撑，
       * 就只能报一个自己觉得"不好意思拒绝"的低价。
       *
       * 【为什么是 500】
       * 演示站近 30 天 PV 36.9 万、UV 8.3 万；官网同期 PV 3,114。演示站流量是
       * 官网的 118 倍——此前只卖官网展示位，折算曝光价值约 125 元/月，
       * 所以「独家 300 没人接」不是你定的价高了，是当时交付的东西就值那么多。
       * 把主力展示位挪到演示站后，单席折算曝光量约 12 万次/月，
       * 按开发者社区保守 CPM ¥4 计算 ≈ ¥480，取整到 500。
       * 这是一个**能拿出计算过程**的价，谈的时候有据可依，不会被一句"太贵了"打回去。
       *
       * 这不是优惠价，也不是最终价，是**锚**。真实成交可以往上谈。
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
      /*
       * 素材分两种，用途不同，不能混。
       *
       * 1) 广告图 680×320（2:1）——带推广文案的横幅。用在**允许推销**的位置：
       *    演示站工作台轮播、官网赞助页。原图给 2 倍是因为这三处尺寸各不相同
       *    （演示站约 400px 宽、赞助页约 180px、侧栏约 100px），缩下来才不糊。
       *
       * 2) Logo，透明底 PNG/SVG，高 ≥80px——纯品牌标识。用在**读者专注阅读**的位置：
       *    文档侧栏。那里放"低至 29.9/月"的促销横幅，既打断阅读也不是赞助商想要的
       *    效果；缩到小尺寸又只剩一团色块。Logo 是唯一在小尺寸下还成立的形式。
       *
       * 要两份素材确实多一道门槛，但这两处场景的诉求本来就相反，
       * 用同一张图硬凑，结果就是两边都不好看。
       */
      requirement:
        '品牌名称 + 官方链接 + 一句话业务介绍；素材两种：广告图 680×320（2:1，用于演示站与赞助页）+ Logo 透明底 PNG/SVG 高 ≥80px（用于文档侧栏）',
    },
    {
      key: 'supporter',
      name: '个人支持者',
      icon: <Heart className="size-5" aria-hidden />,
      seats: '名额不限',
      /*
       * 起价与爱发电上实际设置的档位一致。
       *
       * 页面上写一个数、点进去看到另一个数，是赞助流程里最容易让人掉头就走的一种错——
       * 所以这两个数字必须锁死同步。改价时记得两边一起改（爱发电见 lib/sponsors.ts 的 afdianUrl）。
       */
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
      // 不要求提供任何东西：爱发电订阅时已有昵称，名单直接从后台同步即可。
      // 多问一句「该怎么称呼你」，就多一次放弃的机会。
    },
    {
      /*
       * 资源合作伙伴：排在两档**现金档之后**。
       *
       * 【为什么不在最前】
       * 前面两档（开源 ¥500、个人 ¥20）回答的是同一个问题："我出多少钱、拿到什么"，
       * 并排放在一起正好和下面的权益对比表对上。资源档不给钱、只给服务器/云资源，
       * 属于另一条路；插在两者中间会把这条价格主线打断，读者会误读成"第二贵的档位"。
       *
       * 【位置在后不等于低一等】
       * 它独占一行、并给出完整需求清单，读起来更像"另一条支持通道"，而不是现金档的附属品。
       */
      key: 'infrastructure',
      name: '资源合作伙伴',
      icon: <Server className="size-5" aria-hidden />,
      /*
       * 价格位不放价，放这一档的实质——「分布式」是项目里的既有说法：
       * 演示环境一直是多位成员各出一份（前后端、MySQL/Redis、服务器）拼起来的
       * （见 content/blog/2025/continew-server-migrate.mdx「演示环境的发展历程」）。
       * 资源档就是把这套已经跑了很久的模式对外开放：每家出一件，共同撑起分布式演示环境。
       */
      price: '共建分布式演示环境',
      /*
       * 明确写「个人、团队与企业」：手上有一台闲置服务器或一个 Token 额度的个人同样能支持，
       * 只写「团队与企业」等于把这类人挡在门外——他们恰恰是最容易开口的一群。
       */
      summary: '适合能提供服务器、云资源或 Token 额度的个人、团队与企业。',
      /*
       * 「当前需求」清单：把项目真正缺的基础设施列出来，让有意支持的团队对得上号——
       * 比一句"欢迎提供资源"具体得多，对方一眼就知道还能支持什么、自己手里的资源能不能用上。
       * 数量标注（×1 / 多个）也是在管理预期：云服务器和 Redis 各只要一个，Token 额度则可以多个。
       *
       * status 必须标：不标的话读者分不清哪条已经被支持、哪条还缺，
       * 想支持还得先来问一句——那这份清单就没起到"降低询问成本"的作用。
       * by 填提供方名称，与 data/sponsors.json 的 infrastructure 条目对应；提供方变动时要同步改这里。
       */
      needs: [
        {
          name: '云服务器（>=4C8G50G，带公网IP）',
          qty: '×1',
          desc: '部署 continew-admin 相关服务及数据库',
          status: 'provided',
          by: '风铃云',
        },
        {
          name: 'Token Plan 或额度',
          qty: '不限',
          desc: '项目 Code Review CI 与开发提效',
          status: 'open',
        },
        {
          name: '对象存储 OSS / S3 服务',
          qty: '×1',
          desc: '文件、头像与附件上传演示',
          status: 'open',
        },
        { name: 'Redis 服务', qty: '×1', desc: 'continew-admin 等服务的缓存与会话', status: 'open' },
      ],
      action: (
        <a
          href={contactAnchor}
          className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg border border-teal-500/40 px-5 py-2.5 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-teal-500/10"
        >
          <Server className="size-4" aria-hidden />
          聊聊合作
        </a>
      ),
    },
  ];
}

/** 赞助款去向。写清楚钱花在哪，比反复强调「请支持我们」更有说服力。 */
const SUPPORT_USES = [
  '承担网站域名及服务器运营成本',
  '投入更多精力进行项目开发',
  '采购开发工具与Token服务',
  '提供更优质的技术支持',
  '持续优化代码质量，开箱即用，持续提供舒适的开发体验',
  '研发更多实用功能与模块',
];

function TierCard({ tier, className }: { tier: Tier; className?: string }) {
  const tone = TONES[tier.key];
  /** 仍未落实的需求条数——直接写进小标题，读者不用逐条去数。 */
  const openCount = tier.needs?.filter((need) => need.status === 'open').length ?? 0;
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
            className={cn('flex size-9 items-center justify-center rounded-lg border', tone.icon)}
          >
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

      {/*
        资源合作伙伴的「当前需求」：放进正文流（紧跟 summary），而不是像 requirement 那样塞在底部——
        需求清单是这一档的核心信息，放底部会被 flex-1 撑开的空白推远，读起来是断开的两块。

        样式上刻意做轻：每条两行——首行「名称 + 数量 + 状态」，次行才是用途说明，
        不堆胶囊也不上重点色。清单要的是"扫一眼就对得上号"，不是再立一个重点区块。
      */}
      {tier.needs && (
        <div className="mt-4">
          <p className="text-xs font-medium text-fd-muted-foreground">
            当前需求
            {openCount > 0 && (
              <span className="ml-1.5 font-normal text-teal-700 dark:text-teal-300">
                · 还有 {openCount} 项待支持
              </span>
            )}
          </p>
          {/*
            两列铺开：这一档独占一行、宽度富余，4 条需求排成 2×2 既填满版面又比单列矮一半，
            正好解决"三卡并排太挤、左右还空着"的问题。
          */}
          <ul className="mt-2 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {tier.needs.map((need) => (
              <li key={need.name} className="flex gap-2 text-xs leading-relaxed">
                {/* 已支持用对勾、待支持用圆点：不靠颜色也能区分状态 */}
                {need.status === 'provided' ? (
                  <Check
                    className="mt-[2px] size-3.5 shrink-0 text-teal-600 dark:text-teal-400"
                    aria-hidden
                  />
                ) : (
                  <span
                    className="mt-[6px] size-1.5 shrink-0 rounded-full bg-teal-500 dark:bg-teal-400"
                    aria-hidden
                  />
                )}
                <span className="min-w-0">
                  {/*
                    拆成两行：第一行「名称 + 数量 + 状态」是扫读时眼睛真正跑的那一行，
                    第二行只放用途说明。之前全怼在一行，名称被用途挤断、状态被推到行尾折行——
                    最难找的偏偏是最该一眼看到的「待支持」。
                  */}
                  <span className="flex flex-wrap items-center gap-x-1.5">
                    <span
                      className={cn(
                        'font-medium',
                        need.status === 'provided'
                          ? 'text-fd-muted-foreground'
                          : 'text-fd-foreground',
                      )}
                    >
                      {need.name}
                    </span>
                    <span className="text-teal-700 dark:text-teal-300">{need.qty}</span>
                    {/*
                      「已支持」刻意不做胶囊：它是已完成的信息，应该往后退。
                      做成灰色 chip 反而和「待支持」抢视觉，两条都成了重点、谁也不突出。
                      这里只留一句弱化的括号小字，让「待支持」成为清单里唯一跳出来的东西。
                    */}
                    {need.status === 'provided' ? (
                      <span className="text-fd-muted-foreground/70">
                        （已由{need.by ?? '伙伴'}提供）
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-medium text-teal-700 dark:text-teal-300">
                        待支持
                      </span>
                    )}
                  </span>
                  {need.desc && (
                    <span className="mt-0.5 block text-fd-muted-foreground">{need.desc}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/*
        撑开剩余高度，把下方素材要求与 CTA 顶到卡片底部——
        两档摘要行数不同时，按钮仍在同一条水平线上。
      */}
      <div className="flex-1" />

      {/*
        没有 requirement 的档位整块不渲染——否则会留一条孤零零的分割线，
        下面再挂一个「需提供：」的空壳。
      */}
      {tier.requirement && (
        <p className="mt-4 border-t border-fd-border/60 pt-3 text-xs text-fd-muted-foreground">
          需提供：{tier.requirement}
        </p>
      )}

      {/*
        CTA 放在卡片最底部：权益区是 flex-1，把两档的按钮顶到同一条水平线上，
        并排看时不会一高一低。这也符合阅读顺序——读完权益和门槛，再决定要不要行动。
      */}
      {tier.action}
    </div>
  );
}

/**
 * 权益对比表。
 *
 * 列顺序刻意是「个人支持者 → 开源合作伙伴」：从左往右是一条升级路径，
 * 读者顺着读过去，看到的就是"多花这部分钱买到了什么"。
 *
 * 分「两档都有」和「开源合作伙伴专属」两组呈现，而不是一长条平铺：
 * 先确认基础权益是平等的，再看差异项，高价档的价值才立得住——
 * 如果一上来就是一排"只有他有"，读起来像在数落低档档位。
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
            <Minus
              className="mx-auto size-3.5 text-fd-muted-foreground/40"
              aria-label="无"
            />
          )}
        </td>
        <td className="px-2 py-2.5 text-center">
          <Check
            className="mx-auto size-4 text-[var(--cn-brand)]"
            aria-label="有"
          />
        </td>
      </tr>
    ));

  const groupRow = (label: string) => (
    <tr className="border-t border-fd-border/60 bg-fd-muted/25">
      <td
        colSpan={3}
        className="px-4 py-2 text-xs font-medium tracking-wide text-fd-muted-foreground"
      >
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
            {/*
              左列承载**两档**：个人支持者与资源合作伙伴的基础权益本来就是同一套
              （名单 + 共鸣者交流群），拆成两列只会得到两列一模一样的对勾——
              白占版面，还暗示它们之间有区别。
              两个名字上下分行而不是「个人支持者 / 资源合作伙伴」挤一行：
              这一列只有约 112px，11 个字必然折行，断点还会落在名字中间。
            */}
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

/**
 * 商业档：Logo 卡片 + 一句话介绍。
 *
 * 一句话是这版的关键改动——一个陌生 Logo 本身没有信息量，读者不知道该不该点；
 * 补上业务说明，它才构成"推荐"，而且这句话由赞助商自己写，说服成本在他那边。
 */
function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  const description = sponsor.description ? stripTags(sponsor.description) : '';
  return (
    <a
      href={sponsor.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group flex flex-col items-center gap-3 rounded-xl border border-fd-border p-6 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left',
        cardHover,
      )}
    >
      {sponsor.img && (
        // 外链图片，静态导出下不经过图片优化，用原生 img
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sponsorImageUrl(sponsor.img)}
          alt={sponsor.name}
          loading="lazy"
          className="h-20 w-auto max-w-full rounded-lg object-contain sm:h-24"
        />
      )}
      <div className="min-w-0">
        <span className="text-sm font-medium group-hover:text-fd-primary">{sponsor.name}</span>
        {description && (
          <span className="mt-1 block text-sm leading-relaxed text-fd-muted-foreground">
            {description}
          </span>
        )}
      </div>
    </a>
  );
}

/**
 * 个人支持者：只列名字。
 *
 * 个人没有 Logo，硬要求素材等于把人挡在门外；用名字条也正好在视觉上
 * 和商业档的 Logo 卡片区分开——两者不是同一件事，不该长得一样。
 *
 * 入参是 `Supporter[]` 而不是 `Sponsor[]`：这个列表只可能渲染名字与链接，
 * 类型上就不给 `img` / `description` 留位置（详见 lib/sponsors.ts）。
 */
function SupporterList({ sponsors }: { sponsors: Supporter[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {sponsors.map((sponsor) => (
        <li key={sponsor.name}>
          {sponsor.url ? (
            <a
              href={sponsor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-fd-border bg-fd-card px-3 py-1.5 text-sm text-fd-muted-foreground transition-colors hover:border-[var(--cn-brand-line)] hover:text-fd-foreground"
            >
              {sponsor.name}
            </a>
          ) : (
            <span className="inline-flex items-center rounded-full border border-fd-border bg-fd-card px-3 py-1.5 text-sm text-fd-muted-foreground">
              {sponsor.name}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function SponsorPage() {
  /*
   * 素材路径存在性校验：模块顶层跑一次，dev 与 build 都会经过。
   * 路径写错（如目录重组后漏改）在这里直接抛错让构建失败，
   * 而不是上线后等人看到裂图——这类事故已经出过两次。
   */
  assertSponsorAssetsExist();

  const strategic = getSponsors('strategic');
  const infrastructure = getSponsors('infrastructure');
  const supporters = getSponsors('supporter');
  const tiers = buildTiers(Math.max(getStrategicSeats() - strategic.length, 0));

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Sponsorship"
        title="成为赞助者"
        /*
         * 开场白压到原来的一半：原文 150 字，和下面「赞助能带来什么」两块内容
         * 一起把首屏撑得很满，读者还没看到档位就先读完两段铺垫。
         * 保留三件真正有用的事：协议允许免费商用（打消顾虑）、2022 年底至今（说明不是玩票）、
         * 赞助也换来面向开发者的展示（给出资理由）。其余抒情去掉。
         */
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

      {/*
        赞助款去向单列一块：原文是紧跟在开场白后面的一整段，挤在页面头里会糊成一坨，
        拆成两列清单后读者能扫读。
      */}
      {/*
        赞助款去向折叠起来。

        它是**信任状**，不是决策依据——读者要先被"我为什么要掏钱"说服，
        才会关心"钱具体花在哪"。默认铺开 6 条，会让读者还没看到档位
        就先读完一整段清单，上半页的密度也下不来。
        折起来后信息一条没少，想看的人点开就是。
      */}
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
        借鉴 Vue 赞助页的结构：在列出档位**之前**，先分别站在「企业」和「个人」
        两种出资方的角度讲清动机。档位回答的是「多少钱、给什么」，
        这一节回答的是「我为什么要掏这个钱」——顺序反了，读者还没被说服就先看到价格，
        只会觉得贵。

        企业栏的第一条是整页最有力的一句，也是 Vue 那句
        "it ensures the project that your product relies on stays healthy" 的中文版：
        不是请他做慈善，而是**他的产品跑在你的项目上，项目健康对他有直接好处**。
        这句话把赞助从「花钱买广告」变成了「给自己买保险」，说服力完全不在一个量级。
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
              {/*
                之前这里写的是「演示站月均 36 万+ PV」——那是**站点整体**的页面浏览量，
                而赞助商的轮播只在登录后的工作台首页，真正看到它的人远少于这个数。
                拿站点总量当展示位曝光量说，是夸大，谈的时候一旦被追问就露馅。
                换成「独立访客 + 平均停留时长」：两个数都来自百度统计，
                加起来还能说明一件事——流量不是刷出来的（刷量不会停留 7 分钟）。
              */}
              <li>面向开发者的曝光：演示站月均 8 万+ 独立访客，平均停留 7 分钟以上。</li>
              <li>
                「愿意支持开源」的品牌认知——对做开发者产品的团队，这是很难买到的无形资产。
              </li>
              {/*
                原来这句是「在社区里更容易被开发者看见」——太虚，读完等于没读。
                换成群发这条具体的：展示位是「等人来看」，群发是「推到眼前」，
                这是两种完全不同的触达效率，而且是旧站四档里最贵那几档才有的权益。
              */}
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
                <span className="font-medium text-fd-foreground">更有效的做法：把这一页转给你的雇主。</span>
                <span className="text-fd-muted-foreground">
                  {' '}
                  企业赞助对开源项目的支撑，远大于个人捐赠——你能起的作用比想象中大。
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
        {/*
          两档并排。此前是四档（独家/铂金/金牌/银牌），其中三档常空——
          页面上三分之一在说"虚位以待"，潜在赞助商读到的不是"有四种选择"，
          而是"没人赞助"。两档足够，且两档卖的是两种不同的关系，不是同一档的两种尺寸。
        */}
        {/*
          分两行，不再三卡平铺：三列时每卡被压到约 1/3 宽，文字挤、两侧还空着——
          这不是留白，是列数给多了。

          第一行是两档**现金档**（开源 ¥500 / 个人 ¥20）并排：它们回答同一个问题——
          "出多少钱、拿到什么"，并排放在一起正好和下面的权益对比表对上。

          第二行是资源档独占一行：它不给钱、只给资源，是另一条支持通道，
          放在现金档**之后**而不是插在中间，避免被读成"第二贵的档位"。
          独占一行也让它有足够宽度把需求清单铺成两列，不再局促。
        */}
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

        {/*
          内容规范原本是 bg-fd-muted/50 + text-xs：浅色下 muted(96.1%) 与背景(96%) 同色，
          底色完全看不见，只剩一团 12px 灰字。改加边框并升到 text-sm。
        */}
        {/*
          内容规范整块折叠：它是"细则"，不是决定要不要赞助的关键信息。
          默认铺开两段灰字，会把「合作方式」这一节撑得又长又闷——
          读者还没比完档位就先撞上一墙免责说明。折起来这一节立刻松了，
          需要的人点开就能看全，信息一条没少。
        */}
        <details className="mt-8 rounded-xl border border-fd-border bg-fd-card p-5 text-sm leading-relaxed text-fd-muted-foreground">
          <summary className="cursor-pointer font-medium text-fd-foreground">
            内容规范与展示说明
          </summary>
          <p className="mt-2.5">
            建议推广与开发者相关的产品或服务（低代码平台、技术课程、开发工具、云服务、实体外设等）。
            拒绝推广违反法律法规、涉及灰色产业的产品，以及 IP 代理、上网工具等。
            {/*
              频率写死「每月一次」而不是原来的「单日不超过两次」。
              后者看着宽松，实际是把自己逼到每周都能被要求发一次的地步；
              而群发的成本不在次数，在**群会散**——发多了人退群，这个位子就没价值了。
            */}
            为避免过度打扰：交流群群发与公众号推广各每月不超过一次，内容需提前确认。
          </p>
          <p className="mt-2">
            展示位由同期合作伙伴共享、等比平铺展示（不做轮播——周边视野里的动效既打扰读者，
            也会把单家曝光按时间切片，对双方都是损失）。席位按季度评估，到期可续约或让出。
          </p>
        </details>
      </Section>

      <Section title="当前支持者" description="感谢他们为 ContiNew 提供的支持。">
        <div className="flex flex-col gap-8">
          {strategic.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-fd-primary">
                  <Crown className="size-4" aria-hidden />
                </span>
                <h3 className="text-sm font-semibold">开源合作伙伴</h3>
                <span className="text-xs text-fd-muted-foreground">按月资金支持</span>
              </div>
              <div className={cn('grid gap-4', strategic.length > 1 && 'sm:grid-cols-2')}>
                {strategic.map((sponsor) => (
                  <SponsorCard key={sponsor.name} sponsor={sponsor} />
                ))}
              </div>
            </div>
          )}

          {/*
            资源合作伙伴单列一组：他们提供的是服务器、云资源这类**实物/服务**，
            不是按月付的钱。跟付费档混在一起会让「¥500/月」这个价格失去参照，
            也让他们自己被误读成"花钱买的广告位"——对双方都不公道。

            两者都叫「合作伙伴」是刻意的：给资源不是低人一等，只是方式不同；
            用名字区分谁高谁低，反而会让提供服务器的伙伴觉得自己只是个陪衬。
          */}
          {infrastructure.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-teal-600 dark:text-teal-400">
                  <Server className="size-4" aria-hidden />
                </span>
                <h3 className="text-sm font-semibold">资源合作伙伴</h3>
                <span className="text-xs text-fd-muted-foreground">服务器与云资源支持</span>
              </div>
              <div className={cn('grid gap-4', infrastructure.length > 1 && 'sm:grid-cols-2')}>
                {infrastructure.map((sponsor) => (
                  <SponsorCard key={sponsor.name} sponsor={sponsor} />
                ))}
              </div>
            </div>
          )}

          {/*
            个人支持者：**始终显示**，哪怕名单是空的。

            之前这里是 `{supporters.length > 0 && …}`，空数组就整块消失。后果是
            页面上面「个人支持者 ¥20/月」那张卡承诺了一种支持，下面却连一个名字都没有，
            中间没有任何交代——读者会以为这一档已经有人了、或者干脆没人支持。

            空态给一句实话 + 一个入口：名单是公开的，一旦有人订阅，这里就会长出来，
            第一个名字的位置对后来者是真实激励（所以写明「会出现在这里」）。
          */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-amber-600 dark:text-amber-400">
                <Heart className="size-4" aria-hidden />
              </span>
              <h3 className="text-sm font-semibold">个人支持者</h3>
              <span className="text-xs text-fd-muted-foreground">按月小额支持</span>
            </div>
            {supporters.length > 0 ? (
              <SupporterList sponsors={supporters} />
            ) : (
              <p className="rounded-lg border border-dashed border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
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
        </div>
      </Section>

      <Section
        id="contact"
        title="如何洽谈"
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
              {/*
                把收款方式写进流程，而不是等谈完才说。
                赞助沟通里最劝退的一种情况是：聊了三轮才发现付款方式自己用不了。
              */}
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
