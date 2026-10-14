import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInThisContext } from 'node:vm';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const require = createRequire(join(root, 'package.json'));
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const cache = new Map();

/** 把无扩展名的模块 id 解析成仓库内的实际文件：先 .tsx 再 .ts。 */
function resolveLocal(withoutExtension) {
  for (const extension of ['.tsx', '.ts']) {
    if (existsSync(join(root, withoutExtension + extension))) return withoutExtension + extension;
  }
  throw new Error(`Cannot resolve ${withoutExtension}`);
}

function loadTs(relativePath) {
  const file = join(root, relativePath);
  if (cache.has(file)) return cache.get(file).exports;
  const loaded = { exports: {} };
  cache.set(file, loaded);
  const { outputText } = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
    fileName: file,
  });
  const localRequire = (id) => {
    if (id.startsWith('@/')) return loadTs(resolveLocal(id.slice(2)));
    // 组件之间用相对路径互相引用（./commit-heatmap），要按「引用者所在目录」解析
    if (id.startsWith('.')) {
      return loadTs(resolveLocal(relative(root, resolve(dirname(file), id)).split(sep).join('/')));
    }
    return require(id);
  };
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

test('home mobile navigation keeps one typography contract without changing docs or desktop navigation', () => {
  const css = require('postcss').parse(readFileSync(join(root, 'app/global.css'), 'utf8'));
  const rules = new Map();
  css.walkAtRules('media', (media) => {
    if (media.params !== '(width < 40rem)') return;
    media.walkRules((rule) => {
      const declarations = {};
      rule.walkDecls((declaration) => { declarations[declaration.prop] = declaration.value; });
      rules.set(rule.selector, declarations);
    });
  });
  const panel = '#nd-nav > nav > div[id]';
  const links = rules.get(`${panel} a:not([aria-label])`);
  assert.equal(links?.['min-height'], '44px');
  assert.equal(links?.['font-size'], '1rem');
  assert.equal(links?.color, 'var(--color-fd-foreground)');
  assert.equal(links?.padding, '10px 12px');
  assert.equal(rules.get(`${panel} a:not([aria-label]):hover`)?.['background-color'], 'var(--color-fd-accent)');
  assert.equal(rules.get(`${panel} .cn-nav-about-title`)?.padding, '0 12px');
  assert.equal(rules.get(`${panel} .cn-nav-about-title`)?.['font-size'], '0.875rem');
  assert.equal(rules.get(`${panel} .cn-nav-about`)?.['border-top'], '1px solid var(--color-fd-border)');
  assert.equal(rules.get(`${panel} .cn-nav-about ul`)?.margin, '0 0 0 12px');
  const tools = `${panel} div:has(> [role='separator'])`;
  assert.equal(rules.get(tools)?.gap, '0');
  assert.equal(rules.get(`${tools} > a`)?.flex, '0 0 44px');
  assert.equal(rules.get(`${tools} > a > :is(svg, img)`)?.width, '20px');
  assert.equal(rules.get(`${tools} > a > :is(svg, img)`)?.height, '20px');
  assert.equal(rules.get(`${tools} > button`)?.['min-height'], undefined);
  for (const selector of rules.keys()) {
    assert.ok(selector.startsWith(panel), `Mobile navigation rule must stay within the HomeLayout panel: ${selector}`);
  }
  for (const page of ['index.html', 'blog.html', 'team.html', 'users.html', 'sponsor.html', 'timeline.html', 'demo.html']) {
    const html = exported(page);
    assert.match(html, /cn-nav-sponsor/);
    assert.match(html, /cn-nav-about-title hidden/);
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
  hasDeclaration('.cn-marquee-host:has(:focus-visible) .cn-marquee', null, 'animation', 'none');
  hasDeclaration('.cn-marquee-host:has(:focus-visible) .cn-marquee-copy', null, 'display', 'none');
  hasDeclaration('.cn-marquee-host:has(:focus-visible) .cn-marquee-viewport', null, 'overflow-x', 'auto');
  hasDeclaration('.cn-marquee-host:hover .cn-marquee', null, 'animation-play-state', 'paused');
  // 指针用户点击跑马灯必须毫无反应：静态可浏览态只能由键盘焦点（:focus-visible）触发。
  const pointerFocusMarqueeRules = [];
  for (const sheet of sheets) sheet.walkRules((rule) => {
    if (rule.selector.includes(':focus-within') && rule.selector.includes('cn-marquee')) pointerFocusMarqueeRules.push(rule.selector);
  });
  assert.deepEqual(pointerFocusMarqueeRules, [], 'Marquee must not react to a plain pointer focus');
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
  // 键盘滚动区改用原生 <section aria-label>（自带 region 语义），
  // 契约关心的是「可聚焦 + 有可访问名称」，不再要求手写 role="region"。
  const regions = (html.match(/<section\b[^>]*>/g) ?? []).filter((tag) => attribute(tag, 'class')?.includes('cn-marquee-viewport'));
  assert.ok(regions.length >= 2, 'Both marquee types must expose a keyboard scroll region');
  for (const tag of regions) {
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

/*
 * 社区活跃度图表（/timeline）的确定性契约。
 *
 * 这里刻意**不**断言 out/timeline.html 里有没有那两张图：它们的数据来自构建期的
 * GitHub 请求，CI 一旦拿不到就整块不渲染，把「有没有图」写进门禁会让它随机变红。
 * 改为直接渲染组件、喂合成数据，验的才是真正该守住的东西：拿不到数据不画假图、
 * 拿得到时钩子与可访问性到位、几何值走 SVG 属性而不是内联样式。
 */
const starTrendFixture = {
  points: [
    { date: '2024-01-01', count: 0 },
    { date: '2025-01-01', count: 10 },
    { date: '2026-01-01', count: 40 },
  ],
  total: 40,
  last30: 3,
  live: true,
};

function heatmapWindow(key, label, total) {
  return {
    key,
    label,
    start: '2026-01-01',
    end: '2026-01-31',
    columns: Array.from({ length: 7 }, (_, column) =>
      Array.from({ length: 7 }, (_, row) => ({
        date: `2026-01-${String(column * 7 + row + 1).padStart(2, '0')}`,
        // 首列前两格落在统计窗口之外，用来验证补齐格不画
        count: column === 0 && row < 2 ? null : (column + row) % 5,
      })),
    ),
    monthLabels: [{ column: 0, label: '1 月' }],
    total,
    activeDays: 20,
    bestDay: { date: '2026-01-08', count: 5 },
    bestWeek: { date: '2026-01-05', count: 12 },
    longestStreakWeeks: 3,
    max: 8,
  };
}

test('activity charts never draw without live data and keep their accessibility contract', () => {
  const { StarTrendChart } = loadTs('components/activity/star-trend-chart.tsx');
  const { CommitHeatmapChart } = loadTs('components/activity/commit-heatmap.tsx');
  const { CommitActivity } = loadTs('components/activity/commit-activity.tsx');

  // 拿不到数据 → 整块不渲染。绝不画一条编出来的曲线，也不留一个空白框
  assert.equal(render(StarTrendChart, { trend: { ...starTrendFixture, live: false } }), '');
  assert.equal(render(CommitHeatmapChart, { heatmap: null }), '');
  assert.equal(render(CommitActivity, { windows: [] }), '');
  // 只有一个点也构不成趋势，同样不渲染
  assert.equal(
    render(StarTrendChart, { trend: { ...starTrendFixture, points: [starTrendFixture.points[0]] } }),
    '',
  );

  const trendHtml = render(StarTrendChart, { trend: starTrendFixture });
  openingTag(trendHtml, 'figure', 'data-cn-chart="star-trend"');
  assert.ok(
    attribute(openingTag(trendHtml, 'svg', 'role="img"'), 'aria-label'),
    'Star trend chart needs an accessible name',
  );
  assert.match(trendHtml, /<figcaption/, 'Star trend chart needs a text caption for no-JS readers');

  // 曲线从年末起时，首个年份刻度与次年几乎重合，必须丢掉前一个而不是叠成乱码
  const crampedTrend = render(StarTrendChart, {
    trend: {
      ...starTrendFixture,
      points: [
        { date: '2022-12-07', count: 1 },
        { date: '2023-01-02', count: 3 },
        { date: '2026-01-01', count: 40 },
      ],
    },
  });
  const yearLabels = [...crampedTrend.matchAll(/>(\d{4})</g)].map((match) => match[1]);
  assert.deepEqual(yearLabels, ['2023', '2026'], 'Crowded year ticks must be dropped, not overlapped');

  const heatHtml = render(CommitHeatmapChart, { heatmap: heatmapWindow('recent', '近一年', 40) });
  openingTag(heatHtml, 'div', 'data-cn-chart="commit-heatmap"');
  // 色阶只表达强度、读数由文字给出：整张图对读屏隐藏，且不该成为可聚焦的空洞区域
  assert.equal(attribute(openingTag(heatHtml, 'svg', 'aria-hidden'), 'aria-hidden'), 'true');
  assert.ok(!/tabindex/i.test(heatHtml), 'Aria-hidden heatmap must not be focusable');
  // 窗口之外的补齐格不画：7×7 减去首列那两格
  assert.equal((heatHtml.match(/<rect/g) ?? []).length, 47);

  // 年份切换器：每个窗口一个 aria-pressed 按钮，默认选中第一个
  const switcherHtml = render(CommitActivity, {
    windows: [heatmapWindow('recent', '近一年', 40), heatmapWindow('2025', '2025 年', 733)],
  });
  openingTag(switcherHtml, 'div', 'data-cn-chart="commit-activity"');
  const chips = switcherHtml.match(/<button\b[^>]*data-cn-control="filter"[^>]*>/g) ?? [];
  assert.equal(chips.length, 2, 'Each window needs one switcher chip');
  assert.equal(attribute(chips[0], 'aria-pressed'), 'true', 'The first window is selected by default');
  assert.equal(attribute(chips[1], 'aria-pressed'), 'false');
  // 切换后读数整组变化，读屏用户需要被念出新数字，否则点完按钮「什么都没发生」
  assert.match(switcherHtml, /aria-live="polite"/);
  // 默认渲染的是第一个窗口的读数，而不是全部窗口的数字
  assert.ok(switcherHtml.includes('提交次数'));
  assert.ok(switcherHtml.includes('>40<'));
  assert.ok(!switcherHtml.includes('>733<'));

  // DESIGN_SYSTEM：几何值走 SVG 属性，不写内联样式
  assert.ok(!trendHtml.includes('style="'), 'Star trend chart must not use inline styles');
  assert.ok(!heatHtml.includes('style="'), 'Commit heatmap must not use inline styles');
  assert.ok(!switcherHtml.includes('style="'), 'Window switcher must not use inline styles');
});
