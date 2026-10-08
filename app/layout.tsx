import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { appName, appDescription, siteUrl } from '@/lib/shared';
import { i18n } from '@/lib/i18n';
import StaticSearchDialog from '@/components/search-dialog';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${appName} - 持续迭代，持续焕新`,
    template: `%s | ${appName}`,
  },
  description: appDescription,
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="zh-CN" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider
          // 全站 UI 文案走中文（详见 lib/i18n.ts），否则目录、搜索、翻页等位置是英文。
          i18n={i18n.provider()}
          search={{ SearchDialog: StaticSearchDialog }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
