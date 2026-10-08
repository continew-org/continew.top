import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { getCityCount, getTopCities, getUsers } from '@/lib/users';
import { UserDirectory } from '@/components/user-directory';
import { gitConfig } from '@/lib/shared';
import { PageContainer, PageHeader, PageNextLinks, Section } from '@/components/site-primitives';

export const metadata: Metadata = {
  title: '登记用户',
  description: '正在使用 ContiNew 系列项目的公司与团队。',
};

/**
 * 登记入口：社区统一的登记帖（ContiNew Admin 仓库 Issue），无需额外后台。
 * 指向固定 Issue 而非 issues 列表页 —— 列表页要访客自己想怎么填，固定帖里有统一格式。
 */
const registerUrl = `https://github.com/${gitConfig.user}/continew-admin/issues/83`;

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
        description={`目前已有 ${users.length} 家公司与团队登记，覆盖 ${getCityCount()} 个城市。如果你的公司或团队也在用，欢迎登记入驻——这是对我们最直接的认可。`}
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
