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
  return `${meters.toFixed(1)} m`;
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
 * 格式化数字，保留1位小数，支持可选单位
 * @param value - 要格式化的数值
 * @param unit - 可选的单位后缀
 * @returns 格式化后的字符串，如果值无效则返回 '-'
 */
export function formatNumber(value: number | undefined | null, unit = ''): string {
  if (value === undefined || value === null) return '-';
  const formatted = Number.isInteger(value) ? value.toString() : value.toFixed(1);
  return unit ? `${formatted}${unit}` : formatted;
}
