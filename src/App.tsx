import { useState, useEffect } from 'react';
import { AppLayout, ResizablePanels } from '@/components/layout';
import { ErrorBoundary } from '@/components/common';
import { DiveList, DiveDetail } from '@/components/features';
import { useDiveStore } from '@/store';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return isMobile;
}

function MobileLayout() {
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
        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'list'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Dive List
        </button>
        <button
          onClick={() => setActiveTab('detail')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'detail'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Dive Detail
        </button>
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

function DesktopLayout() {
  return (
    <ResizablePanels
      direction="horizontal"
      panels={[
        {
          content: (
            <ErrorBoundary>
              <DiveList />
            </ErrorBoundary>
          ),
          minSize: 400,
          defaultSize: 55,
        },
        {
          content: (
            <ErrorBoundary>
              <DiveDetail />
            </ErrorBoundary>
          ),
          minSize: 400,
          defaultSize: 45,
        },
      ]}
    />
  );
}

function App() {
  const isMobile = useIsMobile();
  
  return (
    <ErrorBoundary>
      <AppLayout>
        {isMobile ? <MobileLayout /> : <DesktopLayout />}
      </AppLayout>
    </ErrorBoundary>
  );
}

export default App;
