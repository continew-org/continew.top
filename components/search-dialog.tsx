'use client';

import DefaultSearchDialog from 'fumadocs-ui/components/dialog/search-default';
import type { SharedProps } from 'fumadocs-ui/contexts/search';

/**
 * 静态搜索对话框。
 *
 * 本站为静态导出（output: 'export'），无服务端搜索 API，
 * 故采用构建期预生成的 Orama 静态索引（客户端查询）。
 * DefaultSearchDialog 的 type: 'static' 内部即使用 fumadocs-core 的 staticClient()。
 */
export default function StaticSearchDialog(props: SharedProps) {
  return <DefaultSearchDialog type="static" {...props} />;
}
