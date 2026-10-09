import messagesData from '@/data/messages.json';

/**
 * 首页「用户留言」区块的数据源。
 *
 * 与 users.json 同属人工维护的结构化数据：留言内容来自交流群、Gitee 登记帖与 Issue，
 * 由维护者挑选后录入。之所以不走构建期自动抓取（像 site-stats.ts 那样），
 * 是因为留言需要**审核**——自动拉会混入提问、灌水与无意义回复，
 * 出现在官网首页就是负面资产。宁可少更，不可失控。
 */
export interface Message {
  /** 留言正文。展示主体，建议控制在 60 字内，过长会撑破卡片高度。 */
  content: string;
  /** 署名，如「李工」。 */
  author: string;
  /** 身份/职位，如「后端负责人」。 */
  title?: string;
  /** 所在城市，如「南昌」。 */
  region?: string;
  /** 头像地址；留空时页面退化为首字占位。 */
  avatar?: string;
  /** 留言出处平台，用于标注来源，不用于跳转。 */
  platform?: 'github' | 'gitee' | 'atomgit' | 'wechat';
  /** 可点击的原留言链接；留空则不渲染链接。 */
  url?: string;
  /** 留言日期（YYYY-MM-DD），用于排序，新的在前。 */
  createdAt?: string;
}

/**
 * 全部留言：按日期倒序。
 *
 * 过滤掉缺正文或缺署名的条目——这类多半是录入到一半的草稿，
 * 与其在首页渲染出「无名氏的空白卡片」，不如直接不显示。
 */
export function getMessages(): Message[] {
  return (messagesData as Message[])
    .filter((message) => message.content?.trim() && message.author?.trim())
    .slice()
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
}
