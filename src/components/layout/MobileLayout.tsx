import { useState, useEffect, useRef } from 'react';
import { ErrorBoundary, TabButton } from '@/components/common';
import { DiveList, DiveDetail } from '@/components/features';
import { uiLabels } from '@/constants';
import { useDiveStore } from '@/store';

/**
 * 移动端布局 - Tab 切换模式
 */
export function MobileLayout() {
  const [activeTab, setActiveTab] = useState<'list' | 'detail'>('list');
  const selectedDiveId = useDiveStore((state) => state.selectedDiveId);
  const prevSelectedDiveId = useRef(selectedDiveId);
  
  // 用户选中新的潜水时切换到详情 Tab
  useEffect(() => {
    if (selectedDiveId && selectedDiveId !== prevSelectedDiveId.current && activeTab === 'list') {
      setActiveTab('detail');
    }
    prevSelectedDiveId.current = selectedDiveId;
  }, [selectedDiveId, activeTab]);

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
