import { memo, useRef, useCallback } from 'react';
import type { EffectiveSeriesConfig } from '@/hooks';

interface ChartLegendProps {
  seriesConfigs: EffectiveSeriesConfig[];
  hoveredSeries: string | null;
  selectedSeries: string | null;
  onToggleVisibility: (key: string) => void;
  onResetToDefault: () => void;
  onShowAll: () => void;
  onHideAll: () => void;
  onMouseEnter: (key: string) => void;
  onMouseLeave: () => void;
  onSelect: (key: string) => void;
}

/**
 * 图表图例组件
 * 显示所有数据系列，支持点击切换可见性和悬停高亮
 * 右键/长按选择系列用于右侧Y轴显示
 */
function ChartLegendComponent({
  seriesConfigs,
  hoveredSeries,
  selectedSeries,
  onToggleVisibility,
  onResetToDefault,
  onShowAll,
  onHideAll,
  onMouseEnter,
  onMouseLeave,
  onSelect,
}: ChartLegendProps) {
  return (
    <div className="flex flex-wrap justify-center items-center gap-2 px-2 py-2 border-t border-dive-border">
      {/* 全选/默认/清空按钮 */}
      <div className="flex items-center gap-1 mr-2">
        <button
          onClick={onShowAll}
          className="px-2 py-1 rounded text-xs bg-dive-hover hover:bg-dive-card text-dive-text transition-colors"
          title="Show all series">
          All
        </button>
        <button
          onClick={onResetToDefault}
          className="px-2 py-1 rounded text-xs bg-dive-hover hover:bg-dive-card text-dive-text transition-colors"
          title="Reset to default (Depth, Ascent, Temp)">
          Default
        </button>
        <button
          onClick={onHideAll}
          className="px-2 py-1 rounded text-xs bg-dive-hover hover:bg-dive-card text-dive-text transition-colors"
          title="Hide all series">
          None
        </button>
      </div>
      
      {seriesConfigs
        .filter((series) => series.hasData !== false)
        .map((series) => {
        const isVisible = series.visible;
        const isHovered = hoveredSeries === series.key;
        const isSelected = selectedSeries === series.key;

        return (
          <LegendButton
            key={series.key}
            isVisible={isVisible}
            isHovered={isHovered}
            isSelected={isSelected}
            onClick={() => onToggleVisibility(series.key)}
            onContextMenu={(e) => {
              e.preventDefault();
              if (isVisible) onSelect(series.key);
            }}
            onLongPress={() => {
              if (isVisible) onSelect(series.key);
            }}
            onMouseEnter={() => onMouseEnter(series.key)}
            onMouseLeave={onMouseLeave}
          >
            <div
              className={`w-3 h-1 rounded ${!isVisible ? 'opacity-40' : ''}`}
              style={{ backgroundColor: series.color }}
            />
            <LegendLabel isVisible={isVisible} isSelected={isSelected} color={series.color}>
              {series.name}
            </LegendLabel>
          </LegendButton>
        );
      })}
    </div>
  );
}

interface LegendButtonProps {
  children: React.ReactNode;
  isVisible: boolean;
  isHovered: boolean;
  isSelected: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onLongPress: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const LONG_PRESS_DELAY = 500; // 长按延迟 ms

function LegendButton({
  children,
  isVisible,
  isHovered,
  isSelected,
  onClick,
  onContextMenu,
  onLongPress,
  onMouseEnter,
  onMouseLeave,
}: LegendButtonProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  const handleTouchStart = useCallback(() => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress();
    }, LONG_PRESS_DELAY);
  }, [onLongPress]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleClick = useCallback(() => {
    // 如果是长按触发的，不执行点击
    if (isLongPress.current) {
      isLongPress.current = false;
      return;
    }
    onClick();
  }, [onClick]);

  return (
    <button
      onClick={handleClick}
      onContextMenu={onContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all select-none ${
        isSelected ? 'ring-1 ring-cyan-400/50 bg-dive-hover' : ''
      } ${
        isHovered ? 'bg-dive-hover' : 'hover:bg-dive-card'
      } ${!isVisible ? 'opacity-40' : ''}`}
      title="Click to toggle • Long-press/Right-click to select Y-axis"
    >
      {children}
    </button>
  );
}

interface LegendLabelProps {
  children: React.ReactNode;
  isVisible: boolean;
  isSelected: boolean;
  color?: string;
}

function LegendLabel({ children, isVisible, isSelected, color }: LegendLabelProps) {
  return (
    <span
      className={`${!isVisible ? 'line-through text-dive-text-muted' : 'text-dive-text'} ${isSelected ? 'font-medium' : ''}`}
      style={{ color: isVisible ? color : undefined }}
    >
      {children}
    </span>
  );
}

export const ChartLegend = memo(ChartLegendComponent);
