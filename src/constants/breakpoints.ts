/**
 * 响应式断点常量
 * 集中管理所有像素断点值，便于维护和一致性
 * 
 * Tailwind CSS 对应关系：
 * - sm: 640px  (Tailwind 默认)
 * - md: 768px  (Tailwind 默认)
 * - lg: 1024px (Tailwind 默认)
 * - tablet: 1200px (自定义，对应 BREAKPOINTS.mobile)
 */
export const BREAKPOINTS = {
  /** 手机竖屏最大宽度 (iPhone Pro Max ~430px) - 隐藏 tooltip */
  mobilePortrait: 480,
  
  /** 移动端断点 - 小于此值使用移动端布局 (Tailwind: tablet:) */
  mobile: 1200,
  
  /** 左侧面板最小宽度 */
  panelMinWidth: 450,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;
