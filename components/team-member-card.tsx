'use client';

import { useEffect, useRef, useState } from 'react';
import { Coffee } from 'lucide-react';
import type { TeamMember } from '@/lib/team';
import { AfdianIcon, AtomGitIcon, GiteeIcon, GitHubIcon } from '@/components/brand-icons';
import { ActionLink, Button } from '@/components/site-actions';
import { useBackdropDismiss } from '@/components/use-dialog-events';
import { siteType } from '@/lib/site-design';
import { cn } from '@/lib/cn';

export type TeamMemberKind = 'core' | 'resonator' | 'emeritus';

const kindLabel: Record<TeamMemberKind, string> = {
  core: '核心团队成员',
  resonator: '社区共鸣者',
  emeritus: '名誉核心团队成员',
};

function SponsorDialog({ member, onClose }: Readonly<{ member: TeamMember; onClose: () => void }>) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    ref.current?.showModal();
  }, []);
  useBackdropDismiss(ref, () => ref.current?.close());

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-label={member.sponsorTitle ?? '赞赏支持'}
      // Preflight 重置了原生 dialog 的 margin，必须显式恢复居中。
      className="m-auto max-h-[90vh] w-[calc(100%_-_2rem)] max-w-xl overflow-y-auto rounded-2xl bg-fd-background p-6 shadow-2xl backdrop:bg-black/60"
    >
      <h3 className={cn('text-center', siteType.cardTitle)}>{member.sponsorTitle ?? '赞赏支持'}</h3>
      {/* 小程序码需要足够的识别尺寸，不能为适应双列而缩小。 */}
      <div className="mt-5 flex flex-col items-center justify-center gap-5 sm:flex-row sm:items-start">
        {member.sponsorPics?.map((pic) => (
          <div key={pic.src} className="flex flex-col items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pic.src}
              alt={`${member.name} 的${pic.label}赞赏码`}
              className="w-48 rounded-lg border border-fd-border sm:w-56"
            />
            <span className="text-xs font-medium leading-5 text-fd-muted-foreground">{pic.label}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-sm leading-6 text-fd-muted-foreground">
        用另一台设备扫码，或保存图片后在应用内识别
      </p>
      <Button onClick={() => ref.current?.close()} className="mt-6 w-full">关闭</Button>
    </dialog>
  );
}

function socialLinks(member: TeamMember) {
  const socials = member.socials;
  if (!socials) return null;
  const items = [
    socials.github && {
      label: 'GitHub',
      href: `https://github.com/${socials.github}`,
      icon: <GitHubIcon className="size-4" aria-hidden />,
    },
    socials.gitee && {
      label: 'Gitee',
      href: `https://gitee.com/${socials.gitee}`,
      icon: <GiteeIcon className="size-4" aria-hidden />,
    },
    socials.atomgit && {
      label: 'AtomGit',
      href: `https://atomgit.com/${socials.atomgit}`,
      icon: <AtomGitIcon className="size-4" aria-hidden />,
    },
  ].filter(Boolean) as Array<{ label: string; href: string; icon: React.ReactNode }>;

  if (items.length === 0) return null;
  return (
    <div className="flex items-center gap-1">
      {items.map((item) => (
        <ActionLink
          key={item.label}
          href={item.href}
          variant="ghost"
          size="icon"
          icon={false}
          aria-label={`${member.name} 的 ${item.label}（在新窗口打开）`}
        >
          {item.icon}
        </ActionLink>
      ))}
    </div>
  );
}

export function TeamMemberCard({ member, kind }: Readonly<{ member: TeamMember; kind: TeamMemberKind }>) {
  const [showSponsor, setShowSponsor] = useState(false);
  const socials = socialLinks(member);
  const hasActions = Boolean(socials || member.sponsor || member.afdian);

  return (
    <div className="flex h-full flex-col rounded-xl border border-fd-border bg-fd-card p-5">
      <div className="flex items-start gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={member.avatarPic}
          alt={member.name}
          loading="lazy"
          className="size-14 shrink-0 rounded-full border border-fd-border object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={siteType.cardTitle}>{member.name}</h3>
            {member.featured && (
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                Creator
              </span>
            )}
          </div>
          <p className="mt-1 text-sm leading-6 text-fd-foreground/75">{kindLabel[kind]}</p>
          {!member.featured && <p className="mt-1 text-sm leading-6 text-fd-muted-foreground">{member.title}</p>}
          {member.motto && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-fd-muted-foreground">{member.motto}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-3 text-sm leading-6 text-fd-muted-foreground">
        {member.projects && member.projects.length > 0 && (
          <div>
            <p className="font-medium text-fd-foreground/70">参与范围</p>
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1.5">
              {member.projects.map((project) => (
                <ActionLink key={project.label} href={project.url} variant="text">{project.label}</ActionLink>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {member.location && <span>{member.location}</span>}
          {member.website && <ActionLink href={member.website.url} variant="text">{member.website.label}</ActionLink>}
        </div>
      </div>

      {hasActions && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-fd-border pt-3">
          {socials}
          <div className="flex flex-wrap items-center gap-2">
            {member.sponsor && (
              <Button onClick={() => setShowSponsor(true)}>
                <Coffee className="size-4" aria-hidden />
                {member.sponsorText ?? '赞赏'}
              </Button>
            )}
            {member.afdian && (
              <ActionLink href={member.afdian} aria-label={`在爱发电按月支持 ${member.name}（在新窗口打开）`}>
                <AfdianIcon className="size-4 text-amber-700 dark:text-amber-300" aria-hidden />
                爱发电
              </ActionLink>
            )}
          </div>
        </div>
      )}
      {showSponsor && <SponsorDialog member={member} onClose={() => setShowSponsor(false)} />}
    </div>
  );
}
