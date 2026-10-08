import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';
import { appName, gitConfig } from './shared';
import { AtomGitIcon, GiteeIcon, GitHubIcon } from '@/components/brand-icons';
import { NavAboutMenu } from '@/components/nav-about-menu';
import { NavSponsorLink } from '@/components/nav-sponsor-link';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <Image src="/logo.svg" alt={appName} width={24} height={24} aria-hidden />
          {appName}
        </>
      ),
    },
    // 文字链接在前、代码托管平台图标在后。
    // icon 类型渲染为图标按钮；不放文字链接（会在侧边栏渲染为多余项）。
    links: [
      /*
       * 文档直达 ContiNew Admin 分区，而不是 /docs 根：
       * 根路径只是分区索引，多一次点击，而 Admin 是目前内容最全的主力文档。
       */
      {
        text: '文档',
        url: '/docs/admin',
      },
      {
        text: '博客',
        url: '/blog',
      },
      /*
       * 「赞助」带一个心形图标：在纯文字导航里形成视觉重点，提示这是「支持我们」的入口。
       * 内置导航项在桌面端不渲染文字链接的 icon，故自建，详见 components/nav-sponsor-link.tsx。
       */
      {
        type: 'custom',
        children: <NavSponsorLink />,
      },
      /*
       * 「关于」不用内置 menu：它把子项渲染成卡片并硬编码三列网格（大屏横排），
       * 而这三个子项只是纯链接，卡片会大片留白。改为自建的纵向紧凑下拉，
       * 详见 components/nav-about-menu.tsx。
       */
      {
        type: 'custom',
        children: <NavAboutMenu />,
      },
      {
        type: 'icon',
        url: `https://github.com/${gitConfig.user}`,
        label: 'GitHub',
        text: 'GitHub',
        icon: <GitHubIcon className="size-5" />,
        external: true,
      },
      {
        type: 'icon',
        url: 'https://atomgit.com/continew',
        label: 'AtomGit',
        text: 'AtomGit',
        icon: <AtomGitIcon className="size-5" />,
        external: true,
      },
      {
        type: 'icon',
        url: 'https://gitee.com/continew',
        label: 'Gitee',
        text: 'Gitee',
        icon: <GiteeIcon className="size-5" />,
        external: true,
      },
    ],
  };
}
