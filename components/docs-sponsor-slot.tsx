import Link from 'next/link';
import { HeartHandshake } from 'lucide-react';
import { getActiveStrategic, sponsorLogoUrl } from '@/lib/sponsors';
import { cn } from '@/lib/cn';
import { focusRing } from '@/lib/site-design';

/**
 * 文档目录底部的支持入口。
 *
 * 不再把这里做成「广告席位」：它首先说明支持与文档维护的关系；
 * 有开源合作伙伴时再展示其 Logo 和名称，始终保持静态、紧凑、不打断阅读。
 */
export function DocsSponsorSlot() {
  const sponsors = getActiveStrategic();

  return (
    <aside className="mt-4 border-t border-fd-border pt-4" aria-label="支持 ContiNew">
      <Link
        href="/sponsor"
        className={cn('group block rounded-xl border border-fd-border bg-fd-card p-3 transition-colors hover:border-[var(--cn-brand-line)] hover:bg-fd-accent/30', focusRing)}
      >
        <span className="flex items-center gap-2 text-xs font-semibold text-fd-foreground">
          <HeartHandshake
            className="size-4 text-[var(--cn-brand)] transition-transform motion-safe:group-hover:scale-105"
            aria-hidden
          />
          支持 ContiNew
        </span>
        <span className="mt-2 block text-xs leading-relaxed text-fd-muted-foreground">
          你的支持用于持续维护项目、文档与在线演示。
        </span>
        <span className="mt-2 block text-xs font-medium text-[var(--cn-brand)]">
          了解支持方式 →
        </span>
      </Link>

      {sponsors.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-fd-muted-foreground">开源合作伙伴</p>
          <ul className="mt-1.5 flex flex-col gap-0.5">
            {sponsors.map((sponsor) => (
              <li key={sponsor.name}>
                <a
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={sponsor.name}
                  className={cn('flex min-h-11 items-center gap-2 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-fd-accent/50', focusRing)}
                >
                  {sponsor.logo && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={sponsorLogoUrl(sponsor.logo)}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      className="size-7 shrink-0 object-contain"
                    />
                  )}
                  <span className="min-w-0 truncate text-xs text-fd-muted-foreground">
                    {sponsor.name}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
