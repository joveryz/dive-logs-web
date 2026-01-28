import { createContext, useContext, useRef, ReactNode, MutableRefObject } from 'react';

/**
 * Chart Ref Context
 * 用于在组件树中共享图表容器的 ref，供 PDF 导出使用
 */

interface ChartRefContextType {
  chartRef: MutableRefObject<HTMLDivElement | null>;
}

const ChartRefContext = createContext<ChartRefContextType | null>(null);

export function ChartRefProvider({ children }: { children: ReactNode }) {
  const chartRef = useRef<HTMLDivElement | null>(null);

  return (
    <ChartRefContext.Provider value={{ chartRef }}>
      {children}
    </ChartRefContext.Provider>
  );
}

export function useChartRef(): MutableRefObject<HTMLDivElement | null> {
  const context = useContext(ChartRefContext);
  if (!context) {
    // 如果没有 Provider，返回一个空 ref
    return { current: null };
  }
  return context.chartRef;
}
