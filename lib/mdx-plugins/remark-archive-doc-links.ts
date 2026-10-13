import { visit } from 'unist-util-visit';
import type { Root, RootContent } from 'mdast';
import type { Root as HastRoot, Element } from 'hast';
import { getSourceUnitForFile, getVersionTags } from '../docs-sections.ts';

const CONTINEW_HOSTS = new Set(['github.com', 'atomgit.com', 'gitee.com']);
const KEEP_FLOATING_REF = new Set(['CHANGELOG.md']);

type SourceUnit = NonNullable<ReturnType<typeof getSourceUnitForFile>>;

/** 上游文档的自链接早于版本化路径，按当前编译页面所属版本解析。 */
export function rewriteDocUrl(rawUrl: string, unit: SourceUnit): string {
  const { section, version } = unit;
  const prefix = `/docs/${section.key}`;
  if (version && rawUrl.startsWith(prefix)) {
    const path = rawUrl.split(/[?#]/, 1)[0];
    if (path === prefix || path.startsWith(`${prefix}/`)) {
      const suffix = path.slice(prefix.length);
      const firstSegment = suffix.split('/')[1];
      if (!section.versions?.some(({ key }) => key === firstSegment)) {
        return `${prefix}/${version.key}${rawUrl.slice(prefix.length)}`;
      }
    }
  }

  if (!version?.archived || !version.versionTag) return rawUrl;
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return rawUrl;
  }
  if (!CONTINEW_HOSTS.has(url.hostname)) return rawUrl;
  if (KEEP_FLOATING_REF.has(url.pathname.split('/').pop() ?? '')) return rawUrl;
  const match = /^\/[^/]+\/([^/]+)\/(blob|tree)\/dev(?=\/|$)/.exec(url.pathname);
  const tag = match && getVersionTags(version)[match[1]];
  if (!tag) return rawUrl;
  url.pathname = url.pathname.replace(/\/(blob|tree)\/dev(?=\/|$)/, `/$1/${tag}`);
  return url.toString();
}

function rewriter(file: unknown) {
  const filePath = (file as { path?: string } | undefined)?.path;
  const unit = filePath ? getSourceUnitForFile(filePath) : undefined;
  return unit ? (url: string) => rewriteDocUrl(url, unit) : undefined;
}

function hasUrl(node: RootContent | Root): node is (RootContent | Root) & { url: string } {
  return node.type === 'link' || node.type === 'image' || node.type === 'definition';
}

function rewriteJsxUrl(node: { attributes: Array<{ type: string; name?: string; value?: unknown }> }, rewrite: (url: string) => string) {
  for (const attribute of node.attributes) {
    if (attribute.type !== 'mdxJsxAttribute' ||
        (attribute.name !== 'href' && attribute.name !== 'src') ||
        typeof attribute.value !== 'string') continue;
    attribute.value = rewrite(attribute.value);
  }
}

export function remarkArchiveDocLinks() {
  return (tree: Root, file: unknown) => {
    const rewrite = rewriter(file);
    if (!rewrite) return;

    visit(tree, (node) => {
      if (hasUrl(node)) node.url = rewrite(node.url);
    });
    visit(tree, 'mdxJsxFlowElement', (node) => rewriteJsxUrl(node, rewrite));
    visit(tree, 'mdxJsxTextElement', (node) => rewriteJsxUrl(node, rewrite));
  };
}

export function rehypeArchiveDocLinks() {
  return (tree: HastRoot, file: unknown) => {
    const rewrite = rewriter(file);
    if (!rewrite) return;

    visit(tree, 'element', (node: Element) => {
      for (const key of node.tagName === 'a' ? ['href'] : ['src', 'href']) {
        const value = node.properties?.[key];
        if (typeof value === 'string') node.properties[key] = rewrite(value);
      }
    });
  };
}
