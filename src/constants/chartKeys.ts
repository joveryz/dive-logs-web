/**
 * 图表数据系列键名定义
 * @module constants/chartKeys
 */

import type { DiveProfilePoint } from '@/types';

// ============================================================================
// 数据系列键名常量
// ============================================================================

/**
 * 所有可用的图表数据系列键名
 * 对应 DiveProfilePoint 中的字段
 */
export const CHART_SERIES_KEYS = {
  // 基础数据
  DEPTH: 'depth',
  ASCENT_RATE: 'ascentRate',
  HEART_RATE: 'heartRate',
  TEMPERATURE: 'temperature',
  
  // 减压相关
  NDL: 'ndl',
  GF99: 'gf99',
  DECO: 'deco',
  TTS: 'tts',
  TTS5: 'tts5',
  CEILING: 'ceiling',
  
  // 气体相关
  GAS_DENSITY: 'gasDensity',
  PPO2: 'ppO2',
  PPN2: 'ppN2',
  PPHE: 'ppHe',
  
  // 安全指标
  CNS: 'cns',
  
  // 气瓶与消耗
  SAC: 'sac',
  TANK1_PRESSURE: 'tank1Pressure',
  TANK2_PRESSURE: 'tank2Pressure',
  TANK3_PRESSURE: 'tank3Pressure',
  TANK4_PRESSURE: 'tank4Pressure',
} as const;

/**
 * 图表系列键名类型
 */
export type ChartSeriesKey = typeof CHART_SERIES_KEYS[keyof typeof CHART_SERIES_KEYS];

/**
 * 验证键名是否为有效的图表系列键
 */
export function isValidChartSeriesKey(key: string): key is ChartSeriesKey {
  return Object.values(CHART_SERIES_KEYS).includes(key as ChartSeriesKey);
}

/**
 * 从 DiveProfilePoint 中提取数据系列键名
 */
export type ProfileDataKey = keyof Pick<DiveProfilePoint,
  | 'depth' | 'temperature' | 'heartRate' | 'ascentRate'
  | 'ndl' | 'gf99' | 'cns' | 'gasDensity'
  | 'ppO2' | 'ppN2' | 'ppHe'
  | 'tank1Pressure' | 'tank2Pressure' | 'tank3Pressure' | 'tank4Pressure'
  | 'sac' | 'deco' | 'tts' | 'tts5' | 'ceiling'
>;

// ============================================================================
// 系列分组常量
// ============================================================================

/**
 * 以 0 为基准的数据系列（这些系列的最小值应该是 0）
 */
export const ZERO_BASED_SERIES_KEYS: readonly ChartSeriesKey[] = [
  CHART_SERIES_KEYS.CNS,
  CHART_SERIES_KEYS.GF99,
  CHART_SERIES_KEYS.DECO,
  CHART_SERIES_KEYS.TTS,
  CHART_SERIES_KEYS.NDL,
  CHART_SERIES_KEYS.PPO2,
  CHART_SERIES_KEYS.PPHE,
  CHART_SERIES_KEYS.PPN2,
  CHART_SERIES_KEYS.GAS_DENSITY,
  CHART_SERIES_KEYS.SAC,
] as const;

/**
 * 气瓶压力系列键名
 */
export const TANK_PRESSURE_KEYS: readonly ChartSeriesKey[] = [
  CHART_SERIES_KEYS.TANK1_PRESSURE,
  CHART_SERIES_KEYS.TANK2_PRESSURE,
  CHART_SERIES_KEYS.TANK3_PRESSURE,
  CHART_SERIES_KEYS.TANK4_PRESSURE,
] as const;

/**
 * FreeDive 模式默认显示的系列
 */
export const FREEDIVE_DEFAULT_VISIBLE_KEYS: readonly ChartSeriesKey[] = [
  CHART_SERIES_KEYS.DEPTH,
  CHART_SERIES_KEYS.ASCENT_RATE,
  CHART_SERIES_KEYS.HEART_RATE,
  CHART_SERIES_KEYS.TEMPERATURE,
] as const;

/**
 * OC Rec 及其他潜水模式默认显示的系列
 */
export const SCUBA_DEFAULT_VISIBLE_KEYS: readonly ChartSeriesKey[] = [
  CHART_SERIES_KEYS.DEPTH,
  CHART_SERIES_KEYS.ASCENT_RATE,
  CHART_SERIES_KEYS.HEART_RATE,
  CHART_SERIES_KEYS.TEMPERATURE,
  CHART_SERIES_KEYS.NDL,
  CHART_SERIES_KEYS.GF99,
  CHART_SERIES_KEYS.TANK1_PRESSURE,
  CHART_SERIES_KEYS.SAC,
] as const;

/**
 * 检查键名是否为零基准系列
 */
export function isZeroBasedSeries(key: string): boolean {
  return ZERO_BASED_SERIES_KEYS.includes(key as ChartSeriesKey);
}

/**
 * 检查键名是否为气瓶压力系列
 */
export function isTankPressureSeries(key: string): boolean {
  return TANK_PRESSURE_KEYS.includes(key as ChartSeriesKey);
}
