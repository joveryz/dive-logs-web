import { create } from 'zustand';
import { Dive } from '@/types';
import { mockDives } from '@/data';

interface DiveStore {
  // 数据
  dives: Dive[];
  selectedDiveId: string | null;
  filterText: string;
  
  // 操作
  setSelectedDiveId: (id: string | null) => void;
  setFilterText: (text: string) => void;
  setDives: (dives: Dive[]) => void;
}

export const useDiveStore = create<DiveStore>((set) => ({
  // 初始数据
  dives: mockDives,
  selectedDiveId: mockDives[0]?.id || null,
  filterText: '',
  
  // 操作
  setSelectedDiveId: (id) => set({ selectedDiveId: id }),
  setFilterText: (text) => set({ filterText: text }),
  setDives: (dives) => set({ dives }),
}));

