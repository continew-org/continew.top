'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { ActionLink, Button, FilterChip } from '@/components/site-actions';
import { JoinGroupDialog } from '@/components/home/join-group-dialog';
import { currentDocsUrl } from '@/lib/shared';

export function DesignSystemExamples() {
  const [category, setCategory] = useState('全部');
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={() => setConfirmed(!confirmed)}>
          {confirmed ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
          {confirmed ? '已确认' : '确认操作'}
        </Button>
        <Button>次要操作</Button>
        <Button variant="ghost">轻量操作</Button>
        <Button disabled>暂不可用</Button>
        <Button size="icon" aria-label="确认图标按钮" onClick={() => setConfirmed(!confirmed)}>
          <Check className="size-4" aria-hidden />
        </Button>
        <JoinGroupDialog />
      </div>
      <p role="status" className="text-sm text-fd-muted-foreground">{confirmed ? '操作已确认。' : '尚未确认操作。'}</p>
      <div className="flex flex-wrap items-center gap-3">
        <ActionLink href="/blog" variant="primary">站内导航</ActionLink>
        <ActionLink href="#motion">页内导航</ActionLink>
        <ActionLink href="https://github.com/continew-org">外部导航</ActionLink>
        <ActionLink href={currentDocsUrl} variant="text">文字链接</ActionLink>
      </div>
      <div role="group" aria-label="样例分类" className="flex flex-wrap gap-2">
        {['全部', '版本更新', '社区动态'].map((item) => (
          <FilterChip key={item} selected={category === item} onClick={() => setCategory(item)}>{item}</FilterChip>
        ))}
      </div>
      <p role="status" className="text-sm text-fd-muted-foreground">当前分类：{category}</p>
    </div>
  );
}
