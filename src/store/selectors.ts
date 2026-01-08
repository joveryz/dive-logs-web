/**
 * Dive Store Selectors
 * 优化的状态选择器，避免不必要的重渲染
 * @module store/selectors
 */

import type { DiveStore } from './diveStore';
import type { Dive } from '@/types';

// ============================================================================
// 基础 Selectors
// ============================================================================

/**
 * 选择所有潜水记录
 */
export const selectDives = (state: DiveStore): Dive[] => state.dives;

/**
 * 选择当前选中的潜水 ID
 */
export const selectSelectedDiveId = (state: DiveStore): string | null =>
  state.selectedDiveId;

/**
 * 选择搜索查询
 */
export const selectSearchQuery = (state: DiveStore): string => state.searchQuery;

/**
 * 选择是否只显示有效潜水
 */
export const selectFilterValidDivesOnly = (state: DiveStore): boolean =>
  state.filterValidDivesOnly;

/**
 * 选择筛选的潜水类型
 */
export const selectFilterDiveType = (state: DiveStore): string | null =>
  state.filterDiveType;

/**
 * 选择筛选的潜水员
 */
export const selectFilterDiver = (state: DiveStore): string | null =>
  state.filterDiver;

// ============================================================================
// 派生 Selectors
// ============================================================================

/**
 * 选择当前选中的潜水记录
 */
export const selectSelectedDive = (state: DiveStore): Dive | null => {
  const { dives, selectedDiveId } = state;
  return dives.find((d) => d.id === selectedDiveId) || null;
};

