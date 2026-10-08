'use client';

import { useEffect, useRef, useState } from 'react';
import type { TeamMember } from '@/lib/team';
import { AtomGitIcon, GiteeIcon, GitHubIcon } from '@/components/brand-icons';
import { cardHover } from '@/components/site-primitives';
import { cn } from '@/lib/cn';

/**
 * 成员卡片赞赏弹层：展示成员的微信/支付宝赞赏码。
 *
 * 用原生 `<dialog>` + `showModal()`，而不是 `div[role="dialog"]` 手写模拟：
 * 后者要自己实现 Esc 关闭、焦点陷阱（Tab 不能跑到背景内容里）、关闭后焦点归还、
 * 背景 inert 与滚动锁定，手写极易漏项；这些恰恰是浏览器原生模态已经做好的。
 */
function SponsorDialog({ member, onClose }: { member: TeamMember; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-label={member.sponsorTitle ?? '赞赏支持'}
      // dialog 元素自身的点击区域即遮罩层，命中它就关闭（内容区点击不冒泡到此处）
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      /*
       * Tailwind v4 的 preflight 里有 `*, ::backdrop { margin: 0 }` 全局重置，
       * 会盖掉原生 dialog 居中所需的 `margin: auto`，弹层会贴到左上角——故显式加 m-auto。
       */
      className="m-auto w-full max-w-md rounded-2xl bg-fd-background p-6 shadow-2xl backdrop:bg-black/60"
    >
      <h3 className="text-center font-semibold">{member.sponsorTitle ?? '赞赏支持'}</h3>
      <div className="mt-5 flex justify-center gap-4">
        {member.sponsorPics?.map((src) => (
          // 赞赏码是本地静态资源，静态导出下不经过图片优化，用原生 img 即可；
          // 显式给 alt，屏幕阅读器能知道这是谁的赞赏码。
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt={`${member.name} 的赞赏码`}
            className="h-48 w-auto rounded-lg border border-fd-border"
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="mt-6 w-full rounded-lg border border-fd-border py-2 text-sm font-medium transition-colors hover:bg-fd-accent"
      >
        关闭
      </button>
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
      icon: <GitHubIcon className="size-4" />,
    },
    socials.gitee && {
      label: 'Gitee',
      href: `https://gitee.com/${socials.gitee}`,
      icon: <GiteeIcon className="size-4" />,
    },
    socials.atomgit && {
      label: 'AtomGit',
      href: `https://atomgit.com/${socials.atomgit}`,
      icon: <AtomGitIcon className="size-4" />,
    },
  ].filter(Boolean) as Array<{ label: string; href: string; icon: React.ReactNode }>;

  if (items.length === 0) return null;
  return (
    <div className="flex items-center gap-2">
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${member.name} 的 ${item.label}`}
          className="text-fd-muted-foreground transition-colors hover:text-fd-foreground"
        >
          {item.icon}
        </a>
      ))}
    </div>
  );
}

export function TeamMemberCard({ member }: { member: TeamMember }) {
  const [showSponsor, setShowSponsor] = useState(false);

  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-xl border border-fd-border p-5',
        cardHover,
      )}
    >
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
            <h3 className="font-semibold">{member.name}</h3>
            {/*
              职称默认用中性色：成员卡片量大，若每人都挂主色 pill 会超出色彩预算。
              仅 Creator（数据里 featured: true）用主色，让创建者在列表里一眼可辨。
            */}
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                /*
                  Creator 的职称徽章走琥珀金：全站唯一一位，值得一点「尊贵感」，
                  也与主色区分开（主色留给交互态，避免误以为可点击）。
                  其余成员走中性色——卡片量大，每人都挂彩色会超出色彩预算。
                */
                member.featured
                  ? 'border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'border border-fd-border bg-fd-muted text-fd-muted-foreground',
              )}
            >
              {member.title}
            </span>
          </div>
          {member.motto && (
            <p className="mt-1 line-clamp-2 text-xs text-fd-muted-foreground">{member.motto}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-1.5 text-xs text-fd-muted-foreground">
        {member.projects?.map((p) => (
          <a
            key={p.label}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit hover:text-fd-primary hover:underline"
          >
            {p.label}
          </a>
        ))}
        {member.location && <span>{member.location}</span>}
        {member.website && (
          <a
            href={member.website.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit hover:text-fd-primary hover:underline"
          >
            {member.website.label}
          </a>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-fd-border pt-3">
        {socialLinks(member)}
        {member.sponsor && (
          <button
            type="button"
            onClick={() => setShowSponsor(true)}
            className="rounded-full bg-pink-500/10 px-3 py-1 text-xs font-medium text-pink-600 transition-opacity hover:opacity-80 dark:text-pink-400"
          >
            {member.sponsorText ?? '赞赏'}
          </button>
        )}
      </div>

      {showSponsor && <SponsorDialog member={member} onClose={() => setShowSponsor(false)} />}
    </div>
  );
}
