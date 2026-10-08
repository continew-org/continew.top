import Image from 'next/image';

// 备案与版权信息（旧站 .vitepress/configs/footer 同款，静态导出构建期取当前年份）。
const icpRecordCode = '津ICP备2022005864号-3';
const publicSecurityRecordCode = '津公网安备12011202000677号';

const currentYear = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="border-t border-fd-border py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-2 px-6 text-xs text-fd-muted-foreground">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-fd-foreground hover:underline"
          >
            {icpRecordCode}
          </a>
          <a
            href="https://beian.gov.cn/portal/registerSystemInfo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-fd-foreground hover:underline"
          >
            <Image src="/gongan.png" alt="" width={14} height={14} unoptimized aria-hidden />
            {publicSecurityRecordCode}
          </a>
        </div>
        <p>
          CC BY-NC-SA 4.0 | Copyright © 2022-{currentYear} ContiNew
        </p>
      </div>
    </footer>
  );
}
