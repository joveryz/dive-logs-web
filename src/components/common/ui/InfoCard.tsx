import { memo } from 'react';

interface InfoCardProps {
  label: string;
  value: string | number;
  highlight?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 信息卡片 - 显示标签和值的通用组件
 */
export const InfoCard = memo(function InfoCard({
  label,
  value,
  highlight,
  className = '',
  style,
}: InfoCardProps) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-dive-text-muted uppercase tracking-wider">{label}</span>
      <span 
        className={`text-base font-medium whitespace-pre-line ${highlight ? 'text-cyan-400' : 'text-dive-text'} ${className}`}
        style={style}
      >
        {value}
      </span>
    </div>
  );
});
