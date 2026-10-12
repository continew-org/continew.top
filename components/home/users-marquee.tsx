import type { RegisteredUser } from '@/lib/users';
import { cn } from '@/lib/cn';
import { focusRing } from '@/lib/site-design';

/**
 * 登记用户跑马灯：纯 CSS 双行循环，无 JS 时内容与暂停入口仍可用。
 * 每行拥有独立的键盘滚动区；reduce / 聚焦 / 手动暂停时只保留第一份内容。
 */
function UserChip({ user }: { user: RegisteredUser }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-fd-border bg-fd-card px-4 py-2 text-sm font-medium text-fd-muted-foreground">
      {user.logo ? (
        // 外链或本地素材，静态导出下不经过图片优化，用原生 img
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.logo.startsWith('http') ? user.logo : `/images/about/users/${user.logo}`}
          alt=""
          aria-hidden
          loading="lazy"
          className="size-5 shrink-0 rounded bg-white object-contain"
        />
      ) : null}
      {user.name}
    </span>
  );
}

function MarqueeRow({
  users,
  reverse,
  label,
}: {
  users: RegisteredUser[];
  reverse?: boolean;
  label: string;
}) {
  return (
    <div
      role="region"
      aria-label={`${label}，聚焦后可用左右方向键横向浏览`}
      tabIndex={0}
      className={cn('cn-marquee-viewport cn-marquee-fade rounded-lg p-1', focusRing)}
    >
      <ul
        className={cn(
          'cn-marquee cn-marquee-users flex w-max list-none p-0',
          reverse && 'cn-marquee-reverse',
        )}
      >
        {users.map((user, index) => (
          <li key={`a-${user.name}-${index}`} className="mr-3">
            <UserChip user={user} />
          </li>
        ))}
        {/* 视觉副本同时 inert 和 aria-hidden；将来 chip 添加链接也不会产生隐藏焦点。 */}
        {users.map((user, index) => (
          <li key={`b-${user.name}-${index}`} aria-hidden inert className="cn-marquee-copy mr-3">
            <UserChip user={user} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function UsersMarquee({ users }: { users: RegisteredUser[] }) {
  if (users.length === 0) return null;

  const half = Math.ceil(users.length / 2);

  return (
    <div className="cn-marquee-host space-y-3">
      <MarqueeRow users={users.slice(0, half)} label="登记用户第一行" />
      {users.length > half && (
        <MarqueeRow users={users.slice(half)} label="登记用户第二行" reverse />
      )}
      <div className="cn-marquee-control flex justify-center">
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-fd-border px-4 py-2 text-sm text-fd-muted-foreground hover:bg-fd-accent">
          <input type="checkbox" className={cn('cn-marquee-toggle size-4 accent-[var(--cn-brand)]', focusRing)} />
          暂停自动滚动
          <span className="sr-only">，勾选后可横向浏览全部登记用户；取消勾选恢复自动滚动</span>
        </label>
      </div>
    </div>
  );
}
