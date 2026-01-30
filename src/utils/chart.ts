/**
 * 图表工具函数
 * @module utils/chart
 */

import {
  CHART_SERIES_KEYS,
  isZeroBasedSeries,
  isTankPressureSeries,
} from '@/constants/chartKeys';
import type { NumberRange } from '@/types/common';

// ============================================================================
// 常量定义
// ============================================================================

/**
 * 归一化坐标系配置
 * 
 * 普通系列: 使用完整的 0-100 范围
 * 对称系列 (如 ascentRate): 使用以 50 为中心的对称范围 [CENTER - HALF_RANGE, CENTER + HALF_RANGE]
 */
export const NORMALIZED_AXIS = {
  /** 归一化范围最小值 */
  MIN: 0,
  /** 归一化范围最大值 */
  MAX: 100,
  /** 对称系列的中心点 (代表原始值 0) */
  CENTER: 50,
  /** 对称系列从中心到边界的半幅 */
  HALF_RANGE: 45,
} as const;

/** 对称系列的刻度位置 (均匀分布在 CENTER ± HALF_RANGE 范围内) */
export const SYMMETRIC_AXIS_TICKS = [
  NORMALIZED_AXIS.CENTER - NORMALIZED_AXIS.HALF_RANGE,      // 5
  NORMALIZED_AXIS.CENTER - NORMALIZED_AXIS.HALF_RANGE / 2, // 27.5
  NORMALIZED_AXIS.CENTER,                                   // 50
  NORMALIZED_AXIS.CENTER + NORMALIZED_AXIS.HALF_RANGE / 2, // 72.5
  NORMALIZED_AXIS.CENTER + NORMALIZED_AXIS.HALF_RANGE,      // 95
] as const;

/** 普通系列的刻度位置 */
export const LINEAR_AXIS_TICKS = [0, 20, 40, 60, 80, 100] as const;

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 数据范围计算选项
 */
interface RangeCalculationOptions {
  /** 是否添加 padding */
  padding?: boolean;
  /** padding 百分比（默认 0.1 = 10%） */
  paddingPercent?: number;
}

/**
 * 判断是否为对称系列（以 0 为中心）
 */
export function isSymmetricSeries(key: string): boolean {
  return key === CHART_SERIES_KEYS.ASCENT_RATE;
}

// ============================================================================
// 范围计算函数
// ============================================================================

/**
 * 计算数据系列的动态显示范围
 * 
 * @param values - 数据值数组
 * @param key - 数据系列的键名
 * @param options - 计算选项
 * @returns 包含 min 和 max 的范围对象
 * 
 * @description
 * 对于对称系列 (如 ascentRate)，返回的 range 表示绝对值的最大范围 (min=-maxAbs, max=maxAbs)
 * 对于普通系列，返回实际数据范围（带 padding）
 * 
 * @example
 * ```ts
 * // 普通系列
 * calculateDynamicRange([10, 20, 30], 'depth') // => { min: 9, max: 33 }
 * 
 * // 对称系列
 * calculateDynamicRange([-2, 1, 3], 'ascentRate') // => { min: -3.15, max: 3.15 }
 * ```
 */
export function calculateDynamicRange(
  values: number[],
  key: string,
  options: RangeCalculationOptions = {}
): NumberRange {
  const { padding = true, paddingPercent = 0.1 } = options;

  // 空数组返回默认范围
  if (values.length === 0) {
    return { min: 0, max: 100 };
  }

  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);

  // 对称系列：以 0 为中心的对称范围
  if (isSymmetricSeries(key)) {
    return calculateSymmetricRange(dataMin, dataMax);
  }

  const range = dataMax - dataMin;

  // 数据无变化时的处理
  if (range === 0) {
    return calculateConstantValueRange(dataMin, dataMax, key);
  }

  // 计算带 padding 的范围
  return calculatePaddedRange(dataMin, dataMax, key, padding, paddingPercent);
}

/**
 * 计算对称范围（以 0 为中心）
 * 用于 ascentRate 等正负值都有意义的数据
 */
function calculateSymmetricRange(dataMin: number, dataMax: number): NumberRange {
  const maxAbs = Math.max(Math.abs(dataMin), Math.abs(dataMax), 0.1);
  const padded = maxAbs * 1.05; // 5% padding
  return { min: -padded, max: padded };
}

/**
 * 处理数据无变化时的范围
 */
function calculateConstantValueRange(
  dataMin: number,
  dataMax: number,
  key: string
): NumberRange {
  // 根据数据类型设置合理的扩展范围
  let extend = Math.abs(dataMax) * 0.1 || 1;

  if (key === CHART_SERIES_KEYS.TEMPERATURE) {
    extend = 5; // 温度扩展 ±5°C
  } else if (isTankPressureSeries(key)) {
    extend = 50; // 气罐压力扩展 ±50 bar
  } else if (isZeroBasedSeries(key)) {
    // 零基准系列：最小值为 0，最大值为数据的两倍或至少为 1
    return { min: 0, max: Math.max(dataMax * 2, 1) };
  }

  return { min: dataMin - extend, max: dataMax + extend };
}

