import { readFile, readdir } from 'node:fs/promises';
import { extname, join, relative, sep } from 'node:path';
import process from 'node:process';

const root = process.argv[2] ?? 'out';
const htmlFiles = [];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.isFile() && extname(entry.name) === '.html') htmlFiles.push(path);
  }
}

await walk(root);

const toPosix = (value) => value.split(sep).join('/');
const routeOf = (file) => {
  const rel = toPosix(relative(root, file));
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'/index.html'.length)}`;
  return `/${rel.slice(0, -'.html'.length)}`;
};

const routeFiles = new Map(htmlFiles.map((file) => [routeOf(file), file]));
const anchors = new Map();
const links = [];
const hrefPattern = /<a\b[^>]*\bhref=(?:"([^"]*)"|'([^']*)')[^>]*>/giu;
const idPattern = /\bid=(?:"([^"]+)"|'([^']+)')/giu;

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const route = routeOf(file);
  const ids = new Set();
  for (const match of html.matchAll(idPattern)) ids.add(match[1] ?? match[2]);
  anchors.set(route, ids);
  for (const match of html.matchAll(hrefPattern)) {
    links.push({ source: route, href: match[1] ?? match[2] });
  }
}

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
