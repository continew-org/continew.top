/**
 * 给静态导出里的纯文本路由补 UTF-8 BOM。
 *
 * ## 为什么需要
 *
 * `next build` 的静态导出只写出文件、不带响应头，站点由 Nginx 托管。线上实测
 * `/llms.txt` 与 `/llms-full.txt` 的 `Content-Type` 是 `text/plain` 且**不带 charset**，
 * 浏览器于是按本地默认编码猜（中文环境常见 CP936 / CP1252），整篇中文变成乱码。
 * 纯文本没法像 HTML 那样用 `<meta charset>` 自证，BOM 是唯一能自证编码的手段，
 * 各解析器也都会跳过它。
 *
 * `/sitemap.xml` 不需要——XML 声明里已经写了 encoding。逐页 Markdown
 * （`/llms.mdx/**.md`）按 `application/octet-stream` 下发，是下载而非渲染，不参与编码
 * 猜测；Markdown 里塞 BOM 反而会干扰部分解析器，故不加。
 *
 * 更彻底的做法是在 Nginx 站点配置里加 `charset utf-8;`（默认 `charset_types` 已含
 * `text/plain`），那时这里的 BOM 只是冗余、不会有害。
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.argv[2] ?? 'out';
const BOM = '\uFEFF';
const targets = ['llms.txt', 'llms-full.txt'];

for (const relative of targets) {
  const file = join(root, relative);
  let text;
  try {
    text = await readFile(file, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') continue;
    throw error;
  }
  if (text.startsWith(BOM)) continue;
  await writeFile(file, BOM + text);
  console.log(`Added UTF-8 BOM: ${relative}`);
}
