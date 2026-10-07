import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';
import { appName, gitConfig } from './shared';

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
    githubUrl: `https://github.com/${gitConfig.user}`,
    // 文档内各项目（starter/admin/app）已由侧边栏顶部的 Root Folder 切换器承载，
    // 顶部导航指向默认项目文档，进入后即可用左上角切换器切换项目。
    links: [
      {
        text: '文档',
        url: '/docs/admin',
      },
    ],
  };
}
