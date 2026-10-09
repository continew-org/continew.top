import sponsorsData from '@/data/sponsors.json';

export interface Sponsor {
  name: string;
  url: string;
  /**
   * 广告图文件名。**可选**——个人支持者通常没有 Logo，只有名字。
   * 有图渲染成卡片，无图渲染成名字条目，视觉上自然区分了「商业合作」与「个人支持」。
   *
   * 这是**横幅广告图**（建议 680×320，2:1），用于演示站工作台轮播、
   * 官网赞助页这类"大尺寸、允许带有推广文案"的位置。
   */
  img?: string;
  /**
   * 品牌 Logo 文件名。**可选**，优先级高于 img。
   *
   * 【为什么要有这个字段】
   * 文档侧栏是读者专注看文档的地方，把"低至 29.9/月"这种促销横幅摆在那里，
   * 既打断阅读，视觉上也压不住（深色大图在浅色侧栏里非常重）。
   * 小尺寸位置只该出现品牌标识，不该出现推广文案——所以这两种素材要分开。
   *
   * 没提供 Logo 时自动退回 img，不阻塞上线；提供了就自动换成更克制的样式。
   */
  logo?: string;
  /**
   * 一句话说明，显示在赞助页卡片上。
   *
   * 【写什么、不写什么】
   * 只写**我们能核实的事实**（提供了什么资源、什么时起支持），不写对方的营销话术：
   * 官网不是对方的广告位，资源伙伴没付钱，替他登"欢迎老板多多咨询"是越俎代庖。
   * 想放完整业务介绍，让对方在自己站点或落地页写，链接过去就是了。
   */
  description?: string;
}

/**
 * 个人支持者：**只有名字**，与商业档刻意区分成两种类型。
 *
 * 之前两者共用 `Sponsor`，于是数据里给个人支持者写 `img` / `logo` / `description`
 * 都不报错，但 SupporterList 根本不渲染它们——写错了没有任何提示。
 * 拆成两个类型后，超出的字段在编辑器里就会标红。
 * 顺序即展示顺序，需要置顶调整数组顺序即可，不另设 priority 字段。
 */
export interface Supporter {
  name: string;
  /** 个人支持者通常不留链接（爱发电昵称没有主页），有才给。 */
  url?: string;
}

/**
 * 两档：战略合作伙伴 / 个人支持者。
 *
 * 此前是「独家 / 铂金 / 金牌 / 银牌」四档（外加一个永远读不到的 bronze），
 * 问题不在数量，而在**四档卖的是同一种东西的不同尺寸**——Logo 大一点小一点、
 * 位置高一点低一点。赞助商比不出差别，我们也兑现不了「首屏」「侧边栏顶部」
 * 这类既不可控、又无法证明价值的承诺。
 *
 * 现在按**关系类型**分档而不是按位置大小分档：
 *   - strategic：商业合作，卖「曝光 + 数据 + 关系」，按月，名额有限
 *   - supporter：个人支持，卖「参与感」，金额固定、门槛低
 * 两者在页面上形态不同（卡片 vs 名单），互不干扰，也不会出现
 * 「100 和 3000 挨在一起」那种把人吓跑的价格对比。
 */
export interface SponsorTiers {
  /** 付费的商业合作档（按月，限量若干席）。席位计算只看这一档。 */
  strategic: Sponsor[];
  /**
   * 基础设施支持：**以资源而非现金**支持项目的伙伴（服务器、域名、CDN 等）。
   *
   * 【为什么要和 strategic 分开】
   * 提供服务器和按月付费是两件性质不同的事。混在一个档里会有两个后果：
   *   1. 定价被污染——潜在赞助商看到"他们给了台服务器就算合作伙伴"，
   *      会顺理成章地问"那我也给服务器行不行"，¥500/月 的价格就撑不住了；
   *   2. 席位是虚的——那一席不是钱买的，真有人要买第三席时才发现没位子。
   *
   * 分开之后：资源支持照常展示（服务器确实撑着演示站，理应被致谢），
   * 但不占用付费档的席位，"剩 N 席"才是真话。
   */
  infrastructure: Sponsor[];
  /** 个人支持者：只有名字。 */
  supporter: Supporter[];
}

