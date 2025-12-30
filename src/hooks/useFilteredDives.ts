import { useMemo } from 'react';
import { useDiveStore } from '@/store';

/**
 * 获取过滤后的潜水记录列表
 * 根据 filterText 过滤 location, site, computer, type, buddy, number
 */
export function useFilteredDives() {
  const dives = useDiveStore((state) => state.dives);
  const filterText = useDiveStore((state) => state.filterText);
  
  return useMemo(() => {
    if (!filterText.trim()) return dives;
    
    const searchLower = filterText.toLowerCase();
    return dives.filter(dive => 
      dive.location.toLowerCase().includes(searchLower) ||
      dive.site.toLowerCase().includes(searchLower) ||
      dive.diveComputer.model.toLowerCase().includes(searchLower) ||
      dive.diveType.toLowerCase().includes(searchLower) ||
      dive.buddy?.toLowerCase().includes(searchLower) ||
      dive.diveNumber.toString().includes(searchLower)
    );
  }, [dives, filterText]);
}
