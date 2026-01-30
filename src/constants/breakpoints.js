/**
 * 响应式断点常量 (单一数据源)
 * tailwind.config.js 和 TypeScript 代码共用
 */
export const BREAKPOINTS = /** @type {const} */ ({
  /** 手机竖屏最大宽度 (iPhone Pro Max ~430px) */
  mobilePortrait: 480,
  
  /** 移动端断点 - 小于此值使用移动端布局 */
  mobile: 1200,
  
  /** 左侧面板最小宽度 */
  panelMinWidth: 450,
});
