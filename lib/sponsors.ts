import sponsorsData from '@/data/sponsors.json';

export interface Sponsor {
  name: string;
  url: string;
  img: string;
  description?: string;
  priority?: number;
  height?: number;
}

export interface SponsorTiers {
  special: Sponsor[];
  platinum: Sponsor[];
  gold: Sponsor[];
  silver: Sponsor[];
  bronze: Sponsor[];
}

const tiers = sponsorsData as SponsorTiers;

/** 某档位的当前赞助者列表。 */
export function getSponsors(tier: keyof SponsorTiers): Sponsor[] {
  return tiers[tier] ?? [];
}

/** 赞助商广告图完整路径。 */
export function sponsorImageUrl(img: string): string {
  return `/images/sponsor/ads/${img}`;
}
