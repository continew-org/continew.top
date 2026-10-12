import Image from 'next/image';
import { cn } from '@/lib/cn';
import { focusRing, siteLayout } from '@/lib/site-design';

// 备案与版权信息（旧站 .vitepress/configs/footer 同款，静态导出构建期取当前年份）。
const icpRecordCode = '津ICP备2022005864号-3';
const publicSecurityRecordCode = '津公网安备12011202000677号';

const currentYear = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="border-t border-fd-border py-8">
      <div className={cn(siteLayout.standard, 'flex flex-col items-center gap-2 text-xs text-fd-muted-foreground')}>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn('hover:text-fd-foreground hover:underline', focusRing)}
          >
            {icpRecordCode}
          </a>
          <a
            href="https://beian.gov.cn/portal/registerSystemInfo"
            target="_blank"
            rel="noopener noreferrer"
            className={cn('inline-flex items-center gap-1 hover:text-fd-foreground hover:underline', focusRing)}
          >
            <Image src="/gongan.png" alt="" width={14} height={14} unoptimized aria-hidden />
            {publicSecurityRecordCode}
          </a>
        </div>
        <p className="text-center">
          本站内容采用{' '}
          <a
            href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-Hans"
            target="_blank"
            rel="license noopener noreferrer"
            className={cn('hover:text-fd-foreground hover:underline', focusRing)}
          >
            CC BY-NC-SA 4.0
          </a>{' '}
          许可，代码采用{' '}
          <a
            href="https://github.com/continew-org/continew.top/blob/main/LICENSE"
            target="_blank"
            rel="license noopener noreferrer"
            className={cn('hover:text-fd-foreground hover:underline', focusRing)}
          >
            Apache-2.0
          </a>{' '}
          许可
        </p>
        <p>Copyright © 2022-{currentYear} ContiNew</p>
      </div>
    </footer>
  );
}
