/**
 * 应用配置常量
 */
export const APP_CONFIG = {
  name: 'Dive Logs',
  description: 'Deep Dive, Dive Deep',
  version: '0.1.0',
} as const;

/**
 * 面板默认配置
 */
export const PANEL_CONFIG = {
  horizontal: {
    leftMinSize: 400,
    leftDefaultSize: 55,
    rightMinSize: 400,
    rightDefaultSize: 45,
  },
  vertical: {
    topMinSize: 150,
    topDefaultSize: 45,
    bottomMinSize: 150,
    bottomDefaultSize: 55,
  },
} as const;

/**
 * 潜水类型颜色映射
 */
export const DIVE_TYPE_COLORS = {
  Air: { bg: 'bg-blue-900/50', text: 'text-blue-300' },
  Nitrox: { bg: 'bg-green-900/50', text: 'text-green-300' },
  Gauge: { bg: 'bg-yellow-900/50', text: 'text-yellow-300' },
  Freedive: { bg: 'bg-purple-900/50', text: 'text-purple-300' },
  CCR: { bg: 'bg-red-900/50', text: 'text-red-300' },
} as const;
