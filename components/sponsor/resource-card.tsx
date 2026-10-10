import {
  sponsorLogoUrl,
  type ResourceNeedGroup,
  type ResourcePartner,
} from '@/lib/sponsors';
import { Bot, Clock, Database, Globe, Server, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * 迷你视觉标识：资源条目里的提供者头像 / Logo。
 *
 * 默认 20px（赞助页「当前需求」清单内联用）；需求卡片里通过 `sizeClass` 换成更大一档。
 * 注意 cn() 只拼接不去重，传了 sizeClass 就完全替换默认尺寸，不能两个 size-* 并存。
 */
export function MiniVisual({
  partner,
  sizeClass = 'size-5',
}: {
  partner: ResourcePartner;
  sizeClass?: string;
}) {
  if (partner.logo) {
    return (
      // 本地素材，静态导出不经过图片优化，用原生 img
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={sponsorLogoUrl(partner.logo)}
        alt=""
        aria-hidden
        loading="lazy"
        className={`${sizeClass} shrink-0 object-contain`}
      />
    );
  }
  if (partner.avatar) {
    return (
      // 外链头像，静态导出不经过图片优化，用原生 img
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={partner.avatar}
        alt=""
        aria-hidden
        loading="lazy"
        className={`${sizeClass} shrink-0 rounded-full object-cover`}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-full bg-fd-muted text-xs font-semibold text-fd-muted-foreground`}
    >
      {partner.name.slice(0, 1)}
    </span>
  );
}

/**
 * 需求 → 图标。需求名是维护者策展的有限枚举，这里按名称取图标；
 * 新增一种需求时在表里补一行即可，未命中回退到服务器图标。
 */
const NEED_ICONS: Record<string, LucideIcon> = {
  云服务器: Server,
  'Token Plan 或额度': Bot,
  '公共后端 API': Globe,
  '数据库 / 缓存环境': Database,
  任务调度中心: Clock,
};

/** 卡片内的一位提供者：标识 + 名字（+ 具体提供物），右侧起止时间。 */
function ProviderRow({
  entry,
  showPeriod,
  highlightCurrent,
}: {
  entry: ResourcePartner;
  showPeriod: boolean;
  /** 是否给当前在用的提供者加「在用」标记与高亮底色（赞助页区分历史用，首页不需要）。 */
  highlightCurrent: boolean;
}) {
  // 标记「在用」（徽章 + 底色）只在赞助页开启；往期条目才收轻字色。
  // 首页不区分时，所有条目都按正常字色呈现，不标记也不压暗。
  const marked = highlightCurrent && entry.current === true;
  const dimmed = highlightCurrent && entry.current !== true;

  const name = entry.url ? (
    <a
      href={entry.url}
      target="_blank"
      rel="noopener noreferrer"
      className="truncate rounded transition-colors hover:text-[var(--cn-brand)] hover:underline"
    >
      {entry.name}
    </a>
  ) : (
    <span className="truncate">{entry.name}</span>
  );

  return (
    <li
      className={cn(
        'flex items-center gap-3 rounded-lg px-2 py-2',
        // 当前在用的提供者：淡青底 + 一枚「在用」标记；往期的只收轻字色，不灰度头像。
        marked && 'bg-teal-500/[0.08]',
      )}
    >
      <MiniVisual partner={entry} sizeClass="size-9" />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'flex items-center gap-1.5 text-sm font-medium',
            dimmed ? 'text-fd-muted-foreground' : 'text-fd-foreground',
          )}
        >
          {name}
          {marked && (
            <span className="shrink-0 rounded-full bg-teal-500/15 px-1.5 py-px text-[10px] font-medium leading-4 text-teal-700 dark:text-teal-300">
              在用
            </span>
          )}
        </p>
        {entry.detail && (
          <p className="mt-0.5 truncate text-xs text-fd-muted-foreground">{entry.detail}</p>
        )}
      </div>
      {showPeriod && (
        <span className="shrink-0 text-xs tabular-nums text-fd-muted-foreground">
          {entry.period}
        </span>
      )}
    </li>
  );
}

/**
 * 资源需求卡片：一张卡 = 一项**需求**，卡内列出满足过它的全部提供者
 * （当前在用的在前、带「在用」标记，往期的紧随其后、各带时间段）。
 *
 * 这样同一项需求可以同时容纳多人接力（如云服务器先后由三家提供），
 * Token 这类需求里「ChatGPT」也只是某位提供者的具体内容，而不是对所有人的假设。
 * 两张卡片一行（`sm:grid-cols-2`），比一人一条宽行紧凑得多。
 */
export function ResourceNeedCard({
  group,
  showPeriod = true,
  showQty = true,
  highlightCurrent = true,
}: {
  group: ResourceNeedGroup;
  showPeriod?: boolean;
  /** 是否显示数量徽章（×1 / 不限）。首页只表达「谁在支持」，不展示数量。 */
  showQty?: boolean;
  highlightCurrent?: boolean;
}) {
  const Icon = NEED_ICONS[group.need] ?? Server;
  // 「不限」是真正有分量的承诺，用青色徽章点出来；普通数量走中性灰徽章。
  const unlimited = /不限/.test(group.qty);

  return (
    <div className="overflow-hidden rounded-xl border border-fd-border bg-fd-card">
      {/* 卡片头：需求图标 + 需求名 + 数量徽章，一条浅底带把「需求」与「提供者」分层。 */}
      <div className="flex items-center gap-2 border-b border-fd-border/60 bg-fd-muted/30 px-4 py-2.5">
        <Icon className="size-4 text-teal-600 dark:text-teal-400" aria-hidden />
        <h4 className="text-sm font-semibold text-fd-foreground">{group.need}</h4>
        {showQty && (
          <span
            className={cn(
              'ml-auto rounded-full px-2 py-0.5 text-[11px] font-medium leading-4 tabular-nums',
              unlimited
                ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300'
                : 'bg-fd-muted text-fd-muted-foreground',
            )}
          >
            {group.qty}
          </span>
        )}
      </div>
      <ul className="space-y-0.5 p-2">
        {group.entries.map((entry) => (
          <ProviderRow
            key={`${entry.name}-${entry.period}`}
            entry={entry}
            showPeriod={showPeriod}
            highlightCurrent={highlightCurrent}
          />
        ))}
      </ul>
    </div>
  );
}
