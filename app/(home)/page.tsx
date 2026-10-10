import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Boxes,
  Layers,
  LayoutDashboard,
  Rocket,
  ShieldCheck,
  Smartphone,
  Zap,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { ContributeDialog } from '@/components/contribute-dialog';
import { ContributorWall } from '@/components/contributor-wall';
import { AnimatedNumber } from '@/components/home/animated-number';
import { GitHubIcon } from '@/components/brand-icons';
import { Faq, type FaqItem } from '@/components/home/faq';
import { JoinGroupDialog } from '@/components/home/join-group-dialog';
import { MessagesMarquee } from '@/components/home/messages-marquee';
import { SectionHeading } from '@/components/home/section-heading';
import { UsersMarquee } from '@/components/home/users-marquee';
import { getMessages } from '@/lib/messages';
import {
  appDescription,
  appName,
  gitConfig,
  messageUrl,
  registerUrl,
} from '@/lib/shared';
import { getContributorList, getContributorSummary, getStarSummary } from '@/lib/site-stats';
import { getUsers } from '@/lib/users';
import { getHomepageBackers, groupResourceByNeed } from '@/lib/sponsors';
import { CompanyCard } from '@/components/sponsor/company-card';
import { ResourceNeedCard } from '@/components/sponsor/resource-card';
import { SupporterChips } from '@/components/sponsor/supporter-chip';

/**
 * 首页文案集中在本文件。
 *
 * 这些文案是首页的「内容」而非「组件逻辑」——区块组件只负责版式，
 * 写什么由这里决定，改文案不必去翻组件。
 */

/**
 * 项目图标取自文档侧边栏对应分区的 meta.json `icon` 字段
 * （content/docs/admin/meta.json → LayoutDashboard，content/docs/app/meta.json → Smartphone），
 * 让首页与文档站的视觉指代保持一致——在首页认过的图标，进文档还能认出来。
 *
 * Starter 目前在文档里还没有独立分区（content/docs 下只有 admin / app），
 * 没有现成图标可对应，这里沿用社区里一直用的小火箭（Rocket）——
 * 它对应的是 Starter 的定位：给项目加速的基座，而不是又一组可拼装的方块。
 */
const projects: Array<{
  name: string;
  tag: string;
  icon: ReactNode;
  description: string;
  href: string;
  repo: string;
}> = [
  {
    name: 'ContiNew Admin',
    tag: '全栈',
    icon: <LayoutDashboard className="size-5" aria-hidden />,
    description:
      '页面现代美观、专注设计与代码细节的高质量多租户中后台管理系统框架。开箱即用，前后端分离，内置代码生成器。',
    href: '/docs/admin',
    repo: 'continew-admin',
  },
  {
    name: 'ContiNew Starter',
    tag: '后端',
    icon: <Rocket className="size-5" aria-hidden />,
    description:
      '基于「约定优于配置」的企业级 Starter 库。封装一系列经过企业实践验证的依赖包，已发布至 Maven 中央仓库，可在任意项目中直接引入。',
    href: '/docs/starter',
    repo: 'continew-starter',
  },
  {
    name: 'ContiNew App',
    tag: '多端',
    icon: <Smartphone className="size-5" aria-hidden />,
    description:
      '面向 Vibe Coding 的多端工程脚手架（App / 微信小程序 / H5 / 桌面端）。一套代码多端运行，内置工程治理与 AI 协作规范。',
    href: '/docs/app',
    repo: 'continew-app',
  },
];

const capabilities: Array<{ icon: ReactNode; title: string; description: string }> = [
  {
    icon: <Layers className="size-5" aria-hidden />,
    title: '流行技术栈',
    description:
      'Vue 3、Arco Design、TypeScript、Vite 构建前端，Spring Boot 3（Java 17）驱动后端，集成 Sa-Token、MyBatis Plus、Redisson 等主流框架与工具。',
  },
  {
    icon: <Zap className="size-5" aria-hidden />,
    title: '效率至上',
    description:
      '开箱即用，无需手动导入初始数据脚本。品牌配置集中管理，配合代码生成器一键生成前后端 80% 代码。',
  },
  {
    icon: <ShieldCheck className="size-5" aria-hidden />,
    title: '规范与质量并重',
    description:
      '后端严格遵循阿里巴巴 Java 编码规范，注释覆盖率 > 45%。CI 集成 Sonar 代码质量扫描，定期扫描 CVE 漏洞。',
  },
  {
    icon: <Boxes className="size-5" aria-hidden />,
    title: '全能业务脚手架',
    description:
      '支持 SaaS 租户架构，基于 RBAC 的权限与通用数据权限，内置第三方登录、邮箱 / 短信、系统日志等通用方案。',
  },
];

