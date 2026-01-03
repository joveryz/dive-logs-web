/**
 * 图表配置常量
 * @module constants/chart
 */

import { fieldLabels } from './labels';
import { CHART_SERIES_KEYS, type ChartSeriesKey, ZERO_BASED_SERIES_KEYS } from './chartKeys';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 图表数据系列类型
 */
export type ChartSeriesType = 'line' | 'bar' | 'area';

/**
 * 图表数据系列配置
 */
export interface ChartSeriesConfig {
  /** 系列键名 */
  key: ChartSeriesKey;
  /** 显示名称 */
  name: string;
  /** 颜色 */
  color: string;
  /** 图表类型 */
  type: ChartSeriesType;
  /** 是否默认可见 */
  visible: boolean;
  /** 单位 */
  unit: string;
  /** 最小值（可选，用于固定范围） */
  minValue?: number;
  /** 最大值（可选，用于固定范围） */
  maxValue?: number;
}

// ============================================================================
// 颜色配置
// ============================================================================

/**
 * 图表颜色主题
 */
export const CHART_COLORS = {
  // 上升/下降指示
  ascent: {
    up: '#22c55e',    // 绿色 - 上升
    down: '#ef4444',  // 红色 - 下降
  },
  
  // 网格和坐标轴
  grid: '#374151',
  axis: '#6b7280',
  axisLabel: '#d1d5db',
  
  // Tooltip
  tooltip: {
    background: 'rgba(17, 24, 39, 0.95)',
    border: '#4b5563',
    cursor: '#fbbf24',
  },
  
  // 参考线
  referenceLine: '#4b5563',
  
  // 数据系列颜色
  series: {
    depth: '#ffffff',
    ascentRate: '#22c55e',
    heartRate: '#f472b6',
    temperature: '#06b6d4',
    ndl: '#ec4899',
    gf99: '#f43f5e',
    deco: '#ef4444',
    tts: '#f97316',
    tts5: '#fb923c',
    gasDensity: '#14b8a6',
    ppO2: '#10b981',
    ppN2: '#eab308',
    ppHe: '#9ca3af',
    cns: '#f59e0b',
    sac: '#d946ef',
    tank1Pressure: '#a855f7',
    tank2Pressure: '#8b5cf6',
    tank3Pressure: '#7c3aed',
    tank4Pressure: '#6366f1',
  },
} as const;

// ============================================================================
// 布局配置
// ============================================================================

/**
 * 图表布局配置
 */
export const CHART_LAYOUT = {
  /** Y 轴宽度 */
  yAxisWidth: 60,
  /** 默认边距 */
  margin: {
    top: 10,
    right: 10,
    left: 10,
    bottom: 10,
  },
} as const;

/**
 * 图表行为配置
 */
export const CHART_CONFIG = {
  // Y 轴宽度
  yAxisWidth: CHART_LAYOUT.yAxisWidth,
  // 刻度数量
  tickCount: 6,
  // 字体大小
  fontSize: 12,
  // 深度线宽度
  depthLineWidth: 3,
  // 普通线宽度
  lineWidth: 1.5,
  // 悬停区域宽度
  hitboxWidth: 12,
  // 动画持续时间
  animationDuration: 300,
} as const;

// ============================================================================
// 系列配置
// ============================================================================

/**
 * 创建系列配置的工厂函数
 */
function createSeriesConfig(
  key: ChartSeriesKey,
  type: ChartSeriesType = 'line',
  visible: boolean = false,
  unit: string = ''
): ChartSeriesConfig {
  return {
    key,
    name: fieldLabels[key] || key,
    color: CHART_COLORS.series[key as keyof typeof CHART_COLORS.series] || '#9ca3af',
    type,
    visible,
    unit,
  };
}

/**
 * 默认图表系列配置
 * 按类别组织的所有可视化数据系列
 */
export const DEFAULT_CHART_SERIES: ChartSeriesConfig[] = [
  // 基础数据
  createSeriesConfig(CHART_SERIES_KEYS.DEPTH, 'line', true, 'm'),
  createSeriesConfig(CHART_SERIES_KEYS.ASCENT_RATE, 'bar', true, 'm/s'),
  createSeriesConfig(CHART_SERIES_KEYS.HEART_RATE, 'line', true, 'bpm'),
  createSeriesConfig(CHART_SERIES_KEYS.TEMPERATURE, 'line', true, '°C'),
  
  // 减压相关
  createSeriesConfig(CHART_SERIES_KEYS.NDL, 'line', false, 'min'),
  createSeriesConfig(CHART_SERIES_KEYS.GF99, 'line', false, '%'),
  createSeriesConfig(CHART_SERIES_KEYS.DECO, 'line', false, 'min'),
  createSeriesConfig(CHART_SERIES_KEYS.TTS, 'line', false, 'min'),
  createSeriesConfig(CHART_SERIES_KEYS.TTS5, 'line', false, 'min'),
  
  // 气体相关
  createSeriesConfig(CHART_SERIES_KEYS.GAS_DENSITY, 'line', false, 'g/L'),
  createSeriesConfig(CHART_SERIES_KEYS.PPO2, 'line', false, 'bar'),
  createSeriesConfig(CHART_SERIES_KEYS.PPN2, 'line', false, 'bar'),
  createSeriesConfig(CHART_SERIES_KEYS.PPHE, 'line', false, 'bar'),
  
  // 安全指标
  createSeriesConfig(CHART_SERIES_KEYS.CNS, 'line', false, '%'),
  
  // 气瓶与消耗
  createSeriesConfig(CHART_SERIES_KEYS.SAC, 'line', false, 'bar/min'),
  createSeriesConfig(CHART_SERIES_KEYS.TANK1_PRESSURE, 'line', false, 'bar'),
  createSeriesConfig(CHART_SERIES_KEYS.TANK2_PRESSURE, 'line', false, 'bar'),
  createSeriesConfig(CHART_SERIES_KEYS.TANK3_PRESSURE, 'line', false, 'bar'),
  createSeriesConfig(CHART_SERIES_KEYS.TANK4_PRESSURE, 'line', false, 'bar'),
];

/**
 * 获取系列配置
 */
export function getSeriesConfig(key: ChartSeriesKey): ChartSeriesConfig | undefined {
  return DEFAULT_CHART_SERIES.find(s => s.key === key);
}

/**
 * 根据键名数组获取系列配置
 */
export function getSeriesConfigs(keys: ChartSeriesKey[]): ChartSeriesConfig[] {
  return keys
    .map(key => getSeriesConfig(key))
    .filter((config): config is ChartSeriesConfig => config !== undefined);
}

// 导出 ZERO_BASED_SERIES_KEYS 以保持向后兼容
export { ZERO_BASED_SERIES_KEYS };
