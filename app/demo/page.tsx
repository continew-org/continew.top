import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, ExternalLink, Server } from 'lucide-react';
import { getCurrentResourcePartners } from '@/lib/sponsors';
import { demoUrl } from '@/lib/shared';
import {
  PageContainer,
  PageHeader,
  PageNextLinks,
  Section,
} from '@/components/site-primitives';
import { cn } from '@/lib/cn';

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
        eyebrow="Live Demo"
        title="在线演示"
        description="无需安装，直接体验 ContiNew Admin 的完整界面与内置功能。进入前请先花一分钟看完下面的注意事项。"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--cn-brand)] px-5 py-2.5 text-sm font-medium text-[var(--cn-brand-on)] transition-colors hover:bg-[var(--cn-brand-strong)]"
            >
              前往演示环境 <ExternalLink className="size-4" aria-hidden />
            </a>
            <Link
              href="/docs/admin"
              className="inline-flex items-center gap-2 rounded-lg border border-fd-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-accent"
            >
              本地部署指南 <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
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
            <li key={notice} className="flex gap-2.5 text-sm leading-relaxed">
              <AlertTriangle
                className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-500"
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-fd-border p-5">
            <h3 className="text-sm font-medium text-fd-muted-foreground">地址</h3>
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-base font-medium text-[var(--cn-brand)] hover:underline"
            >
              {demoUrl.replace(/^https?:\/\//, '')}
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </div>
          <div className="rounded-xl border border-fd-border p-5">
            <h3 className="text-sm font-medium text-fd-muted-foreground">系统管理员</h3>
            <p className="mt-2 text-base">
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
              <span className="text-sm font-medium">当前在用环境</span>
              <span className="rounded bg-teal-600/10 px-1.5 py-0.5 text-xs font-medium text-teal-700 dark:text-teal-400">
                在用
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-fd-muted-foreground">
              {currentEnv.env}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <span className="text-fd-muted-foreground">
                配置
                <span className="ml-1.5 font-medium tabular-nums text-fd-foreground">
                  {currentEnv.spec}
                </span>
              </span>
              <span className="text-fd-muted-foreground">
                提供者
                {currentEnv.url ? (
                  <a
                    href={currentEnv.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1.5 font-medium text-[var(--cn-brand)] hover:underline"
                  >
                    {currentEnv.name}
                  </a>
                ) : (
                  <span className="ml-1.5 font-medium text-fd-foreground">
                    {currentEnv.name}
                  </span>
                )}
              </span>
            </div>
          </div>
          <p className="mt-4 text-xs text-fd-muted-foreground">
            这套环境是社区和赞助商一台台撑起来的，
            <Link
              href="/sponsor"
              className="ml-1 font-medium text-[var(--cn-brand)] hover:underline"
            >
              查看完整的服务器支持历程 →
            </Link>
          </p>
        </Section>
      )}

      <PageNextLinks
        links={[
          {
            href: '/docs/admin',
            title: '快速开始',
            description: '在本机跑起 ContiNew Admin，完整体验不受限制的功能。',
          },
          {
            href: '/sponsor',
            title: '成为赞助者',
            description: '演示环境的服务器来自社区支持，了解如何参与。',
          },
        ]}
      />
    </PageContainer>
  );
}
