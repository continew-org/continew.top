'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { cardHover } from '@/components/site-primitives';
import { cn } from '@/lib/cn';
import {
  continewProjectLabels,
  registeredEntityLabels,
} from '@/lib/user-registration';
import type { RegisteredUser } from '@/lib/users';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cn-brand)]/50';

function UserLogo({ user }: { user: RegisteredUser }) {
  if (user.logo) {
    const src = user.logo.startsWith('http') ? user.logo : `/images/about/users/${user.logo}`;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        loading="lazy"
        className="size-10 shrink-0 rounded-lg border border-fd-border bg-white object-contain p-1"
      />
    );
  }

  return (
    <span
      aria-hidden
      className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-fd-border bg-fd-muted text-sm font-semibold text-fd-muted-foreground"
    >
      {user.name.slice(0, 1)}
    </span>
  );
}

function registerMonth(createTime: string): string {
  return createTime.slice(0, 7);
}

function publicRegions(user: RegisteredUser): string[] {
  return (user.region ?? []).filter((region) => region.trim() && region.trim() !== '未知');
}

function searchableText(user: RegisteredUser): string {
  return [
    user.name,
    ...(user.region ?? []),
    user.website?.text,
    user.website?.url,
    user.demoUrl,
    user.entityType ? registeredEntityLabels[user.entityType] : undefined,
    ...(user.usedProjects ?? []).map((project) => continewProjectLabels[project]),
    ...(user.useCases ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function UserDirectory({
  users,
  topCities,
  registerUrl,
}: {
  users: RegisteredUser[];
  topCities: Array<{ city: string; count: number }>;
  registerUrl?: string;
}) {
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return users.filter((user) => {
      if (city && !(user.region ?? []).some((region) => region.includes(city))) return false;
      return !kw || searchableText(user).includes(kw);
    });
  }, [users, keyword, city]);

  const chipClass = (active: boolean) =>
    cn(
      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
      focusRing,
      active
        ? 'border-fd-primary bg-fd-primary text-fd-primary-foreground'
        : 'border-fd-border bg-fd-muted text-fd-muted-foreground hover:text-fd-foreground',
    );

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,24rem)_auto] sm:items-center sm:justify-between">
        <label>
          <span className="sr-only">搜索登记用户</span>
          <input
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索名称、地区或网址…"
            aria-label="搜索登记用户"
            className={cn(
              'w-full rounded-lg border border-fd-border bg-fd-background px-4 py-2.5 text-sm placeholder:text-fd-muted-foreground',
              focusRing,
            )}
          />
        </label>

        {topCities.length > 0 && (
          <label className="sm:hidden">
            <span className="sr-only">按地区筛选</span>
            <select
              value={city ?? ''}
              onChange={(event) => setCity(event.target.value || null)}
              className={cn(
                'w-full rounded-lg border border-fd-border bg-fd-background px-4 py-2.5 text-sm',
                focusRing,
              )}
            >
              <option value="">全部地区</option>
              {topCities.map((item) => (
                <option key={item.city} value={item.city}>
                  {item.city}（{item.count}）
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {topCities.length > 0 && (
        <div className="mt-4 hidden flex-wrap items-center gap-2 sm:flex" aria-label="按城市筛选">
          <button
            type="button"
            aria-pressed={city === null}
            onClick={() => setCity(null)}
            className={chipClass(city === null)}
          >
            全部
          </button>
          {topCities.map((item) => (
            <button
              key={item.city}
              type="button"
              aria-pressed={city === item.city}
              onClick={() => setCity(city === item.city ? null : item.city)}
              className={chipClass(city === item.city)}
            >
              {item.city} ({item.count})
            </button>
          ))}
        </div>
      )}

      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="mt-4 text-xs text-fd-muted-foreground"
      >
        找到 {filtered.length} 个登记使用者
        {filtered.length !== users.length ? `，全部共 ${users.length} 个` : ''}
      </p>

      {filtered.length > 0 ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((user) => {
            const regions = publicRegions(user);
            const useCase = user.useCases?.[0];

            return (
              <li
                key={user.name}
                className={cn(
                  'flex items-start gap-3 rounded-xl border border-fd-border p-4',
                  cardHover,
                )}
              >
                <UserLogo user={user} />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold leading-snug">{user.name}</h3>

                  {(user.entityType || regions.length > 0) && (
                    <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-fd-muted-foreground">
                      {user.entityType && <span>{registeredEntityLabels[user.entityType]}</span>}
                      {regions.map((region) => (
                        <span key={region}>{region}</span>
                      ))}
                    </div>
                  )}

                  {user.usedProjects && user.usedProjects.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {user.usedProjects.map((project) => (
                        <span
                          key={project}
                          className="rounded-full bg-[var(--cn-brand-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--cn-brand)]"
                        >
                          {continewProjectLabels[project]}
                        </span>
                      ))}
                    </div>
                  )}

                  {useCase && (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-fd-muted-foreground">
                      {useCase}
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fd-muted-foreground">
                    {user.website && (
                      <a
                        href={user.website.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'inline-flex min-w-0 items-center gap-1 hover:text-fd-primary hover:underline',
                          focusRing,
                        )}
                      >
                        <span className="truncate">{user.website.text}</span>
                        <ArrowUpRight className="size-3 shrink-0" aria-hidden />
                        <span className="sr-only">（在新窗口打开）</span>
                      </a>
                    )}
                    <span className="text-fd-muted-foreground/70 tabular-nums">
                      {registerMonth(user.createTime)} 登记
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-fd-border px-5 py-12 text-center">
          <p className="text-sm font-medium">没有找到匹配的登记使用者</p>
          <p className="mt-2 text-sm text-fd-muted-foreground">换个关键词或地区试试。</p>
          {registerUrl && (
            <a
              href="#register"
              className={cn(
                'mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-fd-primary hover:underline',
                focusRing,
              )}
            >
              还没有登记？查看登记方式
              <ArrowRight className="size-3.5" aria-hidden />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
