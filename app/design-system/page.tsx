import type { Metadata } from 'next';
import Link from 'next/link';
import { PageContainer, PageHeader, Section, cardHover } from '@/components/site-primitives';
import { DesignSystemExamples } from '@/components/design-system-examples';
import { cn } from '@/lib/cn';
import { focusRing, siteType } from '@/lib/site-design';

export const metadata: Metadata = {
  title: '设计系统样例',
  description: '供贡献者验收 ContiNew 官网页面、控件与动效的固定样例。',
  robots: { index: false, follow: false },
};

export default function DesignSystemPage() {
  return (
    <PageContainer>
      <PageHeader
        variant="editorial"
        title="设计系统样例"
        description="这里直接使用官网的公共组件。修改布局、排版或交互后，用同一组内容检查深浅主题、移动端与键盘状态。"
      />
      <Section title="排版层级" description="正文表达信息，辅助文字只承载日期、状态等次要内容。">
        <div className="max-w-2xl space-y-4">
          <h3 className={siteType.cardTitle}>卡片标题：持续迭代，持续舒适</h3>
          <p className={siteType.body}>正文：ContiNew 面向开发者提供开箱即用的工程实践。长篇内容保留适合阅读的列宽，不因页面外壳变宽而拉长每一行。</p>
          <p className={siteType.compact}>紧凑说明：用于名录简介、区块描述和任务提示。</p>
          <p className={cn(siteType.meta, 'text-fd-muted-foreground')}>辅助信息：2026-10-12 · 示例状态</p>
        </div>
      </Section>
      <Section title="行动与状态" description="用 Tab 检查焦点，用 Enter 或空格操作按钮；导航、外链和筛选分别保持自己的语义。">
        <DesignSystemExamples />
      </Section>
      <Section title="卡片反馈" description="只有整卡可点击时才提供整卡 hover。纯信息卡保留安静的展示状态。">
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/team" className={cn('rounded-xl border border-fd-border p-6', cardHover, focusRing)}>
            <h3 className={siteType.cardTitle}>认识社区团队</h3>
            <p className={cn('mt-2 text-fd-muted-foreground', siteType.compact)}>可点击卡片，导航到团队页面。</p>
          </Link>
          <div className="rounded-xl border border-fd-border p-6">
            <h3 className={siteType.cardTitle}>持续维护</h3>
            <p className={cn('mt-2 text-fd-muted-foreground', siteType.compact)}>纯信息卡，不暗示整卡可以点击。</p>
          </div>
        </div>
      </Section>
      <Section id="motion" title="动效与降级" className="scroll-mt-24" description="系统偏好减弱动态效果时，装饰性位移停止，内容保持可读。">
        <div className="cn-reveal max-w-2xl rounded-xl border border-fd-border p-6">
          <h3 className={siteType.cardTitle}>滚动入场样例</h3>
          <p className={cn('mt-2 text-fd-muted-foreground', siteType.compact)}>不支持滚动驱动动画的浏览器显示静态内容。验收动效需要实际滚动，不能只看一张截图。</p>
        </div>
      </Section>
    </PageContainer>
  );
}
