import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { docSections, getSourceUnitForFile, getVersionForFolderPath, getVersionTags } from '../lib/docs-sections.ts';
import { rewriteDocUrl, rewriteCloneCommands } from '../lib/mdx-plugins/remark-archive-doc-links.ts';

const admin = docSections.find(({ key }) => key === 'admin');
const archive = getSourceUnitForFile('/project/content/docs/admin/4.x/index.mdx');
const current = getSourceUnitForFile('D:\\project\\content\\docs\\admin\\5.x\\index.mdx');
const starter = docSections.find(({ key }) => key === 'starter');
const starterArchive = getSourceUnitForFile('/project/content/docs/starter/2.x/index.mdx');
const starterCurrent = getSourceUnitForFile('/project/content/docs/starter/3.x/index.mdx');

test('source unit matching distinguishes versions and leaves the section landing alone', () => {
  assert.equal(archive?.dir, 'admin/4.x');
  assert.equal(current?.dir, 'admin/5.x');
  assert.equal(getSourceUnitForFile('/project/content/docs/admin/meta.json'), undefined);
});

test('only configured version folders become version roots', () => {
  assert.equal(getVersionForFolderPath('admin/5.x')?.key, '5.x');
  assert.equal(getVersionForFolderPath('admin/4.x')?.key, '4.x');
  assert.equal(getVersionForFolderPath('admin/5.x/manual'), undefined);
  assert.equal(getVersionForFolderPath('admin/4.x/manual/system'), undefined);
  assert.equal(getVersionForFolderPath('starter'), undefined);
  assert.equal(getVersionForFolderPath('starter/3.x')?.key, '3.x');
  assert.equal(getVersionForFolderPath('starter/2.x')?.key, '2.x');
  assert.equal(getVersionForFolderPath('starter/3.x/modules'), undefined);
});

test('legacy self links stay within the compiling version and explicit cross-version links stay unchanged', () => {
  for (const unit of [archive, current]) {
    const root = `/docs/admin/${unit.version.key}`;
    assert.equal(rewriteDocUrl('/docs/admin', unit), root);
    assert.equal(rewriteDocUrl('/docs/admin/configuration#hello', unit), `${root}/configuration#hello`);
    assert.equal(rewriteDocUrl('/docs/admin?search=roles#intro', unit), `${root}?search=roles#intro`);
    assert.equal(rewriteDocUrl('/docs/admin/4.x/configuration', unit), '/docs/admin/4.x/configuration');
    assert.equal(rewriteDocUrl('/docs/admin/5.x?search=roles', unit), '/docs/admin/5.x?search=roles');
    assert.equal(rewriteDocUrl('/docs/admin/5.x/configuration', unit), '/docs/admin/5.x/configuration');
    // 跨分区裸链接由 companion 配套规则单独断言（归档页落配套归档线，非归档页不动）
    const expected = unit === archive ? '/docs/starter/2.x' : '/docs/starter';
    assert.equal(rewriteDocUrl('/docs/starter', unit), expected);
  }
});

test('starter legacy links follow its archive and pin only its own dev refs', () => {
  assert.equal(starter.legacyVersion, '3.x');
  assert.equal(starterArchive?.version?.archived, true);
  assert.equal(rewriteDocUrl('/docs/starter', starterArchive), '/docs/starter/2.x');
  assert.equal(rewriteDocUrl('/docs/starter/modules/core#intro', starterArchive),
    '/docs/starter/2.x/modules/core#intro');
  assert.equal(rewriteDocUrl('/docs/starter/3.x/modules/core', starterArchive), '/docs/starter/3.x/modules/core');
  assert.equal(rewriteDocUrl('/docs/starter', starterCurrent), '/docs/starter/3.x');
  const link = 'https://github.com/continew-org/continew-starter/blob/dev/README.md';
  assert.equal(rewriteDocUrl(link, starterArchive),
    'https://github.com/continew-org/continew-starter/blob/v2.17.0/README.md');
  assert.equal(rewriteDocUrl(link, starterCurrent), link);
});

test('archived source links pin only dev refs for their own version', () => {
  const github = 'https://github.com/continew-org/continew-admin/blob/dev/README.md';
  assert.equal(rewriteDocUrl(github, archive), github.replace('/dev/', '/v4.2.0/'));
  assert.equal(rewriteDocUrl(github, current), github);
  assert.equal(rewriteDocUrl(github.replace('/dev/', '/v4.1.0/'), archive), github.replace('/dev/', '/v4.1.0/'));
  assert.equal(rewriteDocUrl('https://github.com/continew-org/continew-starter/tree/dev/docs', archive),
    'https://github.com/continew-org/continew-starter/tree/v2.17.0/docs');
  assert.equal(rewriteDocUrl('https://github.com/continew-org/continew-admin/blob/dev/CHANGELOG.md', archive),
    'https://github.com/continew-org/continew-admin/blob/dev/CHANGELOG.md');
});

