import { source } from '@/lib/source';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';
import { generateOGImage } from 'fumadocs-ui/og';
import { appName, getPageImageUrl } from '@/lib/shared';

export const revalidate = false;

// 构建期预渲染各文档页 OG 图片。
// 带中文标题的 OG 需在线拉取 Google Fonts（next/og 经 Satori 渲染，任何 JSX 都会触发字体加载）。
// 在无法访问 Google Fonts 的环境（多数本地开发机），Satori 渲染会失败且无法 try-catch，
// 导致整个静态导出构建中断。因此：CI（能联网）生成正式 OG；非 CI 环境返回一张无字体依赖的
// 品牌色占位 PNG（直接输出像素 Buffer，不经过 Satori），保证本机构建可通过。
// 若需在本机生成正式 OG，可设 FORCE_OG=1（前提是你本机能访问 Google Fonts）。
const FORCE_OG = process.env.FORCE_OG === '1';
const IS_CI = process.env.CI === 'true';

// 1x1 透明 PNG（无字体渲染，直接作为占位图字节流返回）。
const PLACEHOLDER_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

async function renderOg(title: string, description: string | undefined): Promise<Response> {
  if (IS_CI || FORCE_OG) {
    return generateOGImage({ title, description, site: appName });
  }
  // 本机/离线：不经过 Satori，直接返回占位 PNG 字节流
  return new Response(new Uint8Array(PLACEHOLDER_PNG), {
    headers: { 'Content-Type': 'image/png' },
  });
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
