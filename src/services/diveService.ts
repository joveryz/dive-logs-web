/**
 * 潜水记录 API 服务
 * 目前使用 mock 数据，未来可切换到真实 API
 */

import { Dive } from '@/types';
import { mockDives } from '@/data';
// import { api } from './api';

// 模拟 API 延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 获取所有潜水记录
 */
export async function getDives(): Promise<Dive[]> {
  // 模拟网络延迟
  await delay(100);
  
  // TODO: 切换到真实 API
  // return api.get<Dive[]>('/dives');
  
  return mockDives;
}

/**
 * 获取单个潜水记录
 */
export async function getDiveById(id: string): Promise<Dive | null> {
  await delay(50);
  
  // TODO: 切换到真实 API
  // return api.get<Dive>(`/dives/${id}`);
  
  return mockDives.find(d => d.id === id) || null;
}

/**
 * 搜索潜水记录
 */
export async function searchDives(query: string): Promise<Dive[]> {
  await delay(100);
  
  const searchLower = query.toLowerCase();
  return mockDives.filter(dive => 
    dive.location.toLowerCase().includes(searchLower) ||
    dive.site.toLowerCase().includes(searchLower) ||
    dive.diveComputer.model.toLowerCase().includes(searchLower)
  );
}

/**
 * 导出潜水记录服务
 */
export const diveService = {
  getDives,
  getDiveById,
  searchDives,
};
