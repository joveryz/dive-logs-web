import { AppLayout, ResizablePanels } from '@/components/layout';
import { ErrorBoundary } from '@/components/common';
import { DiveList, DiveDetail } from '@/components/features';

function App() {
  return (
    <ErrorBoundary>
      <AppLayout>
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
      </AppLayout>
    </ErrorBoundary>
  );
}

export default App;
