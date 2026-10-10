import {
  getActiveStrategic,
  getActiveSupporters,
  getCurrentResourcePartners,
  getDisplayedSponsors,
  getPastSupporters,
  getResourcePartners,
  sponsorImageUrl,
  sponsorLogoUrl,
} from '@/lib/sponsors';
import { siteUrl } from '@/lib/shared';

export const revalidate = false;

/**
 * 对外的数据接口：`https://continew.top/sponsor.json`
 *
 * 【为什么必须有这个路由】
 * 演示站（continew-admin-ui）工作台首页的赞助轮播会 fetch 这个文件来渲染广告图。
 * 这个路由不存在时 fetch 拿到 404，演示站轮播整体变空。
 *
 * 【为什么保留 special / platinum 旧键】
 * 演示站 4.x 的 Carousel 读 `[...data.special, ...data.platinum]`，直接输出新结构会抛错。
 * 把当前有横幅的伙伴映射到 special，演示站不改代码即可继续工作；5.x 重做后可删。
 */
export async function GET() {
  /*
   * img / logo 在数据里存相对 partners 目录的路径，这里统一转成完整 URL。
   * 演示站 4.x 用 isHttp 判断，给完整 URL 才会直接使用、不拼旧前缀。
   */
  const withFullUrl = <T extends { img?: string; logo?: string }>(list: T[]) =>
    list.map((s) => ({
      ...s,
      img: s.img ? `${siteUrl}${sponsorImageUrl(s.img)}` : s.img,
      logo: s.logo ? `${siteUrl}${sponsorLogoUrl(s.logo)}` : s.logo,
    }));

  return Response.json({
    // 新结构：当前在支持的
    strategic: withFullUrl(getActiveStrategic()),
    infrastructure: withFullUrl(getCurrentResourcePartners()),
    supporter: getActiveSupporters(),
    // 资源伙伴的完整贡献履历（当前在前，带起止时间）
    resourceHistory: withFullUrl(getResourcePartners()),
    // 往期个人支持者
    pastSupporter: getPastSupporters(),
    // 兼容键：仅供演示站 4.x 轮播消费，5.x 重做后移除
    special: withFullUrl(getDisplayedSponsors()),
    platinum: [],
    gold: [],
    silver: [],
    bronze: [],
  });
}
