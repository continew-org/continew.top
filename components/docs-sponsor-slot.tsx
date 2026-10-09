import Link from 'next/link';
import { Crown } from 'lucide-react';
import { getSponsors, sponsorImageUrl, sponsorLogoUrl } from '@/lib/sponsors';

/**
 * 文档页右侧目录（TOC）底部的赞助展示位。
 *
 * 【为什么放在这里——"用户不讨厌"的四个约束】
 *  1. 不在阅读流里。正文在左、目录在右，读者视线主体一直在左边，右栏底部是
 *     页面里注意力最低的区域之一，放东西不会打断阅读。
 *  2. 不动。刻意没做轮播：周边视野里的运动是分心感的第一来源，
 *     而且轮播会把单家曝光按时间切片，对赞助商也是损失。
 *  3. 小。只放 Logo + 名称，不放大段广告语；多位赞助商纵向平铺、等高等权。
 *  4. 标明身份。挂「开源合作伙伴」标签——读者有权知道这是广告，
 *     而这句话本身就是赞助商买的东西，坦诚和交付在这里是同一件事。
 *
 * 【只放付费档】
 * 这个位子留给付费的开源合作伙伴，资源（服务器 / 云资源）支持的伙伴不进来——
 * 两类支持混在同一格里，"¥500/月 到底买的是什么"就说不清了。
 * 资源伙伴的展示落在首页一行与赞助页。
 */
export function DocsSponsorSlot() {
  const sponsors = getSponsors('strategic');

  return (
    <div className="mt-4 flex flex-col gap-2 border-t border-fd-border pt-4">
      {/*
        标题：皇冠图标（品牌色）+ 轻量小标文字。

        【为什么用图标不用粗字】
        皇冠和赞助页最高档、导航栏「赞助」入口是同一个符号，读者在导航见过它，
        这里再见到就能接上"这是赞助位"。身份靠**图标**传达，文字就不必靠加粗去抢注意力了。

        【为什么是 11px + 常规字重 + 灰字】
        试过 12px + semibold + 前景色，在目录栏里是一坨又粗又黑的字，
        压过了上面的目录条目——它本该是"角落里的标注"，不是"页面里的小节"。
        现在降到 11px、font-medium、muted，配一枚有颜色的图标：
        标注感够了，但不抢戏。
      */}
      <div className="flex items-center gap-1.5">
        <Crown className="size-3.5 shrink-0 text-[var(--cn-brand)]" aria-hidden />
        <span className="text-[11px] font-medium tracking-[0.06em] text-fd-muted-foreground">
          开源合作伙伴
        </span>
      </div>

      {sponsors.length === 0 ? (
        /*
         * 空占位：这一格本身就是商品，空着比整个藏起来更有价值。
         *
         * 之前是"没人赞助就什么都不渲染"，等于把这个销售位收进了抽屉——
         * 潜在赞助商翻遍文档也看不到还有这么个位置可以买。
         * 虚线框 +「席位开放中」是在明确地告诉对方"这里可以买"，
         * 而它所在的位置（读者专注阅读时的右栏底部）恰好也是最自然的露出时机。

         * 措辞用「席位开放中」而不是「虚位以待」：后者偏文言，且落脚在"空"上，
         * 读起来是在陈述缺口；前者落脚在"开放、可以进来"，是邀请而不是自曝其短。
         */
        <Link
          href="/sponsor"
          className="flex flex-col items-start gap-0.5 rounded-lg border border-dashed border-fd-border px-3 py-2.5 transition-colors hover:border-[var(--cn-brand-line)] hover:bg-fd-accent/30"
        >
          <span className="text-xs text-fd-muted-foreground">席位开放中</span>
          <span className="text-xs font-medium text-[var(--cn-brand)]">
            成为开源合作伙伴 →
          </span>
        </Link>
      ) : (
        /*
         * 横向一行：Logo 在左、名称在右，不加边框卡片。
         *
         * 【为什么不再用居中卡片】
         * 上一版是「图在上、名在下」的居中卡片，在约 200px 宽的目录栏里
         * 是一块又方又重的盒子，和上方轻量的目录条目完全不是一种东西，
         * 看着像硬塞进来的广告牌。改成横向一行后，它读起来就像目录的延续——
         * 视觉重量和旁边的条目一致，不打断。
         *
         * Logo 定在 32px：和 12px 文字并排时是一枚标识的量级，看得清主体；
         * 名称承担主要识别，所以 Logo 不需要再大。
         */
        <ul className="flex flex-col gap-0.5">
          {sponsors.map((sponsor) => {
            const src = sponsor.logo
              ? sponsorLogoUrl(sponsor.logo)
              : sponsor.img
                ? sponsorImageUrl(sponsor.img)
                : null;

            return (
              <li key={sponsor.name}>
                <a
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={sponsor.name}
                  className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-fd-accent/50"
                >
                  {src && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={src}
                      alt={sponsor.name}
                      loading="lazy"
                      className="h-8 w-auto max-w-[72px] shrink-0 object-contain"
                    />
                  )}
                  <span className="min-w-0 truncate text-xs text-fd-muted-foreground transition-colors group-hover:text-fd-foreground">
                    {sponsor.name}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}

      {/*
        有赞助商时才补「成为赞助者」入口。空占位本身已经是 CTA，
        再挂一条就成了两个并列的按钮，反而不知道点哪个。
      */}
      {sponsors.length > 0 && (
        <Link
          href="/sponsor"
          className="text-[11px] text-fd-muted-foreground transition-colors hover:text-fd-primary"
        >
          成为赞助者 →
        </Link>
      )}
    </div>
  );
}
