import sponsorsData from '@/data/sponsors.json';

/**
 * 一个支持者（公司或个人）共有的身份字段。
 *
 * 「**是谁**」与「**上不上首页**」是两件独立的事：档位名只表示关系类型
 * （开源合作 / 资源合作 / 个人支持），不再隐含金额高低与视觉大小——
 * 公司的 Logo 与个人的头像在各处都是同一枚小标识的量级。
 */
export interface Backer {
  /** 展示名（公司名或个人昵称）。 */
  name: string;
  /** 主页；有才给，整卡可点。 */
  url?: string;
  /**
   * 品牌标识：**本地素材**文件名（企业用），如 `aeoliancloud/logo.webp`。
   * 与 `avatar` 是同一个角色（视觉标识）的两种形态，不是两种等级。
   */
  logo?: string;
  /** 个人头像：**外链**地址（GitHub / Gitee 平台头像）。与 logo 二选一。 */
  avatar?: string;
  /** 是否仍在支持。仅个人支持者使用（在支持 / 往期），缺省为在支持。 */
  status?: 'active' | 'past';
  /**
   * 是否上首页：**内部策展标记，绝不渲染成标签。**
   *
   * 首页是社会证明位，不是排行榜——资源伙伴按价值阈值、个人按长期与否，
   * 规则只由维护者在这里标记，读者看不到「谁过线、谁没过」。
   */
  featured?: boolean;
}

/**
 * 开源合作伙伴（按月付费的企业）。比基础身份多一张广告横幅与一句业务介绍。
 */
export interface Sponsor extends Backer {
  /** 广告横幅（建议 680×320），用于演示站工作台轮播等大尺寸位置。 */
  img?: string;
  /** 一句话业务介绍，由合作方自己写，可核实、不写金额。 */
  description?: string;
}

/**
 * 资源合作伙伴的**一条资源贡献**——以「需求项」的形式记录：
 * 需求名称（need）+ 实际提供的具体内容（detail，可选）+ 数量 + 起止时间。
 *
 * 同一个人 / 公司可以有多条（如莫愁先后提供了云服务器与公共后端 API），
 * 所以这一档不做「在支持 / 往期」拆分：所有贡献在一个列表里，
 * 当前在用的排在数组前部（`current: true`），其余按时间由近及远。
 */
export interface ResourcePartner extends Backer {
  /** 广告横幅：仅当前在用且有素材的企业有，用于演示站轮播。 */
  img?: string;
  /**
   * 需求项名称：**需要什么**（需求词汇），如「云服务器」「Token Plan 或额度」。
   * 这是每行的主信息——读者先看到的是满足了哪一项需求，而不是具体商品名。
   */
  need: string;
  /**
   * 实际提供的具体内容（短标签，可选），如「8C16G + 10M」「ChatGPT 额度」。
   * 需求是同一类时，具体给了什么、给了多少规格，差异全在这里——也是致谢的落点。
   */
  detail?: string;
  /** 数量，如「×1」「不限」。 */
  qty: string;
  /** 起止时间，如「2024.10 ~ 2025.8」「2025.8 至今」。 */
  period: string;
  /** 是否为当前在用的贡献；当前条目录入在数组前部。 */
  current?: boolean;
  /** 当前在用环境承载的服务清单（仅当前条目需要，/demo 页消费）。 */
  env?: string;
  /** 当前在用环境的完整配置（仅当前条目需要，/demo 页消费）。 */
  spec?: string;
}

/** 个人支持者就是一个 Backer：头像 + 名字 + 链接，没有任何说明字段。 */
export type Supporter = Backer;

export type TierKey = 'strategic' | 'infrastructure' | 'supporter';

export interface SponsorTiers {
  /** 开源合作伙伴：按月付费，占席位。 */
  strategic: Sponsor[];
  /** 资源合作伙伴：资源贡献清单（当前在前，不拆在支持 / 往期）。 */
  infrastructure: ResourcePartner[];
  /** 个人支持者：在支持与往期靠 status 区分。 */
  supporter: Supporter[];
}

/**
 * 一项当前资源需求。需求与提供者在**数据里就绑定**（provider 存提供者名字），
 * 不再让「需求清单」和「伙伴名录」两处分开维护——
 * 那种做法已经出过漏改（Boy 已提供额度，清单却还标「待支持」）。
 */
export interface ResourceNeed {
  /** 需要什么，如「云服务器（>=4C8G50G，带公网IP）」。 */
  name: string;
  /** 数量，如「×1」「不限」。 */
  qty: string;
  /** 用途说明。 */
  desc?: string;
  /**
   * 提供者名称，需与 `tiers.infrastructure` 中某条 `name` 一致；
   * 为 `null` 表示该项待支持。页面据此解析出 Logo / 头像与链接，内联显示。
   */
  provider: string | null;
}

export interface SponsorsData {
  config: {
    /** 开源合作伙伴的席位上限。 */
    strategicSeats: number;
  };
  resourceNeeds: ResourceNeed[];
  tiers: SponsorTiers;
}

const data = sponsorsData as SponsorsData;
const tiers = data.tiers;

/** 开源合作伙伴席位上限。页面用它减在支持数算「剩 N 席」，别处不要再写一个数字。 */
export function getStrategicSeats(): number {
  return data.config.strategicSeats;
}

/** 某一档的全部记录，顺序即数据文件里的数组顺序。 */
export function getSponsors(tier: 'strategic'): Sponsor[];
export function getSponsors(tier: 'infrastructure'): ResourcePartner[];
export function getSponsors(tier: 'supporter'): Supporter[];
export function getSponsors(tier: TierKey) {
  return tiers[tier] ?? [];
}

