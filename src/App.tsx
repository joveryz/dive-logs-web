import { AppLayout, MobileLayout, DesktopLayout } from '@/components/layout';
import { ErrorBoundary } from '@/components/common';
import { useIsMobile, useUrlParams } from '@/hooks';

function App() {
  const isMobile = useIsMobile();
  
  // 处理 URL 参数（如 ?diveNumber=1, ?layout=mobile）
  const { forceLayout } = useUrlParams();
  
  // 确定使用哪种布局：URL 参数优先，否则根据设备判断
  const useMobileLayout = forceLayout ? forceLayout === 'mobile' : isMobile;

  return (
    <ErrorBoundary>
      <AppLayout>
        {useMobileLayout ? <MobileLayout /> : <DesktopLayout />}
      </AppLayout>
    </ErrorBoundary>
  );
}

export default App;
