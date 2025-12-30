import { useState, useEffect } from 'react';

/**
 * 检测当前是否为移动端视口
 * @param breakpoint 断点宽度，默认 768px (md)
 */
export function useIsMobile(breakpoint = 768) {
  // SSR-safe: 初始值使用函数避免服务端渲染问题
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
    
    // 首次渲染后同步状态（处理 SSR hydration）
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}
