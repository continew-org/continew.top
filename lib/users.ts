import usersData from '@/data/users.json';
import type {
  ContinewProjectId,
  RegisteredEntityType,
  RegistrationSourcePlatform,
} from '@/lib/user-registration';

export interface RegisteredUser {
  name: string;
  logo?: string;
  region?: string[];
  website?: { text: string; url: string };
  createTime: string;
  createUser?: { github?: string; gitee?: string; atomgit?: string };
  entityType?: RegisteredEntityType;
  usedProjects?: ContinewProjectId[];
  useCases?: string[];
  demoUrl?: string;
  source?: { platform: RegistrationSourcePlatform; url?: string };
}

/** 全部登记用户按登记时间倒序，顺序含义清晰且不会因资料完整度改变。 */
export function getUsers(): RegisteredUser[] {
  return (usersData as RegisteredUser[])
    .slice()
    .sort((a, b) => b.createTime.localeCompare(a.createTime));
}

/** 有 Logo 的登记用户，供需要品牌素材的展示位按登记时间倒序读取。 */
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

/**
 * 近 n 天新增登记数。
 *
 * 与 `getUsers().length`（累计登记）并列才有信息量：累计数只说明「来过多少人」，
 * 增量才说明**现在还在来人**。页面上这两个数字要挨着放，单独一个都容易被误读。
 */
export function getRecentRegisteredCount(days: number, now = Date.now()): number {
  const cutoff = new Date(now - days * 86_400_000).toISOString().slice(0, 10);
  return (usersData as RegisteredUser[]).filter(
    (user) => user.createTime.slice(0, 10) >= cutoff,
  ).length;
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
