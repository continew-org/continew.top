import type { RegisteredUser } from '@/lib/users';
import { cn } from '@/lib/cn';

/**
 * 登记用户跑马灯（双行反向滚动）。
 *
 * 【为什么是文字 chip 而不是 logo 墙】
 * data/users.json 里 21 家登记用户只有 6 家有 logo。做 logo 墙会有三分之二的位置是灰方块——
 * 那不是在展示用户，是在展示我们没收集到素材。改成公司名 chip 后 21 家一家不落，
 * 有 logo 的才显示 logo，视觉上也比「6 个 logo + 15 个灰块」整齐。
 *
 * 【为什么不用 JS】
 * 内容渲染两份 + CSS 平移 -50% 就是无缝循环，不需要测量宽度、不需要客户端组件，
 * 静态导出下照跑。间距用 margin 而非 gap：gap 只加在元素之间，两份内容接缝处会少一个间距，
 * 每轮循环都能看出一次顿挫。
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
  duration,
}: {
  users: RegisteredUser[];
  reverse?: boolean;
  /** 单行跑完一轮的秒数。两行刻意取不同值，避免上下两行整齐地一起动。 */
  duration: number;
}) {
  return (
    <ul
      className={cn(
        'cn-marquee flex w-max list-none p-0',
        reverse && 'cn-marquee-reverse',
      )}
      style={{ '--cn-marquee-duration': `${duration}s` } as React.CSSProperties}
    >
      {users.map((user, index) => (
        <li key={`a-${user.name}-${index}`} className="mr-3">
          <UserChip user={user} />
        </li>
      ))}
      {/* 第二份是循环用的视觉副本，对辅助技术隐藏，避免读屏把每家读两遍 */}
      {users.map((user, index) => (
        <li key={`b-${user.name}-${index}`} aria-hidden className="mr-3">
          <UserChip user={user} />
        </li>
      ))}
    </ul>
  );
}

export function UsersMarquee({ users }: { users: RegisteredUser[] }) {
  if (users.length === 0) return null;

  // 均分成两行；奇数时第一行多一个，视觉上不至于让第二行明显短一截
  const half = Math.ceil(users.length / 2);

  return (
    <div className="cn-marquee-host cn-marquee-fade space-y-3">
      <MarqueeRow users={users.slice(0, half)} duration={64} />
      <MarqueeRow users={users.slice(half)} duration={78} reverse />
    </div>
  );
}