/** 问答来自旧站 about/faq.md，按首页语境压缩过——完整版仍在文档站。 */
const faqItems: FaqItem[] = [
  {
    question: '谁在维护 ContiNew？',
    answer:
      'ContiNew 是独立的开源社区驱动项目，由来自全国各地的非全职成员团队共同维护，Charles 担任项目负责人。首个项目于 2022 年底发起。',
  },
  {
    question: 'ContiNew 使用什么开源协议？',
    answer:
      'ContiNew Admin 采用 Apache-2.0，ContiNew Starter 采用 LGPL-3.0。二者均可完全免费用于商业应用开发，Starter 通过 Maven / Gradle 依赖方式引入同样免费。',
  },
  {
    question: 'Starter 为什么采用 LGPL-3.0 协议？',
    answer:
      '核心目标是汇集更多开发者智慧，让通用功能更普及。通过 @Bean 重写配置、@Override 方法等常见操作属于面向对象与 IOC 的正常使用方式，与开源协议并不冲突。',
  },
  {
    question: '支持二次开发并开源吗？',
    answer:
      '非常欢迎在遵守对应项目开源协议的前提下二次开发并开源，共同扩展生态。也欢迎投稿登记至项目生态，给更多开发者更多选择。',
  },
  {
    question: '遇到问题在哪里交流？',
    answer:
      '文档里已经有大部分答案。此外可以加入官方交流群，与维护团队和社区开发者实时沟通；也可以到代码托管平台提 Issue 或发帖讨论——GitHub、AtomGit、Gitee 三个平台都有人看，都会同步处理。',
  },
];

/*
 * 登记权益的四条说明搬到 /users 页了。
 *
 * 它们是「我登记能得到什么」的答案，属于决策前的信息；放在首页时，
 * 这个区块被跑马灯 + 四张卡片 + 两个按钮撑得比主内容还长，
 * 而首页这一段的任务只是让人看见「已经有人在用」。
 */

