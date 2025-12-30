import { memo } from 'react';
import { Database } from 'lucide-react';
import { uiLabels } from '@/constants';

/**
 * 空状态组件 - 当没有选中潜水记录时显示
 */
export const EmptyState = memo(function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full bg-dive-surface text-dive-text-muted">
      <Database className="w-12 h-12 mr-3 opacity-50" />
      <span className="text-lg">{uiLabels.emptyState}</span>
    </div>
  );
});
