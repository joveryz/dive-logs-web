import { memo } from 'react';

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Section 分组 - 带可选标题的内容分组组件
 */
export const Section = memo(function Section({
  title,
  children,
  className = '',
}: SectionProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {title && (
        <h3 className="text-xs font-semibold text-dive-text-secondary uppercase tracking-wider border-b border-dive-border/50 pb-1">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
});
