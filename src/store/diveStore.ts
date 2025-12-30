import { create } from 'zustand';
import { Dive } from '../types';
import { mockDives } from '../data';
import { useMemo } from 'react';

interface DiveStore {
  // 数据
  dives: Dive[];
  selectedDiveId: string | null;
  filterText: string;
  
  // 操作
  setSelectedDiveId: (id: string | null) => void;
  setFilterText: (text: string) => void;
}

export const useDiveStore = create<DiveStore>((set) => ({
  // 初始数据
  dives: mockDives,
  selectedDiveId: mockDives[0]?.id || null,
  filterText: '',
  
  // 操作
  setSelectedDiveId: (id) => set({ selectedDiveId: id }),
  setFilterText: (text) => set({ filterText: text }),
}));

// 选择器 hooks，用于性能优化
export const useFilteredDives = () => {
  const dives = useDiveStore((state) => state.dives);
  const filterText = useDiveStore((state) => state.filterText);
  
  return useMemo(() => {
    if (!filterText.trim()) return dives;
    
    const searchLower = filterText.toLowerCase();
    return dives.filter(dive => 
      dive.location.toLowerCase().includes(searchLower) ||
      dive.site.toLowerCase().includes(searchLower) ||
      dive.diveComputer.model.toLowerCase().includes(searchLower) ||
      dive.diveType.toLowerCase().includes(searchLower) ||
      dive.buddy?.toLowerCase().includes(searchLower) ||
      dive.diveNumber.toString().includes(searchLower)
    );
  }, [dives, filterText]);
};

export const useSelectedDive = () => {
  const dives = useDiveStore((state) => state.dives);
  const selectedDiveId = useDiveStore((state) => state.selectedDiveId);
  
  return useMemo(() => {
    return dives.find(d => d.id === selectedDiveId) || null;
  }, [dives, selectedDiveId]);
};
