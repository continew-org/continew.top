/**
 * 拉取三平台 Star 当前值，原子写入 stats.json（部署机 crontab 每小时执行一次）。
 *
 * 用法（部署机上跑，输出路径 = Nginx 站点根目录下的 stats.json）：
 *
 * ```bash
 * # 推荐：与 deploy.yml 同款 node:22 容器，不依赖部署机装了哪个版本的 Node
 * docker run --rm \
 *   -v <官网仓库检出目录>:/ws -w /ws \
 *   -v <SERVER_PATH>:/site \
 *   node:22 node scripts/update-stats.mjs /site/stats.json
 * ```
 *
 * ```
 * # crontab（分 17 刻避开整点；日志落盘便于排查）
 * 17 * * * * docker run --rm -v /root/continew/continew.top:/ws -w /ws \
 *   -v /root/continew/nginx/html:/site node:22 \
 *   node scripts/update-stats.mjs /site/stats.json >> /root/continew/stats.log 2>&1
 * ```
 *
 * ## 为什么是「服务器 cron → stats.json → 浏览器读自家域名」
 *
 * - 站点是纯静态导出，没有服务端运行时，Star 数平时只随构建更新；而构建值只在有
 *   文档变更触发的重建时更新，上游无变化时会长期停留——正因如此才加每小时 cron 这层。
 * - 让浏览器直连三平台 API 在技术上可行（都有 CORS 放行），但官网读者主要在国内，
 *   api.github.com 对部分访客不可达——等于把可达性转嫁给访客。由部署机拉一次、
 *   写成自家域名下的静态文件，所有访客只需访问 continew.top。
 * - 定时任务没有走 GitHub Actions 的 schedule：把 workflow 当通用 cron 高频调用
 *   有触发滥用审查的先例，每天一两次构建属于正常用途，每小时一次不是。
 *
 * ## 失败语义：宁旧勿缺
 *
 * 任何平台拉不到就沿用 stats.json 里上一次的数值（该文件由本脚本独占维护，
 * deploy.yml 的 rsync 步骤已 --exclude 它，不会被 --delete 清掉）；全部平台失败
 * 时退出码 1、不触碰旧文件，cron 日志里可见。前端在 stats.json
 * 缺失或过期时静默回落构建期数值，页面上永远不会出现空洞或报错。
 *
 * 平台注册表复用 lib/platform-api.ts（唯一事实源）：URL 若在这里手抄一份，
 * 上游改接口就只有这一条链路会悄悄失真。import .ts 依赖 Node ≥ 22.18 的
 * 类型剥离——与 scripts/gen-docs-sources.mjs 同一机制。
 */
import { readFile, rename, writeFile } from 'node:fs/promises';

import { getOrgRepos, PLATFORMS } from '../lib/platform-api.ts';

const outPath = process.argv[2];
if (!outPath) {
  console.error('用法：node scripts/update-stats.mjs <stats.json 输出路径>');
  process.exit(1);
}

/** 读取上一次的结果；文件不存在或损坏都按「没有旧值」处理，不阻断本次写入。 */
async function readPrevious() {
  try {
    const parsed = JSON.parse(await readFile(outPath, 'utf8'));
    if (parsed && typeof parsed === 'object' && parsed.platforms && typeof parsed.platforms === 'object') {
      return parsed.platforms;
    }
  } catch {
    // 首次运行，或旧文件不是合法 JSON
  }
  return {};
}

const previous = await readPrevious();
const fresh = {};
for (const platform of PLATFORMS) {
  const repos = await getOrgRepos(platform);
  if (!Array.isArray(repos)) {
    console.warn(`[update-stats] ${platform.name} 拉取失败，沿用旧值（${previous[platform.key] ?? '无'}）`);
    continue;
  }
  // 口径与 lib/site-stats.ts 的 computeStarSummary 完全一致：组织全部公开仓库的
  // stargazers_count 求和。改这里必须同步改那边，否则实时值与构建值会互相「回跳」。
  fresh[platform.key] = repos.reduce(
    (sum, repo) => sum + (typeof repo?.stargazers_count === 'number' ? repo.stargazers_count : 0),
    0,
  );
}

if (Object.keys(fresh).length === 0) {
  console.error('[update-stats] 全部平台都拉取失败，保留旧文件不写。');
  process.exit(1);
}

const platforms = { ...previous, ...fresh };
const stats = {
  version: 1,
  updatedAt: new Date().toISOString(),
  platforms,
  // 总数只在三平台齐备时才给：缺一个就把总数说小，不如让前端继续用构建值
  // 求和与齐备判定都按 PLATFORMS 注册表键取值，旧文件里的遗留键不参与合计
  total: PLATFORMS.every((p) => typeof platforms[p.key] === 'number')
    ? PLATFORMS.reduce((sum, p) => sum + platforms[p.key], 0)
    : undefined,
};

// 先写临时文件再原子改名：cron 与访客读取并发时，浏览器不会读到写了一半的文件
const tmpPath = `${outPath}.tmp`;
await writeFile(tmpPath, `${JSON.stringify(stats, null, 2)}\n`);
await rename(tmpPath, outPath);
console.log(`[update-stats] 已写入 ${outPath}：`, JSON.stringify(stats.platforms));
