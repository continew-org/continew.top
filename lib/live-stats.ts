'use client';

import { useEffect, useState } from 'react';
import type { PlatformKey } from '@/lib/platform-api';

/**
 * 实时 Star 数据的客户端读取层（浏览器只访问自家域名下的 /stats.json）。
 *
 * 数据由部署机 crontab 每小时调用 scripts/update-stats.mjs 刷新；
 * 页面首帧渲染的仍是构建期数值（SSR 直出、SEO 可读、无 JS 也正常），
 * 挂载后拉到 stats.json 且数值存在时才静默替换——拉取失败、文件缺失
 * （例如首次 cron 跑通之前）都不做任何事，不会出现空洞或报错。
 *
 * 同一页面内的多个消费点（导航、首页、时间线）共享一次请求：
 * 模块级 in-flight Promise + localStorage 30 分钟缓存。限流按访客 IP 计，
 * 缓存防的是站内跳转反复拉取与快速刷新的重复流量。
 */

export interface LiveStats {
  version: 1;
  /** 部署机写入时间（ISO 8601），用于展示「更新于」。 */
  updatedAt: string;
  /** 各平台 Star 当前值；个别平台拉取失败时可能缺键。 */
  platforms: Partial<Record<PlatformKey, number>>;
  /** 三平台合计；有平台缺值时脚本不写此字段，前端继续用构建值。 */
  total?: number;
}

const STORAGE_KEY = 'cn:liv…ts';
const TTL_MS = 30 * 60 * 1000;

/** 结构校验：stats.json 由脚本生成，但浏览器读到的任何东西都不能默认可信。 */
function isLiveStats(value: unknown): value is LiveStats {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  if (v.version !== 1 || typeof v.updatedAt !== 'string') return false;
  if (typeof v.platforms !== 'object' || v.platforms === null) return false;
  const numbers = Object.values(v.platforms as Record<string, unknown>);
  if (numbers.some((n) => typeof n !== 'number')) return false;
  return v.total === undefined || typeof v.total === 'number';
}

function readCache(): LiveStats | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as { at: number; data: LiveStats };
    return Date.now() - entry.at < TTL_MS && isLiveStats(entry.data) ? entry.data : null;
  } catch {
    // 隐私模式下 localStorage 会抛异常：只失去缓存，不影响本次拉取
    return null;
  }
}

function writeCache(data: LiveStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ at: Date.now(), data }));
  } catch {
    // 存不进去就算了
  }
}

let pending: Promise<LiveStats | null> | null = null;

export function fetchLiveStats(): Promise<LiveStats | null> {
  const cached = readCache();
  if (cached) return Promise.resolve(cached);
  // no-store：这个文件由站外（cron）改写，走浏览器缓存会读到构建时刻的旧值
  pending ??= fetch('/stats.json', { cache: 'no-store' })
    .then((res) => (res.ok ? (res.json() as Promise<unknown>) : null))
    .then((data) => {
      if (!isLiveStats(data)) return null;
      writeCache(data);
      return data;
    })
    .catch(() => null)
    // 链尾复位在途请求：成功与失败都清空，否则缓存 TTL 过期后永远复用旧 Promise
    // （SPA 软导航不重载 JS），首次失败也会被固化；finally 不改写落定值，结果照常返回调用方
    .finally(() => {
      pending = null;
    });
  return pending;
}

/** 挂载后取一次实时数据；取不到永远返回 null，调用方以构建值兜底。 */
export function useLiveStats(): LiveStats | null {
  const [stats, setStats] = useState<LiveStats | null>(null);
  useEffect(() => {
    let mounted = true;
    void fetchLiveStats().then((data) => {
      if (data && mounted) setStats(data);
    });
    return () => {
      mounted = false;
    };
  }, []);
  return stats;
}
