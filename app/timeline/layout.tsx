import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { getStarSummary } from '@/lib/site-stats';
import { SiteFooter } from '@/components/site-footer';

export default async function Layout({ children }: LayoutProps<'/timeline'>) {
  // 构建期拉取一次（lib/site-stats.ts 有结果缓存），导航栏据此渲染全平台 Star 数
  const stars = await getStarSummary();
  return (
    <HomeLayout {...baseOptions(stars)}>
      {children}
      <SiteFooter />
    </HomeLayout>
  );
}
