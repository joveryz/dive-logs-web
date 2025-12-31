import { ResizablePanels } from './ResizablePanels';
import { ErrorBoundary } from '@/components/common';
import { DiveList, DiveDetail } from '@/components/features';

/**
 * 桌面端布局 - 可调整大小的双面板模式
 */
export function DesktopLayout() {
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
          defaultSize: 40,
        },
        {
          content: (
            <ErrorBoundary>
              <DiveDetail />
            </ErrorBoundary>
          ),
          minSize: 400,
          defaultSize: 60,
        },
      ]}
    />
  );
}
