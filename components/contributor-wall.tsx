import type { CSSProperties } from 'react';
import type { Contributor } from '@/lib/site-stats';
import { cn } from '@/lib/cn';

/*
 * 礼花：8 片，每片一组「方向 + 旋转 + 颜色」。
 *
 * 方向铺满一圈而不是集中在一侧——礼花得是「炸开」，往一边飞就成了喷枪。
 * 颜色沿用品牌蓝与邻近色，只在 hover 那一瞬出现，不参与信息表达。
 *
 * 数据写在这里而不是 CSS 的 nth-of-type：方向、旋转、颜色本来就是一组数据，
 * 拆进 CSS 得写 8 条选择器与之逐个对应，想改一个方向要去翻 8 行。
 */
const CONFETTI = [
  { dx: '-15px', dy: '-12px', rot: '-150deg', color: '#0057fe' },
  { dx: '-6px', dy: '-18px', rot: '-95deg', color: '#12d2ac' },
  { dx: '6px', dy: '-17px', rot: '-40deg', color: '#ffb020' },
  { dx: '16px', dy: '-11px', rot: '35deg', color: '#ff6b9d' },
  { dx: '18px', dy: '2px', rot: '80deg', color: '#8b5cf6' },
  { dx: '14px', dy: '13px', rot: '130deg', color: '#0057fe' },
  { dx: '-4px', dy: '18px', rot: '175deg', color: '#12d2ac' },
  { dx: '-14px', dy: '10px', rot: '220deg', color: '#ffb020' },
] as const;

/**
 * 社区贡献者头像墙。
 *
 * 数据来自构建期拉取的三平台贡献者名单（见 lib/site-stats.ts 的 getContributorList），
 * 跨平台按用户名去重并剔除机器人与镜像同步账号。
 *
 * 头像一律懒加载：名单可能有上百人，首屏外的头像不该拖慢页面。
 */
export function ContributorWall({
  contributors,
  className,
}: {
  contributors: Contributor[];
  /** 追加到列表容器的类。首页需要居中（`justify-center`），团队页保持左对齐。 */
  className?: string;
}) {
  if (contributors.length === 0) return null;

  return (
    <ul className={cn('flex flex-wrap gap-2.5', className)}>
      {contributors.map((contributor) => (
        <li key={`${contributor.platform}-${contributor.login}`}>
          {/*
           * title 只留用户名。
           *
           * 上一版拼的是 `${login}（${platform}）`，而 platform 是内部枚举值
           * （github / gitee / atomgit 小写），等于把数据字段名直接显示给了用户。
           * 平台归属在这里是次要信息——真想知道点进去就到了对应平台。
           */}
          <a
            href={contributor.url}
            target="_blank"
            rel="noopener noreferrer"
            title={contributor.login}
            /*
             * 不能用 overflow-hidden 裁头像：礼花要飞到头像外面去，裁了就只剩半截。
             * 代价是头像必须自己填满内容区（size-full）并保持圆角。
             */
            className="cn-confetti flex size-10 items-center justify-center rounded-full border border-fd-border bg-fd-muted text-sm font-medium text-fd-muted-foreground transition-[transform,border-color] duration-200 hover:scale-[1.08] hover:border-[var(--cn-brand-line)]"
          >
            {contributor.avatar ? (
              // 外链头像，静态导出下不经过图片优化，用原生 img
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={contributor.avatar}
                alt={contributor.login}
                loading="lazy"
                className="size-full rounded-full object-cover"
              />
            ) : (
              // 少数平台接口不返回头像，退化为用户名首字母
              <span aria-hidden>{contributor.login.slice(0, 1).toUpperCase()}</span>
            )}
            {CONFETTI.map((piece, index) => (
              <span
                key={index}
                aria-hidden
                className="cn-confetti-piece"
                style={
                  {
                    '--cn-dx': piece.dx,
                    '--cn-dy': piece.dy,
                    '--cn-rot': piece.rot,
                    background: piece.color,
                    // 逐片错开 20ms：一起炸开像贴纸，错开一点才像真的撒出去
                    animationDelay: `${index * 0.02}s`,
                  } as CSSProperties
                }
              />
            ))}
          </a>
        </li>
      ))}
    </ul>
  );
}
