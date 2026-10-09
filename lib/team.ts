import coreData from '@/data/members-core.json';
import emeritiData from '@/data/members-emeriti.json';
import partnerData from '@/data/members-partner.json';

export interface TeamMemberProject {
  label: string;
  url: string;
}

export interface TeamMemberWebsite {
  label: string;
  url: string;
}

export interface TeamMemberSocials {
  gitee?: string;
  atomgit?: string;
  github?: string;
}

export interface TeamMember {
  name: string;
  avatarPic: string;
  title: string;
  /**
   * 是否为社区创建者。Creator 的职称徽章走主色，与其他成员的中性徽章区分开；
   * 由数据标注而非在组件里硬编码判断名字，改数据时不会漏改代码。
   */
  featured?: boolean;
  motto?: string;
  projects?: TeamMemberProject[];
  location?: string;
  website?: TeamMemberWebsite;
  socials?: TeamMemberSocials;
  sponsor?: boolean;
  sponsorText?: string;
  sponsorTitle?: string;
  /**
   * 赞赏码。**带 label**——因为码本身已经裁成纯白卡片，微信和支付宝长得一模一样，
   * 只有图里那行昵称、没有平台标识，读者会不知道该扫哪张。
   * 平台名必须跟着数据走，不能靠数组顺序猜。
   */
  sponsorPics?: { src: string; label: string }[];
  /**
   * 该成员自己的爱发电主页。**可选**——谁开了就显示谁的入口，没开就完全没有。
   *
   * 不做成全站统一的订阅入口，是因为「支持项目」和「赞赏某位成员」是两件事，
   * 而各成员自己的收款渠道本就不同；与其在页面顶部挂一个指向某个人的链接、
   * 再写一长段解释，不如让入口长在每个人自己的卡片上，各挂各的。
   */
  afdian?: string;
}

/**
 * 核心成员。数据顺序即展示顺序，且 **core[0] 固定为 Creator**——
 * 页面会把 Creator 放在首位，其余核心成员随机排序（见 app/team/page.tsx）。
 */
export function getCoreMembers(): TeamMember[] {
  return coreData as TeamMember[];
}

/** 名誉核心团队成员（曾为社区做出重要贡献）。 */
export function getEmeritiMembers(): TeamMember[] {
  return emeritiData as TeamMember[];
}

/** 社区共鸣者（非核心团队的个人贡献者）。 */
export function getPartnerMembers(): TeamMember[] {
  return partnerData as TeamMember[];
}
