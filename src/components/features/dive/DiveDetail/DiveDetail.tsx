import { useState, memo, useCallback } from 'react';
import { Database } from 'lucide-react';
import { useSelectedDive } from '@/hooks';
import { DiveChart } from '../DiveChart';
import { ResizablePanels } from '@/components/layout';
import { SummaryPanel } from './components';

/**
 * 视图模式
 */
type ViewMode = 'graph' | 'stats';

/**
 * 空状态组件
 */
const EmptyState = memo(function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full bg-gray-900 text-gray-500">
      <Database className="w-12 h-12 mr-3 opacity-50" />
      <span className="text-lg">Select a dive to view details</span>
    </div>
  );
});

/**
 * 视图模式切换按钮
 */
interface ViewModeButtonProps {
  mode: ViewMode;
  currentMode: ViewMode;
  onClick: (mode: ViewMode) => void;
  children: React.ReactNode;
}

const ViewModeButton = memo(function ViewModeButton({
  mode,
  currentMode,
  onClick,
  children,
}: ViewModeButtonProps) {
  return (
    <button
      onClick={() => onClick(mode)}
      className={`px-6 py-2 text-sm font-medium transition-colors ${
        currentMode === mode
          ? 'bg-cyan-600 text-white'
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  );
});

/**
 * 二级导航按钮
 */
const SecondaryNavButton = memo(function SecondaryNavButton({
  label,
}: {
  label: string;
}) {
  return (
    <button className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-colors">
      {label}
    </button>
  );
});

/**
 * 主组件 - 潜水详情
 */
export function DiveDetail() {
  const dive = useSelectedDive();
  const [viewMode, setViewMode] = useState<ViewMode>('graph');

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  if (!dive) {
    return <EmptyState />;
  }

  // 图表区域内容
  const chartContent = (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header Tabs - Graph / Stats */}
      <div className="flex border-b border-gray-700 flex-shrink-0">
        <ViewModeButton
          mode="graph"
          currentMode={viewMode}
          onClick={handleViewModeChange}
        >
          Graph
        </ViewModeButton>
        <ViewModeButton
          mode="stats"
          currentMode={viewMode}
          onClick={handleViewModeChange}
        >
          Stats
        </ViewModeButton>

        {/* Secondary Tabs */}
        <div className="flex-1 flex justify-center gap-2 px-4">
          {['Data', 'Analysis', 'Display', 'Settings'].map((label) => (
            <SecondaryNavButton key={label} label={label} />
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 min-h-0">
        {viewMode === 'graph' ? (
          <DiveChart profile={dive.profile} maxDepth={dive.maxDepth} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Statistics view coming soon...
          </div>
        )}
      </div>
    </div>
  );

  // 详情区域内容 - 单一 Summary Panel
  const detailContent = (
    <div className="flex flex-col h-full bg-gray-900">
      <SummaryPanel dive={dive} />
    </div>
  );

  return (
    <ResizablePanels
      direction="vertical"
      panels={[
        {
          content: chartContent,
          minSize: 150,
          defaultSize: 45,
        },
        {
          content: detailContent,
          minSize: 100,
          defaultSize: 55,
        },
      ]}
    />
  );
}
