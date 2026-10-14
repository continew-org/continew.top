import Link from 'next/link';
import { ArchiveIcon } from 'lucide-react';
import { Callout } from 'fumadocs-ui/components/callout';
import { getDefaultVersion, type DocVersion } from '@/lib/docs-sections';

/**
 * 归档文档页的升级提示。
 *
 * 归档版本与当前版本往往同时在线，而顺着搜索结果进来的人不会先辨认版本、直接读正文，
 * 于是旧配置被照抄进新项目，问题要等部署才暴露。提示紧挨正文之前（放进 layout 或
 * 面包屑就与具体哪一页脱钩），并由代码按「分区/版本」自动挂载（几十个页面手写一定会漏）。
 * 逐页 Markdown 的归档标注由 lib/source.ts 另行添加。
 *
 * 文案里的三个版本字符串分工（不要互相顶替）：
 * - `version.key`：归档线，也是 URL 段，如 `4.x`——「本文是 … 的归档文档」；
 * - `version.versionTag`：这条线的发布 tag，如 `v4.2.0`——「冻结于 …」；
 * - `version.versionLabel`：对应的维护分支，如 `4.2.x`——「以 … 为准」与「已在 … 上运行的项目」，
 *   因为它最接近使用者手上的分支名。
 */
export function ArchiveNotice({
  sectionKey,
  version,
}: Readonly<{
  sectionKey: string;
  version: DocVersion;
}>) {
  const currentKey = getDefaultVersion(sectionKey);
  const line = version.key;
  const versionLabel = version.versionLabel ?? version.ref;
  const releaseTag = version.versionTag ?? versionLabel;

  return (
    <Callout type="warn" icon={<ArchiveIcon />}>
      <p>
        本文是 <strong>{line}</strong> 的归档文档（冻结于 {releaseTag}）。该分支只接收勘误修正，
        内容基本不再变动；文中的源码路径、配置项与版本号均以 {versionLabel} 为准，
        <strong>不建议用于新项目</strong>。
      </p>
      {currentKey ? (
        <p className="mt-2">
          {/*
            链接目标取分区版本列表的第一条（见 lib/docs-sections.ts），新增 6.x 后会自动
            指向 6.x；标签文案同样由它派生，不写死「最新版本」，否则新版本上线就过期。
          */}
          新项目请查看{' '}
          <Link
            href={`/docs/${sectionKey}/${currentKey}`}
            className="font-medium underline underline-offset-4"
          >
            {currentKey} 最新文档
          </Link>
          。已在 {versionLabel} 上运行的项目，本文仍是可靠依据。
        </p>
      ) : null}
    </Callout>
  );
}
