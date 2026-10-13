import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInThisContext } from 'node:vm';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const require = createRequire(join(root, 'package.json'));
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const cache = new Map();

function loadTs(relativePath) {
  const file = join(root, relativePath);
  if (cache.has(file)) return cache.get(file).exports;
  const loaded = { exports: {} };
  cache.set(file, loaded);
  const { outputText } = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
    fileName: file,
  });
  const localRequire = (id) => id.startsWith('@/') ? loadTs(`${id.slice(2)}.ts`) : require(id);
  runInThisContext(`(function(require,module,exports){${outputText}\n})`, { filename: file })(localRequire, loaded, loaded.exports);
  return loaded.exports;
}

const { Button, ActionLink, FilterChip } = loadTs('components/site-actions.tsx');
const { siteLayout, siteType } = loadTs('lib/site-design.ts');
const render = (component, props, children) => renderToStaticMarkup(React.createElement(component, props, children));
const exported = (path) => readFileSync(join(root, 'out', path), 'utf8');

function openingTag(html, tag, marker) {
  const tags = html.match(new RegExp(`<${tag}\\b[^>]*>`, 'g')) ?? [];
  const found = tags.find((item) => item.includes(marker));
  assert.ok(found, `Missing ${tag}: ${marker}`);
  return found;
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return match?.[1];
}

test('standard and reading shells keep explicit width and padding contracts', () => {
  assert.match(siteLayout.standard, /max-w-6xl/);
  assert.match(siteLayout.standard, /px-6/);
  assert.match(siteLayout.reading, /max-w-5xl/);
  assert.match(siteLayout.home, /max-w-6xl/);
  assert.match(siteType.pageTitle, /sm:text-5xl/);
  assert.match(siteType.cardTitle, /text-base/);
});

test('buttons preserve operation semantics, focus, accessible names and disabled state', () => {
  const html = render(Button, { disabled: true, size: 'icon', 'aria-label': '复制' });
  const tag = openingTag(html, 'button', 'data-cn-control="button"');
  assert.equal(attribute(tag, 'type'), 'button');
  assert.equal(attribute(tag, 'aria-label'), '复制');
  assert.match(tag, /disabled=""/);
  assert.match(attribute(tag, 'class'), /size-11/);
  assert.match(attribute(tag, 'class'), /focus-visible:ring-2/);
  assert.equal(attribute(openingTag(render(Button, { type: 'submit' }, '提交'), 'button', 'type='), 'type'), 'submit');
});

test('filter chips share state styles and aria-pressed rather than primary button styling', () => {
  for (const selected of [true, false]) {
    const html = render(FilterChip, { selected }, '分类');
    const tag = openingTag(html, 'button', 'data-cn-control="filter"');
    assert.equal(attribute(tag, 'aria-pressed'), String(selected));
    assert.match(attribute(tag, 'class'), /min-h-11/);
    assert.match(attribute(tag, 'class'), /focus-visible:ring-2/);
    if (selected) assert.match(attribute(tag, 'class'), /bg-\[var\(--cn-brand-soft\)\]/);
  }
});

test('internal and fragment navigation stay in the current tab', () => {
  for (const href of ['/blog', '#motion']) {
    const html = render(ActionLink, { href }, '继续浏览');
    const tag = openingTag(html, 'a', 'data-cn-control="link"');
    assert.equal(attribute(tag, 'href'), href);
    assert.equal(attribute(tag, 'target'), undefined);
    assert.match(attribute(tag, 'class'), /min-h-11/);
    assert.equal((html.match(/<a\b/g) ?? []).length, 1);
  }
});

test('all action variants retain their declared target sizes, including text links', () => {
  for (const variant of ['primary', 'secondary', 'ghost', 'text', 'overlay']) {
    for (const [size, expected] of [['md', 'min-h-11'], ['lg', 'min-h-12'], ['icon', 'size-11']]) {
      const html = render(ActionLink, { href: '/blog', variant, size }, '继续浏览');
      const tag = openingTag(html, 'a', 'data-cn-control="link"');
      assert.ok(attribute(tag, 'class').includes(expected), `${variant}/${size} must contain ${expected}`);
    }
  }
});

test('media triggers have zero padding without overriding ordinary action sizes', () => {
  const tag = openingTag(render(Button, { size: 'media' }, '图片'), 'button', 'data-cn-control="button"');
  const classes = attribute(tag, 'class');
  assert.match(classes, /min-h-11 min-w-11/);
  assert.match(classes, /p-0/);
  assert.doesNotMatch(classes, /px-5|py-2\.5|!/);
});

test('external navigation uses secure new-window attributes and an accessible announcement', () => {
  const html = render(ActionLink, { href: 'https://github.com/continew-org' }, 'GitHub');
  const tag = openingTag(html, 'a', 'data-cn-control="link"');
  assert.equal(attribute(tag, 'target'), '_blank');
  assert.equal(attribute(tag, 'rel'), 'noopener noreferrer');
  assert.match(html, /在新窗口打开/);
});

test('all primary site pages export the same standard shell and declared title variant', () => {
  for (const page of ['blog', 'team', 'users', 'sponsor', 'timeline', 'demo']) {
    const html = exported(`${page}.html`);
    const main = openingTag(html, 'main', 'data-cn-page="standard"');
    const classes = attribute(main, 'class');
    assert.match(classes, /max-w-6xl/);
    assert.doesNotMatch(classes, /max-w-5xl/);
    const title = openingTag(html, 'h1', `data-cn-title="${page === 'demo' ? 'task' : page === 'blog' ? 'editorial' : 'community'}"`);
    assert.match(attribute(title, 'class'), page === 'demo' ? /sm:text-4xl/ : /sm:text-5xl/);
    assert.doesNotMatch(attribute(title, 'class'), /3\.5rem/);
  }
});

