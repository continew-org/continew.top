import coreData from '@/data/members-core.json';
import emeritiData from '@/data/members-emeriti.json';
import partnerData from '@/data/members-partner.json';

export interface TeamMemberProject {
  /** 参与或长期关注的项目范围；不等同于项目所有权或唯一维护职责。 */
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
  /** 职业、个人身份或自述称谓；不表示在社区中的维护权限。 */
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
 * 核心成员。数据顺序即稳定展示顺序，且 **core[0] 固定为 Creator**。
 * 顺序用于帮助访客重复查找成员，不表示贡献或荣誉排名。
 */
export function getCoreMembers(): TeamMember[] {
  return coreData as TeamMember[];
}

/** 名誉核心团队成员：曾深度参与维护，目前不承担日常核心维护责任。 */
export function getEmeritiMembers(): TeamMember[] {
  return emeritiData as TeamMember[];
}

/**
 * 社区共鸣者：积极交流、反馈、传播或协作的社区伙伴。
 * 他们可能也提交过代码，但这一身份不等同于核心维护者，也不承担核心维护责任。
 */
export function getCommunityResonators(): TeamMember[] {
  return partnerData as TeamMember[];
}

export interface CoreMemberProjectGroup {
  key: 'ecosystem' | 'admin' | 'admin-ui' | 'starter';
  label: string;
  description: string;
  members: TeamMember[];
}

const CORE_PROJECT_GROUPS: Array<Omit<CoreMemberProjectGroup, 'members'> & { projectLabel: string }> = [
  {
    key: 'ecosystem',
    label: '全生态',
    description: '项目资料标注为 continew/* 的核心成员',
    projectLabel: 'continew/*',
  },
  {
    key: 'admin',
    label: 'ContiNew Admin',
    description: '长期参与 Admin 后端项目',
    projectLabel: 'continew-admin',
  },
  {
    key: 'admin-ui',
    label: 'ContiNew Admin UI',
    description: '长期参与 Admin 前端项目',
    projectLabel: 'continew-admin-ui',
  },
  {
    key: 'starter',
    label: 'ContiNew Starter',
    description: '长期参与 Starter 项目',
    projectLabel: 'continew-starter',
  },
];

/**
 * 仅按核心成员资料中已经存在的 projects 标签分组。
 * 这是参与范围，不推导唯一负责人、模块 Owner 或更细的个人职责。
 */
export function getCoreMemberProjectGroups(members: TeamMember[]): CoreMemberProjectGroup[] {
  return CORE_PROJECT_GROUPS.map(({ projectLabel, ...group }) => ({
    ...group,
    members: members.filter((member) =>
      member.projects?.some((project) => project.label === projectLabel),
    ),
  })).filter((group) => group.members.length > 0);
}