/**
 * 计算带 padding 的范围
 */
function calculatePaddedRange(
  dataMin: number,
  dataMax: number,
  key: string,
  padding: boolean,
  paddingPercent: number
): NumberRange {
  const range = dataMax - dataMin;
  const paddingValue = padding ? range * paddingPercent : 0;

  // 最小值处理
  let min = isZeroBasedSeries(key)
    ? 0
    : roundToDecimal(dataMin - paddingValue, 1);
  let max = roundToDecimal(dataMax + paddingValue, 1, Math.ceil);

  // 特定数据类型的美化处理
  if (isTankPressureSeries(key)) {
    max = Math.ceil(max / 50) * 50;
  } else if (key === CHART_SERIES_KEYS.NDL) {
    max = Math.min(100, Math.ceil(max / 10) * 10);
  } else if (key === CHART_SERIES_KEYS.TEMPERATURE) {
    min = Math.floor(min / 5) * 5;
    max = Math.ceil(max / 5) * 5;
  }

  return { min, max };
}

// ============================================================================
// 数值转换函数
// ============================================================================

/**
 * 将归一化值转换回实际值
 * 
 * @param normalizedValue - 归一化值
 * @param min - 原始数据最小值
 * @param max - 原始数据最大值
 * @param key - 数据系列键名（用于判断归一化策略）
 * @returns 实际数据值
 * 
 * @description
 * - 普通系列: 归一化值 0-100 线性映射到 [min, max]
 * - 对称系列: 归一化值以 CENTER(50) 为中心，映射到 [-maxAbs, maxAbs]
 */
export function denormalizeValue(
  normalizedValue: number,
  min: number,
  max: number,
  key?: string
): number {
  if (key && isSymmetricSeries(key)) {
    // 对称系列：maxValue 存储的是 maxAbs，从 CENTER 点映射
    const maxAbs = max;
    return ((normalizedValue - NORMALIZED_AXIS.CENTER) / NORMALIZED_AXIS.HALF_RANGE) * maxAbs;
  }
  // 普通系列：线性映射
  return (normalizedValue / NORMALIZED_AXIS.MAX) * (max - min) + min;
}

/**
 * 将实际值转换为归一化值
 * 
 * @param value - 实际数据值
 * @param min - 数据最小值
 * @param max - 数据最大值
 * @param key - 数据系列键名（用于判断归一化策略）
 * @returns 归一化值
 * 
 * @description
 * - 普通系列: [min, max] 线性映射到 0-100
 * - 对称系列: [-maxAbs, maxAbs] 映射到 [CENTER-HALF_RANGE, CENTER+HALF_RANGE]
 */
export function normalizeValue(
  value: number,
  min: number,
  max: number,
  key?: string
): number {
  if (key && isSymmetricSeries(key)) {
    // 对称系列：maxValue 存储的是 maxAbs
    const maxAbs = max;
    return NORMALIZED_AXIS.CENTER + (value / maxAbs) * NORMALIZED_AXIS.HALF_RANGE;
  }
  // 普通系列：线性映射
  if (max === min) return NORMALIZED_AXIS.CENTER; // 避免除以零
  return ((value - min) / (max - min)) * NORMALIZED_AXIS.MAX;
}

// ============================================================================
// Y轴相关函数
// ============================================================================

/**
 * 格式化 Y 轴刻度值
 * 
 * @param value - 归一化后的刻度值
 * @param key - 数据系列键名
 * @param minValue - 该系列的最小值
 * @param maxValue - 该系列的最大值
 * @returns 格式化后的刻度标签
 */
export function formatYAxisTick(
  value: number,
  key: string,
  minValue: number,
  maxValue: number
): string {
  const actualValue = denormalizeValue(value, minValue, maxValue, key);
  return formatNumber(actualValue);
}

/**
 * 计算适合深度显示的 Y 轴最大值
 * 
 * @param maxDepth - 最大深度
 * @returns 美化后的 Y 轴最大值
 */
export function calculateNiceYMax(maxDepth: number): number {
  if (maxDepth <= 20) {
    return Math.ceil(maxDepth / 5) * 5;
  }
  return Math.ceil(maxDepth / 10) * 10;
}

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 四舍五入到指定小数位
 */
function roundToDecimal(
  value: number,
  decimals: number,
  roundFn: (x: number) => number = Math.round
): number {
  const factor = Math.pow(10, decimals);
  return roundFn(value * factor) / factor;
}

/**
 * 格式化数字为字符串
 */
function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}
