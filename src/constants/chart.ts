import { fieldLabels } from './labels';

/**
 * 图表数据系列配置
 */
export interface ChartSeriesConfig {
  key: string;
  name: string;
  color: string;
  type: 'line' | 'bar';
  visible: boolean;
  unit: string;
  minValue?: number;
  maxValue?: number;
}

/**
 * 默认图表系列配置
 * 包含潜水数据中所有可视化的数据系列
 */
export const DEFAULT_CHART_SERIES: ChartSeriesConfig[] = [
  // 基础数据
  { key: 'depth', name: fieldLabels.depth, color: '#ffffff', type: 'line', visible: true, unit: 'm' },
  { key: 'ascentRate', name: fieldLabels.ascentRate, color: '#22c55e', type: 'bar', visible: true, unit: 'm/s' },
  { key: 'temperature', name: fieldLabels.temperature, color: '#06b6d4', type: 'line', visible: true, unit: '°C' },
  // 减压相关
  { key: 'ndl', name: fieldLabels.ndl, color: '#ec4899', type: 'line', visible: false, unit: 'min' },
  { key: 'gf99', name: fieldLabels.gf99, color: '#f43f5e', type: 'line', visible: false, unit: '%' },
  { key: 'deco', name: fieldLabels.deco, color: '#ef4444', type: 'line', visible: false, unit: 'min' },
  { key: 'tts', name: fieldLabels.tts, color: '#f97316', type: 'line', visible: false, unit: 'min' },
  { key: 'tts5', name: fieldLabels.tts5, color: '#fb923c', type: 'line', visible: false, unit: 'min' },
  // 气体相关
  { key: 'gasDensity', name: fieldLabels.gasDensity, color: '#14b8a6', type: 'line', visible: false, unit: 'g/L' },
  { key: 'ppO2', name: fieldLabels.ppO2, color: '#10b981', type: 'line', visible: false, unit: 'bar' },
  { key: 'ppN2', name: fieldLabels.ppN2, color: '#eab308', type: 'line', visible: false, unit: 'bar' },
  { key: 'ppHe', name: fieldLabels.ppHe, color: '#9ca3af', type: 'line', visible: false, unit: 'bar' },
  // 安全指标
  { key: 'cns', name: fieldLabels.cns, color: '#f59e0b', type: 'line', visible: false, unit: '%' },
  // 气瓶与消耗
  { key: 'sac', name: fieldLabels.sac, color: '#d946ef', type: 'line', visible: false, unit: 'bar/min' },
  { key: 'tank1Pressure', name: fieldLabels.tank1Pressure, color: '#a855f7', type: 'line', visible: false, unit: 'bar' },
  { key: 'tank2Pressure', name: fieldLabels.tank2Pressure, color: '#8b5cf6', type: 'line', visible: false, unit: 'bar' },
];

/**
 * 图表颜色常量
 */
export const CHART_COLORS = {
  // 上升/下降颜色
  ascent: {
    up: '#22c55e',   // 绿色 - 上升
    down: '#ef4444', // 红色 - 下降
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
  // 零线
  referenceLine: '#4b5563',
} as const;

/**
 * 以 0 为基准的数据系列 key（这些系列的最小值应该是 0）
 */
export const ZERO_BASED_SERIES_KEYS = [
  'cns', 'gf99', 'deco', 'tts', 'ndl', 
  'ppO2', 'ppHe', 'ppN2', 'gasDensity', 'sac'
];

/**
 * 图表默认配置
 */
export const CHART_CONFIG = {
  // Y 轴宽度
  yAxisWidth: 60,
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
  // 动画
  animationDuration: 300,
} as const;
