import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { SiteFooter } from '@/components/site-footer';

export default function Layout({ children }: LayoutProps<'/team'>) {
  return (
    <HomeLayout {...baseOptions()}>
      {children}
      <SiteFooter />
    </HomeLayout>
  );
}
