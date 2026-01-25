// Dive-related hooks
export { useFilteredDives, getFreeDivePBIds } from './useFilteredDives';
export { useSelectedDive } from './useSelectedDive';

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
export { useUrlParams } from './useUrlParams';
export { useLayoutMode } from './useLayoutMode';
