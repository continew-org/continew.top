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
 * 是旧文档。标题栏说了 4.2，但顺着搜索结果进来的人不会先去辨认项目名称，
 * 而是直接读正文。于是旧配置被照抄进新项目，问题要等到部署才暴露。
 *
 * ## 为什么放在正文之前而不是页头 UI
 *
 * 提示要紧挨着它所修饰的内容。放进 layout 或面包屑里，它就跟具体哪一页脱钩了：
 * 打印和单页分享时也能看见提示；逐页 Markdown 由 lib/source.ts 另行添加归档标注。
 *
 * ## 为什么由代码渲染而不是写进每篇 MDX
 *
 * 59 个页面手写一遍一定会漏，且将来任何一次归档都要再抄一遍。ArchiveNotice
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
  const versionLabel = version.versionLabel ?? version.ref;

  return (
    <Callout type="warn" icon={<ArchiveIcon />}>
      <p>
        本文是 <strong>{versionLabel}</strong> 的归档文档。除非维护者对这一分支打了补丁，
        内容不会再变动——其中源码路径、配置项与版本号均对应于该版本，
        <strong>不建议在新项目中使用</strong>。
      </p>
      {currentKey ? (
        <p className="mt-2">
          新项目请移步{' '}
          <Link
            href={`/docs/${sectionKey}/${currentKey}`}
            className="font-medium underline underline-offset-4"
          >
            最新版本文档
          </Link>
          。仍在 {versionLabel} 上加业务的话，本文仍是可靠依据。
        </p>
      ) : null}
    </Callout>
  );
}
