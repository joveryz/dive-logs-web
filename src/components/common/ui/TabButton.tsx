import { memo } from 'react';
import type { TabVariant } from '@/types';

interface TabButtonProps {
  /** 是否激活 */
  active: boolean;
  /** 点击回调 */
  onClick: () => void;
  /** 按钮内容 */
  children: React.ReactNode;
  /** 样式变体：filled (填充) 或 underline (下划线) */
  variant?: TabVariant;
  /** 是否占满容器宽度 */
  fullWidth?: boolean;
  /** 额外的 className */
  className?: string;
}

/**
 * 通用 Tab 按钮组件
 * 支持两种样式变体：filled (填充背景) 和 underline (下划线)
 */
export const TabButton = memo(function TabButton({
  active,
  onClick,
  children,
  variant = 'filled',
  fullWidth = false,
  className = '',
}: TabButtonProps) {
  const baseStyles = 'py-2 text-sm font-medium transition-colors';
  const widthStyles = fullWidth ? 'flex-1' : 'px-6';

  const variantStyles = {
    filled: active
      ? 'bg-cyan-500 text-white'
      : 'bg-dive-card text-dive-text-secondary hover:bg-dive-hover',
    underline: active
      ? 'text-cyan-400 border-b-2 border-cyan-400'
      : 'text-dive-text-secondary hover:text-dive-text',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${widthStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
});
