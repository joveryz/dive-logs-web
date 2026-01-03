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
  /** 强制最小值为 0 */
  forceZeroMin?: boolean;
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
 * @example
 * ```ts
 * const range = calculateDynamicRange([10, 20, 30], 'depth');
 * // => { min: 9, max: 33 }
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

  // ascentRate 特殊处理：以 0 为中心的对称范围
  if (key === CHART_SERIES_KEYS.ASCENT_RATE) {
    return calculateAscentRateRange(dataMin, dataMax);
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
 * 计算升降速率的对称范围
 */
function calculateAscentRateRange(dataMin: number, dataMax: number): NumberRange {
  const maxAbs = Math.max(Math.abs(dataMin), Math.abs(dataMax), 0.1);
  const padded = maxAbs * 1.05;
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
 * 将归一化值（0-100）转换回实际值
 * 
 * @param normalizedValue - 归一化值（0-100 范围）
 * @param min - 原始数据最小值
 * @param max - 原始数据最大值
 * @returns 实际数据值
 */
export function denormalizeValue(
  normalizedValue: number,
  min: number,
  max: number
): number {
  return (normalizedValue / 100) * (max - min) + min;
}

/**
 * 将实际值转换为归一化值（0-100）
 * 
 * @param value - 实际数据值
 * @param min - 数据最小值
 * @param max - 数据最大值
 * @returns 归一化值（0-100 范围）
 */
export function normalizeValue(
  value: number,
  min: number,
  max: number
): number {
  if (max === min) return 50; // 避免除以零
  return ((value - min) / (max - min)) * 100;
}

// ============================================================================
// Y轴相关函数
// ============================================================================

/**
 * 格式化 Y 轴刻度值
 * 
 * @param value - 归一化后的刻度值（0-100）
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
  // ascentRate 特殊处理：0 在中点(50)
  if (key === CHART_SERIES_KEYS.ASCENT_RATE) {
    const maxAbs = Math.max(Math.abs(minValue), Math.abs(maxValue));
    const scale = 45;
    const actualValue = ((value - 50) / scale) * maxAbs;
    return formatNumber(actualValue);
  }

  const actualValue = denormalizeValue(value, minValue, maxValue);
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
