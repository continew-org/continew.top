'use client';

import { useRef, useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { registrationTemplate } from '@/lib/user-registration';

type CopyState = 'idle' | 'copied' | 'error';

export function UserRegistrationActions({ registerUrl }: { registerUrl: string }) {
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copyTemplate = async () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);

    try {
      await navigator.clipboard.writeText(registrationTemplate);
      setCopyState('copied');
      resetTimer.current = setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      setCopyState('error');
    }
  };

  const statusMessage =
    copyState === 'copied'
      ? '登记模板已复制到剪贴板。'
      : copyState === 'error'
        ? '复制失败，请手动选择下方模板内容。'
        : '';

  return (
    <div>
      <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-fd-border bg-fd-muted/50 p-4 text-xs leading-6 text-fd-muted-foreground sm:p-5">
        {registrationTemplate}
      </pre>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={copyTemplate}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-fd-border bg-fd-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cn-brand)]/50"
        >
          {copyState === 'copied' ? (
            <Check className="size-4 text-[var(--cn-brand)]" aria-hidden />
          ) : (
            <Copy className="size-4" aria-hidden />
          )}
          {copyState === 'copied' ? '模板已复制' : '复制登记模板'}
        </button>
        <a
          href={registerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--cn-brand)] px-5 py-2.5 text-sm font-medium text-[var(--cn-brand-on)] transition-colors hover:bg-[var(--cn-brand-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cn-brand)]/50"
        >
          前往 GitHub 提交登记
          <ExternalLink className="size-4" aria-hidden />
        </a>
      </div>
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="mt-3 min-h-5 text-xs text-fd-muted-foreground"
      >
        {statusMessage}
      </p>
    </div>
  );
}
