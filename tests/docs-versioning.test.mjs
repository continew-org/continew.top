import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { docSections, getSourceUnitForFile, getVersionTags } from '../lib/docs-sections.ts';
import { rewriteDocUrl } from '../lib/mdx-plugins/remark-archive-doc-links.ts';

const admin = docSections.find(({ key }) => key === 'admin');
const archive = getSourceUnitForFile('/project/content/docs/admin/4.2/index.mdx');
const current = getSourceUnitForFile('D:\\project\\content\\docs\\admin\\5.0\\index.mdx');

test('source unit matching distinguishes versions and leaves the section landing alone', () => {
  assert.equal(archive?.dir, 'admin/4.2');
  assert.equal(current?.dir, 'admin/5.0');
  assert.equal(getSourceUnitForFile('/project/content/docs/admin/index.mdx'), undefined);
});

test('legacy self links stay within the compiling version and explicit cross-version links stay unchanged', () => {
  for (const unit of [archive, current]) {
    const root = `/docs/admin/${unit.version.key}`;
    assert.equal(rewriteDocUrl('/docs/admin', unit), root);
    assert.equal(rewriteDocUrl('/docs/admin/configuration#hello', unit), `${root}/configuration#hello`);
    assert.equal(rewriteDocUrl('/docs/admin?search=roles#intro', unit), `${root}?search=roles#intro`);
    assert.equal(rewriteDocUrl('/docs/admin/4.2/configuration', unit), '/docs/admin/4.2/configuration');
    assert.equal(rewriteDocUrl('/docs/admin/5.0?search=roles', unit), '/docs/admin/5.0?search=roles');
    assert.equal(rewriteDocUrl('/docs/admin/5.0/configuration', unit), '/docs/admin/5.0/configuration');
    assert.equal(rewriteDocUrl('/docs/starter', unit), '/docs/starter');
  }
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

test('a second archive keeps version-specific tags and does not change legacy owner', () => {
  const another = { ...archive, version: { ...archive.version, key: '5.0', versionTag: 'v5.0.0' } };
  const link = 'https://github.com/continew-org/continew-admin/tree/dev';
  assert.equal(rewriteDocUrl(link, another), link.replace('/dev', '/v5.0.0'));
  assert.equal(rewriteDocUrl(link, archive), link.replace('/dev', '/v4.2.0'));
  assert.equal(admin.legacyVersion, '4.2');
  assert.equal(getVersionTags(archive.version)['continew-admin-ui'], 'v4.2.0');
});

test('legacy redirect generator preserves query and anchor and refuses to overwrite routes', async () => {
  const output = await mkdtemp(join(tmpdir(), 'docs-redirects-'));
  try {
    const archiveDir = join(output, 'docs', 'admin', '4.2');
    await mkdir(archiveDir, { recursive: true });
    await writeFile(join(archiveDir, 'configuration.html'), '<html></html>');
    const script = join(process.cwd(), 'scripts', 'gen-legacy-doc-redirects.mjs');
    execFileSync(process.execPath, [script, output]);
    const redirect = await readFile(join(output, 'docs', 'admin', 'configuration.html'), 'utf8');
    assert.match(redirect, /location\.replace\("\/docs\/admin\/4\.2\/configuration" \+ location\.search \+ location\.hash\)/);
    assert.throws(() => execFileSync(process.execPath, [script, output], { stdio: 'pipe' }));
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});

test('export contains both version routes and legacy static redirect when snapshots are present', async (t) => {
  const dir = join(process.cwd(), 'out', 'docs', 'admin');
  try {
    await access(join(dir, '4.2.html'));
  } catch {
    t.skip('requires an exported build with upstream Admin snapshots');
    return;
  }
  const legacy = await readFile(join(dir, 'reference', 'security.html'), 'utf8');
  assert.match(legacy, /location\.replace\("\/docs\/admin\/4\.2\/reference\/security" \+ location\.search \+ location\.hash\)/);
  const latest = await readFile(join(dir, '5.0.html'), 'utf8');
  assert.match(latest, /href="\/docs\/admin\/5\.0\/reference\/faq"/);
  const archivedMarkdown = await readFile(join(process.cwd(), 'out', 'llms.mdx', 'docs', 'admin', '4.2', 'content.md'), 'utf8');
  assert.match(archivedMarkdown, /本文是 4\.2\.x 的归档文档/);
  assert.match(archivedMarkdown, /\/docs\/admin\/5\.0/);
});
