import type { HighlightColor } from './types';

export function javaStringHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return h;
}

export function spreadHash(h: number): number {
  return (h ^ (h >>> 16)) & 0xffffffff;
}

export function bucketIndex(key: string, capacity: number): number {
  const h = javaStringHash(key);
  return spreadHash(h) & (capacity - 1);
}

export function colorClass(color: HighlightColor | string): string {
  switch (color) {
    case 'success':
      return 'border-emerald-500 bg-emerald-500/10 text-emerald-200';
    case 'warning':
      return 'border-amber-500 bg-amber-500/10 text-amber-200';
    case 'error':
      return 'border-rose-500 bg-rose-500/10 text-rose-200';
    default:
      return 'border-sky-500 bg-sky-500/10 text-sky-200';
  }
}