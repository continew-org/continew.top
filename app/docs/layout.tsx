import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    // 各分区（starter/admin/app）在 meta.json 标记 root: true，构成 Root Folder。
    // 采用默认 tabMode="auto"：侧边栏顶部渲染项目切换下拉框（图标+标题+描述），
    // 仅显示当前打开的项目分支，其余隐藏。不设为 "top"（那会退化为平铺链接）。
    <DocsLayout tree={source.getPageTree()} {...baseOptions()}>
      {children}
    </DocsLayout>
  );
}
