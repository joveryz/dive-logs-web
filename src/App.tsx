import { AppLayout, MobileLayout, DesktopLayout } from '@/components/layout';
import { ErrorBoundary } from '@/components/common';
import { useLayoutMode } from '@/hooks';

function App() {
  const isMobileLayout = useLayoutMode();

  return (
    <ErrorBoundary>
      <AppLayout>
        {isMobileLayout ? <MobileLayout /> : <DesktopLayout />}
      </AppLayout>
    </ErrorBoundary>
  );
}

export default App;
