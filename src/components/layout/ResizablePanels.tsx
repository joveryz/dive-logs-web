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
  const initializedRef = useRef(false);
  
  const isVertical = direction === 'vertical';
  
  // 初始化时检查最小宽度限制
  useEffect(() => {
    if (initializedRef.current || !containerRef.current) return;
    initializedRef.current = true;
    
    const containerSize = isVertical 
      ? containerRef.current.offsetHeight 
      : containerRef.current.offsetWidth;
    
    // 检查第一个面板的默认百分比是否小于最小宽度
    const firstPanelMinPercent = (panels[0].minSize / containerSize) * 100;
    const currentFirstPercent = panelSizes[0];
    
    if (currentFirstPercent < firstPanelMinPercent && panels[0].minSize > 0) {
      const newSizes = [...panelSizes];
      newSizes[0] = firstPanelMinPercent;
      newSizes[1] = 100 - firstPanelMinPercent;
      setPanelSizes(newSizes);
    }
  }, [panels, panelSizes, isVertical]);
  
  // 处理拖拽开始
  const handleMouseDown = useCallback((index: number, e: React.MouseEvent) => {
    e.preventDefault();
    dragIndexRef.current = index;
    startPosRef.current = isVertical ? e.clientY : e.clientX;
    startSizesRef.current = [...panelSizes];
    
    document.body.style.cursor = isVertical ? 'row-resize' : 'col-resize';
    document.body.style.userSelect = 'none';
  }, [panelSizes, isVertical]);
  
  // 处理触摸拖拽开始
  const handleTouchStart = useCallback((index: number, e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    dragIndexRef.current = index;
    startPosRef.current = isVertical ? touch.clientY : touch.clientX;
    startSizesRef.current = [...panelSizes];
  }, [panelSizes, isVertical]);
  
  // 处理拖拽中
  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (dragIndexRef.current === null || !containerRef.current) return;
      
      const containerSize = isVertical 
        ? containerRef.current.offsetHeight 
        : containerRef.current.offsetWidth;
      const currentPos = isVertical ? clientY : clientX;
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

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (dragIndexRef.current !== null) {
        e.preventDefault();
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }
    };
    
    const handleEnd = () => {
      if (dragIndexRef.current !== null) {
        dragIndexRef.current = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
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
                  ? 'h-2 w-full cursor-row-resize' 
                  : 'w-2 h-full cursor-col-resize'
              } bg-dive-hover hover:bg-cyan-400 active:bg-cyan-400 transition-colors flex-shrink-0 group relative touch-none z-10`}
              onMouseDown={(e) => handleMouseDown(index, e)}
              onTouchStart={(e) => handleTouchStart(index, e)}
            >
              {/* 拖拽手柄视觉指示条 */}
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
                isVertical 
                  ? 'h-1 w-8' 
                  : 'w-1 h-8'
              } rounded-full bg-dive-text-muted group-hover:bg-cyan-300 group-active:bg-cyan-300 transition-colors`} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
