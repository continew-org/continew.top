import { Handshake, Heart, Server, type LucideIcon } from 'lucide-react';
import { CompanionCard } from '@/components/sponsor/companion-card';
import type { Companion, TierKey } from '@/lib/sponsors';
import { cn } from '@/lib/cn';

const initialCount = 12;
const gridClass =
  'grid auto-rows-fr items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(230px,1fr))]';

const groups: Array<{
  key: TierKey;
  label: string;
  description: string;
  icon: LucideIcon;
  iconClass: string;
  countClass: string;
}> = [
  {
    key: 'strategic',
    label: '开源合作伙伴',
    description: '以持续资金支持项目维护与发展',
    icon: Handshake,
    iconClass: 'text-[var(--cn-brand)]',
    countClass: 'bg-[var(--cn-brand-soft)] text-[var(--cn-brand)]',
  },
  {
    key: 'infrastructure',
    label: '资源合作伙伴',
    description: '按实际支持过的需求记录，当前与历史同样保留',
    icon: Server,
    iconClass: 'text-teal-600 dark:text-teal-400',
    countClass: 'bg-teal-500/10 text-teal-700 dark:text-teal-300',
  },
  {
    key: 'supporter',
    label: '个人支持者',
    description: '每一位支持者都会保留在支持者名录中',
    icon: Heart,
    iconClass: 'text-amber-600 dark:text-amber-400',
    countClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  },
];

function getPrimaryRelation(companion: Companion): TierKey {
  if (companion.relations.includes('strategic')) return 'strategic';
  if (companion.relations.includes('infrastructure')) return 'infrastructure';
  return 'supporter';
}

function CompanionGroup({
  companions,
  label,
  description,
  icon: Icon,
  iconClass,
  countClass,
}: {
  companions: Companion[];
  label: string;
  description: string;
  icon: LucideIcon;
  iconClass: string;
  countClass: string;
}) {
  const visible = companions.slice(0, initialCount);
  const remaining = companions.slice(initialCount);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1">
        <Icon className={cn('size-4', iconClass)} aria-hidden />
        <h3 className="text-sm font-semibold text-fd-foreground">{label}</h3>
        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', countClass)}>
          {companions.length} 位
        </span>
        <p className="w-full text-xs text-fd-muted-foreground sm:ml-6 sm:w-auto">
          {description}
        </p>
      </div>

      <div className={gridClass}>
        {visible.map((companion) => (
          <CompanionCard key={companion.name} companion={companion} />
        ))}
      </div>

      {remaining.length > 0 && (
        <details className="group mt-4">
          <summary className="mx-auto flex w-fit cursor-pointer list-none items-center rounded-full border border-fd-border bg-fd-card px-4 py-2 text-xs font-medium text-fd-muted-foreground transition-colors hover:border-[var(--cn-brand-line)] hover:text-fd-foreground [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">查看本组全部 {companions.length} 位</span>
            <span className="hidden group-open:inline">收起较早记录</span>
          </summary>
          <div className={`${gridClass} mt-3`}>
            {remaining.map((companion) => (
              <CompanionCard key={companion.name} companion={companion} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

/** 支持者名录按关系分组；关系只表达支持方式，不表示金额或荣誉高低。 */
export function CompanionDirectory({ companions }: { companions: Companion[] }) {
  return (
    <div className="space-y-8">
      {groups.map(({ key, ...group }) => {
        const entries = companions.filter(
          (companion) => getPrimaryRelation(companion) === key,
        );
        if (entries.length === 0) return null;
        return <CompanionGroup key={key} companions={entries} {...group} />;
      })}
    </div>
  );
}
