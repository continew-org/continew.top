import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';
import { appName, currentDocsUrl } from './shared';
import type { StarSummary } from './site-stats';
import { NavAboutMenu } from '@/components/nav-about-menu';
import { NavSponsorLink } from '@/components/nav-sponsor-link';
import { NavStarCount } from '@/components/nav-star-count';
import { HeartHandshake } from 'lucide-react';
import { AtomGitIcon, GiteeIcon, GitHubIcon } from '@/components/brand-icons';

/**
 * 全站导航配置。
 *
 * `stars` 为构建期拉取的 Star 汇总（lib/site-stats.ts）。传进来而不是在组件内部取，
 * 是因为本函数是同步的，而数据拉取是异步的——由各 layout 负责 await 后注入。
 * 不传时导航不渲染星数（降级），其余部分照常。
 */
export function baseOptions(
  stars?: StarSummary,
  options?: { docs?: boolean },
): BaseLayoutProps {
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
     *   on: 'nav'  → 只进入站点导航
     *   on: 'menu' → 只进入文档侧栏
     *   不写      → 两处都进（默认分支同时进入 navItems 和 menuItems）
     * 而 docs 布局的侧栏会把 menuItems 渲染在**文档树上方**，
     * 所以不声明就会变成：顶栏一排「文档/博客/赞助/关于」，侧栏再来一遍，
     * 文档树被压到下面——这正是 Fumadocs 官网侧栏比我们干净的原因。
     *
     * 声明归属后顶栏照旧，侧栏只剩文档树。
     */
    links: [
      /*
       * 文档直达 ContiNew Admin 当前版本，不经过 /docs 根路径。
       */
      {
        text: '文档',
        url: currentDocsUrl,
        on: options?.docs ? 'nav' : 'all',
      },
      {
        text: '博客',
        url: '/blog',
        on: options?.docs ? 'nav' : 'all',
      },
      /*
       * 「赞助」带一个心形图标：在纯文字导航里形成视觉重点，提示这是「支持我们」的入口。
       * 内置导航项在桌面端不渲染文字链接的 icon，故自建，详见 components/nav-sponsor-link.tsx。
       */
      {
        type: 'custom',
        on: options?.docs ? 'nav' : 'all',
        children: <NavSponsorLink />,
      },
      /*
       * 「关于」不用内置 menu：它把子项渲染成卡片并硬编码三列网格（大屏横排），
       * 而这三个子项只是纯链接，卡片会大片留白。改为自建的纵向紧凑下拉，
       * 详见 components/nav-about-menu.tsx。
       */
      {
        type: 'custom',
        on: options?.docs ? 'nav' : 'all',
        children: <NavAboutMenu />,
      },
      /*
       * 三个代码托管平台的入口：文档桌面侧栏底部、手机抽屉顶部的图标按钮。
       *
       * 【为什么必须是 icon，而不是文字链接】
       * docs 布局把 `menuItems` 中的 icon 项放在侧栏底部（手机端放在抽屉顶部），
       * 普通文字项则排在文档树上方。Fumadocs 官网的 GitHub 图标也是这种入口。
       *
       * 【因此这类项不能声明 `on`】
       * 侧栏图标区读的是 menuItems；声明 `on: 'nav'` 会让图标无法进入该区域。
       * 上面四个导航项只属于站点导航，这些图标项则属于文档侧栏。
       */
      ...(options?.docs
        ? [
            {
              type: 'icon' as const,
              // 琥珀色沿用个人支持者的关系色（见 DESIGN_SYSTEM.md「品牌与原则」）：
              // 文字工具行里只有它带颜色，醒目但不动用主行动色。
              icon: <HeartHandshake className="text-amber-600 dark:text-amber-400" />,
              text: '支持',
              label: '支持 ContiNew',
              url: '/sponsor',
            },
          ]
        : []),
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
       * docs 布局的桌面侧栏使用 menuItems，移动端顶栏也不渲染 navItems；
       * 因此 Star 胶囊与文字导航只在官网页面出现。
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
