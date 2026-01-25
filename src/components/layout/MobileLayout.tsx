import { useState, useEffect, useRef } from 'react';
import { ErrorBoundary, TabButton } from '@/components/common';
import { DiveList, DiveDetail, DiveChart } from '@/components/features';
import { uiLabels } from '@/constants';
import { useDiveStore, selectSelectedDiveId } from '@/store';
import { useOrientation, useSelectedDive } from '@/hooks';

/**
 * 移动端布局
 * - 竖屏: Tab 切换模式 (列表/详情)
 * - 横屏 + 已选 dive: 全屏显示 Chart
 * - 横屏 + 未选 dive: 显示列表
 */
export function MobileLayout() {
  const [activeTab, setActiveTab] = useState<'list' | 'detail'>('list');
  const selectedDiveId = useDiveStore(selectSelectedDiveId);
  const prevSelectedDiveId = useRef(selectedDiveId);
  const orientation = useOrientation();
  const selectedDive = useSelectedDive();
  
  const isLandscape = orientation === 'landscape';
  
  // 用户选中新的潜水时切换到详情 Tab
  useEffect(() => {
    if (selectedDiveId && selectedDiveId !== prevSelectedDiveId.current && activeTab === 'list') {
      setActiveTab('detail');
    }
    prevSelectedDiveId.current = selectedDiveId;
  }, [selectedDiveId, activeTab]);

  // 横屏 + 已选 dive: 全屏 Chart
  if (isLandscape && selectedDive) {
    return (
      <div className="relative h-full w-full bg-dive-surface">
        {/* 返回列表按钮 */}
        <button
          onClick={() => useDiveStore.getState().setSelectedDiveId(null)}
          className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dive-card/80 backdrop-blur-sm border border-dive-border/50 text-dive-text-secondary hover:text-dive-text hover:bg-dive-card transition-all duration-200"
          aria-label="Back to list"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">#{selectedDive.diveNumber}</span>
        </button>
        
        {/* 全屏 Chart */}
        <ErrorBoundary>
          <DiveChart 
            profile={selectedDive.profile} 
            maxDepth={selectedDive.maxDepth} 
            diveType={selectedDive.diveType}
          />
        </ErrorBoundary>
      </div>
    );
  }

  // 横屏 + 未选 dive: 显示列表
  if (isLandscape && !selectedDive) {
    return (
      <div className="h-full">
        <ErrorBoundary>
          <DiveList />
        </ErrorBoundary>
      </div>
    );
  }

  // 竖屏: Tab 切换模式
  return (
    <div className="flex flex-col h-full">
      {/* 移动端 Tab 切换 */}
      <div className="flex border-b border-dive-border bg-dive-card">
        <TabButton
          active={activeTab === 'list'}
          onClick={() => setActiveTab('list')}
          variant="underline"
          fullWidth
          className="py-3"
        >
          {uiLabels.diveList}
        </TabButton>
        <TabButton
          active={activeTab === 'detail'}
          onClick={() => setActiveTab('detail')}
          variant="underline"
          fullWidth
          className="py-3"
        >
          {uiLabels.diveDetail}
        </TabButton>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'list' ? (
          <ErrorBoundary>
            <DiveList />
          </ErrorBoundary>
        ) : (
          <ErrorBoundary>
            <DiveDetail />
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
}
