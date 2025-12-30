import { memo } from 'react';
import type { DiveType } from '@/types';

/**
 * 潜水类型颜色配置
 */
const DIVE_TYPE_STYLES: Record<string, string> = {
  'CC/BO': 'bg-purple-900/50 text-purple-300',
  'OC Tec': 'bg-red-900/50 text-red-300',
  'FreeDive': 'bg-teal-900/50 text-teal-300',
  'Avelo': 'bg-green-900/50 text-green-300',
  // OC Rec 系列使用蓝色
  default: 'bg-blue-900/50 text-blue-300',
  // 未知类型
  unknown: 'bg-dive-hover text-dive-text',
};

/**
 * 获取潜水类型的样式类名
 */
function getDiveTypeStyle(diveType: DiveType): string {
  if (diveType.startsWith('OC Rec')) {
    return DIVE_TYPE_STYLES.default;
  }
  return DIVE_TYPE_STYLES[diveType] || DIVE_TYPE_STYLES.unknown;
}

interface DiveTypeBadgeProps {
  diveType: DiveType;
  className?: string;
}

/**
 * 潜水类型标签 - 显示带颜色的潜水类型
 */
export const DiveTypeBadge = memo(function DiveTypeBadge({ 
  diveType, 
  className = '' 
}: DiveTypeBadgeProps) {
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-xs ${getDiveTypeStyle(diveType)} ${className}`}>
      {diveType}
    </span>
  );
});
