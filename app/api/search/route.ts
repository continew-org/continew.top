import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

// 静态导出：构建期预生成 Orama 搜索索引，客户端直接加载，无需服务端运行时。
export const revalidate = false;
export const { staticGET: GET } = createFromSource(source);
