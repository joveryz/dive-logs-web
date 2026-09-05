import { useMemo } from 'react';
import { useDiveStore, selectDives, selectSearchQuery, selectFilterValidDivesOnly, selectFilterDiveType, selectFilterDiver, selectFilterDateMonth, selectFilterTag, selectFilterLocation, selectFilterSite } from '@/store';
import { Dive } from '@/types';

/**
 * 判断潜水记录是否有效
 * - FreeDive 深度 < 6m 的无效
 * - 非 FreeDive 深度 < 10m 的无效
 * - 非 FreeDive 时长 < 15min 的无效
 */
function isValidDive(dive: Dive): boolean {
  if (dive.diveType === 'FreeDive' && dive.maxDepth < 6) return false;
  if (dive.diveType !== 'FreeDive' && dive.maxDepth < 10) return false;
  if (dive.diveType !== 'FreeDive' && dive.duration < 15 * 60) return false;
  return true;
}

/**
 * 比较搜索表达式
 * 支持格式: field>value, field<value, field>=value, field<=value
 * 支持字段: depth, duration/time, date
 */
interface ComparisonQuery {
  field: string;
  operator: '>' | '<' | '>=' | '<=';
  value: number | string;
}

function parseComparisonQuery(query: string): ComparisonQuery | null {
  const match = query.match(/^(depth|duration|time|date)\s*(>=|<=|>|<)\s*(.+)$/i);
  if (!match) return null;
  
  const field = match[1].toLowerCase();
  return {
    field,
    operator: match[2] as ComparisonQuery['operator'],
    value: field === 'date' ? match[3] : parseFloat(match[3]),
  };
}

function getDiveFieldValue(dive: Dive, field: string): number | string | null {
  switch (field) {
    case 'depth':
      return dive.maxDepth;
    case 'duration':
    case 'time':
      return dive.duration;
    case 'date':
      return dive.date;
    default:
      return null;
  }
}

function matchesComparison(dive: Dive, comparison: ComparisonQuery): boolean {
  const fieldValue = getDiveFieldValue(dive, comparison.field);
  if (fieldValue === null) return false;
  
  switch (comparison.operator) {
    case '>':
      return fieldValue > comparison.value;
    case '<':
      return fieldValue < comparison.value;
    case '>=':
      return fieldValue >= comparison.value;
    case '<=':
      return fieldValue <= comparison.value;
    default:
      return false;
  }
}

/**
 * 获取每个 Diver 的 FreeDive PB (Personal Best) ID 集合
 * 返回一个 Set，包含所有 diver 各自的最深 FreeDive 记录 ID
 */
export function getFreeDivePBIds(dives: Dive[]): Set<string> {
  const freeDives = dives.filter(d => d.diveType === 'FreeDive');
  if (freeDives.length === 0) return new Set();
  
  // 按 diver 分组，找到每个 diver 的 PB
  const diverPBs = new Map<string, Dive>();
  for (const dive of freeDives) {
    const diver = dive.diver || '__unknown__';
    const current = diverPBs.get(diver);
    if (!current || dive.maxDepth > current.maxDepth) {
      diverPBs.set(diver, dive);
    }
  }
  
  return new Set(Array.from(diverPBs.values()).map(d => d.id));
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
  const filterDiver = useDiveStore(selectFilterDiver);
  const filterDateMonth = useDiveStore(selectFilterDateMonth);
  const filterTag = useDiveStore(selectFilterTag);
  const filterLocation = useDiveStore(selectFilterLocation);
  const filterSite = useDiveStore(selectFilterSite);
  
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
    
    // 按潜水员过滤
    if (filterDiver) {
      result = result.filter(dive => dive.diver === filterDiver);
    }
    
    // 按日期月份过滤
    if (filterDateMonth) {
      result = result.filter(dive => dive.date.startsWith(filterDateMonth));
    }
    
    // 按标签过滤
    if (filterTag) {
      result = result.filter(dive => dive.tags?.includes(filterTag));
    }
    
    // 按地点过滤
    if (filterLocation) {
      result = result.filter(dive => dive.location === filterLocation);
    }
    
    // 按潜点过滤
    if (filterSite) {
      result = result.filter(dive => dive.site === filterSite);
    }
    
    // 文本搜索过滤
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase().trim();
      
      // 特殊搜索: "pb" 搜索所有 diver 的 FreeDive PB
      if (searchLower === 'pb') {
        const pbIds = getFreeDivePBIds(dives);
        if (pbIds.size > 0) {
          result = result.filter(dive => pbIds.has(dive.id));
        } else {
          result = [];
        }
      } else {
        // 尝试解析比较表达式 (如 depth>30, time<60, date>2026-01-01)
        const comparison = parseComparisonQuery(searchLower);
        if (comparison) {
          result = result.filter(dive => matchesComparison(dive, comparison));
        } else {
          result = result.filter(dive => 
            dive.location.toLowerCase().includes(searchLower) ||
            dive.site.toLowerCase().includes(searchLower) ||
            dive.diveComputer.model.toLowerCase().includes(searchLower) ||
            dive.diveType.toLowerCase().includes(searchLower) ||
            dive.buddy?.toLowerCase().includes(searchLower) ||
            dive.diveNumber.toString().includes(searchLower) ||
            dive.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
            dive.date.includes(searchLower)
          );
        }
      }
    }
    
    return result;
  }, [dives, searchQuery, filterValidDivesOnly, filterDiveType, filterDiver, filterDateMonth, filterTag, filterLocation, filterSite]);
}
