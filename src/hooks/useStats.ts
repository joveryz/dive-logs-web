import { useMemo } from 'react';
import { Dive } from '@/types';
import { formatDurationReadable } from '@/utils';

/**
 * 统计分类类型
 */
export type StatsCategory = 'diverDiveType' | 'diver' | 'diveType' | 'buddy' | 'year' | 'yearMonth' | 'location' | 'site' | 'computer';

/**
 * 单个分类的统计数据
 */
export interface CategoryStats {
  /** 分类名称 */
  name: string;
  /** 潜水次数 */
  diveCount: number;
  /** 总水下时间（秒） */
  totalTime: number;
  /** 总潜水深度（米） */
  totalDepth: number;
  /** 最大深度 */
  maxDepth: number;
  /** 平均最大深度 */
  avgMaxDepth: number;
  /** 最长潜水时间（秒） */
  longestDive: number;
  /** 平均潜水时间（秒） */
  avgDiveTime: number;
  /** 最低心率 */
  minHeartRate: number | null;
  /** 最高心率 */
  maxHeartRate: number | null;
  /** 平均心率 */
  avgHeartRate: number | null;
  /** 最常去的地点 */
  mostVisitedLocation: string;
  /** 独立地点数量 */
  uniqueLocations: number;
  /** 最常去的潜点 */
  mostVisitedSite: string;
  /** 独立潜点数量 */
  uniqueSites: number;
}

/**
 * 格式化后的统计数据（用于显示）
 */
export interface FormattedStats {
  name: string;
  totalTime: string;
  totalDepth: string;
  maxDepth: string;
  avgMaxDepth: string;
  longestDive: string;
  avgDiveTime: string;
  minHeartRate: string;
  maxHeartRate: string;
  avgHeartRate: string;
  mostVisitedLocation: string;
  uniqueLocations: string;
  mostVisitedSite: string;
  uniqueSites: string;
}

/**
 * 获取分类值
 */
function getCategoryValue(dive: Dive, category: StatsCategory): string {
  switch (category) {
    case 'diverDiveType':
      return `${dive.diver || 'Unknown'} / ${dive.diveType}`;
    case 'diver':
      return dive.diver || 'Unknown';
    case 'diveType':
      return dive.diveType;
    case 'location':
      return dive.location;
    case 'site':
      return dive.site;
    case 'buddy':
      return dive.buddy;
    case 'yearMonth':
      return dive.date.substring(0, 7); // YYYY-MM
    case 'year':
      return dive.date.substring(0, 4); // YYYY
    case 'computer':
      return dive.diveComputer.model;
    default:
      return 'Unknown';
  }
}

/**
 * 计算一组潜水的统计数据
 */
function calculateStats(dives: Dive[], name: string): CategoryStats {
  if (dives.length === 0) {
    return {
      name,
      diveCount: 0,
      totalTime: 0,
      totalDepth: 0,
      maxDepth: 0,
      avgMaxDepth: 0,
      longestDive: 0,
      avgDiveTime: 0,
      minHeartRate: null,
      maxHeartRate: null,
      avgHeartRate: null,
      mostVisitedLocation: '-',
      uniqueLocations: 0,
      mostVisitedSite: '-',
      uniqueSites: 0,
    };
  }

  const totalTime = dives.reduce((sum, d) => sum + d.duration, 0);
  const totalDepth = dives.reduce((sum, d) => sum + d.maxDepth, 0);
  const maxDepth = Math.max(...dives.map(d => d.maxDepth));
  const avgMaxDepth = dives.reduce((sum, d) => sum + d.maxDepth, 0) / dives.length;
  const longestDive = Math.max(...dives.map(d => d.duration));
  const avgDiveTime = totalTime / dives.length;

  // 统计地点
  const locationCounts = new Map<string, number>();
  dives.forEach(d => {
    locationCounts.set(d.location, (locationCounts.get(d.location) || 0) + 1);
  });
  const mostVisitedLocation = [...locationCounts.entries()]
    .sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  // 统计潜点
  const siteCounts = new Map<string, number>();
  dives.forEach(d => {
    siteCounts.set(d.site, (siteCounts.get(d.site) || 0) + 1);
  });
  const mostVisitedSite = [...siteCounts.entries()]
    .sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  // 计算心率统计
  const heartRates = dives
    .filter(d => d.environment?.minHeartRate || d.environment?.maxHeartRate || d.environment?.avgHeartRate)
    .map(d => d.environment);
  
  let minHeartRate: number | null = null;
  let maxHeartRate: number | null = null;
  let avgHeartRate: number | null = null;
  
  if (heartRates.length > 0) {
    const minRates = heartRates.map(e => e?.minHeartRate).filter((v): v is number => v !== undefined);
    const maxRates = heartRates.map(e => e?.maxHeartRate).filter((v): v is number => v !== undefined);
    const avgRates = heartRates.map(e => e?.avgHeartRate).filter((v): v is number => v !== undefined);
    
    if (minRates.length > 0) minHeartRate = Math.min(...minRates);
    if (maxRates.length > 0) maxHeartRate = Math.max(...maxRates);
    if (avgRates.length > 0) avgHeartRate = avgRates.reduce((a, b) => a + b, 0) / avgRates.length;
  }

  return {
    name,
    diveCount: dives.length,
    totalTime,
    totalDepth,
    maxDepth,
    avgMaxDepth,
    longestDive,
    avgDiveTime,
    minHeartRate,
    maxHeartRate,
    avgHeartRate,
    mostVisitedLocation,
    uniqueLocations: locationCounts.size,
    mostVisitedSite,
    uniqueSites: siteCounts.size,
  };
}

