import { blogSource } from '@/lib/blog-source';
import { source } from '@/lib/source';
import { findPath, type Root } from 'fumadocs-core/page-tree';
import { createSearchAPI, type AdvancedIndex } from 'fumadocs-core/search/server';

type SearchPage =
  | ReturnType<typeof source.getPages>[number]
  | ReturnType<typeof blogSource.getPages>[number];

function breadcrumbs(tree: Root, url: string, rootName?: string): string[] | undefined {
  const path = findPath(tree.children, (node) => node.type === 'page' && node.url === url);
  if (!path) return undefined;

  const names = [rootName ?? tree.name, ...path.slice(0, -1).map((node) => node.name)]
    .filter((name): name is string => typeof name === 'string' && name.length > 0);
  return names.length > 0 ? names : undefined;
}

function indexPage(page: SearchPage, tree: Root, rootName?: string): AdvancedIndex {
  const structuredData = page.data.structuredData;
  if (!structuredData) throw new Error(`Missing search data: ${page.url}`);

  return {
    // Fumadocs 会给标题 ID 追加 "-N"；同级 slug 本身也可能以 "-N" 结尾，故结尾加冒号区分。
    id: `page:${page.url}:`,
    title: page.data.title,
    description: page.data.description,
    url: page.url,
    structuredData,
    breadcrumbs: breadcrumbs(tree, page.url, rootName),
  };
}

export const revalidate = false;

export const { staticGET: GET } = createSearchAPI('advanced', {
  indexes: async () => {
    const docsTree = source.getPageTree();
    const blogTree = blogSource.getPageTree();
    const indexes = await Promise.all([
      ...source.getPages().map((page) => indexPage(page, docsTree)),
      ...blogSource.getPages().map((page) => indexPage(page, blogTree, '博客')),
    ]);
    const seen = new Set<string>();
    for (const index of indexes) {
      if (seen.has(index.id)) throw new Error(`Duplicate search page: ${index.id}`);
      seen.add(index.id);
    }
    return indexes;
  },
});
