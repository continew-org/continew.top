import environmentsData from '@/data/demo-environments.json';

/**
 * 演示环境的提供者名录（含历史）。
 *
 * 数据来自旧站（VitePress）docs/admin/guide/demo.md 的「环境来源」一节，
 * 迁到官网是因为它本质上不是文档，而是**对基础设施贡献者的致谢**：
 * 谁在什么时间提供了什么配置的服务器，项目因此才能有在线演示环境。
 *
 * 放在这里而不是文档里，还与赞助体系咬合得起来——当前环境由风铃云提供，
 * 它同时也是 data/sponsors.json 的 infrastructure 档：
 * 「我提供的服务器」和「官网记录的致谢」是同一件事的两面，
 * 潜在的资源支持者看到这张表，就知道自己提供服务器后会被怎样记录。
 */
export interface DemoEnvironment {
  /** 这套环境承载了什么（可能同时包含多个服务）。 */
  env: string;
  /** 配置规格；早期记录不全时为 "-"。 */
  spec: string;
  /** 提供者名称（个人或公司）。 */
  provider: string;
  /** 提供者主页；服务器赞助商会带商品链接。 */
  url: string;
  /** 起止时间文本，如「2024.10 ~ 2025.8」「2025.8 至今」。 */
  period: string;
  /** 是否为当前在用环境。用于页面高亮，最多应只有一条。 */
  current?: boolean;
}

/**
 * 全部环境记录：当前环境在前，其余按时间倒序。
 *
 * 顺序在**数据文件里维护**，代码不做排序——period 是自由文本（「~ 2025.8」这种），
 * 用代码排既没有可靠的比较依据，也会在补记某条旧环境时打乱已有顺序。
 */
export function getDemoEnvironments(): DemoEnvironment[] {
  return environmentsData as DemoEnvironment[];
}
