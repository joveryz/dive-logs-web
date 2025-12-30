import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Dive } from '@/types';
import { mockDives } from '@/data';

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
  /** 筛选文本 */
  filterText: string;
}

/**
 * Store 操作
 */
interface DiveActions {
  /** 设置选中的潜水记录 ID */
  setSelectedDiveId: (id: string | null) => void;
  /** 设置筛选文本 */
  setFilterText: (text: string) => void;
  /** 设置潜水记录列表 */
  setDives: (dives: Dive[]) => void;
  /** 添加潜水记录 */
  addDive: (dive: Dive) => void;
  /** 更新潜水记录 */
  updateDive: (id: string, updates: Partial<Dive>) => void;
  /** 删除潜水记录 */
  deleteDive: (id: string) => void;
  /** 清空筛选 */
  clearFilter: () => void;
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
  dives: mockDives,
  selectedDiveId: mockDives[0]?.id || null,
  filterText: '',
};

/**
 * Dive Store
 * 使用 Zustand 管理潜水记录的全局状态
 */
export const useDiveStore = create<DiveStore>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        ...initialState,

        // 操作方法
        setSelectedDiveId: (id) => {
          set({ selectedDiveId: id }, false, 'setSelectedDiveId');
        },

        setFilterText: (text) => {
          set({ filterText: text }, false, 'setFilterText');
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

        clearFilter: () => {
          set({ filterText: '' }, false, 'clearFilter');
        },
      }),
      {
        name: 'dive-logs-storage',
        // 只持久化用户选择相关的状态，不持久化数据
        partialize: (state) => ({
          selectedDiveId: state.selectedDiveId,
          filterText: state.filterText,
        }),
      }
    ),
    {
      name: 'DiveStore',
      enabled: import.meta.env.DEV,
    }
  )
);

// ============================================================================
// Selector Hooks（性能优化）
// ============================================================================

/**
 * 获取所有潜水记录
 */
export const useDives = () => useDiveStore((state) => state.dives);

/**
 * 获取选中的潜水记录 ID
 */
export const useSelectedDiveId = () =>
  useDiveStore((state) => state.selectedDiveId);

/**
 * 获取筛选文本
 */
export const useFilterText = () => useDiveStore((state) => state.filterText);

/**
 * 获取操作方法
 */
export const useDiveActions = () =>
  useDiveStore((state) => ({
    setSelectedDiveId: state.setSelectedDiveId,
    setFilterText: state.setFilterText,
    setDives: state.setDives,
    addDive: state.addDive,
    updateDive: state.updateDive,
    deleteDive: state.deleteDive,
    clearFilter: state.clearFilter,
  }));
