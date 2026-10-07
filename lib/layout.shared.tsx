import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';
import { appName, gitConfig } from './shared';
import { AtomGitIcon, GiteeIcon, GitHubIcon } from '@/components/brand-icons';

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
    // 右上角代码托管平台图标链接（GitHub / AtomGit / Gitee）。
    // icon 类型渲染为图标按钮；不放文字链接（会在侧边栏渲染为多余项）。
    links: [
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
