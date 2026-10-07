import { source } from '@/lib/source';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';
import { generateOGImage } from 'fumadocs-ui/og';
import { appName, getPageImageUrl } from '@/lib/shared';

export const revalidate = false;

// 构建期预渲染各文档页 OG 图片。
// 带中文标题的 OG 需在线拉取 Google Fonts（next/og 的默认行为）。
// 在无法访问 Google Fonts 的环境（多数本地开发机），降级为本地渲染的品牌色
// 占位图（不含文字、不联网），保证静态导出构建可通过；CI 等可联网环境生成正式 OG。
async function renderOg(title: string, description: string | undefined): Promise<ImageResponse> {
  try {
    return await generateOGImage({ title, description, site: appName });
  } catch {
    // 离线降级：纯色品牌占位图（无文字，避免触发 Google Fonts 拉取）
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            backgroundColor: '#0c0c0c',
            borderBottom: '18px solid rgba(18,210,172,0.6)',
          }}
        />
      ),
      { width: 1200, height: 630 },
    );
  }
}

export async function GET(_req: Request, { params }: RouteContext<'/og/docs/[...slug]'>) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  return renderOg(page.data.title, page.data.description);
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImageUrl(page).segments,
  }));
}