/**
 * 格式化统计数据
 */
function formatStats(stats: CategoryStats): FormattedStats {
  return {
    name: stats.name,
    totalTime: formatDurationReadable(stats.totalTime),
    totalDepth: `${stats.totalDepth.toFixed(1)}m`,
    maxDepth: `${stats.maxDepth.toFixed(1)}m`,
    avgMaxDepth: `${stats.avgMaxDepth.toFixed(1)}m`,
    longestDive: formatDurationReadable(stats.longestDive),
    avgDiveTime: formatDurationReadable(stats.avgDiveTime),
    minHeartRate: stats.minHeartRate !== null ? `${Math.round(stats.minHeartRate)} bpm` : '-',
    maxHeartRate: stats.maxHeartRate !== null ? `${Math.round(stats.maxHeartRate)} bpm` : '-',
    avgHeartRate: stats.avgHeartRate !== null ? `${Math.round(stats.avgHeartRate)} bpm` : '-',
    mostVisitedLocation: stats.mostVisitedLocation,
    uniqueLocations: stats.uniqueLocations.toString(),
    mostVisitedSite: stats.mostVisitedSite,
    uniqueSites: stats.uniqueSites.toString(),
  };
}

/**
 * 统计 Hook
 */
export function useStats(dives: Dive[], category: StatsCategory) {
  return useMemo(() => {
    // 按分类分组
    const groups = new Map<string, Dive[]>();
    dives.forEach(dive => {
      const key = getCategoryValue(dive, category);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(dive);
    });

    // 计算每个分组的统计
    const categoryStats: FormattedStats[] = [];
    
    // 先计算 "All" 统计
    const allStats = calculateStats(dives, 'All');
    categoryStats.push(formatStats(allStats));

    // 按潜水次数排序分组，Solo 排在最前面，年月按时间倒序
    const sortedGroups = [...groups.entries()].sort((a, b) => {
      // Solo 优先排在最前
      if (a[0] === 'Solo') return -1;
      if (b[0] === 'Solo') return 1;
      // 年/年月按时间倒序排列
      if (category === 'year' || category === 'yearMonth') {
        return b[0].localeCompare(a[0]);
      }
      // 其他按潜水次数排序
      return b[1].length - a[1].length;
    });
    
    sortedGroups.forEach(([key, groupDives]) => {
      const stats = calculateStats(groupDives, key);
      categoryStats.push(formatStats(stats));
    });

    return {
      totalDives: dives.length,
      categories: categoryStats,
    };
  }, [dives, category]);
}

/**
 * 分类标签映射
 */
export const STATS_CATEGORY_LABELS: Record<StatsCategory, string> = {
  diverDiveType: 'Diver/Type',
  diver: 'Diver',
  diveType: 'Type',
  location: 'Location',
  site: 'Site',
  buddy: 'Buddy',
  yearMonth: 'Year/Month',
  year: 'Year',
  computer: 'Computer',
};

/**
 * 统计行标签
 */
export const STATS_ROW_LABELS = {
  totalTime: 'Total Time',
  totalDepth: 'Total Depth',
  maxDepth: 'Max Depth',
  avgMaxDepth: 'Avg Max Depth',
  longestDive: 'Longest Dive',
  avgDiveTime: 'Avg Dive Time',
  minHeartRate: 'Min Heart Rate',
  maxHeartRate: 'Max Heart Rate',
  avgHeartRate: 'Avg Heart Rate',
  mostVisitedLocation: 'Top Location',
  uniqueLocations: 'Locations',
  mostVisitedSite: 'Top Site',
  uniqueSites: 'Sites',
} as const;
