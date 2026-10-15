import type { TeamMember } from '@/lib/team';
import { TeamMemberCard, type TeamMemberKind } from '@/components/team-member-card';
import { siteGrid } from '@/lib/site-design';
import { cn } from '@/lib/cn';

/**
 * 稳定的成员网格。
 *
 * 团队页承担「找到维护者」的任务，因此按数据顺序稳定渲染，不在服务端或水合后随机换位。
 * 数据顺序只用于保持查找稳定，不表达成员贡献或荣誉排名。
 *
 * 列数只有两档，都取自 `siteGrid`：3 列用于平铺名录，2 列用于 2 人小组或分组左栏的右区。
 * 不在调用处另写列数——那正是核心成员卡被拉宽到 544px 的原因。
 */
export function MemberGrid({
  members,
  kind,
  columns = 3,
  className,
}: Readonly<{
  members: TeamMember[];
  kind: TeamMemberKind;
  columns?: 2 | 3;
  className?: string;
}>) {
  return (
    <div className={cn(columns === 2 ? siteGrid.pair : siteGrid.directory, className)}>
      {members.map((member) => (
        <TeamMemberCard key={member.name} member={member} kind={kind} />
      ))}
    </div>
  );
}
