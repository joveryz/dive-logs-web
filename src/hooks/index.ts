// Dive-related hooks
export { useFilteredDives, getFreeDivePBIds } from './useFilteredDives';

// Chart hooks (unified API)
export {
  useChartData,
  useContainerSize,
  useSeriesHover,
  type EffectiveSeriesConfig,
} from './useChartData';

// Stats hooks
export {
  useStats,
  STATS_CATEGORY_LABELS,
  STATS_ROW_LABELS,
  type StatsCategory,
  type CategoryStats,
  type FormattedStats,
} from './useStats';

// Utility hooks
export { useIsMobile } from './useIsMobile';
export { useOrientation, type Orientation } from './useOrientation';
export { useUrlParams } from './useUrlParams';
export { useLayoutMode } from './useLayoutMode';
