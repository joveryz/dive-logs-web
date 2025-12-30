/**
 * 图表相关工具函数
 */

import { ZERO_BASED_SERIES_KEYS } from '@/constants';

/**
 * 计算数据系列的动态显示范围
 * @param values - 数据值数组
 * @param key - 数据系列的 key
 * @returns 包含 min 和 max 的对象
 */
export function calculateDynamicRange(
  values: number[],
  key: string
): { min: number; max: number } {
  if (values.length === 0) return { min: 0, max: 100 };

  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);

  // ascentRate 特殊处理：对称范围，以0为中心
  if (key === 'ascentRate') {
    const maxAbs = Math.max(Math.abs(dataMin), Math.abs(dataMax), 0.1);
    // 只添加很小的 padding，保持数据幅度明显
    const padded = maxAbs * 1.05;
    return { min: -padded, max: padded };
  }

  // 其他数据：添加 padding 使数据不紧贴边界
  const range = dataMax - dataMin;
  const padding = range * 0.1; // 10% padding

  // 最小值处理：某些数据最小值应该是0（如压力、百分比等）
  let min = ZERO_BASED_SERIES_KEYS.includes(key)
    ? 0
    : Math.floor((dataMin - padding) * 10) / 10;
  let max = Math.ceil((dataMax + padding) * 10) / 10;

  // 确保有效范围
  if (max <= min) max = min + 1;

  // 对于某些数据类型，取整到更漂亮的数字
  if (key === 'tank1Pressure' || key === 'tank2Pressure') {
    max = Math.ceil(max / 50) * 50;
  } else if (key === 'ndl') {
    max = Math.min(100, Math.ceil(max / 10) * 10);
  } else if (key === 'temperature') {
    min = Math.floor(min / 5) * 5;
    max = Math.ceil(max / 5) * 5;
  }

  return { min, max };
}

/**
 * 将值归一化到 0-100 范围
 */
export function normalizeValue(
  value: number,
  min: number,
  max: number
): number {
  const range = max - min;
  if (range === 0) return 50;
  return ((value - min) / range) * 100;
}

/**
 * 将归一化值转换回实际值
 */
export function denormalizeValue(
  normalizedValue: number,
  min: number,
  max: number
): number {
  return (normalizedValue / 100) * (max - min) + min;
}

/**
 * 格式化 Y 轴刻度值
 */
export function formatYAxisTick(
  value: number,
  key: string,
  minValue: number,
  maxValue: number
): string {
  // ascentRate 特殊处理：0 在中点(50)，使用 scale=45
  if (key === 'ascentRate') {
    const maxAbs = Math.max(Math.abs(minValue), Math.abs(maxValue));
    const scale = 45;
    const actualValue = ((50 - value) / scale) * maxAbs;
    return actualValue.toFixed(2);
  }

  const actualValue = denormalizeValue(value, minValue, maxValue);
  return actualValue.toFixed(key.includes('pp') ? 2 : 0);
}

/**
 * 计算合适的 Y 轴最大值（深度）
 */
export function calculateNiceYMax(maxDepth: number): number {
  return maxDepth <= 20
    ? Math.ceil(maxDepth / 5) * 5
    : Math.ceil(maxDepth / 10) * 10;
}
