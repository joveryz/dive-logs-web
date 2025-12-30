/**
 * 潜水数据模块
 * 从 Shearwater CSV 导出文件加载真实潜水数据
 */

import { Dive } from '../types';
import { parseDivesFromCSV } from './csvParser';

// 从 CSV 文件解析潜水数据
export const dives: Dive[] = parseDivesFromCSV();

// 保持向后兼容的别名（已弃用，将在未来版本移除）
/** @deprecated Use `dives` instead */
export const mockDives = dives;
