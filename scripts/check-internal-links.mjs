import { readFile, readdir } from 'node:fs/promises';
import { extname, join, relative, resolve, sep } from 'node:path';
import process from 'node:process';

// 待检查目录来自命令行：解析后必须落在工作目录内，否则拒绝执行——避免路径注入。
// 该脚本总是从仓库根运行。
const workingDir = resolve('.');
const root = resolve(process.argv[2] ?? 'out');
if (root !== workingDir && !root.startsWith(`${workingDir}${sep}`)) {
  throw new Error(`Refusing to operate outside the working directory: ${process.argv[2]}`);
}
const files = (await readdir(root, { recursive: true, withFileTypes: true })).filter((entry) =>
  entry.isFile(),
);
const htmlFiles = files
  .filter((entry) => extname(entry.name) === '.html')
  .map((entry) => join(entry.parentPath, entry.name));

const toPosix = (value) => value.split(sep).join('/');
// 站内静态文件（如 /llms.txt、/atomgit.svg）不是页面路由，产物中存在即视为可达。
const staticFiles = new Set(
  files.map((entry) => toPosix(relative(root, join(entry.parentPath, entry.name)))),
);
const routeOf = (file) => {
  const rel = toPosix(relative(root, file));
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'/index.html'.length)}`;
  return `/${rel.slice(0, -'.html'.length)}`;
};

const routeFiles = new Map(htmlFiles.map((file) => [routeOf(file), file]));
const hrefPattern = /<a\b[^>]*\bhref=(?:"([^"]*)"|'([^']*)')[^>]*>/giu;
const idPattern = /\bid=(?:"([^"]+)"|'([^']+)')/giu;

// 各页面互不依赖，并行读取；逐页解析出锚点与出链后再合并。
const pages = await Promise.all(
  [...routeFiles].map(async ([route, file]) => {
    const html = await readFile(file, 'utf8');
    const ids = new Set();
    for (const match of html.matchAll(idPattern)) ids.add(match[1] ?? match[2]);
    const pageLinks = [...html.matchAll(hrefPattern)].map((match) => ({
      source: route,
      href: match[1] ?? match[2],
    }));
    return { route, ids, pageLinks };
  }),
);

const anchors = new Map(pages.map((page) => [page.route, page.ids]));
const links = pages.flatMap((page) => page.pageLinks);

const errors = [];
for (const { source, href } of links) {
  if (!href || href.startsWith('#')) {
    if (href?.startsWith('#') && !anchors.get(source)?.has(decodeURIComponent(href.slice(1)))) {
      errors.push(`${source}: missing fragment ${href}`);
    }
    continue;
  }
  if (href.includes('\\')) {
    errors.push(`${source}: backslash is invalid in URL ${JSON.stringify(href)}`);
    continue;
  }

  let url;
  try {
    url = new URL(href, `https://continew.top${source}`);
  } catch {
    errors.push(`${source}: invalid URL ${JSON.stringify(href)}`);
    continue;
  }
  if (url.origin !== 'https://continew.top') continue;
  if (url.pathname.startsWith('/_next/')) continue;

  const path = decodeURIComponent(url.pathname).replace(/\/$/, '') || '/';
  if (!routeFiles.has(path)) {
    if (path !== '/' && staticFiles.has(path.slice(1))) continue;
    errors.push(`${source}: ${JSON.stringify(href)} resolves to missing route ${path}`);
    continue;
  }
  if (url.hash) {
    const fragment = decodeURIComponent(url.hash.slice(1));
    if (!anchors.get(path)?.has(fragment)) {
      errors.push(`${source}: ${JSON.stringify(href)} resolves to missing fragment #${fragment} on ${path}`);
    }
  }
}

if (errors.length > 0) {
  console.error(`Found ${errors.length} broken internal link(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Internal link check passed: ${routeFiles.size} routes, ${links.length} links.`);
