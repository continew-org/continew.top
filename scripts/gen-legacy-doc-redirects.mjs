import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { docSections } from '../lib/docs-sections.ts';

const root = process.argv[2] ?? 'out';
const routes = new Map();
for (const section of docSections) {
  const archive = section.versions?.find(({ key }) => key === section.legacyVersion);
  if (!archive) continue;
  const base = join(root, 'docs', section.key, archive.key);
  try {
    if (!(await stat(base)).isDirectory()) continue;
  } catch {
    continue;
  }
  async function collect(dir, segments = []) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) await collect(join(dir, entry.name), [...segments, entry.name]);
      if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
      const name = entry.name.slice(0, -'.html'.length);
      const suffix = name === 'index' ? segments : [...segments, name];
      const oldRoute = join(root, 'docs', section.key, ...suffix) + '.html';
      const target = `/docs/${section.key}/${archive.key}${suffix.length ? `/${suffix.join('/')}` : ''}`;
      routes.set(oldRoute, target);
    }
  }
  await collect(base);
  routes.set(join(root, 'docs', section.key) + '.html', `/docs/${section.key}/${archive.key}`);
}

for (const [file, target] of routes) {
  try {
    if ((await stat(file)).isFile()) throw new Error(`Refusing to overwrite existing route: ${file}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>文档已迁移</title><meta http-equiv="refresh" content="0;url=${target}"></head><body><p>文档已迁移到 <a href="${target}">${target}</a>。</p><script>location.replace(${JSON.stringify(target)} + location.search + location.hash)</script></body></html>`;
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
}
console.log(`Created ${routes.size} legacy doc redirects.`);
