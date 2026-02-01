/**
 * 排序工具函数
 */

/**
 * 比较可能为 null/undefined 的可选值
 * null 值会被排到末尾
 */
export function compareOptional<T>(
  a: T | undefined | null,
  b: T | undefined | null,
  compare: (a: T, b: T) => number,
  sortDirection: 'asc' | 'desc' = 'asc'
): number {
  if (a == null && b == null) return 0;
  // null 值始终排到末尾
  if (a == null) return sortDirection === 'asc' ? 1 : -1;
  if (b == null) return sortDirection === 'asc' ? -1 : 1;
  return compare(a, b);
}

/**
 * 比较数字（用于 compareOptional）
 */
export const compareNumbers = (a: number, b: number): number => a - b;
