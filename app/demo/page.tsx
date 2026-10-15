import type { Metadata } from 'next';
import { AlertTriangle, Server } from 'lucide-react';
import { getCurrentResourcePartners } from '@/lib/sponsors';
import { currentDocsUrl, demoUrl } from '@/lib/shared';
import { ActionLink } from '@/components/site-actions';
import {
  PageContainer,
  PageHeader,
  PageNextLinks,
  Section,
} from '@/components/site-primitives';
import { cn } from '@/lib/cn';
import { siteGrid, siteType } from '@/lib/site-design';

export const metadata: Metadata = {
  title: '在线演示',
  description:
    'ContiNew Admin 在线演示环境：体验地址、演示账号，以及进入前需要知道的使用限制与注意事项。',
};

/**
 * 进入演示环境前需要知道的事。
 *
 * 文案取自旧站「在线演示」页的注意事项，按官网语境重写过。
 * 这几条都是**会真实影响使用体验**的限制，不是免责话术：
 * 不加说明的话，用户在演示库里存了数据、发现改不了数据、或者遇到部署期不可用，
 * 都会变成一次没必要的困惑（对双方都是成本）。
 */
const notices: string[] = [
  '演示环境的数据会不定期重置，请不要在其中存放任何重要数据。',
  '演示环境对修改、删除等操作做了限制，需要完整体验请本地部署。',
  '演示环境服务器配置较低，访问人数较多时可能会出现卡顿。',
  'dev 分支代码提交会触发自动重新部署，期间服务可能短暂不可用。',
  '演示环境提供不易，请不要故意破坏线上环境。',
];

export default function DemoPage() {
  // 只取当前在用的服务器资源：完整贡献履历在赞助页，这里不重复铺列
  const currentEnv = getCurrentResourcePartners().find(
    (item) => item.name === '风铃云信息科技',
  ) ?? getCurrentResourcePartners()[0];

  return (
    <PageContainer>
      <PageHeader
        variant="task"
        align="center"
        eyebrow="Live Demo"
        title="在线演示"
        description="无需安装，直接体验 ContiNew Admin 的完整界面与内置功能。进入前请先花一分钟看完下面的注意事项。"
        actions={
          <>
            <ActionLink href={demoUrl} variant="primary">
              前往演示环境
            </ActionLink>
            <ActionLink href={`${currentDocsUrl}/reference/deployment`}>本地部署指南</ActionLink>
          </>
        }
      />

      {/*
        注意事项排在地址之前：这一页的顺序就是「先看限制，再拿地址」。
        把地址放在最上面，多数人会直接跳走，说明页就等于没存在过。
      */}
      <Section
        title="进入前请先看这几条"
        description="这些限制会真实影响你的使用体验，先了解再进入，能少走不少弯路。"
      >
        <ul className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
          {notices.map((notice) => (
            <li key={notice} className={cn('flex gap-2.5', siteType.body)}>
              <AlertTriangle
                className="mt-1.5 size-4 shrink-0 text-amber-600 dark:text-amber-500"
                aria-hidden
              />
              <span className="text-fd-foreground">{notice}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="演示地址与账号"
        description="演示环境基于 dev 分支构建，展示的是最新开发中的功能。"
      >
        {/* 两条都是一行内容，满宽铺开会变成两张空卡；限宽到与名录卡同一口径。 */}
        <div className={siteGrid.pair}>
          <div className="rounded-xl border border-fd-border p-5">
            <h3 className={cn('font-medium text-fd-muted-foreground', siteType.compact)}>地址</h3>
            <ActionLink href={demoUrl} variant="text" className="mt-2 max-w-full">
              <span className="break-all">{demoUrl.replace(/^https?:\/\//, '')}</span>
            </ActionLink>
          </div>
          <div className="rounded-xl border border-fd-border p-5">
            <h3 className={cn('font-medium text-fd-muted-foreground', siteType.compact)}>系统管理员</h3>
            <p className={cn('mt-2', siteType.body)}>
              <code className="rounded bg-fd-muted px-1.5 py-0.5 font-mono text-sm">
                admin
              </code>
              <span className="mx-2 text-fd-muted-foreground">/</span>
              <code className="rounded bg-fd-muted px-1.5 py-0.5 font-mono text-sm">
                admin123
              </code>
            </p>
          </div>
        </div>
      </Section>

      {/*
        服务器来源：只呈现**当前在用环境**，完整的历史名录留在赞助页。

        这两页都读 data/demo-environments.json，但两处都铺完整表格会变成同一张表
        出现两次——读者从演示页点到赞助页会看到一模一样的内容，谁都是多余的那一处。
        按语境分工：
          - 本页读者是「想体验演示环境的人」，只关心现在这套能不能用、谁在支撑；
          - 赞助页读者是「关心社区与赞助的人」，七条历史名录正是给他们看的。
        所以这里给一张当前环境卡 + 一条去赞助页的链接，两处互为上下游。
      */}
      {currentEnv && (
        <Section
          title="环境由谁提供"
          description="演示环境长期在线，离不开社区与赞助商的服务器支持。"
        >
          <div className="rounded-xl border border-fd-border p-5">
            <div className="flex items-center gap-2">
              <Server className="size-4 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
              <span className={cn('font-medium', siteType.compact)}>当前在用环境</span>
              <span className={cn('rounded bg-teal-600/10 px-1.5 py-0.5 font-medium text-teal-700 dark:text-teal-400', siteType.meta)}>
                在用
              </span>
            </div>
            <p className={cn('mt-3 text-fd-muted-foreground', siteType.compact)}>
              {currentEnv.env}
            </p>
            <div className={cn('mt-3 flex flex-wrap items-center gap-x-6 gap-y-2', siteType.compact)}>
              <span className="text-fd-muted-foreground">
                {/* 与值之间用 ml-1.5 留白、不加空格，故与元素同行书写，消除 JSX 空白歧义 */}
                配置<span className="ml-1.5 font-medium tabular-nums text-fd-foreground">
                  {currentEnv.spec}
                </span>
              </span>
              <span className="text-fd-muted-foreground">
                提供者
                {currentEnv.url ? (
                  <ActionLink href={currentEnv.url} variant="text" className="ml-1.5">
                    {currentEnv.name}
                  </ActionLink>
                ) : (
                  <span className="ml-1.5 font-medium text-fd-foreground">
                    {currentEnv.name}
                  </span>
                )}
              </span>
            </div>
          </div>
          <p className={cn('mt-4 text-fd-muted-foreground', siteType.compact)}>
            这套环境是社区和赞助商一台台撑起来的，
            <ActionLink href="/sponsor" variant="text" className="ml-1">
              查看完整的服务器支持历程
            </ActionLink>
          </p>
        </Section>
      )}

      <PageNextLinks
        links={[
          {
            href: currentDocsUrl,
            title: '快速开始',
            description: '在本机跑起 ContiNew Admin，完整体验不受限制的功能。',
          },
          {
            href: '/sponsor',
            title: '支持 ContiNew',
            description: '演示环境由社区伙伴共同支撑，了解如何参与。',
          },
        ]}
      />
    </PageContainer>
  );
}
