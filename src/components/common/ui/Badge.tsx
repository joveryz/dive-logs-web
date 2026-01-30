import { memo } from 'react';

/**
 * 预定义的徽章变体样式
 */
const BADGE_VARIANTS = {
  // 潜水类型
  'CC/BO': 'bg-purple-900/50 text-purple-300',
  'OC Tec': 'bg-red-900/50 text-red-300',
  'FreeDive': 'bg-teal-900/50 text-teal-300',
  'Avelo': 'bg-green-900/50 text-green-300',
  'OC Rec': 'bg-blue-900/50 text-blue-300',
  // 特殊标记
  'PB': 'bg-yellow-500/20 text-yellow-400',
  // 人员
  'diver': 'bg-cyan-900/20 text-cyan-400/80',
  'buddy': 'bg-orange-900/20 text-orange-400/80',
  // 标签
  'tag': 'bg-purple-900/40 text-purple-300',
  // 默认
  default: 'bg-dive-hover text-dive-text',
} as const;

type BadgeVariant = keyof typeof BADGE_VARIANTS;

interface BadgeProps {
  /** 徽章内容 */
  children: React.ReactNode;
  /** 预定义变体，或自定义样式类 */
  variant?: BadgeVariant | string;
  /** 额外的样式类 */
  className?: string;
}

/**
 * 获取变体样式
 */
function getVariantStyle(variant: string): string {
  // 检查 OC Rec 系列
  if (variant.startsWith('OC Rec')) {
    return BADGE_VARIANTS['OC Rec'];
  }
  return BADGE_VARIANTS[variant as BadgeVariant] || variant || BADGE_VARIANTS.default;
}

/**
 * 通用徽章组件
 */
export const Badge = memo(function Badge({ 
  children,
  variant = 'default',
  className = 'text-xs'
}: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded ${className} ${getVariantStyle(variant)}`}>
      {children}
    </span>
  );
});
