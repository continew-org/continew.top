import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { docSections } from '../lib/docs-sections.ts';

const root = process.argv[2] ?? 'out';

/**
 * 递归收集某个归档版本目录下的全部 HTML 旧路由，返回 [旧地址, 新地址] 列表。
 *
 * 子目录与文件互不依赖，用 Promise.all 并行下探——既避免逐个串行等待，
 * 也避开「循环内 await」（Sonar javascript:S9382）。
 */
async function collect(dir, section, archive, segments = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  const found = await Promise.all(
    entries.map(async (entry) => {
      if (entry.isDirectory()) {
        return collect(join(dir, entry.name), section, archive, [...segments, entry.name]);
      }
      if (!entry.isFile() || !entry.name.endsWith('.html')) return [];

      const name = entry.name.slice(0, -'.html'.length);
      const suffix = name === 'index' ? segments : [...segments, name];
      const suffixPath = suffix.length ? `/${suffix.join('/')}` : '';
      const oldRoute = join(root, 'docs', section.key, ...suffix) + '.html';
      return [[oldRoute, `/docs/${section.key}/${archive.key}${suffixPath}`]];
    }),
  );
  return found.flat();
}

const perSection = await Promise.all(
  docSections.map(async (section) => {
    const archive = section.versions?.find(({ key }) => key === section.legacyVersion);
    if (!archive) return undefined;

    const base = join(root, 'docs', section.key, archive.key);
    try {
      if (!(await stat(base)).isDirectory()) return undefined;
    } catch {
      return undefined;
    }

    const entries = await collect(base, section, archive);
    // 分区根（/docs/<分区>）同样固定指向归档版本
    entries.push([join(root, 'docs', section.key) + '.html', `/docs/${section.key}/${archive.key}`]);
    return entries;
  }),
);

// 同一旧地址被多个分区命中时后写覆盖先写，与逐条 set 的行为一致
const routes = new Map(perSection.filter(Boolean).flat());

await Promise.all(
  [...routes].map(async ([file, target]) => {
    try {
      if ((await stat(file)).isFile()) throw new Error(`Refusing to overwrite existing route: ${file}`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>文档已迁移</title><meta http-equiv="refresh" content="0;url=${target}"></head><body><p>文档已迁移到 <a href="${target}">${target}</a>。</p><script>location.replace(${JSON.stringify(target)} + location.search + location.hash)</script></body></html>`;
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, html);
  }),
);
console.log(`Created ${routes.size} legacy doc redirects.`);
