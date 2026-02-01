/**
 * 设备检测工具函数
 */

/**
 * 检测是否是 iOS 设备
 */
export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
};
