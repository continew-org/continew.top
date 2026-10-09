import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import Script from 'next/script';
import { appName, appDescription, siteUrl } from '@/lib/shared';
import { i18n } from '@/lib/i18n';
import StaticSearchDialog from '@/components/search-dialog';

/*
 * 百度统计站点 ID：沿用旧站（VitePress）的那一处。
 *
 * 新站是**替换**旧站而不是并存，沿用同一个 ID 意味着历史数据连续——
 * 对赞助商而言，一条不断向上的曲线比一段从零开始的新数据有说服力得多。
 * 旧站代码见 charles7c/continew.top 的 .vitepress/configs/head.ts。
 *
 * 新站此前完全没有统计代码，等于「给赞助商的每月数据报告」这条权益无法兑现；
 * 装上之后从这一刻起的数据才是可交付的。
 */
const BAIDU_TONGJI_ID = 'ac0c6ebdc48b8f9e479a33b477e39447';

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
        {/* afterInteractive：不阻塞首屏渲染，也不进静态导出的 HTML 关键路径 */}
        <Script id="baidu-tongji" strategy="afterInteractive">
          {`var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?${BAIDU_TONGJI_ID}";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(hm, s);
})();`}
        </Script>
      </body>
    </html>
  );
}
