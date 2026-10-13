import Link from 'next/link';
import { ArchiveIcon } from 'lucide-react';
import { Callout } from 'fumadocs-ui/components/callout';
import { getDefaultVersion, type DocVersion } from '@/lib/docs-sections';

/**
 * 归档文档页的升级提示。
 *
 * ## 为什么要有
 *
 * 归档版本与当前版本往往同时在线：有人在搜索引擎里点了旧链接、有人手上跑的
 * 就是那个版本。仅仅「内容停止更新」是不够的——读旧文档的人常常不知道自己读的
 * 是旧文档。侧栏版本下拉里写着 4.x，但顺着搜索结果进来的人不会先去辨认项目名称，
 * 而是直接读正文。于是旧配置被照抄进新项目，问题要等到部署才暴露。
 *
 * ## 文案里的三个版本字符串分工（不要互相顶替）
 *
 * - `version.key`：归档**线**，也是 URL 段，如 `4.x`——放在「本文是 … 的归档文档」里；
 * - `version.versionTag`：这条线的**发布 tag**，如 `v4.2.0`——放在「冻结于 …」里；
 * - `version.versionLabel`：该版本对应的**维护分支**，如 `4.2.x`——放在「以 … 为准」
 *   与「已在 … 上运行的项目」里，因为它最接近使用者手上的分支名。
 *
 * ## 为什么放在正文之前而不是页头 UI
 *
 * 提示要紧挨着它所修饰的内容。放进 layout 或面包屑里，它就跟具体哪一页脱钩了：
 * 打印和单页分享时也能看见提示；逐页 Markdown 由 lib/source.ts 另行添加归档标注。
 *
 * ## 为什么由代码渲染而不是写进每篇 MDX
 *
 * 几十个页面手写一遍一定会漏，且将来任何一次归档都要再抄一遍。ArchiveNotice
 * 按「分区/版本」自动挂载，漏是不可能的。
 */
export function ArchiveNotice({
  sectionKey,
  version,
}: {
  sectionKey: string;
  version: DocVersion;
}) {
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
