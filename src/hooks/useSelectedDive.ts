import { useDiveStore, selectSelectedDive } from '@/store';

/**
 * 获取当前选中的潜水记录
 */
export function useSelectedDive() {
  return useDiveStore(selectSelectedDive);
}
