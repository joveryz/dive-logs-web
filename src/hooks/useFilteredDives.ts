import { useMemo } from 'react';
import { useDiveStore, selectDives, selectSearchQuery, selectFilterValidDivesOnly, selectFilterDiveType } from '@/store';
import { Dive } from '@/types';

/**
 * 判断潜水记录是否有效
 * - 潜水编号 > 1000 的无效
 * - FreeDive 深度 < 5m 的无效
 * - 非 FreeDive 深度 < 10m 的无效
 * - 非 FreeDive 时长 < 15min 的无效
 */
function isValidDive(dive: Dive): boolean {
  if (dive.diveNumber > 1000) return false;
  if (dive.diveType === 'FreeDive' && dive.maxDepth < 6) return false;
  if (dive.diveType !== 'FreeDive' && dive.maxDepth < 10) return false;
  if (dive.diveType !== 'FreeDive' && dive.duration < 15 * 60) return false;
  return true;
}

/**
 * 获取 FreeDive PB (Personal Best) ID
 */
export function getFreeDivePBId(dives: Dive[]): string | null {
  const freeDives = dives.filter(d => d.diveType === 'FreeDive');
  if (freeDives.length === 0) return null;
  return freeDives.reduce((deepest, dive) => 
    dive.maxDepth > deepest.maxDepth ? dive : deepest
  ).id;
}

/**
 * 获取过滤后的潜水记录列表
 * 根据 searchQuery 过滤 location, site, computer, type, buddy, number, tags
 * 支持搜索 "pb" 来显示 FreeDive PB
 * 可选过滤无效潜水
 */
export function useFilteredDives() {
  const dives = useDiveStore(selectDives);
  const searchQuery = useDiveStore(selectSearchQuery);
  const filterValidDivesOnly = useDiveStore(selectFilterValidDivesOnly);
  const filterDiveType = useDiveStore(selectFilterDiveType);
  
  return useMemo(() => {
    let result = dives;
    
    // 过滤无效潜水
    if (filterValidDivesOnly) {
      result = result.filter(isValidDive);
    }
    
    // 按潜水类型过滤
    if (filterDiveType) {
      result = result.filter(dive => dive.diveType === filterDiveType);
    }
    
    // 文本搜索过滤
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      
      // 特殊搜索: "pb" 搜索 FreeDive PB
      if (searchLower === 'pb') {
        const pbId = getFreeDivePBId(dives);
        if (pbId) {
          result = result.filter(dive => dive.id === pbId);
        } else {
          result = [];
        }
      } else {
        result = result.filter(dive => 
          dive.location.toLowerCase().includes(searchLower) ||
          dive.site.toLowerCase().includes(searchLower) ||
          dive.diveComputer.model.toLowerCase().includes(searchLower) ||
          dive.diveType.toLowerCase().includes(searchLower) ||
          dive.buddy?.toLowerCase().includes(searchLower) ||
          dive.diveNumber.toString().includes(searchLower) ||
          dive.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
    }
    
    return result;
  }, [dives, searchQuery, filterValidDivesOnly, filterDiveType]);
}
