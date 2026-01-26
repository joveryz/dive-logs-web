import { ResizablePanels } from './ResizablePanels';
import { ErrorBoundary } from '@/components/common';
import { DiveList, DiveDetail } from '@/components/features';
import { BREAKPOINTS } from '@/constants';

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
          minSize: BREAKPOINTS.panelMinWidth,
          defaultSize: 25,
        },
        {
          content: (
            <ErrorBoundary>
              <DiveDetail />
            </ErrorBoundary>
          ),
          minSize: 0,
          defaultSize: 75,
        },
      ]}
    />
  );
}
