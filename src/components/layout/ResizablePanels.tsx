import { useState, useCallback, useRef, useEffect, ReactNode } from 'react';

interface PanelConfig {
  content: ReactNode;
  minSize: number;
  defaultSize: number;
}

interface ResizablePanelsProps {
  panels: PanelConfig[];
  direction?: 'horizontal' | 'vertical';
  className?: string;
}

export function ResizablePanels({ panels, direction = 'horizontal', className = '' }: ResizablePanelsProps) {
  // 存储每个面板的尺寸（百分比）
  const [panelSizes, setPanelSizes] = useState<number[]>(() => {
    const totalDefault = panels.reduce((sum, p) => sum + p.defaultSize, 0);
    return panels.map(p => (p.defaultSize / totalDefault) * 100);
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const dragIndexRef = useRef<number | null>(null);
  const startPosRef = useRef<number>(0);
  const startSizesRef = useRef<number[]>([]);
  
  const isVertical = direction === 'vertical';
  
  // 处理拖拽开始
  const handleMouseDown = useCallback((index: number, e: React.MouseEvent) => {
    e.preventDefault();
    dragIndexRef.current = index;
    startPosRef.current = isVertical ? e.clientY : e.clientX;
    startSizesRef.current = [...panelSizes];
    
    document.body.style.cursor = isVertical ? 'row-resize' : 'col-resize';
    document.body.style.userSelect = 'none';
  }, [panelSizes, isVertical]);
  
  // 处理拖拽中
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragIndexRef.current === null || !containerRef.current) return;
      
      const containerSize = isVertical 
        ? containerRef.current.offsetHeight 
        : containerRef.current.offsetWidth;
      const currentPos = isVertical ? e.clientY : e.clientX;
      const deltaPos = currentPos - startPosRef.current;
      const deltaPercent = (deltaPos / containerSize) * 100;
      
      const index = dragIndexRef.current;
      const newSizes = [...startSizesRef.current];
      
      // 计算最小尺寸百分比
      const minPercent1 = (panels[index].minSize / containerSize) * 100;
      const minPercent2 = (panels[index + 1].minSize / containerSize) * 100;
      
      // 调整相邻两个面板的尺寸
      let newSize1 = startSizesRef.current[index] + deltaPercent;
      let newSize2 = startSizesRef.current[index + 1] - deltaPercent;
      
      // 限制最小尺寸
      if (newSize1 < minPercent1) {
        newSize1 = minPercent1;
        newSize2 = startSizesRef.current[index] + startSizesRef.current[index + 1] - minPercent1;
      }
      if (newSize2 < minPercent2) {
        newSize2 = minPercent2;
        newSize1 = startSizesRef.current[index] + startSizesRef.current[index + 1] - minPercent2;
      }
      
      newSizes[index] = newSize1;
      newSizes[index + 1] = newSize2;
      
      setPanelSizes(newSizes);
    };
    
    const handleMouseUp = () => {
      if (dragIndexRef.current !== null) {
        dragIndexRef.current = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [panels, isVertical]);
  
  return (
    <div 
      ref={containerRef} 
      className={`flex ${isVertical ? 'flex-col' : 'flex-row'} h-full ${className}`}
    >
      {panels.map((panel, index) => (
        <div 
          key={index} 
          className={`flex ${isVertical ? 'flex-col' : 'flex-row'}`}
          style={{ 
            [isVertical ? 'height' : 'width']: `${panelSizes[index]}%`,
            flexShrink: 0,
          }}
        >
          {/* 面板内容 */}
          <div className="flex-1 overflow-hidden">
            {panel.content}
          </div>
          
          {/* 分隔条（最后一个面板后面不需要） */}
          {index < panels.length - 1 && (
            <div
              className={`${
                isVertical 
                  ? 'h-1 w-full cursor-row-resize' 
                  : 'w-1 h-full cursor-col-resize'
              } bg-dive-hover hover:bg-amber-500 transition-colors flex-shrink-0 group relative`}
              onMouseDown={(e) => handleMouseDown(index, e)}
            >
              {/* 拖拽手柄视觉提示 */}
              <div className={`absolute ${
                isVertical 
                  ? 'inset-x-0 -top-1 -bottom-1 group-hover:bg-amber-500/20' 
                  : 'inset-y-0 -left-1 -right-1 group-hover:bg-amber-500/20'
              }`} />
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
                isVertical 
                  ? 'h-1 w-8' 
                  : 'w-1 h-8'
              } rounded-full bg-dive-text-muted group-hover:bg-amber-400 transition-colors`} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
