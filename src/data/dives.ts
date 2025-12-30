/**
 * 潜水数据模块
 * 从 Shearwater CSV 导出文件加载真实潜水数据
 */

import { Dive } from '../types';
import { parseDivesFromCSV } from './csvParser';

// 从 CSV 文件解析潜水数据
export const mockDives: Dive[] = parseDivesFromCSV();
