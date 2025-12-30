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

