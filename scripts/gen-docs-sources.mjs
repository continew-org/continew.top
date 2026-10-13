/**
 * 输出文档版本的拉取目标，供 CI 组装 content/docs 使用。
 *
 * 输出形式（每行一条，可直接 `IFS='=' read`）：
 *
 * ```
 * admin/5.x=continew-admin@dev
 * admin/4.x=continew-admin@4.2.x
 * starter=continew-starter@dev
 * app=continew-app@dev
 * ```
 *
 * ## 为什么要有这个脚本
 *
 * deploy.yml 此前手抄了一份分区 -> 仓库映射。它与 lib/docs-sections.ts 会漂移：
 * 在配置里加了版本却忘了同步 workflow，线上就拿不到那个分支，而构建依然成功——
 * 一个不报错的偏差。让 CI 从配置读，漂移就不可能发生。
 *
 * key 是 `content/docs` 下的相对路径（不是分区名）：同一仓库的不同版本会拉取到
 * 不同目录，二者必须一一对应。
 */

// 此处的 .ts 后缀是必须的：本文件由 Node 直接执行，类型剥离不做路径补全。
// 与 source.config.ts 的情况不同——那边由 Next 编译加载，走 bundler 解析。
import { getSourceTargets } from '../lib/docs-sections.ts';

const lines = getSourceTargets().map(({ dir, repo, ref }) => `${dir}=${repo}@${ref}`);

process.stdout.write(`${lines.join('\n')}\n`);
