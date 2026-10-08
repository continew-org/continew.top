import type { Contributor } from '@/lib/site-stats';

/**
 * 社区贡献者头像墙。
 *
 * 数据来自构建期拉取的三平台贡献者名单（见 lib/site-stats.ts 的 getContributorList），
 * 跨平台按用户名去重并剔除机器人与镜像同步账号。
 *
 * 头像一律懒加载：名单可能有上百人，首屏外的头像不该拖慢页面。
 */
export function ContributorWall({ contributors }: { contributors: Contributor[] }) {
  if (contributors.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2.5">
      {contributors.map((contributor) => (
        <li key={`${contributor.platform}-${contributor.login}`}>
          <a
            href={contributor.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`${contributor.login}（${contributor.platform}）`}
            className="flex size-10 items-center justify-center overflow-hidden rounded-full border border-fd-border bg-fd-muted text-sm font-medium text-fd-muted-foreground transition-colors hover:border-fd-primary hover:text-fd-primary"
          >
            {contributor.avatar ? (
              // 外链头像，静态导出下不经过图片优化，用原生 img
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={contributor.avatar}
                alt={contributor.login}
                loading="lazy"
                className="size-10 rounded-full object-cover"
              />
            ) : (
              // 少数平台接口不返回头像，退化为用户名首字母
              <span aria-hidden>{contributor.login.slice(0, 1).toUpperCase()}</span>
            )}
          </a>
        </li>
      ))}
    </ul>
  );
}
