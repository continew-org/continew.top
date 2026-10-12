import {
  BookOpenText,
  Code2,
  MessageCircleMore,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react';
import { JoinGroupDialog } from '@/components/home/join-group-dialog';
import { ActionLink } from '@/components/site-actions';
import { gitConfig } from '@/lib/shared';

const projects = [
  { name: 'Admin', repo: 'continew-admin' },
  { name: 'Admin UI', repo: 'continew-admin-ui' },
  { name: 'Starter', repo: 'continew-starter' },
  { name: 'App', repo: 'continew-app' },
  { name: '官网', repo: 'continew.top' },
] as const;

const docsProjects = [
  { name: 'Admin / Admin UI', repo: 'continew-admin' },
  { name: 'Starter', repo: 'continew-starter' },
  { name: 'App', repo: 'continew-app' },
] as const;

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <ActionLink href={href} variant="ghost">{children}</ActionLink>;
}

function PathCard({
  icon: Icon,
  title,
  description,
  children,
  tone = 'brand',
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
  tone?: 'brand' | 'teal' | 'amber' | 'red';
}) {
  const toneClass = {
    brand: 'bg-[var(--cn-brand-soft)] text-[var(--cn-brand)]',
    teal: 'bg-teal-500/10 text-teal-700 dark:text-teal-300',
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    red: 'bg-red-500/10 text-red-700 dark:text-red-300',
  }[tone];

  return (
    <article className="flex h-full flex-col rounded-2xl border border-fd-border bg-fd-card p-5 sm:p-6">
      <span className={`flex size-10 items-center justify-center rounded-xl ${toneClass}`}>
        <Icon className="size-5" aria-hidden />
      </span>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground">{description}</p>
      <div className="mt-5 flex flex-1 flex-wrap content-end items-end gap-1">{children}</div>
    </article>
  );
}

export function ContributionPaths() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <PathCard
        icon={Code2}
        title="代码与测试"
        description="修复问题、补充测试或提交功能改进。较大的修改，请先到对应项目提交 Issue 对齐方案。"
      >
        {projects.map((project) => (
          <ExternalLink
            key={project.repo}
            href={`https://github.com/${gitConfig.user}/${project.repo}/issues/new/choose`}
          >
            {project.name}
          </ExternalLink>
        ))}
      </PathCard>

      <PathCard
        icon={BookOpenText}
        title="文档与内容"
        description="纠正文档、补充示例或分享实践。项目文档在各自仓库的 docs 目录维护，官网只负责汇聚展示。"
        tone="teal"
      >
        {docsProjects.map((project) => (
          <ExternalLink
            key={project.repo}
            href={`https://github.com/${gitConfig.user}/${project.repo}/tree/dev/docs`}
          >
            {project.name} 文档
          </ExternalLink>
        ))}
        <ExternalLink href={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/main/CONTRIBUTING.md`}>
          官网贡献指南
        </ExternalLink>
      </PathCard>

      <PathCard
        icon={MessageCircleMore}
        title="交流、反馈与传播"
        description="分享真实使用体验、参与功能讨论、帮助其他开发者，或把有价值的实践讲给更多人。"
        tone="amber"
      >
        <JoinGroupDialog />
        <ExternalLink href={`https://github.com/${gitConfig.user}`}>浏览 GitHub 组织</ExternalLink>
      </PathCard>

      <PathCard
        icon={ShieldAlert}
        title="安全问题"
        description="请勿在公开 Issue、Pull Request 或讨论区披露漏洞。请前往受影响项目的 Security Advisories 私下报告。"
        tone="red"
      >
        {projects.map((project) => (
          <ExternalLink
            key={project.repo}
            href={`https://github.com/${gitConfig.user}/${project.repo}/security/advisories/new`}
          >
            {project.name}
          </ExternalLink>
        ))}
      </PathCard>
    </div>
  );
}