test('a second archive keeps version-specific tags and does not change the legacy redirect target', () => {
  const another = { ...archive, version: { ...archive.version, key: '5.x', versionTag: 'v5.0.0' } };
  const link = 'https://github.com/continew-org/continew-admin/tree/dev';
  assert.equal(rewriteDocUrl(link, another), link.replace('/dev', '/v5.0.0'));
  assert.equal(rewriteDocUrl(link, archive), link.replace('/dev', '/v4.2.0'));
  assert.equal(admin.legacyVersion, '5.x');
  assert.equal(getVersionTags(archive.version)['continew-admin-ui'], 'v4.2.0');
});

test('archived git clone commands pin the maintenance ref and companion tags', () => {
  const block = [
    'git clone https://github.com/continew-org/continew-admin.git',
    'cd continew-admin',
    'git clone https://github.com/continew-org/continew-admin-ui.git',
    'git clone https://github.com/continew-org/continew-starter.git',
    'git clone https://github.com/other-org/unrelated.git',
  ].join('\n');
  const rewritten = rewriteCloneCommands(block, archive);
  const lines = rewritten.split('\n');
  // 主仓库钉维护分支（含发布后修复），配套仓库只有冻结 tag
  assert.equal(lines[0], 'git clone -b 4.2.x https://github.com/continew-org/continew-admin.git');
  assert.equal(lines[1], 'cd continew-admin');
  assert.equal(lines[2], 'git clone -b v4.2.0 https://github.com/continew-org/continew-admin-ui.git');
  assert.equal(lines[3], 'git clone -b v2.17.0 https://github.com/continew-org/continew-starter.git');
  // 注册表外的仓库不动
  assert.equal(lines[4], 'git clone https://github.com/other-org/unrelated.git');
  // 已显式指定分支的命令、非归档版本、无 URL 的 clone 均不动
  assert.equal(
    rewriteCloneCommands('git clone -b dev https://github.com/continew-org/continew-admin.git', archive),
    'git clone -b dev https://github.com/continew-org/continew-admin.git',
  );
  assert.equal(rewriteCloneCommands(block, current), block);
  assert.equal(rewriteCloneCommands('git clone --depth 1', archive), 'git clone --depth 1');
  // starter 归档线钉自己的维护 ref；其配套仓库 continew-admin 钉配套 tag v4.2.0
  assert.equal(
    rewriteCloneCommands('git clone https://github.com/continew-org/continew-starter.git', starterArchive),
    'git clone -b 2.17.x https://github.com/continew-org/continew-starter.git',
  );
  assert.equal(
    rewriteCloneCommands('git clone https://github.com/continew-org/continew-admin.git', starterArchive),
    'git clone -b v4.2.0 https://github.com/continew-org/continew-admin.git',
  );
  // 既非主仓库也非配套仓库时不改
  assert.equal(
    rewriteCloneCommands('git clone https://github.com/continew-org/continew-app.git', starterArchive),
    'git clone https://github.com/continew-org/continew-app.git',
  );
});

test('cross-section bare links on archived pages resolve to the companion archive', () => {
  // admin 4.x 配套 starter v2.17.0 → /docs/starter 落到 starter/2.x
  assert.equal(rewriteDocUrl('/docs/starter', archive), '/docs/starter/2.x');
  assert.equal(rewriteDocUrl('/docs/starter/modules/extension/crud', archive),
    '/docs/starter/2.x/modules/extension/crud');
  assert.equal(rewriteDocUrl('/docs/starter/modules/cache#anchor', archive),
    '/docs/starter/2.x/modules/cache#anchor');
  // 反向：starter 2.x 配套 admin v4.2.0 → /docs/admin 落到 admin/4.x
  assert.equal(rewriteDocUrl('/docs/admin/reference/security', starterArchive),
    '/docs/admin/4.x/reference/security');
  // 已显式写版本段的不动
  assert.equal(rewriteDocUrl('/docs/starter/3.x/modules/cache', archive),
    '/docs/starter/3.x/modules/cache');
  assert.equal(rewriteDocUrl('/docs/starter/2.x', archive), '/docs/starter/2.x');
  // 非归档页不做跨分区改写
  assert.equal(rewriteDocUrl('/docs/starter', current), '/docs/starter');
  // 没有版本结构的分区（app）保持原样
  assert.equal(rewriteDocUrl('/docs/app', archive), '/docs/app');
  // 本分区裸链接仍归 own-version 规则处理（不重复插版本段）
  assert.equal(rewriteDocUrl('/docs/admin', archive), '/docs/admin/4.x');
});

