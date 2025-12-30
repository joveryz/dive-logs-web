/**
 * UI 相关类型定义
 * @module types/ui
 */

/**
 * 潜水列表排序字段
 */
export type SortField =
  | 'diveNumber'
  | 'date'
  | 'diveComputer'
  | 'diveType'
  | 'location'
  | 'buddy'
  | 'tags'
  | 'maxDepth'
  | 'duration';

/**
 * 排序方向
 */
export type SortDirection = 'asc' | 'desc';

/**
 * 潜水详情视图模式
 */
export type ViewMode = 'graph' | 'stats';

/**
 * Tab 按钮变体
 */
export type TabVariant = 'filled' | 'underline';
