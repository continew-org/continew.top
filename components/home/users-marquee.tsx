import type { RegisteredUser } from '@/lib/users';
import { cn } from '@/lib/cn';
import { focusRing } from '@/lib/site-design';

/**
 * 登记用户跑马灯：纯 CSS 双行循环，每行拥有独立的键盘滚动区。
 * 减弱动效或聚焦时只保留第一份内容，无客户端脚本依赖。
 */
function UserChip({ user }: Readonly<{ user: RegisteredUser }>) {
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
}: Readonly<{
  users: RegisteredUser[];
  reverse?: boolean;
  label: string;
}>) {
  return (
    <section
      aria-label={`${label}，聚焦后可用左右方向键横向浏览`}
      // 横向滚动区必须可聚焦：键盘才能用方向键浏览、并让动画停住（WCAG 2.2.2 的暂停机制）。
      // NOSONAR 必须与 Sonar 的判定行同行，故写在 tabIndex 那一行末尾。
      tabIndex={0} // NOSONAR: 非交互元素带 tabIndex 在此属有意为之
      className={cn('cn-marquee-viewport cn-marquee-fade rounded-lg p-1', focusRing)}
    >
      <ul
        className={cn(
          'cn-marquee cn-marquee-users flex w-max list-none p-0',
          reverse && 'cn-marquee-reverse',
        )}
      >
        {/* key 取用户名：登记名录内名字唯一（data/users.json 人工审核），不必退化为数组下标。 */}
        {users.map((user) => (
          <li key={`a-${user.name}`} className="mr-3">
            <UserChip user={user} />
          </li>
        ))}
        {/* 视觉副本同时 inert 和 aria-hidden；将来 chip 添加链接也不会产生隐藏焦点。 */}
        {users.map((user) => (
          <li key={`b-${user.name}`} aria-hidden inert className="cn-marquee-copy mr-3">
            <UserChip user={user} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function UsersMarquee({ users }: Readonly<{ users: RegisteredUser[] }>) {
  if (users.length === 0) return null;

  const half = Math.ceil(users.length / 2);

  return (
    <div className="cn-marquee-host space-y-3">
      <MarqueeRow users={users.slice(0, half)} label="登记用户第一行" />
      {users.length > half && (
        <MarqueeRow users={users.slice(half)} label="登记用户第二行" reverse />
      )}
    </div>
  );
}
