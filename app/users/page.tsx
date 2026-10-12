import type { Metadata } from 'next';
import {
  Check,
  ClipboardCheck,
  FileText,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import { Faq } from '@/components/home/faq';
import { PageContainer, PageIntro, PageNextLinks, Section } from '@/components/site-primitives';
import { ActionLink } from '@/components/site-actions';
import { UserDirectory } from '@/components/user-directory';
import { UserRegistrationActions } from '@/components/user-registration-actions';
import { registerUrl } from '@/lib/shared';
import { getCityCount, getTopCities, getUsers } from '@/lib/users';

export const metadata: Metadata = {
  title: '谁在使用',
  description: '查看正在使用 ContiNew 系列项目的组织、团队与项目，或提交公开登记。',
};

const registrationSteps = [
  {
    title: '准备公开资料',
    description: '确认展示名称、使用项目与使用场景，可选提供地区、官网和 Logo。',
    icon: FileText,
  },
  {
    title: '提交登记信息',
    description: '复制页面提供的模板，在 GitHub 固定登记帖中公开提交。',
    icon: ClipboardCheck,
  },
  {
    title: '人工核验展示',
    description: '维护者核对公开信息后更新名单；资料变化时可申请修改或撤下。',
    icon: ShieldCheck,
  },
] as const;

const registrationFaqs = [
  {
    question: '谁可以登记？',
    answer:
      '正在实际使用任一 ContiNew 项目的公司、团队、学校、开源项目或个人都可以登记。请只提交你有权公开的信息。',
  },
  {
    question: '哪些信息会公开展示？',
    answer:
      '官网只展示你主动提交并确认公开的字段。联系方式、测试账号、业务数据等敏感信息不应提交，也不会收录。',
  },
  {
    question: '提交后多久会出现在官网？',
    answer:
      '登记由维护者人工核验，并在后续站点更新时发布，因此没有固定上线时限。资料完整、链接可访问会更便于核对。',
  },
  {
    question: '如何修改或撤下登记？',
    answer:
      '在登记帖中留言说明需要修改或撤下的内容。维护者核对原登记身份与公开记录后，会在后续更新中处理。',
  },
];

export default function UsersPage() {
  const users = getUsers();
  const cityCount = getCityCount();
  const topCities = getTopCities();

  return (
    <PageContainer>
      <header className="relative grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
        <PageIntro
          className="cn-stagger"
          eyebrow="真实使用"
          title="谁在使用 ContiNew"
          description="来自公司、团队、学校与开源项目的真实公开登记。先看看谁正在使用，也欢迎公开分享你的实践。"
          actions={
            <>
              <ActionLink href="#register" variant="primary">登记你的使用信息</ActionLink>
              <ActionLink href="#directory">查看使用者</ActionLink>
            </>
          }
        />

        <aside className="rounded-2xl border border-fd-border bg-fd-card/90 p-6 shadow-sm sm:p-7">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--cn-brand-soft)] text-[var(--cn-brand)]">
              <UsersRound className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="font-semibold">公开使用名单</h2>
              <p className="mt-0.5 text-xs text-fd-muted-foreground">由社区主动提交并持续维护</p>
            </div>
          </div>
          <dl className="mt-6 grid grid-cols-2 divide-x divide-fd-border border-y border-fd-border/70 py-5 text-center">
            <div className="flex flex-col-reverse">
              <dt className="mt-1 text-xs text-fd-muted-foreground">已登记使用者</dt>
              <dd className="text-3xl font-semibold tracking-tight tabular-nums">{users.length}</dd>
            </div>
            <div className="flex flex-col-reverse">
              <dt className="mt-1 text-xs text-fd-muted-foreground">已覆盖城市</dt>
              <dd className="text-3xl font-semibold tracking-tight tabular-nums">{cityCount}</dd>
            </div>
          </dl>
          <ul className="mt-5 space-y-3 text-sm text-fd-muted-foreground">
            {['登记内容公开提交', '维护团队人工核验', '支持申请更新或撤下'].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <Check className="size-4 shrink-0 text-[var(--cn-brand)]" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </aside>
      </header>

      <Section
        id="directory"
        className="scroll-mt-24"
        title="谁在使用"
        description="按登记时间倒序展示。可按名称、地区或网址搜索，也可筛选热门城市。"
        action={
          <span className="rounded-full border border-fd-border bg-fd-card px-3 py-1 text-xs text-fd-muted-foreground">
            共 {users.length} 个
          </span>
        }
      >
        <UserDirectory users={users} topCities={topCities} registerUrl={registerUrl} />
      </Section>

      <Section
        id="register"
        className="scroll-mt-24"
        title="如何登记"
        description="登记免费且公开。先确认准备展示的信息，再前往 GitHub 固定登记帖提交。"
      >
        <ol className="grid border-y border-fd-border/70 sm:grid-cols-3 sm:divide-x sm:divide-fd-border">
          {registrationSteps.map(({ title, description, icon: Icon }, index) => (
            <li key={title} className="flex gap-4 border-b border-fd-border/70 py-5 last:border-b-0 sm:border-b-0 sm:px-5 sm:first:pl-0 sm:last:pr-0">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--cn-brand-soft)] text-[var(--cn-brand)]">
                <Icon className="size-4" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-medium text-fd-muted-foreground">第 {index + 1} 步</p>
                <h3 className="mt-1 font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-fd-muted-foreground">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:gap-10">
          <div>
            <h3 className="text-base font-semibold leading-6">登记模板</h3>
            <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground">
              复制模板并按提示填写。带“选填”的字段可以省略，未提供的信息不会被推断补齐。
            </p>
            <div className="mt-5">
              <UserRegistrationActions registerUrl={registerUrl} />
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-fd-border bg-fd-muted/35 p-6">
            <h3 className="font-semibold">公开与维护说明</h3>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-fd-muted-foreground">
              <li className="flex gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-[var(--cn-brand)]" aria-hidden />
                只展示你主动提交并确认公开的信息。
              </li>
              <li className="flex gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-[var(--cn-brand)]" aria-hidden />
                不要提交联系方式、账号密码或未脱敏业务数据。
              </li>
              <li className="flex gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-[var(--cn-brand)]" aria-hidden />
                信息变化后，可在登记帖申请修改或撤下。
              </li>
            </ul>
            <p className="mt-5 border-t border-fd-border pt-5 text-xs leading-relaxed text-fd-muted-foreground">
              公开登记只表示正在使用，不代表 ContiNew 与登记主体存在商业合作、认证或相互背书关系。
            </p>
          </aside>
        </div>
      </Section>

      <Section title="登记常见问题">
        <Faq items={registrationFaqs} className="max-w-none" />
      </Section>

      <PageNextLinks
        links={[
          {
            href: '/docs/admin',
            title: '快速开始',
            description: '还没用上？从 ContiNew Admin 的文档开始，十分钟跑起来。',
          },
          {
            href: '/sponsor',
            title: '支持 ContiNew',
            description: '以个人、资源或企业合作的方式进入支持者名录。',
          },
        ]}
      />
    </PageContainer>
  );
}
