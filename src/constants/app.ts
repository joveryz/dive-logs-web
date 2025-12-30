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
