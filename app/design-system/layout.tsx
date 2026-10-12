import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { getStarSummary } from '@/lib/site-stats';
import { SiteFooter } from '@/components/site-footer';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const stars = await getStarSummary();
  return (
    <HomeLayout {...baseOptions(stars)}>
      {children}
      <SiteFooter />
    </HomeLayout>
  );
}
