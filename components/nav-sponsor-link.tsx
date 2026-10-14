'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeartHandshake } from 'lucide-react';
import { cn } from '@/lib/cn';

/** 导航里的支持入口：覆盖个人支持、资源共建与企业合作三种同行方式。 */
export function NavSponsorLink() {
  const pathname = usePathname();
  const active = pathname === '/sponsor';

  return (
    <Link
      href="/sponsor"
      aria-current={active ? 'page' : undefined}
      data-active={active}
      className={cn(
        'cn-nav-sponsor inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors',
        'text-fd-muted-foreground hover:text-fd-foreground',
      )}
    >
      <HeartHandshake className="size-4" aria-hidden />
      支持
    </Link>
  );
}
