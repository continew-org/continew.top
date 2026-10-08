'use client';

import { useMemo, useState } from 'react';
import { cardHover } from '@/components/site-primitives';
import { cn } from '@/lib/cn';
import type { RegisteredUser } from '@/lib/users';

function UserLogo({ user }: { user: RegisteredUser }) {
  if (user.logo) {
    const src = user.logo.startsWith('http') ? user.logo : `/images/about/users/${user.logo}`;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={user.name}
        loading="lazy"
        className="size-10 shrink-0 rounded-lg border border-fd-border bg-white object-contain p-1"
      />
    );
  }
  /*
   * 无 logo 时用首字占位。21 家里有 14 家没有 logo，此前占位块用品牌色，
   * 等于三分之二的卡片在烧品牌色 —— 违反「90% 中性 + 8% 品牌色」的色彩预算。
   * 这里降为中性灰，品牌色只留给筛选选中态。
   */
  return (
    <span
      aria-hidden
      // 与有 logo 时的 border 保持一致：浅色下 muted 底色与卡片背景几乎同色，靠边框撑出形状
      className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-fd-border bg-fd-muted text-sm font-semibold text-fd-muted-foreground"
    >
      {user.name.slice(0, 1)}
    </span>
  );
}

/** 「2025-12-19 21:59:56」→「2025-12」。登记月是目录里唯一能体现增长的时间信号。 */
function registerMonth(createTime: string): string {
  return createTime.slice(0, 7);
}

export function UserDirectory({
  users,
  topCities,
  registerUrl,
}: {
  users: RegisteredUser[];
  topCities: Array<{ city: string; count: number }>;
  /** 搜索无结果时的登记入口，避免空态成为死路。 */
  registerUrl?: string;
}) {
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return users.filter((u) => {
      if (city && !(u.region ?? []).some((r) => r.includes(city))) return false;
      if (!kw) return true;
      return (
        u.name.toLowerCase().includes(kw) ||
        (u.region ?? []).some((r) => r.toLowerCase().includes(kw)) ||
        u.website?.text.toLowerCase().includes(kw)
      );
    });
  }, [users, keyword, city]);

  const chipClass = (active: boolean) =>
    cn(
      // 边框同 blog 分类标签：浅色下 muted 底色与页面背景几乎同色，靠边框撑出形状
      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
      active
        ? 'border-fd-primary bg-fd-primary text-fd-primary-foreground'
        : 'border-fd-border bg-fd-muted text-fd-muted-foreground hover:text-fd-foreground',
    );

  return (
    <div>
      {/* 搜索框独占一行，城市筛选另起一行：此前两者挤在同一行，窄屏下会互相压缩。 */}
      <div className="flex flex-col gap-4">
        <input
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="搜索公司名、地区或网址…"
          aria-label="搜索登记用户"
          className="w-full rounded-lg border border-fd-border bg-fd-background px-4 py-2 text-sm outline-none placeholder:text-fd-muted-foreground focus:border-fd-primary sm:max-w-sm"
        />
        {topCities.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setCity(null)} className={chipClass(city === null)}>
              全部
            </button>
            {topCities.map((c) => (
              <button
                key={c.city}
                type="button"
                onClick={() => setCity(city === c.city ? null : c.city)}
                className={chipClass(city === c.city)}
              >
                {c.city} ({c.count})
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-fd-muted-foreground">
        共 {filtered.length} 家{filtered.length !== users.length ? `（全部 ${users.length} 家）` : ''}
      </p>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((user) => (
          <li
            key={user.name}
            className={cn(
              'flex items-center gap-3 rounded-xl border border-fd-border p-4',
              cardHover,
            )}
          >
            <UserLogo user={user} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate text-sm font-semibold">{user.name}</h3>
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-fd-muted-foreground">
                {user.region?.map((r) => (
                  <span key={r}>{r}</span>
                ))}
                {user.website && (
                  <a
                    href={user.website.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate hover:text-fd-primary hover:underline"
                  >
                    {user.website.text}
                  </a>
                )}
              </div>
              <p className="mt-1 text-xs text-fd-muted-foreground/70 tabular-nums">
                {registerMonth(user.createTime)} 登记
              </p>
            </div>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <div className="mt-10 rounded-xl border border-dashed border-fd-border py-12 text-center">
          <p className="text-sm text-fd-muted-foreground">没有匹配的登记用户，换个关键词试试？</p>
          {registerUrl && (
            <a
              href={registerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-fd-primary hover:underline"
            >
              还没登记？来这里提交 →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
