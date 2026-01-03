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
}

/**
 * 完整的 Store 类型
 */
export type DiveStore = DiveState & DiveActions;

// ============================================================================
// Store 实现
// ============================================================================

/**
 * 初始状态
 */
const initialState: DiveState = {
  dives: initialDives,
  selectedDiveId: initialDives[0]?.id || null,
  searchQuery: '',
  filterValidDivesOnly: true,
  filterDiveType: null,
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
        set({ selectedDiveId: id }, false, 'setSelectedDiveId');
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
    }),
    {
      name: 'DiveStore',
      enabled: import.meta.env.DEV,
    }
  )
);


