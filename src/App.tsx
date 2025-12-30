import { AppLayout, MobileLayout, DesktopLayout } from '@/components/layout';
import { ErrorBoundary } from '@/components/common';
import { useIsMobile, useUrlParams } from '@/hooks';

function App() {
  const isMobile = useIsMobile();
  
  // 桌面端处理 URL 参数（移动端在 MobileLayout 中处理以支持自动跳转 detail）
  useUrlParams();

  return (
    <ErrorBoundary>
      <AppLayout>
        {isMobile ? <MobileLayout /> : <DesktopLayout />}
      </AppLayout>
    </ErrorBoundary>
  );
}

export default App;