/** 当前仍在支持的开源合作伙伴（剔除往期）。 */
export function getActiveStrategic(): Sponsor[] {
  return getSponsors('strategic').filter((s) => s.status !== 'past');
}

/**
 * 资源合作伙伴的**全部贡献**（当前在前）。
 *
 * 刻意不做在支持 / 往期拆分：资源贡献记录的是「谁在什么时间提供了什么」，
 * 是一份持续累积的贡献履历，当前条目靠数组顺序与时间文本体现，不另加标记。
 */
export function getResourcePartners(): ResourcePartner[] {
  return getSponsors('infrastructure');
}

/** 当前在用的资源贡献（/demo 页与 sponsor.json 用）。 */
export function getCurrentResourcePartners(): ResourcePartner[] {
  return getResourcePartners().filter((p) => p.current === true);
}

/**
 * 一项需求下的全部提供者。
 *
 * 资源卡片按**需求**归组，而不是一条贡献一张卡：同一项需求（如云服务器、Token 额度）
 * 往往先后由多人接力满足，组内当前在用的条目在前（沿用入参数组顺序），往期条目在后，
 * 各自带具体提供物与起止时间。这样一份需求能同时容纳多人，也能一眼看出「现在是谁、以前是谁」。
 */
export interface ResourceNeedGroup {
  /** 需求名（同组条目共享的 `need`）。 */
  need: string;
  /** 数量：取当前在用条目，没有则取组内第一条。 */
  qty: string;
  /** 该需求的全部贡献条目，当前在用的在前。 */
  entries: ResourcePartner[];
}

/**
 * 把贡献条目按 `need` 归组。组的顺序 = 各组第一条在入参数组中的出现顺序
 * （`getResourcePartners()` 已保证当前在用的在前，所以「有在用人的需求」自然排前面）。
 */
export function groupResourceByNeed(partners: ResourcePartner[]): ResourceNeedGroup[] {
  const order: string[] = [];
  const map = new Map<string, ResourcePartner[]>();
  for (const partner of partners) {
    const list = map.get(partner.need);
    if (list) {
      list.push(partner);
    } else {
      map.set(partner.need, [partner]);
      order.push(partner.need);
    }
  }
  return order.map((need) => {
    const entries = map.get(need) ?? [];
    return {
      need,
      qty: entries.find((entry) => entry.current === true)?.qty ?? entries[0]?.qty ?? '',
      entries,
    };
  });
}

/** 当前在支持的个人支持者。 */
export function getActiveSupporters(): Supporter[] {
  return getSponsors('supporter').filter((s) => s.status !== 'past');
}

/** 往期的个人支持者。 */
export function getPastSupporters(): Supporter[] {
  return getSponsors('supporter').filter((s) => s.status === 'past');
}

/**
 * 首页要展示的支持者，按关系分成三组。
 *
 * 策展口径——**社会证明位，按「承诺」而不是「金额」选**：
 *   - 开源合作伙伴：当前在支持的**全部**（按月付费天然有承诺）；
 *   - 资源合作伙伴：当前在用且 `featured`（价值过阈值）；
 *   - 个人支持者：优先 `featured`（长期）；一个长期都没有时，
 *     取最近的若干位兜底——首页不能在「有个人支持」时反而空着。
 *
 * 规则只存在于这里，页面上不解释、不贴标签。
 */
export interface HomepageBackers {
  strategic: Sponsor[];
  resource: ResourcePartner[];
  supporters: Supporter[];
}

export function getHomepageBackers(fallbackCount = 3): HomepageBackers {
  const resource = getCurrentResourcePartners().filter((p) => p.featured === true);

  const activeSupporters = getActiveSupporters();
  const longTerm = activeSupporters.filter((s) => s.featured === true);
  const supporters = longTerm.length > 0 ? longTerm : activeSupporters.slice(0, fallbackCount);

  return {
    strategic: getActiveStrategic(),
    resource,
    supporters,
  };
}

/**
 * 当前资源需求清单（含提供者解析）。页面把需求与提供者画在同一行。
 */
export interface ResolvedResourceNeed extends ResourceNeed {
  /** 命中 infrastructure 条目时为该贡献条目，否则为 undefined（待支持）。 */
  providerEntry?: ResourcePartner;
}

export function getResourceNeeds(): ResolvedResourceNeed[] {
  const partners = getResourcePartners();
  return data.resourceNeeds.map((need) => ({
    ...need,
    providerEntry: need.provider
      ? partners.find((p) => p.name === need.provider)
      : undefined,
  }));
}

/**
 * 演示站轮播要消费的伙伴：**当前在用且有广告横幅（img）的**。
 *
 * 演示站 4.x 轮播读的是 sponsor.json 的 `special`，按 img 渲染；
 * 没有横幅的条目（如只有头像的 Boy、往期贡献者）混进去会出现空图，故在此剔除。
 * 注意席位计算不能用这个列表，只有 strategic 才占席。
 */
export function getDisplayedSponsors(): Array<Sponsor | ResourcePartner> {
  return [...getActiveStrategic(), ...getCurrentResourcePartners()].filter((s) =>
    Boolean(s.img),
  );
}

/**
 * 赞助商素材的基础目录：按**赞助商**分目录，而不是按素材类型分——
 * 一家 = 一个目录，接入是建目录、下线是删目录，不会漏改另一处。
 * img / logo 存相对本目录的路径，如 `aeoliancloud/banner.webp`。
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
 * 走爱发电而不是直接收款：个人支持若是按月，手动收款每个月都要开口催，
 * 平台自动扣款把这件事从「每月社交」变成「每月出报告」，可持续性完全不同。
 */
export const afdianUrl = 'https://afdian.com/a/charles7c';
