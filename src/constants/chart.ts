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
  { key: 'depth', name: 'Depth', color: '#ffffff', type: 'line', visible: true, unit: 'm' },
  { key: 'deco', name: 'Deco', color: '#ef4444', type: 'line', visible: true, unit: 'min' },
  { key: 'tts', name: 'TTS', color: '#f97316', type: 'line', visible: true, unit: 'min' },
  { key: 'ndl', name: 'NDL', color: '#ec4899', type: 'line', visible: true, unit: 'min' },
  { key: 'ascentRate', name: 'Ascent', color: '#22c55e', type: 'bar', visible: true, unit: 'm/s' },
  { key: 'cns', name: 'CNS', color: '#f59e0b', type: 'line', visible: true, unit: '%' },
  { key: 'gasDensity', name: 'Gas Density', color: '#14b8a6', type: 'line', visible: true, unit: 'g/L' },
  { key: 'gf99', name: 'GF99', color: '#f43f5e', type: 'line', visible: true, unit: '%' },
  { key: 'ppO2', name: 'ppO2', color: '#10b981', type: 'line', visible: true, unit: 'bar' },
  { key: 'ppHe', name: 'ppHe', color: '#9ca3af', type: 'line', visible: false, unit: 'bar' },
  { key: 'ppN2', name: 'ppN2', color: '#eab308', type: 'line', visible: true, unit: 'bar' },
  { key: 'tank1Pressure', name: 'Tank 1', color: '#a855f7', type: 'line', visible: true, unit: 'bar' },
  { key: 'tank2Pressure', name: 'Tank 2', color: '#8b5cf6', type: 'line', visible: false, unit: 'bar' },
  { key: 'sac', name: 'SAC', color: '#d946ef', type: 'line', visible: true, unit: 'L/min' },
  { key: 'temperature', name: 'Temp', color: '#06b6d4', type: 'line', visible: true, unit: '°C' },
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
