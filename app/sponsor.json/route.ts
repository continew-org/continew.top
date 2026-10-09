import { getDisplayedSponsors, getSponsors } from '@/lib/sponsors';

export const revalidate = false;

/**
 * 对外的数据接口：`https://continew.top/sponsor.json`
 *
 * 【为什么必须有这个路由】
 * 演示站（continew-admin-ui）工作台首页的赞助轮播会 fetch 这个文件来渲染广告图。
 * 新站上线后 continew.top 指向本站，如果这个路由不存在，那个 fetch 会拿到 404，
 * 演示站轮播会整体变空——连它自己内置的两张引导图也不显示（失败时走 catch，列表为空）。
 * 也就是说，这不是"少一个接口"，而是**上线当天演示站首页就会缺一块**。
 *
 * 【为什么要保留 special / platinum 这些旧键】
 * 演示站 4.x 的 Carousel 读的是 `[...data.special, ...data.platinum]`。
 * 本站的档位已经改成 strategic / supporter，直接输出新结构会让那行代码
 * 展开 undefined 抛错。这里把 strategic 同时映射一份到 special，
 * 演示站不用改任何代码就能继续工作。
 *
 * 等 5.x 模板重做、演示站改为直接读 strategic / supporter 之后，
 * 下面这几个旧键就可以删掉了。
 */
export async function GET() {
  /*
   * 演示站轮播展示的是「所有该露面的伙伴」——付费合作伙伴 + 基础设施支持，
   * 与首页、文档侧栏保持同一口径。风铃云的服务器撑着演示站本身，
   * 理应出现在那里。
   */
  const displayed = getDisplayedSponsors();

  return Response.json({
    // 新结构：本站当前的档位
    strategic: getSponsors('strategic'),
    infrastructure: getSponsors('infrastructure'),
    supporter: getSponsors('supporter'),
    // 兼容键：仅供演示站 4.x 轮播消费，5.x 重做后移除
    special: displayed,
    platinum: [],
    gold: [],
    silver: [],
    bronze: [],
  });
}
