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
import { join, resolve, sep } from 'node:path';

// 输出目录来自命令行：解析后必须落在工作目录内，否则拒绝执行——避免「跳出去」的路径
// 被交给读写操作（Sonar jssecurity:S8707 的路径注入）。构建脚本总是从仓库根运行。
const workingDir = resolve('.');
const root = resolve(process.argv[2] ?? 'out');
if (root !== workingDir && !root.startsWith(`${workingDir}${sep}`)) {
  throw new Error(`Refusing to operate outside the working directory: ${process.argv[2]}`);
}
const BOM = '\uFEFF';
const targets = ['llms.txt', 'llms-full.txt'];

// 两个目标文件互不依赖，并行处理即可（也让「循环内 await」的告警不再成立）。
await Promise.all(targets.map(async (relative) => {
  const file = join(root, relative);
  let text;
  try {
    text = await readFile(file, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }
  if (text.startsWith(BOM)) return;
  await writeFile(file, BOM + text);
  console.log(`Added UTF-8 BOM: ${relative}`);
}));
