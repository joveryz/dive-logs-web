import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Dive } from '@/types';
import { dives as initialDives } from '@/data';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * Store 状态
 */
interface DiveState {
  /** 潜水记录列表 */
  dives: Dive[];
  /** 当前选中的潜水记录 ID */
  selectedDiveId: string | null;
  /** 搜索查询文本 */
  searchQuery: string;
  /** 是否只显示有效潜水 */
  filterValidDivesOnly: boolean;
  /** 筛选的潜水类型 */
  filterDiveType: string | null;
  /** 筛选的潜水员 */
  filterDiver: string | null;
  /** 筛选的日期月份 (YYYY-MM) */
  filterDateMonth: string | null;
  /** 筛选的标签 */
  filterTag: string | null;
  /** 筛选的地点 (location) */
  filterLocation: string | null;
  /** 筛选的潜点 (site) */
  filterSite: string | null;
  /** DiveList 滚动位置 */
  listScrollTop: number;
  /** Chart 系列可见性覆盖 */
  chartSeriesVisibility: Record<string, boolean>;
  /** Chart 选中的系列（用于右侧Y轴） */
  chartSelectedSeries: string | null;
  /** 移动端横屏是否显示全屏图表 */
  showLandscapeChart: boolean;
}

/**
 * Store 操作
 */
interface DiveActions {
  /** 设置选中的潜水记录 ID */
  setSelectedDiveId: (id: string | null) => void;
  /** 设置搜索查询文本 */
  setSearchQuery: (query: string) => void;
  /** 设置是否只显示有效潜水 */
  setFilterValidDivesOnly: (filter: boolean) => void;
  /** 设置筛选的潜水类型 */
  setFilterDiveType: (type: string | null) => void;
  /** 设置筛选的潜水员 */
  setFilterDiver: (diver: string | null) => void;
  /** 设置筛选的日期月份 */
  setFilterDateMonth: (month: string | null) => void;
  /** 设置筛选的标签 */
  setFilterTag: (tag: string | null) => void;
  /** 设置筛选的地点 */
  setFilterLocation: (location: string | null) => void;
  /** 设置筛选的潜点 */
  setFilterSite: (site: string | null) => void;
  /** 设置潜水记录列表 */
  setDives: (dives: Dive[]) => void;
  /** 添加潜水记录 */
  addDive: (dive: Dive) => void;
  /** 更新潜水记录 */
  updateDive: (id: string, updates: Partial<Dive>) => void;
  /** 删除潜水记录 */
  deleteDive: (id: string) => void;
  /** 清空搜索查询 */
  clearSearch: () => void;
  /** 设置列表滚动位置 */
  setListScrollTop: (scrollTop: number) => void;
  /** 设置 Chart 系列可见性 */
  setChartSeriesVisibility: (visibility: Record<string, boolean>) => void;
  /** 设置 Chart 选中系列 */
  setChartSelectedSeries: (key: string | null) => void;
  /** 设置横屏是否显示全屏图表 */
  setShowLandscapeChart: (show: boolean) => void;
}

/**
 * 完整的 Store 类型
 */
export type DiveStore = DiveState & DiveActions;

// ============================================================================
// Store 实现
// ============================================================================

/**
 * 获取默认选中的潜水 ID（编号最大的）
 */
const getDefaultSelectedDiveId = (): string | null => {
  if (initialDives.length === 0) return null;
  const maxDive = initialDives.reduce((max, dive) => 
    dive.diveNumber > max.diveNumber ? dive : max
  );
  return maxDive.id;
};

/**
 * 初始状态
 */
const initialState: DiveState = {
  dives: initialDives,
  selectedDiveId: getDefaultSelectedDiveId(),
  searchQuery: '',
  filterValidDivesOnly: true,
  filterDiveType: null,
  filterDiver: null,
  filterDateMonth: null,
  filterTag: null,
  filterLocation: null,
  filterSite: null,
  listScrollTop: 0,
  chartSeriesVisibility: {},
  chartSelectedSeries: 'ascentRate',
  showLandscapeChart: true,
};

/**
 * Dive Store
 * 使用 Zustand 管理潜水记录的全局状态
 */
export const useDiveStore = create<DiveStore>()(
  devtools(
    (set, get) => ({
      // 初始状态
      ...initialState,

      // 操作方法
      setSelectedDiveId: (id) => {
        set({ selectedDiveId: id, showLandscapeChart: true }, false, 'setSelectedDiveId');
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query }, false, 'setSearchQuery');
      },

      setFilterValidDivesOnly: (filter) => {
        set({ filterValidDivesOnly: filter }, false, 'setFilterValidDivesOnly');
      },

      setFilterDiveType: (type) => {
        set({ filterDiveType: type }, false, 'setFilterDiveType');
      },

      setFilterDiver: (diver) => {
        set({ filterDiver: diver }, false, 'setFilterDiver');
      },

      setFilterDateMonth: (month) => {
        set({ filterDateMonth: month }, false, 'setFilterDateMonth');
      },

      setFilterTag: (tag) => {
        set({ filterTag: tag }, false, 'setFilterTag');
      },

      setFilterLocation: (location) => {
        set({ filterLocation: location }, false, 'setFilterLocation');
      },

      setFilterSite: (site) => {
        set({ filterSite: site }, false, 'setFilterSite');
      },

      setDives: (dives) => {
        set({ dives }, false, 'setDives');
      },

      addDive: (dive) => {
        set(
          (state) => ({ dives: [...state.dives, dive] }),
          false,
          'addDive'
        );
      },

      updateDive: (id, updates) => {
        set(
          (state) => ({
            dives: state.dives.map((dive) =>
              dive.id === id ? { ...dive, ...updates } : dive
            ),
          }),
          false,
          'updateDive'
        );
      },

      deleteDive: (id) => {
        const { selectedDiveId } = get();
        set(
          (state) => {
            const newDives = state.dives.filter((dive) => dive.id !== id);
            return {
              dives: newDives,
              // 如果删除的是当前选中的，选中第一个
              selectedDiveId:
                selectedDiveId === id
                  ? newDives[0]?.id || null
                  : selectedDiveId,
            };
          },
          false,
          'deleteDive'
        );
      },

      clearSearch: () => {
        set({ searchQuery: '' }, false, 'clearSearch');
      },

      setListScrollTop: (scrollTop) => {
        set({ listScrollTop: scrollTop }, false, 'setListScrollTop');
      },

      setChartSeriesVisibility: (visibility) => {
        set({ chartSeriesVisibility: visibility }, false, 'setChartSeriesVisibility');
      },

      setChartSelectedSeries: (key) => {
        set({ chartSelectedSeries: key }, false, 'setChartSelectedSeries');
      },

      setShowLandscapeChart: (show) => {
        set({ showLandscapeChart: show }, false, 'setShowLandscapeChart');
      },
    }),
    {
      name: 'DiveStore',
      enabled: import.meta.env.DEV,
    }
  )
);