test('legacy redirect generator preserves query and anchor and refuses to overwrite routes', async () => {
  const output = await mkdtemp(join(tmpdir(), 'docs-redirects-'));
  try {
    const versionDir = join(output, 'docs', 'admin', '5.x');
    await mkdir(versionDir, { recursive: true });
    await writeFile(join(versionDir, 'configuration.html'), '<html></html>');
    const starterVersionDir = join(output, 'docs', 'starter', '3.x');
    await mkdir(starterVersionDir, { recursive: true });
    await writeFile(join(starterVersionDir, 'configuration.html'), '<html></html>');
    // 仅在归档版本存在的页面（最新版已删除）也要生成旧地址跳转页
    await mkdir(join(output, 'docs', 'admin', '4.x', 'manual'), { recursive: true });
    await writeFile(join(output, 'docs', 'admin', '4.x', 'manual', 'generator.html'), '<html></html>');
    const script = join(process.cwd(), 'scripts', 'gen-legacy-doc-redirects.mjs');
    // 脚本只接受「工作目录内」的输出目录（路径注入防护），
    // 故在临时目录里执行、把输出目录传成当前位置。
    execFileSync(process.execPath, [script, '.'], { cwd: output });
    const redirect = await readFile(join(output, 'docs', 'admin', 'configuration.html'), 'utf8');
    assert.match(redirect, /location\.replace\("\/docs\/admin\/5\.x\/configuration" \+ location\.search \+ location\.hash\)/);
    const projectRedirect = await readFile(join(output, 'docs', 'admin.html'), 'utf8');
    assert.match(projectRedirect, /location\.replace\("\/docs\/admin\/5\.x" \+ location\.search \+ location\.hash\)/);
    const starterRedirect = await readFile(join(output, 'docs', 'starter', 'configuration.html'), 'utf8');
    assert.match(starterRedirect, /location\.replace\("\/docs\/starter\/3\.x\/configuration" \+ location\.search \+ location\.hash\)/);
    const starterProjectRedirect = await readFile(join(output, 'docs', 'starter.html'), 'utf8');
    assert.match(starterProjectRedirect, /location\.replace\("\/docs\/starter\/3\.x" \+ location\.search \+ location\.hash\)/);
    const removedRedirect = await readFile(join(output, 'docs', 'admin', 'manual', 'generator.html'), 'utf8');
    assert.match(removedRedirect, /location\.replace\("\/docs\/admin\/4\.x\/manual\/generator" \+ location\.search \+ location\.hash\)/);
    assert.throws(() => execFileSync(process.execPath, [script, '.'], { cwd: output, stdio: 'pipe' }));
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});

test('export contains both version routes and legacy static redirect when snapshots are present', async (t) => {
  const dir = join(process.cwd(), 'out', 'docs', 'admin');
  try {
    await access(join(dir, '4.x.html'));
  } catch {
    t.skip('requires an exported build with upstream Admin snapshots');
    return;
  }
  const projectRedirect = await readFile(join(process.cwd(), 'out', 'docs', 'admin.html'), 'utf8');
  assert.match(projectRedirect, /location\.replace\("\/docs\/admin\/5\.x" \+ location\.search \+ location\.hash\)/);
  const legacy = await readFile(join(dir, 'reference', 'security.html'), 'utf8');
  assert.match(legacy, /location\.replace\("\/docs\/admin\/5\.x\/reference\/security" \+ location\.search \+ location\.hash\)/);
  const latest = await readFile(join(dir, '5.x.html'), 'utf8');
  assert.match(latest, /href="\/docs\/admin\/5\.x\/reference\/faq"/);
  const archivedMarkdown = await readFile(join(process.cwd(), 'out', 'llms.mdx', 'docs', 'admin', '4.x', 'content.md'), 'utf8');
  assert.match(archivedMarkdown, /本文是 4\.x 的归档文档（冻结于 v4\.2\.0）/);
  assert.match(archivedMarkdown, /\/docs\/admin\/5\.x/);
});

test('export contains both starter versions and its legacy static redirect when snapshots are present', async (t) => {
  const dir = join(process.cwd(), 'out', 'docs', 'starter');
  try {
    await access(join(dir, '2.x.html'));
  } catch {
    t.skip('requires an exported build with upstream Starter snapshots');
    return;
  }
  const projectRedirect = await readFile(join(process.cwd(), 'out', 'docs', 'starter.html'), 'utf8');
  assert.match(projectRedirect, /location\.replace\("\/docs\/starter\/3\.x" \+ location\.search \+ location\.hash\)/);
  const legacy = await readFile(join(dir, 'modules', 'core.html'), 'utf8');
  assert.match(legacy, /location\.replace\("\/docs\/starter\/3\.x\/modules\/core" \+ location\.search \+ location\.hash\)/);
  const latest = await readFile(join(dir, '3.x.html'), 'utf8');
  assert.match(latest, /href="\/docs\/starter\/3\.x\/modules\/core"/);
  const archivedMarkdown = await readFile(
    join(process.cwd(), 'out', 'llms.mdx', 'docs', 'starter', '2.x', 'content.md'),
    'utf8',
  );
  assert.match(archivedMarkdown, /本文是 2\.x 的归档文档（冻结于 v2\.17\.0）/);
  assert.match(archivedMarkdown, /\/docs\/starter\/3\.x/);
});
