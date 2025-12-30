import { useMemo } from 'react';
import { useDiveStore } from '@/store';

/**
 * 获取当前选中的潜水记录
 */
export function useSelectedDive() {
  const dives = useDiveStore((state) => state.dives);
  const selectedDiveId = useDiveStore((state) => state.selectedDiveId);
  
  return useMemo(() => {
    return dives.find(d => d.id === selectedDiveId) || null;
  }, [dives, selectedDiveId]);
}
