import { useState } from 'react';
import { ErrorBoundary, TabButton } from '@/components/common';
import { DiveList, DiveDetail } from '@/components/features';
import { uiLabels } from '@/constants';
import { useUrlParams } from '@/hooks';

/**
 * 移动端布局 - Tab 切换模式
 */
export function MobileLayout() {
  // 如果 URL 有 diveNumber 参数，默认显示 detail
  const hasDiveNumberParam = useUrlParams();
  const [activeTab, setActiveTab] = useState<'list' | 'detail'>(hasDiveNumberParam ? 'detail' : 'list');

  return (
    <div className="flex flex-col h-full">
      {/* 移动端 Tab 切换 */}
      <div className="flex border-b border-zinc-700 bg-zinc-800">
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
