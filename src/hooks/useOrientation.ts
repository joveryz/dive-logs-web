import { useState, useEffect } from 'react';

export type Orientation = 'portrait' | 'landscape';

/**
 * 检测屏幕方向
 * @returns 当前屏幕方向 'portrait' | 'landscape'
 */
export function useOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>(() => {
    if (typeof window === 'undefined') return 'portrait';
    return window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(orientation: portrait)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setOrientation(e.matches ? 'portrait' : 'landscape');
    };

    // 初始化
    setOrientation(mediaQuery.matches ? 'portrait' : 'landscape');

    // 监听变化
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return orientation;
}
