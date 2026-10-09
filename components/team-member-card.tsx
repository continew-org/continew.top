'use client';

import { useEffect, useRef, useState } from 'react';
import { Coffee } from 'lucide-react';
import type { TeamMember } from '@/lib/team';
import { AfdianIcon, AtomGitIcon, GiteeIcon, GitHubIcon } from '@/components/brand-icons';
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
      // max-h + overflow-y-auto：手机上两张码纵向排列会超过一屏，允许弹层内部滚动
      className="m-auto max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-fd-background p-6 shadow-2xl backdrop:bg-black/60"
    >
      <h3 className="text-center font-semibold">{member.sponsorTitle ?? '赞赏支持'}</h3>
      {/*
        尺寸不能再小了：赞赏码是小程序码，模块细、中心还有头像，识别裕度本来就低。
        最初 max-w-md + h-48 时，每张图 132px 宽、码本体约 58px——根本扫不出来。
        现在给到 192px（手机）/ 224px（桌面），素材里码占画面 94%，
        所以码本体稳定在 180~210px，扫得上。
      */}
      <div className="mt-5 flex flex-col items-center justify-center gap-5 sm:flex-row sm:items-start">
        {member.sponsorPics?.map((pic) => (
          <div key={pic.src} className="flex flex-col items-center gap-2">
            {/*
              赞赏码是本地静态资源，静态导出下不经过图片优化，用原生 img 即可。

              两张素材在图片层面已经处理成「同尺寸 + 同构图」：都是 720×720、
              码本体居中、占画面 94%、四周各留 3% 静区。这一步必须在素材做，
              不能靠 CSS：微信赞赏码原图里码只占 70% 宽、支付宝占 85%，
              外面那圈是海报留白——样式上给一样的尺寸，码本体还是会一大一小。
              这里因此只给宽度、高度自适应，两图必然严格对齐。
            */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pic.src}
              alt={`${member.name} 的${pic.label}赞赏码`}
              className="w-48 rounded-lg border border-fd-border sm:w-56"
            />
            {/* 平台名必须在图上：码裁成纯白卡片后，两张图本身分不出微信和支付宝 */}
            <span className="text-xs font-medium text-fd-muted-foreground">{pic.label}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-fd-muted-foreground">
        用另一台设备扫码，或保存图片后在应用内识别
      </p>
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
  // 先算出来：既避免在 JSX 里重复调用，也用来判断底部操作区要不要渲染——
  // 三者都没有时整块不渲染，否则会留一条孤零零的分割线。
  const socials = socialLinks(member);
  const hasActions = Boolean(socials || member.sponsor || member.afdian);

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

      {hasActions && (
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-fd-border pt-3">
          {socials}
          <div className="flex items-center gap-2">
            {/*
              赞赏（一次性、微信/支付宝码）在左，爱发电（按月订阅）在右：
              按行动强度递增排列。两者配色也刻意不同——粉是心意，琥珀是长期支持，
              后者与赞助页「个人支持者」档同色，全站一致。
            */}
            {/*
              两个按钮都补了图标，并把 hover 从「整体变淡」改成「描边加深 + 底色加深」。
              原来的 hover:opacity-80 是让按钮变淡——鼠标移上去反而更弱，反馈方向是反的。
            */}
            {member.sponsor && (
              <button
                type="button"
                onClick={() => setShowSponsor(true)}
                className="inline-flex items-center gap-1 rounded-full border border-pink-500/25 bg-pink-500/10 px-2.5 py-1 text-xs font-medium text-pink-600 transition-colors hover:border-pink-500/45 hover:bg-pink-500/15 dark:border-pink-400/25 dark:text-pink-400"
              >
                <Coffee className="size-3.5" aria-hidden />
                {member.sponsorText ?? '赞赏'}
              </button>
            )}
            {member.afdian && (
              <a
                href={member.afdian}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`在爱发电按月支持 ${member.name}`}
                className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 transition-colors hover:border-amber-500/50 hover:bg-amber-500/15 dark:border-amber-400/25 dark:text-amber-400"
              >
                <AfdianIcon className="size-3.5" aria-hidden />
                爱发电
              </a>
            )}
          </div>
        </div>
      )}

      {showSponsor && <SponsorDialog member={member} onClose={() => setShowSponsor(false)} />}
    </div>
  );
}
