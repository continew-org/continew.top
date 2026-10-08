import usersData from '@/data/users.json';

export interface RegisteredUser {
  name: string;
  logo?: string;
  region?: string[];
  website?: { text: string; url: string };
  createTime: string;
  createUser?: { gitee?: string };
}

/**
 * 信息完整度：logo(4) + 官网(2) + 有效地区(1)。
 *
 * 数据里曾有一个人工维护的 `platinum` 标记，意图是「资料完整的用户排前面」，
 * 现已废弃 —— 完整与否由代码按字段判定，不再依赖人工打标。
 */
export function completeness(user: RegisteredUser): number {
  let score = 0;
  if (user.logo) score += 4;
  if (user.website) score += 2;
  if ((user.region ?? []).some((r) => r.trim() && r.trim() !== '未知')) score += 1;
  return score;
}

/** 全部登记用户：资料完整的在前（同分按登记时间倒序），其余按登记时间倒序。 */
export function getUsers(): RegisteredUser[] {
  return (usersData as RegisteredUser[])
    .slice()
    .sort(
      (a, b) =>
        completeness(b) - completeness(a) || b.createTime.localeCompare(a.createTime),
    );
}

/** 有 Logo 的登记用户（首页用户墙用），同样完整度优先。 */
export function getFeaturedUsers(): RegisteredUser[] {
  return getUsers().filter((u) => Boolean(u.logo));
}

/**
 * 地区字符串 → 城市名。无法判定的返回 null。
 *
 * 地区是用户自行填写的自由文本，存在三种形态：
 *   1. 「广东 · 深圳」——规范格式，取城市部分
 *   2. 「北京」「上海」——直辖市，本身就是城市
 *   3. 「新疆」「未知」——省级或占位值，不能计入城市口径
 * 此前直接 split('·')[1] 兜底，把「未知」和「新疆」也计进了城市数，首屏数字是虚高的。
 */
const MUNICIPALITIES = new Set(['北京', '上海', '天津', '重庆']);

export function toCity(region: string): string | null {
  const raw = region.trim();
  if (!raw || raw === '未知') return null;
  if (raw.includes('·')) return raw.split('·')[1]?.trim() || null;
  return MUNICIPALITIES.has(raw) ? raw : null;
}

/** 覆盖城市数（已剔除「未知」与纯省级地区）。 */
export function getCityCount(): number {
  const cities = new Set<string>();
  for (const user of usersData as RegisteredUser[]) {
    for (const region of user.region ?? []) {
      const city = toCity(region);
      if (city) cities.add(city);
    }
  }
  return cities.size;
}

/** 热门城市（按登记数聚合，取前 n 个）。已剔除「未知」与纯省级地区。 */
export function getTopCities(limit = 8): Array<{ city: string; count: number }> {
  const counts = new Map<string, number>();
  for (const user of usersData as RegisteredUser[]) {
    for (const region of user.region ?? []) {
      const city = toCity(region);
      if (!city) continue;
      counts.set(city, (counts.get(city) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city, 'zh-Hans-CN'))
    .slice(0, limit);
}
