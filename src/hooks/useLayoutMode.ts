import { useIsMobile } from './useIsMobile';
import { useUrlParams } from './useUrlParams';

/**
 * 获取当前布局模式
 * 优先使用 URL 参数 (?layout=mobile 或 ?layout=desktop)
 * 否则根据设备宽度自动判断
 * @returns 是否使用移动端布局
 */
export function useLayoutMode(): boolean {
  const isMobile = useIsMobile();
  const { forceLayout } = useUrlParams();
  
  // URL 参数优先，否则根据设备判断
  return forceLayout ? forceLayout === 'mobile' : isMobile;
}
