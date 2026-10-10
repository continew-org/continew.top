import { sponsorLogoUrl, type Sponsor } from '@/lib/sponsors';
import { cn } from '@/lib/cn';

/**
 * 开源合作伙伴的紧凑卡片：Logo / 头像 + 名字 + 一句业务介绍。
 *
 * 与资源行、支持者胶囊同一套视觉量级——标识都是一枚小图，
 * 企业多一句业务介绍，所以用卡片而不是行。有链接整卡可点。
 */
export function CompanyCard({ sponsor, className }: { sponsor: Sponsor; className?: string }) {
  const visual = sponsor.logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={sponsorLogoUrl(sponsor.logo)}
      alt=""
      aria-hidden
      loading="lazy"
      className="size-8 object-contain"
    />
  ) : sponsor.avatar ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={sponsor.avatar}
      alt=""
      aria-hidden
      loading="lazy"
      className="size-8 rounded-full object-cover"
    />
  ) : (
    <span
      aria-hidden
      className="flex size-8 items-center justify-center rounded-full bg-fd-muted text-xs font-semibold text-fd-muted-foreground"
    >
      {sponsor.name.slice(0, 1)}
    </span>
  );

  const inner = (
    <>
      {visual}
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-fd-foreground">
          {sponsor.name}
        </span>
        {sponsor.description && (
          <span className="block truncate text-xs text-fd-muted-foreground">
            {sponsor.description}
          </span>
        )}
      </span>
    </>
  );

  const cls = cn(
    'flex items-center gap-2.5 rounded-xl border border-fd-border bg-fd-card px-3 py-2.5 text-left',
    sponsor.url && 'transition-colors hover:border-[var(--cn-brand-line)] hover:bg-fd-accent/40',
    className,
  );

  return sponsor.url ? (
    <a href={sponsor.url} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <span className={cls}>{inner}</span>
  );
}
