import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';
import { appName } from './shared';
import type { StarSummary } from './site-stats';
import { NavAboutMenu } from '@/components/nav-about-menu';
import { NavSponsorLink } from '@/components/nav-sponsor-link';
import { NavStarCount } from '@/components/nav-star-count';
import { AtomGitIcon, GiteeIcon, GitHubIcon } from '@/components/brand-icons';

/**
 * 全站导航配置。
 *
 * `stars` 为构建期拉取的 Star 汇总（lib/site-stats.ts）。传进来而不是在组件内部取，
 * 是因为本函数是同步的，而数据拉取是异步的——由各 layout 负责 await 后注入。
 * 不传时导航不渲染星数（降级），其余部分照常。
 */
export function baseOptions(stars?: StarSummary): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <Image src="/logo.svg" alt={appName} width={24} height={24} aria-hidden />
          {appName}
        </>
      ),
    },
    /*
     * 文字链接在前、代码托管平台在后。
     *
     * 【`on: 'nav'` 不能省——这一条是侧边栏不再重复导航的关键】
     * Fumadocs 的 useLinkItems() 按 `on` 把链接分给两处：
     *   on: 'nav'  → 只进顶部导航栏
     *   on: 'menu' → 只进侧边栏
     *   不写      → 两处都进（默认分支同时 push 进 navItems 和 menuItems）
     * 而 spacious 布局的 SidebarItems 会把 menuItems 渲染在**文档树上方**，
     * 所以不声明就会变成：顶栏一排「文档/博客/赞助/关于」，侧栏再来一遍，
     * 文档树被压到下面——这正是 Fumadocs 官网侧栏比我们干净的原因。
     *
     * 声明归属后顶栏照旧，侧栏只剩文档树。
     */
    links: [
      /*
       * 文档直达 ContiNew Admin 分区，而不是 /docs 根：
       * 根路径只是分区索引，多一次点击，而 Admin 是目前内容最全的主力文档。
       */
      {
        text: '文档',
        url: '/docs/admin',
        on: 'nav',
      },
      {
        text: '博客',
        url: '/blog',
        on: 'nav',
      },
      /*
       * 「赞助」带一个心形图标：在纯文字导航里形成视觉重点，提示这是「支持我们」的入口。
       * 内置导航项在桌面端不渲染文字链接的 icon，故自建，详见 components/nav-sponsor-link.tsx。
       */
      {
        type: 'custom',
        on: 'nav',
        children: <NavSponsorLink />,
      },
      /*
       * 「关于」不用内置 menu：它把子项渲染成卡片并硬编码三列网格（大屏横排），
       * 而这三个子项只是纯链接，卡片会大片留白。改为自建的纵向紧凑下拉，
       * 详见 components/nav-about-menu.tsx。
       */
      {
        type: 'custom',
        on: 'nav',
        children: <NavAboutMenu />,
      },
      /*
       * 三个代码托管平台的入口：右上角一排图标按钮。
       *
       * 【为什么必须是 icon，而不是文字链接】
       * spacious 布局的 HeaderActions 只渲染 `menuItems` 里 `type === 'icon'` 的项
       * （源码 IconLinks 组件），顶栏没有自定义插槽——文字链接塞不进去，
       * 非 icon 的项只会落到侧边栏。Fumadocs 官网右上方那个 GitHub 图标就是这么来的。
       *
       * 【因此这类项不能声明 `on`】
       * IconLinks 读的是 menuItems，声明 `on: 'nav'` 会让它不进 menuItems，
       * 结果就是图标整个消失。上面四个导航项要 `on: 'nav'`，这里三个不能要，
       * 区别只在于「文字项要躲开侧栏、图标项要留在顶栏」。
       *
       * 小屏（lg 以下）Fumadocs 会自动把它们收进「⋯」菜单，不用额外适配。
       */
      {
        type: 'icon',
        icon: <GitHubIcon />,
        text: 'GitHub',
        label: 'GitHub',
        url: 'https://github.com/continew-org',
        external: true,
      },
      {
        type: 'icon',
        icon: <AtomGitIcon />,
        text: 'AtomGit',
        label: 'AtomGit',
        url: 'https://atomgit.com/continew',
        external: true,
      },
      {
        type: 'icon',
        icon: <GiteeIcon />,
        text: 'Gitee',
        label: 'Gitee',
        url: 'https://gitee.com/continew',
        external: true,
      },
      /*
       * 全平台 Star 数胶囊（GitHub 那种「★ Star | 数字」造型）。
       *
       * 【位置：官网导航栏右侧，`on: 'nav'` + `secondary: true`】
       * Fumadocs 的 `isSecondary()` 用 secondary 决定渲染到导航栏左半区还是右半区：
       * 默认只有 `type === 'icon'` 靠右，custom 项不显式声明会混进左侧文字链接里，
       * 所以这里两个都要写。数据由各 layout await getStarSummary() 后注入。
       *
       * 注意 spacious 布局（/docs 文档页）不消费 navItems —— 该布局的顶栏
       * 只渲染 menuItems 里的 icon 项（右上角三个平台图标），侧栏只留文档树。
       * 因此 Star 胶囊与文字导航只在官网页面出现，文档页没有，这是布局的既定行为。
       */
      ...(stars
        ? [
            {
              type: 'custom' as const,
              on: 'nav' as const,
              secondary: true,
              children: <NavStarCount total={stars.total} platforms={stars.platforms} />,
            },
          ]
        : []),
    ],
  };
}
