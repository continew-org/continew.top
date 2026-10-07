import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // 静态导出：产物为纯静态文件（out/），由 GitHub Actions 推送至自有 Nginx 服务器托管。
  output: 'export',
  images: {
    // 静态导出禁用 Next/Image 服务端优化，OG 等图片在构建期预渲染。
    unoptimized: true,
  },
};

export default withMDX(config);
