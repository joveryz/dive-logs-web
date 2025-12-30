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
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
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
 * 格式化日期
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-CA'); // YYYY-MM-DD 格式
}

/**
 * 格式化日期时间
 */
export function formatDateTime(dateStr: string, timeStr: string): string {
  return `${dateStr} ${timeStr}`;
}

/**
 * 格式化温度
 */
export function formatTemperature(celsius: number): string {
  return `${celsius.toFixed(0)} °C`;
}

/**
 * 格式化气压
 */
export function formatPressure(bar: number): string {
  return `${bar} bar`;
}

/**
 * 获取潜水类型的颜色
 */
export function getDiveTypeColor(type: string): string {
  const colors: Record<string, string> = {
    'Air': '#3b82f6',
    'Nitrox': '#22c55e',
    'Gauge': '#f59e0b',
    'Freedive': '#8b5cf6',
    'CCR': '#ef4444',
  };
  return colors[type] || '#6b7280';
}

/**
 * 计算潜水的统计信息
 */
export function calculateDiveStats(dives: { maxDepth: number; duration: number }[]) {
  if (dives.length === 0) {
    return {
      totalDives: 0,
      totalDiveTime: 0,
      maxDepth: 0,
      avgDepth: 0,
    };
  }
  
  const totalDiveTime = dives.reduce((sum, d) => sum + d.duration, 0);
  const maxDepth = Math.max(...dives.map(d => d.maxDepth));
  const avgDepth = dives.reduce((sum, d) => sum + d.maxDepth, 0) / dives.length;
  
  return {
    totalDives: dives.length,
    totalDiveTime,
    maxDepth,
    avgDepth,
  };
}
