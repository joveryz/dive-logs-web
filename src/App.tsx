import { AppLayout, MobileLayout, DesktopLayout } from '@/components/layout';
import { ErrorBoundary } from '@/components/common';
import { useIsMobile } from '@/hooks';

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