export default async function HomePage() {
  /*
   * 三个数据源一次性并发拉取，都在构建期执行（静态导出）。
   *
   * 其中贡献者的「统计数字」与「名单」底层是同一批请求，lib/site-stats.ts 里缓存了 Promise，
   * 一次构建只真正拉一次；Star 与贡献者又共用同一份组织仓库列表，同样有缓存。
   * 未认证 GitHub 限流只有 60 次/小时，这些重复必须省掉。
   *
   * 任一失败都有各自的降级：Star 走快照、贡献者留空名单，首页不会因为有接口不通就缺一大块。
   */
  const [stars, contributorSummary, contributorList] = await Promise.all([
    getStarSummary(),
    getContributorSummary(),
    getContributorList(),
  ]);

  const users = getUsers();
  const messages = getMessages();
  /*
   * 首页支持者名单：由 getHomepageBackers 统一策展（开源全上、资源按阈值、
   * 个人优先长期）。这里只拿到结果，规则不外显——首页是社会证明位，不是排行榜。
   * 三者各用最贴切的紧凑形态：开源合作卡、需求项式资源行、支持者胶囊，
   * 头像 / Logo 都是小标识的量级，不再用大卡片。
   */
  const backers = getHomepageBackers();
  // 首页资源只放当前在用的条目，按需求归组成卡片（不展开往期履历，那是赞助页的事）。
  const resourceGroups = groupResourceByNeed(backers.resource);
  const hasBackers =
    backers.strategic.length > 0 ||
    resourceGroups.length > 0 ||
    backers.supporters.length > 0;

  // 数值保持数字类型，交给 AnimatedNumber 做「滚进视口从 0 计数」；格式化在组件内做
  const stats = [
    { value: stars.total, label: '全平台 Star' },
    { value: contributorSummary.total, label: '位贡献者' },
    { value: users.length, label: '家企业登记使用' },
    { value: projects.length, label: '个开源项目' },
  ];

  return (
    <main className="flex flex-1 flex-col">
      {/*
       * Hero：一句话主张 + 双 CTA + 产品主视觉。
       *
       * 纵向留白一档就够：小屏 pt-14/pb-12，桌面 sm:pt-24。首页一共八块，
       * 每块上下各 80px 的留白累起来会让人滚好几屏才见到下一个信息，
       * 尤其在手机上一屏只有几百像素高的时候。
       */}
      <section className="relative overflow-hidden px-6 pt-14 pb-12 sm:pt-24 sm:pb-16">
        {/* 顶部极淡品牌色光晕，与二级页面的 PageContainer 共用同一视觉语言；
            cn-glow 让它以极小幅度缓慢呼吸（详见 global.css，幅度刻意压到几乎不可见） */}
        <div
          aria-hidden
          className="cn-glow pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_oklab,var(--cn-brand)_8%,transparent),transparent_70%)]"
        />
        {/* cn-stagger：打开页面时子元素依次淡入上移（首屏动画只能用时间驱动，见 global.css） */}
        <div className="cn-stagger relative mx-auto flex max-w-3xl flex-col items-center text-center">
          <Image src="/logo.svg" alt={appName} width={64} height={64} priority />
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-fd-border bg-fd-card px-4 py-1.5 text-xs font-medium text-[var(--cn-brand)]">
            <span aria-hidden className="size-1.5 rounded-full bg-[var(--cn-brand)]" />
            ContiNew Admin v4.1.0 已发布
          </p>
          <h1 className="mt-6 text-balance font-bold tracking-tight text-4xl sm:text-5xl">
            持续迭代，持续舒适的开发体验
          </h1>
          <p className="mt-5 text-base leading-relaxed text-fd-muted-foreground sm:text-lg">
            {appDescription}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/docs/admin"
              className="rounded-lg bg-[var(--cn-brand)] px-6 py-3 text-sm font-medium text-[var(--cn-brand-on)] shadow-sm transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-px hover:bg-[var(--cn-brand-strong)] hover:shadow-md"
            >
              快速上手
            </Link>
            {/*
              「在线演示」先到官网的 /demo 说明页，再进演示环境。
              演示环境有数据重置、操作受限、部署期短暂不可用等限制，
              直接跳过去的人多半不知道，容易在里面存重要数据或对改不了数据感到困惑；
              先看一页说明再进，对使用者和演示环境都省事。
            */}
            <Link
              href="/demo"
              className="rounded-lg border border-fd-border px-6 py-3 text-sm font-medium transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-px hover:bg-fd-accent hover:shadow-sm"
            >
              在线演示
            </Link>
            {/*
              交流群入口同样放首屏：Issue 模板、greeting 机器人、各仓库 CONTRIBUTING
              都把「入群方式」指向官网首页，若入口只埋在底部收尾区，读者滚不到就找不到。
              边框样式与「在线演示」同级，不稀释实心主按钮「快速上手」。
            */}
            <JoinGroupDialog className="inline-flex items-center gap-2 rounded-lg border border-fd-border px-6 py-3 text-sm font-medium transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-px hover:bg-fd-accent hover:shadow-sm" />
          </div>
          <p className="mt-6 text-xs text-fd-muted-foreground">
            Apache-2.0 / LGPL-3.0 开源协议 · 已有 {users.length} 家企业登记使用
          </p>
        </div>
        {/* 主视觉：独立的图容器，不与文字叠放；入场晚半拍收住整段节奏 */}
        <div className="cn-stagger-hero-visual relative mx-auto mt-16 max-w-5xl">
          <Image
            src="/images/home/hero-dashboard.webp"
            alt="ContiNew Admin 数据分析页"
            width={1912}
            height={922}
            priority
            className="rounded-xl border border-fd-border shadow-sm"
          />
        </div>
      </section>

      {/*
       * 数据带：真实数字，构建期从三平台公开接口拉取。
       *
       * 底色这块试过三版：深色带（把首页压得太重）→ 品牌浅蓝带（一条横贯整屏的
       * 湖蓝色，跟上下的白/灰区块不在一个体系里，看着像没做完的占位）→ 现在的无底色。
       * 结论是这条带的「分隔感」交给上下两条细线就够了，强调色留给数字本身——
       * 四个品牌蓝的粗体数字在纯白上已经足够抢眼，再铺一条底色反而是双重强调。
       */}
      <section className="border-y border-fd-border/70">
        <dl className="mx-auto flex max-w-4xl flex-wrap items-baseline justify-center gap-x-12 gap-y-4 px-6 py-6 sm:py-8">
          {stats.map((stat) => (
            /*
             * dt（术语）必须在 dd（描述）之前——这是 dl 的语义要求，读屏按源顺序朗读。
             * 视觉上仍要「数字在前、标签在后」，所以容器用 flex-row-reverse 反转绘制方向，
             * 而不是把 DOM 顺序倒过来。
             */
            <div
              key={stat.label}
              className="flex flex-row-reverse items-baseline justify-end gap-2"
            >
              <dt className="text-sm text-fd-muted-foreground">{stat.label}</dt>
              <dd className="text-2xl font-bold tracking-tight text-[var(--cn-brand)] tabular-nums sm:text-3xl">
                <AnimatedNumber value={stat.value} />
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 项目矩阵 */}
      <section className="px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="项目生态"
            title="三个项目，一套方法论"
            description="覆盖后端、前端与多端，从脚手架到完整解决方案，一套工程规范贯穿始终。"
          />
          <div className="mt-10 sm:mt-12 grid gap-5 md:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.name}
                href={project.href}
                // 半强度品牌边框（--cn-brand-line）：实色边框在圆角上会显毛边；
                // 抬升 + 阴影给「卡片浮起来」的空间反馈，与边框变色同时发生
                className="cn-reveal group flex flex-col rounded-xl border border-fd-border bg-fd-card p-6 transition-[border-color,background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-[var(--cn-brand-line)] hover:bg-fd-accent/30 hover:shadow-lg hover:shadow-fd-border/40"
              >
                {/*
                 * 图标与项目名同行、标签退到右上角。
                 * 上一版是「图标方块 → 标签 → 名称」三段竖排，图标占了一整行版面
                 * 却只承载一个装饰作用，标签被夹在中间也读不出归属。
                 * 图标贴到名称左侧当锚点，标签做成右上角的徽章，层次一次性读完。
                 */}
                <div className="flex items-start justify-between gap-3">
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <span className="shrink-0 text-[var(--cn-brand)]">{project.icon}</span>
                    {project.name}
                    <ArrowRight
                      aria-hidden
                      className="size-4 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                    />
                  </h3>
                  <span className="shrink-0 rounded-md bg-[var(--cn-brand-soft)] px-2 py-0.5 text-xs font-medium text-[var(--cn-brand)]">
                    {project.tag}
                  </span>
                </div>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-fd-muted-foreground">
                  {project.description}
                </p>
                <span className="mt-4 text-xs text-fd-muted-foreground">
                  {gitConfig.user}/{project.repo}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 为什么选我们 */}
      <section className="bg-fd-muted/40 px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="核心能力"
            title="不只是脚手架，是一套能直接落地的工程实践"
            description="从技术选型到代码规范，从权限模型到安全工具，把重复搭建的成本一次性收掉。"
          />
          <div className="mt-10 sm:mt-12 grid gap-5 md:grid-cols-2">
            {capabilities.map((capability) => (
              <div
                key={capability.title}
                className="cn-reveal rounded-xl border border-fd-border bg-fd-card p-7 transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-fd-primary/50 hover:shadow-lg hover:shadow-fd-border/40"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-[var(--cn-brand-soft)] text-[var(--cn-brand)]">
                  {capability.icon}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{capability.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground">
                  {capability.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 登记用户滚动 */}
      <section className="px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="登记用户"
            title="他们正在用 ContiNew"
            description="如您使用了 ContiNew 系列项目进行开发，我们诚挚邀请您抽出宝贵时间完成用户登记。"
          />
        </div>
        <div className="mt-10 sm:mt-12">
          <UsersMarquee users={users} />
        </div>
        <div className="mx-auto mt-10 flex max-w-6xl flex-wrap items-center justify-center gap-3 px-6">
          {/*
           * 这是外链（GitHub 登记帖），用原生 <a> 而非 next/link：
           * Link 默认同标签跳转，会把访客整个带离本站；登记要填表，
           * 同标签走掉等于放弃当前浏览。与 /users 页的登记按钮保持一致。
           */}
          <a
            href={registerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-[var(--cn-brand)] px-5 py-2.5 text-sm font-medium text-[var(--cn-brand-on)] transition-colors hover:bg-[var(--cn-brand-strong)]"
          >
            我也是使用者，立即登记
          </a>
          <Link
            href="/users"
            className="inline-flex items-center gap-1.5 rounded-lg border border-fd-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-accent"
          >
            查看全部登记用户
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </section>

      {/*
       * 用户留言滚动。
       *
       * 跑马灯组件在名单为空时会整块 return null，而这一节真正的目的是
       * **把读者变成留言的人**——滚动区只是社会证明，入口才是动作。
       * 所以下面的引导不能挂在 marquee 的渲染前提里：没有留言时，
       * 它就是这块区域唯一的内容，必须照样立得住。
       */}
      <section className="bg-fd-muted/40 px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="社区声音"
            title="用过的人怎么说"
            description="留言来自交流群、Issue 与登记帖，滚动展示，不打分不排序。"
          />
        </div>
        {messages.length > 0 ? (
          <div className="mt-10 sm:mt-12">
            <MessagesMarquee messages={messages} />
          </div>
        ) : (
          <p className="mt-8 text-center text-sm text-fd-muted-foreground">
            还没有可展示的留言——第一条由你来开。
          </p>
        )}
        <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center gap-3 px-6 sm:mt-12">
          {/*
           * 用描边按钮而非品牌实底：上方「登记用户」已经有一个实底主按钮，
           * 隔一屏再来一个同权重的按钮会互相抢。征集留言是次级动作，
           * 描边 + GitHub 图标恰好也把「点进去会离开本站」这件事说清楚了。
           */}
          <a
            href={messageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-fd-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-[var(--cn-brand-line)] hover:bg-[var(--cn-brand-soft)]"
          >
            <GitHubIcon className="size-4" />
            我要留言
          </a>
        </div>
      </section>

      {/*
       * 社区贡献者：按提交数排序的名单。
       *
       * 这里原本是「贡献者纸带」（可播放的贡献时间轴）。纸带好看，但它是个需要主动交互
       * 才读得懂的装置——不点播放就是一堆小圆点，而首页访客里会去点的人极少。
       * 换成按贡献度排序的名单后，一眼能读完「谁、做了多少」，
       * 它同时也是这条首页上最硬的一条社会证明。
       */}
      <section className="px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="社区贡献者"
            title={`${contributorSummary.total} 位贡献者，把它打磨到现在`}
            description="每一个头像都是一次真实的提交。数据取自 GitHub 组织下全部公开仓库，构建期同步。"
          />
          {contributorList.list.length > 0 ? (
            <div className="mt-10 sm:mt-12 flex justify-center">
              <ContributorWall contributors={contributorList.list} className="justify-center" />
            </div>
          ) : (
            <p className="mt-6 text-center text-sm text-fd-muted-foreground">
              贡献者名单本次构建未能拉取，该区块已省略——不展示一面空墙。
            </p>
          )}
          <div className="mt-10 flex justify-center">
            <ContributeDialog className="inline-flex items-center gap-1.5 rounded-lg border border-fd-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-[var(--cn-brand-line)] hover:bg-[var(--cn-brand-soft)]" />
          </div>
        </div>
      </section>

      {/*
        当前支持者。紧跟在「社区贡献者」之后：一个是出力的人、一个是出钱出资源的伙伴，
        连在一起才构成完整的社会证明——「这个项目确实有人在投入」。
        再往后是 FAQ 与收尾 CTA，那两段是转化流程，不该被赞助信息打断。

        【为什么按关系分小标签、却不分级】
        开源合作伙伴、资源合作伙伴、个人支持者是三种**关系**，不是高低等级。
        各处的 Logo / 头像都收在一枚小标识的量级：企业用紧凑卡片、资源用需求项式行、
        个人用胶囊——谁上首页由维护者在数据里按「承诺」策展（featured，内部标记，不渲染），
        页面上看不到「谁过线、谁没过」，否则这块社会证明位就退化成排行榜。
        不写金额；首页的资源行不画时间，完整履历在赞助页。

        【底色为什么是极淡品牌色】
        首页底色是白 / 中性灰交替的：贡献者（白）→ 这里 → FAQ（灰）。
        两块相邻不能同色，所以这里既不能白也不能灰——用 6% 品牌色，
        与两侧都区分得开，又比中性灰多一层"致谢"的语义。
      */}
      <section className="bg-[color-mix(in_oklab,var(--cn-brand)_6%,transparent)] px-6 py-14 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            eyebrow="当前支持者"
            title={
              hasBackers ? '他们，撑起 ContiNew 的日常运转' : '席位开放中，等第一位伙伴'
            }
            description="提交记录里或许看不到他们，但 ContiNew 能持续下去，他们是源源不断的力量。"
          />

          {hasBackers ? (
            <div className="mt-9 flex flex-col gap-6 sm:mt-10">
              {/* 开源合作伙伴：企业有一句业务介绍，用紧凑卡片 */}
              {backers.strategic.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {backers.strategic.map((sponsor) => (
                    <CompanyCard key={sponsor.name} sponsor={sponsor} />
                  ))}
                </div>
              )}

              {/* 资源合作伙伴：按需求归组的卡片，一行两张，首页只看当前在用、不画时间 */}
              {resourceGroups.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {resourceGroups.map((group) => (
                    <ResourceNeedCard
                      key={group.need}
                      group={group}
                      showPeriod={false}
                      showQty={false}
                      highlightCurrent={false}
                    />
                  ))}
                </div>
              )}

              {/* 个人支持者：紧凑胶囊，一行排开 */}
              {backers.supporters.length > 0 && (
                <SupporterChips supporters={backers.supporters} />
              )}
            </div>
          ) : (
            // 一个支持者都没有时才显示占位，圆角与真实列表一致，不会有塌陷感。
            <div className="mt-9 flex justify-center sm:mt-10">
              <Link
                href="/sponsor"
                className="flex items-center gap-2.5 rounded-xl border border-dashed border-fd-border bg-fd-card px-5 py-3.5 transition-colors hover:border-[var(--cn-brand-line)]"
              >
                <span className="text-sm font-medium text-[var(--cn-brand)]">
                  成为第一位支持者 →
                </span>
              </Link>
            </div>
          )}

          {/*
            有支持者时，底部这条是"我也想赞助"的入口；
            一个都没有时，上面的占位卡已经是同一个入口，再挂一条就是重复。
          */}
          {hasBackers && (
            <div className="mt-8 text-center">
              <Link
                href="/sponsor"
                className="text-sm font-medium text-[var(--cn-brand)] hover:underline"
              >
                成为赞助者 →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 常见问题 */}
      <section className="bg-fd-muted/40 px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="常见问题" title="先解决你的顾虑" />
          <Faq items={faqItems} className="mt-10 sm:mt-12" />
        </div>
      </section>

      {/*
       * 开始使用：收尾区块。
       *
       * 原来铺的是一整片品牌浅蓝，问题是它跟「核心能力 / 社区声音 / 常见问题」
       * 那几块的浅灰底混在一起看，前一秒是灰、后一秒是蓝，整页的色彩节奏就散了。
       * 改成白底 + 一道从底部中心升上来的极淡品牌光晕：既保住了收尾的仪式感，
       * 又和 Hero 顶部那道同源光晕首尾呼应，而且不占「区块底色」这个位置。
       */}
      <section className="relative overflow-hidden border-t border-fd-border/70 px-6 py-14 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(60%_100%_at_50%_100%,color-mix(in_oklab,var(--cn-brand)_7%,transparent),transparent_70%)]"
        />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
          <SectionHeading
            eyebrow="开始使用"
            title="从下一次 git clone 开始"
            description="克隆仓库、引入依赖，或者先看一眼在线演示。遇到问题时，交流群里有人在。"
          />
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/docs/admin"
              className="rounded-lg bg-[var(--cn-brand)] px-6 py-3 text-sm font-medium text-[var(--cn-brand-on)] transition-colors hover:bg-[var(--cn-brand-strong)]"
            >
              快速上手
            </Link>
            {/* 同上：先到 /demo 说明页，再进演示环境 */}
            <Link
              href="/demo"
              className="rounded-lg border border-fd-border bg-fd-card px-6 py-3 text-sm font-medium transition-colors hover:bg-fd-accent"
            >
              在线演示
            </Link>
            <JoinGroupDialog className="inline-flex items-center gap-2 rounded-lg border border-fd-border bg-fd-card px-6 py-3 text-sm font-medium transition-colors hover:bg-fd-accent" />
          </div>
        </div>
      </section>
    </main>
  );
}
