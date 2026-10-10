import fs from 'node:fs';
import path from 'node:path';
import { SPONSOR_ASSET_BASE, getSponsors } from './sponsors';

/**
 * 赞助商素材的**构建期存在性校验**。
 *
 * 【为什么需要它】
 * `img` / `logo` 存的是相对路径字符串，写错不会有任何编译错误——只会在页面上
 * 变成一个裂图。这类事故已经发生过两次：赞赏码目录重组、`aeoliancloud/`
 * 素材迁移，都属于"改路径改出来的 404"，而且都要等到人打开页面才被发现。
 *
 * 校验放在构建期（服务端组件的模块顶层，dev 与 build 都会跑），
 * 路径写错直接抛错让构建失败，而不是上线后等读者发现。
 *
 * 【为什么单独一个文件】
 * 这个模块要 import `node:fs`，只能在服务端跑。`lib/sponsors.ts` 被客户端组件
 * （docs-sponsor-slot）引用，所以 fs 不能出现在那条依赖链上。
 */

/**
 * 检查所有赞助商声明的 img / logo 在 public 下真实存在。
 * 缺失时抛错，附带全部缺失项——一次报全，避免改一个跑一次。
 */
export function assertSponsorAssetsExist(): void {
  const root = path.join(process.cwd(), 'public', SPONSOR_ASSET_BASE.replace(/^\/+/, ''));
  const missing: string[] = [];

  // 只查有素材字段的两档，先各自取出（避免 getSponsors 对联合入参的重载解析问题）。
  const entries = [
    ...getSponsors('strategic').map((sponsor) => ({ tier: 'strategic' as const, sponsor })),
    ...getSponsors('infrastructure').map((sponsor) => ({ tier: 'infrastructure' as const, sponsor })),
  ];
  for (const { tier, sponsor } of entries) {
    for (const file of [sponsor.img, sponsor.logo]) {
      if (!file) continue;
      if (!fs.existsSync(path.join(root, file))) {
        missing.push(`  - ${tier} / ${sponsor.name}: ${SPONSOR_ASSET_BASE}/${file}`);
      }
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `赞助商素材缺失（${missing.length} 处）：\n${missing.join('\n')}\n` +
        `请检查 data/sponsors.json 里的 img / logo 路径，或素材是否已放到 ${SPONSOR_ASSET_BASE}/<赞助商>/ 下。`,
    );
  }
}