/**
 * data/sponsors.json 的顶层结构。
 *
 * 【为什么把席位放进数据，而不是留在页面里写常量】
 * 席位是会变的运营参数（3 席卖满了要不要加、淡季要不要收）。写在页面代码里，
 * 改一次要动一次代码、还要记得两处（文案里的"限量 N 席"和"剩 N 席"）同步；
 * 放进数据只有一个真相源，页面从 getStrategicSeats() 读。
 */
export interface SponsorsData {
  config: {
    /** 付费商业档的席位上限。 */
    strategicSeats: number;
  };
  tiers: SponsorTiers;
}

const data = sponsorsData as SponsorsData;
const tiers = data.tiers;

/**
 * 付费商业档的席位上限。
 *
 * 页面用它算"剩 N 席"（getSponsors('strategic').length 是已占席数），
 * **不要在别处再写一个数字**：两个数字不同步时，页面会一边说"剩 3 席"、
 * 一边说"已满"，是最难自查的一类错。
 */
export function getStrategicSeats(): number {
  return data.config.strategicSeats;
}

/** 商业档（strategic / infrastructure）的赞助者列表。 */
export function getSponsors(tier: 'strategic' | 'infrastructure'): Sponsor[];
/** 个人支持者列表。 */
export function getSponsors(tier: 'supporter'): Supporter[];
export function getSponsors(tier: keyof SponsorTiers): Sponsor[] | Supporter[] {
  return (tiers[tier] ?? []) as Sponsor[] | Supporter[];
}

/**
 * 展示位（首页、文档侧栏）上要出现的赞助者：付费合作伙伴 + 基础设施支持。
 *
 * 两者性质不同，但都该露面——服务器撑着演示站，理应被致谢。
 * 注意：**席位计算不能用这个列表**，只有 strategic 才占席。
 */
export function getDisplayedSponsors(): Sponsor[] {
  return [...getSponsors('strategic'), ...getSponsors('infrastructure')];
}

/**
 * 赞助商素材的基础目录：按**赞助商**分目录，而不是按素材类型分。
 *
 * 【为什么是 partners/<slug>/ 而不是 ads/ + logos/】
 * 按类型分时，同一家的横幅和 Logo 分居两个目录：接入一家要往两处各放一个文件，
 * 下线一家要在两处各删一个，漏删就留下没人认领的孤儿文件。
 * 按赞助商分之后，一家 = 一个目录：接入是建目录，下线是删目录，不会漏。
 *
 * img / logo 字段存的是**相对本目录的路径**，如 "aeoliancloud/banner.webp"。
 */
const SPONSOR_ASSET_BASE = '/images/sponsor/partners';
export { SPONSOR_ASSET_BASE };

/** 赞助商广告横幅图完整路径。 */
export function sponsorImageUrl(img: string): string {
  return `${SPONSOR_ASSET_BASE}/${img}`;
}

/** 赞助商 Logo 完整路径（文档侧栏等小尺寸位置用）。 */
export function sponsorLogoUrl(logo: string): string {
  return `${SPONSOR_ASSET_BASE}/${logo}`;
}

/**
 * 爱发电主页：个人支持的订阅入口。
 *
 * 为什么走爱发电而不是直接收款：个人支持是**按月订阅**，手动收款的结局是
 * 每个月都要开口催一次，撑不过三个月。平台自动扣款把这件事从「每月社交」
 * 变成「每月出报告」，可持续性完全不同。
 *
 * 顺带一个契合点：爱发电接受个人身份入驻，不要求企业资质——
 * 正好对应现在只能走个人收款的情况，不用为了收钱先去注册公司。
 */
export const afdianUrl = 'https://afdian.com/a/charles7c';
