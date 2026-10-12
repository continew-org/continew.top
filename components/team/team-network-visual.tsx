import Image from 'next/image';
import type { TeamMember } from '@/lib/team';
import { cn } from '@/lib/cn';

function AvatarStack({
  members,
  align = 'left',
}: {
  members: TeamMember[];
  align?: 'left' | 'right';
}) {
  return (
    <div className={cn('flex -space-x-2', align === 'right' && 'justify-end')} aria-hidden>
      {members.slice(0, 4).map((member) => (
        // 外链头像不经过 Next 图片优化；固定尺寸与背景确保远端图片延迟时结构不跳动
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={member.name}
          src={member.avatarPic}
          alt=""
          className="size-8 rounded-full border-2 border-fd-background bg-fd-muted object-cover sm:size-9"
        />
      ))}
      {members.length > 4 && (
        <span className="flex size-8 items-center justify-center rounded-full border-2 border-fd-background bg-fd-muted text-xs font-medium text-fd-muted-foreground sm:size-9">
          +{members.length - 4}
        </span>
      )}
    </div>
  );
}

export function TeamNetworkVisual({
  core,
  resonators,
  emeriti,
}: {
  core: TeamMember[];
  resonators: TeamMember[];
  emeriti: TeamMember[];
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-fd-border/80 bg-fd-background/80 p-5 shadow-sm backdrop-blur sm:p-6">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,color-mix(in_oklab,var(--cn-brand)_12%,transparent),transparent_48%)]"
      />
      <svg
        aria-hidden
        viewBox="0 0 460 250"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 size-full text-[var(--cn-brand)] opacity-45"
      >
        <path d="M230 125 C185 125 176 62 112 62" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M230 125 C278 125 288 66 350 66" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M230 125 C230 168 230 181 230 214" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".55" />
        <circle cx="230" cy="125" r="4" fill="currentColor" />
        <circle cx="112" cy="62" r="3" fill="currentColor" opacity=".72" />
        <circle cx="350" cy="66" r="3" fill="currentColor" opacity=".72" />
        <circle cx="230" cy="214" r="3" fill="currentColor" opacity=".55" />
      </svg>

      <div className="relative grid min-h-64 grid-cols-2 grid-rows-[1fr_auto_1fr] gap-x-6 gap-y-5">
        <div className="self-start">
          <p className="text-xs font-medium text-fd-foreground">核心团队</p>
          <p className="mt-1 text-xs leading-5 text-fd-muted-foreground">持续维护</p>
          <div className="mt-3">
            <AvatarStack members={core} />
          </div>
        </div>

        <div className="self-start text-right">
          <p className="text-xs font-medium text-fd-foreground">社区共鸣者</p>
          <p className="mt-1 text-xs leading-5 text-fd-muted-foreground">积极协作</p>
          <div className="mt-3">
            <AvatarStack members={resonators} align="right" />
          </div>
        </div>

        <div className="col-span-2 flex justify-center">
          <div className="flex items-center gap-2 rounded-xl border border-[var(--cn-brand-line)] bg-fd-background px-4 py-2.5 shadow-sm">
            <Image src="/logo.svg" alt="" width={24} height={24} aria-hidden />
            <span className="text-sm font-semibold">ContiNew</span>
          </div>
        </div>

        <div className="col-span-2 self-end border-t border-fd-border/70 pt-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-fd-foreground">名誉核心团队成员</p>
              <p className="mt-1 text-xs leading-5 text-fd-muted-foreground">重要的历史贡献</p>
            </div>
            <AvatarStack members={emeriti} align="right" />
          </div>
        </div>
      </div>
    </div>
  );
}
