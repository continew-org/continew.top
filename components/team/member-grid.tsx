import type { TeamMember } from '@/lib/team';
import { TeamMemberCard, type TeamMemberKind } from '@/components/team-member-card';
import { cn } from '@/lib/cn';

/**
 * 稳定的成员网格。
 *
 * 团队页承担「找到维护者」的任务，因此按数据顺序稳定渲染，不在服务端或水合后随机换位。
 * 数据顺序只用于保持查找稳定，不表达成员贡献或荣誉排名。
 */
export function MemberGrid({
  members,
  kind,
  columns = 3,
  className,
}: Readonly<{
  members: TeamMember[];
  kind: TeamMemberKind;
  columns?: 2 | 3 | 4;
  className?: string;
}>) {
  return (
    <div
      className={cn(
        'grid auto-rows-fr gap-4 sm:grid-cols-2',
        columns === 3 && 'lg:grid-cols-3',
        columns === 4 && 'lg:grid-cols-4',
        className,
      )}
    >
      {members.map((member) => (
        <TeamMemberCard key={member.name} member={member} kind={kind} />
      ))}
    </div>
  );
}
