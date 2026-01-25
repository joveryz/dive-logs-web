import { useState, useEffect } from 'react';

/**
 * 检测是否为触摸设备
 */
function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * 检测当前是否为移动端视口
 * 结合屏幕宽度和触摸能力判断
 * @param breakpoint 断点宽度，默认 768px (md)
 */
export function useIsMobile(breakpoint = 768) {
  // SSR-safe: 初始值使用函数避免服务端渲染问题
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    // 触摸设备且宽度小于 1024 视为移动端（横屏手机宽度通常 < 1024）
    // 或者宽度小于断点
    const isTouch = isTouchDevice();
    const isNarrow = window.innerWidth < breakpoint;
    const isTouchAndMedium = isTouch && window.innerWidth < 1024;
    return isNarrow || isTouchAndMedium;
  });

  useEffect(() => {
    const handleResize = () => {
      const isTouch = isTouchDevice();
      const isNarrow = window.innerWidth < breakpoint;
      const isTouchAndMedium = isTouch && window.innerWidth < 1024;
      setIsMobile(isNarrow || isTouchAndMedium);
    };
    
    // 首次渲染后同步状态（处理 SSR hydration）
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}
