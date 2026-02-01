/**
 * UI 相关类型定义
 * @module types/ui
 */

import type { Dive } from './dive';
import type { SortDirection } from './common';

// 重新导出 SortDirection 以保持向后兼容
export type { SortDirection };

// ============================================================================
// 排序相关
// ============================================================================

/**
 * 潜水列表排序字段
 */
export type SortField = Extract<
  keyof Dive,
  'diveNumber' | 'date' | 'diveType' | 'location' | 'maxDepth' | 'duration'
> | 'diveComputer' | 'buddy' | 'tags' | 'avgHeartRate' | 'minHeartRate';

// ============================================================================
// 视图相关
// ============================================================================

/**
 * 潜水详情视图模式
 */
export type ViewMode = 'graph' | 'stats';

/**
 * Tab 按钮变体
 */
export type TabVariant = 'filled' | 'underline';
