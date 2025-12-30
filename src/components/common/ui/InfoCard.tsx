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
      <span className="text-xs text-zinc-500 uppercase tracking-wider">{label}</span>
      <span 
        className={`text-base font-medium whitespace-pre-line ${highlight ? 'text-amber-500' : 'text-zinc-200'} ${className}`}
        style={style}
      >
        {value}
      </span>
    </div>
  );
});
