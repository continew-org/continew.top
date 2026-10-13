import { source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
} from 'fumadocs-ui/layouts/docs/page';
import { DocsPageBreadcrumb } from '@/components/docs-page-breadcrumb';
import { ViewOptionsPopover } from '@/components/view-options-popover';
import { DocsSponsorSlot } from '@/components/docs-sponsor-slot';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getMDXComponents } from '@/components/mdx';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { getPageImageUrl, getPageMarkdownUrl, currentDocsUrl, siteUrl } from '@/lib/shared';
import { ArchiveNotice } from '@/components/archive-notice';
import { getDocVersion, docSections } from '@/lib/docs-sections';

export default async function Page(props: Readonly<PageProps<'/docs/[[...slug]]'>>) {
  const params = await props.params;
  // /docs 根路径（slug 为空）：静态导出无法用服务端 redirect，
  // 用 <meta refresh> 客户端重定向到当前版本文档。
  // 不 return <html> 骨架（由根 layout 提供），只注入 meta 与降级文案，避免非法嵌套 HTML。
  if (!params.slug || params.slug.length === 0) {
    return (
      <>
        <meta httpEquiv="refresh" content={`0; url=${currentDocsUrl}`} />
        <p>
          正在跳转到 <Link href={currentDocsUrl}>{docSections[0]?.title} 文档</Link>…
        </p>
      </>
    );
  }
  const page = source.getPage(params.slug);
  if (!page) notFound();

  // 变量名须为常规 PascalCase：全大写（MDX）会被 jsx-pascal-case（S6770）判为非 PascalCase。
  const MdxContent = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;
  // 归档版本自动挂载升级提示（见 components/archive-notice.tsx 的取舍说明）。
  // 按「分区/版本」判定而非逐页标注，故不会漏也不会随文档改版失效。
  const [sectionKey, versionKey] = page.slugs;
  const archiveVersion = getDocVersion(sectionKey, versionKey);
  const archiveNotice =
    archiveVersion?.archived && sectionKey ? (
      <ArchiveNotice sectionKey={sectionKey} version={archiveVersion} />
    ) : null;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      className="wrap-break-word"
      slots={{
        breadcrumb: DocsPageBreadcrumb,
      }}
      /*
       * 支持入口挂在右侧目录底部：不在阅读流里、不滚动、不弹窗，
       * 是文档页里对读者打扰最小、又能自然说明维护来源的位置。
       * 有开源合作伙伴时，入口下方会追加紧凑名单。
       */
      tableOfContent={{
        style: 'clerk',
        footer: <DocsSponsorSlot />,
      }}
      tableOfContentPopover={{
        style: 'normal',
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      {archiveNotice}
      <div className="flex flex-row gap-2 items-center border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          markdownUrl={markdownUrl}
          page={{ slugs: page.slugs, path: page.path }}
          siteUrl={siteUrl}
        />
      </div>
      <DocsBody>
        <MdxContent
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  // 空 slug 对应 /docs 根路径（重定向到默认项目），静态导出需显式包含
  return [{ slug: [] }, ...source.generateParams()];
}

export async function generateMetadata(props: PageProps<'/docs/[[...slug]]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImageUrl(page).url,
    },
  };
}
