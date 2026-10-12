'use client';

import { useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { ActionLink, Button } from '@/components/site-actions';
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
      <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-fd-border bg-fd-muted/50 p-4 text-sm leading-6 text-fd-muted-foreground sm:p-5">
        {registrationTemplate}
      </pre>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button onClick={copyTemplate}>
          {copyState === 'copied' ? (
            <Check className="size-4 text-[var(--cn-brand)]" aria-hidden />
          ) : (
            <Copy className="size-4" aria-hidden />
          )}
          {copyState === 'copied' ? '模板已复制' : '复制登记模板'}
        </Button>
        <ActionLink href={registerUrl} variant="primary">前往 GitHub 提交登记</ActionLink>
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
