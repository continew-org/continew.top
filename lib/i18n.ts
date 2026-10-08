import { defineI18nUI } from 'fumadocs-ui/i18n';

/**
 * 中文文案表。
 *
 * 键名后括号里的部分是 Fumadocs 标注的**使用场景**（不是文案内容），必须原样保留，
 * 否则匹配不上会静默回退英文。键名含 `{url}` 的是模板，占位符也要保留。
 */
const zhCN = {
  displayName: '简体中文',

  // 目录
  'On this page(table of contents)': '目录',
  'Table of Contents(inline table of contents)': '目录',
  'No Headings(table of contents)': '无标题',

  // 搜索
  'Search(search dialog)': '搜索',
  'Search(search trigger)': '搜索',
  'No results found(search dialog)': '未找到结果',
  'Close Search(search dialog)(aria-label)': '关闭搜索',
  'Open Search(search trigger)(aria-label)': '打开搜索',

  // 侧边栏
  'Close Sidebar(aria-label)': '关闭侧边栏',
  'Close Sidebar(sidebar)(aria-label)': '关闭侧边栏',
  'Collapse Sidebar(sidebar)(aria-label)': '折叠侧边栏',
  'Hide Sidebar(sidebar)': '隐藏侧边栏',
  'Open Sidebar(aria-label)': '打开侧边栏',
  'Open Sidebar(sidebar)(aria-label)': '打开侧边栏',
  'Show Sidebar(sidebar)': '显示侧边栏',
  'Toggle Menu(home layout header)(aria-label)': '切换菜单',

  // 主题
  'Theme(site menu)': '主题',
  'Toggle Theme(theme switcher)(aria-label)': '切换主题',
  'Light(theme switcher)(aria-label)': '浅色',
  'Dark(theme switcher)(aria-label)': '深色',
  'System(theme switcher)(aria-label)': '跟随系统',

  // 语言切换（预留：当前单语言，界面上不会出现）
  'Language(language switcher)': '语言',
  'Choose a language(language switcher)': '选择语言',
  'Choose a language(language switcher)(aria-label)': '选择语言',

  // 复制类
  'Copy Text(code block)(aria-label)': '复制代码',
  'Copied Text(code block)(aria-label)': '已复制代码',
  'Copy Anchor Link(heading anchor)(aria-label)': '复制标题链接',
  'Copied Anchor Link(heading anchor)(aria-label)': '已复制标题链接',
  'Copy Link(accordion)(aria-label)': '复制链接',
  'Copied Link(accordion)(aria-label)': '已复制链接',
  'Copy Markdown(page actions)': '复制 Markdown',
  'Copied Markdown(page actions)': '已复制 Markdown',
  'View as Markdown(page actions)': '以 Markdown 查看',

  // 页面操作
  'Open(page actions)': '打开',
  'Options(aria-label)': '选项',
  'Edit on GitHub(edit page)': '在 GitHub 上编辑',
  'Ask AI(AI chat button)': '询问 AI',
  'Open in ChatGPT(page actions)': '在 ChatGPT 中打开',
  'Open in Claude(page actions)': '在 Claude 中打开',
  'Open in Cursor(page actions)': '在 Cursor 中打开',
  'Open in GitHub(page actions)': '在 GitHub 中打开',
  'Open in Scira AI(page actions)': '在 Scira AI 中打开',
  'Read {url}, I want to ask questions about it.(page actions)': '请阅读 {url}，我想就此提问',

  // 翻页与页脚
  'Previous Page(pagination)': '上一页',
  'Next Page(pagination)': '下一页',
  'Last updated on(page footer)': '最后更新于',

  // 类型表格（API 文档组件）
  'Type(type table)': '类型',
  'Prop(type table)': '属性',
  'Parameters(type table)': '参数',
  'Returns(type table)': '返回值',
  'Default(type table)': '默认值',

  // 404
  'Page Not Found(404 not found page)': '页面未找到',
  'Back to Home(404 not found page)': '返回首页',
  'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 not found page)':
    '你访问的页面可能已被移除、改名，或暂时不可用。',

  // 公告
  'Close Banner(banner)(aria-label)': '关闭公告',
};

/**
 * 全站 UI 文案。
 *
 * 本站面向国内用户，`html lang` 已是 `zh-CN`，但 Fumadocs 内置文案默认是英文的
 * （侧边目录的 "On this page"、搜索框的 "Search"、翻页的 "Next Page" 等）。
 * 这里把 fumadocs-ui 暴露的全部文案键一次性译成中文，未提供的键会自动回退英文。
 */
export const i18n = defineI18nUI(
  {
    defaultLanguage: 'zh-CN',
    languages: ['zh-CN'],
  },
  {
    'zh-CN': zhCN,
  },
);

/**
 * 目录标题。
 *
 * 博客详情页的目录是自组装的（见 components/blog-toc.tsx），拿不到 Fumadocs 的翻译上下文；
 * 这里从同一份文案表取，保证文档站与博客的目录标题永远一致，不会一处改一处忘。
 */
export const tocTitle = zhCN['On this page(table of contents)'];
