/**
 * 格式化工具函数
 */

/**
 * 各字段的小数位数配置
 */
export const FIELD_DECIMAL_PLACES: Record<string, number> = {
  // 环境数据
  depth: 2,
  temperature: 2,
  ascentRate: 2,
  
  // 减压相关
  ndl: 0,
  gf99: 0,
  cns: 0,
  deco: 0,
  tts: 0,
  tts5: 0,
  ceiling: 0,
  
  // 气体相关
  gasDensity: 2,
  ppO2: 2,
  ppN2: 2,
  ppHe: 2,
  
  // 气瓶与消耗
  tank1Pressure: 2,
  tank2Pressure: 2,
  tank3Pressure: 2,
  tank4Pressure: 2,
  sac: 2,
};

/**
 * 获取字段的小数位数
 * @param key - 字段名
 * @returns 小数位数，默认为 0
 */
export function getDecimalPlaces(key: string): number {
  return FIELD_DECIMAL_PLACES[key] ?? 0;
}

/**
 * 格式化持续时间（秒 -> mm:ss 或 HH:mm:ss）
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 格式化持续时间为可读字符串（如 "46min 55s"）
 */
export function formatDurationReadable(seconds: number): string {
  const totalSecs = Math.round(seconds);
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}min`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
}

/**
 * 格式化深度（米）
 */
export function formatDepth(meters: number): string {
  return `${meters.toFixed(getDecimalPlaces('depth'))} m`;
}

/**
 * 格式化时间（秒）为图表显示格式 (MM:SS)
 */
export function formatTimeForChart(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 格式化数字，根据字段类型自动确定小数位数，支持可选单位
 * @param value - 要格式化的数值
 * @param unit - 可选的单位后缀
 * @param fieldKey - 可选的字段名，用于从统一配置获取小数位数
 * @returns 格式化后的字符串，如果值无效则返回 '-'
 */
export function formatNumber(value: number | undefined | null, unit = '', fieldKey?: string): string {
  if (value === undefined || value === null) return '-';
  const decimals = fieldKey ? getDecimalPlaces(fieldKey) : 2;
  const formatted = Number.isInteger(value) ? value.toString() : value.toFixed(decimals);
  return unit ? `${formatted}${unit}` : formatted;
}
