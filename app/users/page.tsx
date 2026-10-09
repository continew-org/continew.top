import type { Metadata } from 'next';
import { ArrowRight, Check } from 'lucide-react';
import { getCityCount, getTopCities, getUsers } from '@/lib/users';
import { UserDirectory } from '@/components/user-directory';
import { registerUrl } from '@/lib/shared';
import { PageContainer, PageHeader, PageNextLinks, Section } from '@/components/site-primitives';

export const metadata: Metadata = {
  title: '登记用户',
  description: '正在使用 ContiNew 系列项目的公司与团队。',
};

/**
 * 登记权益。文案取自旧站的登记引导，每条压到一句话。
 *
 * 用对勾清单而不是卡片：赞助页「您的支持将用于」是同一套读法，
 * 全站两处「承诺 / 用途」保持一致；而且点进这一页的人要的是扫一眼确认，
 * 不是逐张读卡片。标题保留是为了能扫读——纯一句话清单里，四条承诺会糊成一段。
 */
const registerBenefits: Array<{ title: string; description: string }> = [
  {
    title: '无偿登记',
    description:
      '登记完全免费。我们郑重承诺不会在任何阶段收取使用费用，也不会将您的信息用于商业盈利或其他非公开目的。',
  },
  {
    title: '优先支持',
    description: '登记后您将被视为优质用户，维护团队会优先响应您在实际使用过程中遇到的问题。',
  },
  {
    title: '官方认可',
    description: '您有机会在官方网站上获得展示，让更多人了解您的项目或公司。',
  },
  {
    title: '社区贡献',
    description:
      '您的登记会成为后来调研者的可信指标之一，也是我们制定后续版本计划时的重要参考。',
  },
];

export default function UsersPage() {
  const users = getUsers();
  const topCities = getTopCities();

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Who's using"
        title="登记用户"
        /*
         * 首屏统计卡片已移除：21 家企业 / 13 个城市这种量级做成三张大卡，
         * 反而把「规模还不大」摆到台面上（对比 /timeline 那种 5000+ Star 撑得住的数字）。数字降级为描述里的一句话，目录中也有城市计数可查。
         */
        description={`目前已有 ${users.length} 家公司/团队登记，覆盖 ${getCityCount()} 个城市。如果你们也在用 ContiNew 项目，诚邀登记——这是对我们最直接的认可。`}
        actions={
          <a
            href={registerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
          >
            立即登记 <ArrowRight className="size-4" aria-hidden />
          </a>
        }
      />

      {/* 权益排在目录之前：先看「登记能得到什么」，再决定要不要填 */}
      <Section
        title="登记后你能得到什么"
        description="以下四条是我们对每一位登记用户的承诺。"
      >
        <ul className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {registerBenefits.map((benefit) => (
            <li key={benefit.title} className="flex gap-2.5">
              <Check className="mt-0.5 size-4 shrink-0 text-[var(--cn-brand)]" aria-hidden />
              <div className="min-w-0">
                <span className="block text-base font-medium">{benefit.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-fd-muted-foreground">
                  {benefit.description}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="用户目录"
        description="支持按公司名、地区或网址搜索，也可按热门城市筛选。资料完整的登记企业会排在前面。"
      >
        <UserDirectory users={users} topCities={topCities} registerUrl={registerUrl} />
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
            title: '成为赞助者',
            description: '赞助者可在官网获得 Logo 展示位，了解赞助权益。',
          },
        ]}
      />
    </PageContainer>
  );
}
