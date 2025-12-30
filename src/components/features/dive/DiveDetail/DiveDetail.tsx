import { useState, memo, useCallback } from 'react';
import { useSelectedDive, getFreeDivePBId, useFilteredDives } from '@/hooks';
import { useDiveStore } from '@/store';
import { DiveChart } from '../DiveChart';
import { DiveStats } from '../DiveStats';
import { ResizablePanels } from '@/components/layout';
import { TabButton, EmptyState } from '@/components/common';
import { uiLabels } from '@/constants';
import { DiveTab, ComputerTab, CursorTab } from './tabs';
import type { ViewMode, Dive, DiveProfilePoint } from '@/types';

// ============================================================================
// Tab 类型定义
// ============================================================================

type TabId = 'dive' | 'computer' | 'cursor';

// ============================================================================
// 内部组件
// ============================================================================

/**
 * 详情内容 - Tab 导航与内容区域
 */
const DetailContent = memo(function DetailContent({ 
  dive, 
  cursorData 
}: { 
  dive: Dive; 
  cursorData: DiveProfilePoint | null;
}) {
  const [activeTab, setActiveTab] = useState<TabId>('dive');
  
  // 检查是否是 FreeDive 个人最佳记录
  const freeDivePersonalBestId = getFreeDivePBId(useDiveStore.getState().dives);
  const isPersonalBest = dive.diveType === 'FreeDive' && dive.id === freeDivePersonalBestId;

  return (
    <div className="h-full flex flex-col bg-zinc-900">
      {/* Tab 导航 */}
      <div className="flex border-b border-zinc-700 flex-shrink-0">
        <TabButton active={activeTab === 'dive'} onClick={() => setActiveTab('dive')}>
          {uiLabels.diveSummary}
        </TabButton>
        <TabButton active={activeTab === 'computer'} onClick={() => setActiveTab('computer')}>
          {uiLabels.computer}
        </TabButton>
        <TabButton active={activeTab === 'cursor'} onClick={() => setActiveTab('cursor')}>
          Cursor
        </TabButton>
      </div>

      {/* Tab 内容 */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'dive' && <DiveTab dive={dive} isPersonalBest={isPersonalBest} />}
        {activeTab === 'computer' && <ComputerTab dive={dive} />}
        {activeTab === 'cursor' && <CursorTab cursorData={cursorData} />}
      </div>
    </div>
  );
});

// ============================================================================
// 主组件
// ============================================================================

/**
 * 潜水详情主组件 - 展示选中潜水的图表和详细信息
 */
export function DiveDetail() {
  const dive = useSelectedDive();
  const filteredDives = useFilteredDives();
  const [viewMode, setViewMode] = useState<ViewMode>('graph');
  const [cursorData, setCursorData] = useState<DiveProfilePoint | null>(null);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);
  
  const handleCursorChange = useCallback((data: DiveProfilePoint | null) => {
    setCursorData(data);
  }, []);

  if (!dive) {
    return <EmptyState />;
  }

  // 图表区域内容
  const chartContent = (
    <div className="flex flex-col h-full bg-zinc-900">
      {/* Header Tabs - Graph / Stats */}
      <div className="flex border-b border-zinc-700 flex-shrink-0">
        <TabButton
          active={viewMode === 'graph'}
          onClick={() => handleViewModeChange('graph')}
        >
          {uiLabels.graph}
        </TabButton>
        <TabButton
          active={viewMode === 'stats'}
          onClick={() => handleViewModeChange('stats')}
        >
          {uiLabels.stats}
        </TabButton>
      </div>

      {/* Chart Area */}
      <div className="flex-1 min-h-0">
        {viewMode === 'graph' ? (
          <DiveChart 
            profile={dive.profile} 
            maxDepth={dive.maxDepth} 
            diveType={dive.diveType}
            onCursorChange={handleCursorChange}
          />
        ) : (
          <DiveStats dives={filteredDives} />
        )}
      </div>
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
          content: <DetailContent dive={dive} cursorData={cursorData} />,
          minSize: 100,
          defaultSize: 55,
        },
      ]}
    />
  );
}