test('blog detail keeps its reading shell instead of stretching long prose', () => {
  const html = exported('blog/2026/continew-dynamics-2026-10.html');
  const main = openingTag(html, 'main', 'data-cn-page="reading"');
  assert.match(attribute(main, 'class'), /max-w-5xl/);
  assert.match(html, /w-72/);
});

test('component examples are noindex and excluded from discovery surfaces', () => {
  const html = exported('design-system.html');
  const robots = openingTag(html, 'meta', 'name="robots"');
  assert.equal(attribute(robots, 'content'), 'noindex, nofollow');
  assert.doesNotMatch(exported('sitemap.xml'), /design-system/);
  for (const page of ['index.html', 'blog.html', 'team.html', 'sponsor.html']) {
    assert.doesNotMatch(exported(page), /href="\/design-system(?:["/#?])/);
  }
  for (const file of ['llms.txt', 'llms-full.txt']) assert.doesNotMatch(exported(file), /\/design-system/);
});

test('exported plain-text routes declare UTF-8 so browsers cannot mis-decode them', () => {
  // 静态导出不带响应头，text/plain 无 charset 时浏览器按本地编码猜，中文会乱码
  for (const file of ['llms.txt', 'llms-full.txt']) {
    assert.ok(exported(file).startsWith('\uFEFF'), `${file} must start with a UTF-8 BOM`);
  }
});

test('exported CSS preserves the reduced-motion and keyboard marquee contracts', () => {
  const postcss = require('postcss');
  const sheets = [];
  function collect(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = join(directory, entry.name);
      if (entry.isDirectory()) collect(file);
      else if (entry.name.endsWith('.css')) sheets.push(postcss.parse(readFileSync(file, 'utf8')));
    }
  }
  collect(join(root, 'out/_next/static'));
  assert.ok(sheets.length > 0, 'The build must export stylesheets');
  const normalize = (selector) => selector.replace(/\s+/g, '');
  function hasDeclaration(selector, preference, property, value) {
    let found = false;
    for (const sheet of sheets) sheet.walkRules((rule) => {
      if (!rule.selector.split(',').some((item) => normalize(item) === normalize(selector))) return;
      let parent = rule.parent;
      let matchesPreference = preference === null;
      while (parent) {
        if (parent.type === 'atrule' && parent.name === 'media' && new RegExp(`prefers-reduced-motion:\\s*${preference}`).test(parent.params)) matchesPreference = true;
        parent = parent.parent;
      }
      if (!matchesPreference) return;
      rule.walkDecls(property, (declaration) => {
        if (declaration.value === value) found = true;
      });
    });
    assert.ok(found, `${selector} must have ${property}: ${value} in ${preference ?? 'base'} CSS`);
  }
  for (const selector of ['.cn-reveal', '.cn-stagger > *', '.cn-glow', '.cn-marquee']) {
    hasDeclaration(selector, 'reduce', 'animation', 'none');
    hasDeclaration(selector, 'reduce', 'transform', 'none');
  }
  hasDeclaration('.cn-marquee-copy', 'reduce', 'display', 'none');
  hasDeclaration('.cn-marquee-viewport', 'reduce', 'overflow-x', 'auto');
  hasDeclaration('.cn-marquee-host:focus-within .cn-marquee', null, 'animation', 'none');
  hasDeclaration('.cn-marquee-host:focus-within .cn-marquee-copy', null, 'display', 'none');
  hasDeclaration('.cn-marquee-host:focus-within .cn-marquee-viewport', null, 'overflow-x', 'auto');
  hasDeclaration('.cn-marquee-host:hover .cn-marquee', null, 'animation-play-state', 'paused');
  // Tailwind 4 的 preflight 不再为按钮补手形光标，导出的样式必须自己补回来。
  const pointerRules = [];
  for (const sheet of sheets) sheet.walkRules((rule) => {
    if (!/button/.test(rule.selector)) return;
    rule.walkDecls('cursor', (declaration) => {
      if (declaration.value === 'pointer') pointerRules.push(rule.selector);
    });
  });
  assert.ok(pointerRules.length > 0, 'Enabled buttons must keep the pointer cursor');
  const html = exported('index.html');
  const regions = (html.match(/<div\b[^>]*>/g) ?? []).filter((tag) => attribute(tag, 'class')?.includes('cn-marquee-viewport'));
  assert.ok(regions.length >= 2, 'Both marquee types must expose a keyboard scroll region');
  for (const tag of regions) {
    assert.equal(attribute(tag, 'role'), 'region');
    assert.equal(attribute(tag, 'tabindex'), '0');
    assert.ok(attribute(tag, 'aria-label'));
  }
  const copies = (html.match(/<li\b[^>]*>/g) ?? []).filter((tag) => attribute(tag, 'class')?.includes('cn-marquee-copy'));
  assert.ok(copies.length > 0, 'Marquee copies must be present in the exported homepage');
  for (const tag of copies) {
    assert.equal(attribute(tag, 'aria-hidden'), 'true');
    assert.match(tag, /\sinert(?:=""|\s|>)/);
  }
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.dependencies['framer-motion'], undefined);
  assert.equal(pkg.dependencies.motion, undefined);
});
