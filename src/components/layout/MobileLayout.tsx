import { useState, useEffect } from 'react';
import { useDiveStore } from '@/store';
import { ErrorBoundary, TabButton } from '@/components/common';
import { DiveList, DiveDetail } from '@/components/features';
import { uiLabels } from '@/constants';

/**
 * 移动端布局 - Tab 切换模式
 */
export function MobileLayout() {
  const { selectedDiveId } = useDiveStore();
  const [activeTab, setActiveTab] = useState<'list' | 'detail'>('list');

  // 选择潜水后自动切换到详情页
  useEffect(() => {
    if (selectedDiveId) {
      setActiveTab('detail');
    }
  }, [selectedDiveId]);

  return (
    <div className="flex flex-col h-full">
      {/* 移动端 Tab 切换 */}
      <div className="flex border-b border-gray-700 bg-gray-800">
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
