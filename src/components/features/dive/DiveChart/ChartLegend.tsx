import { memo } from 'react';
import { ChartSeriesConfig } from '@/constants';

interface ChartLegendProps {
  seriesConfigs: ChartSeriesConfig[];
  hoveredSeries: string | null;
  onToggleVisibility: (key: string) => void;
  onHideAll: () => void;
  onShowAll: () => void;
  allHidden: boolean;
  onMouseEnter: (key: string) => void;
  onMouseLeave: () => void;
}

/**
 * 图表图例组件
 * 显示所有数据系列，支持点击切换可见性和悬停高亮
 */
function ChartLegendComponent({
  seriesConfigs,
  hoveredSeries,
  onToggleVisibility,
  onHideAll,
  onShowAll,
  allHidden,
  onMouseEnter,
  onMouseLeave,
}: ChartLegendProps) {
  return (
    <div className="flex flex-wrap justify-center items-center gap-2 px-2 py-2 border-t border-gray-700">
      {/* 全选/全不选按钮 */}
      <div className="flex items-center gap-1 mr-2">
        <button
          onClick={onShowAll}
          className="px-2 py-1 rounded text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
          title="Show all series"
        >
          All
        </button>
        <button
          onClick={onHideAll}
          className="px-2 py-1 rounded text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
          title="Hide all series"
        >
          None
        </button>
      </div>
      
      {seriesConfigs.map((series) => {
        const isVisible = series.visible;
        const isHovered = hoveredSeries === series.key;

        return (
          <LegendButton
            key={series.key}
            isVisible={isVisible}
            isHovered={isHovered}
            onClick={() => onToggleVisibility(series.key)}
            onMouseEnter={() => onMouseEnter(series.key)}
            onMouseLeave={onMouseLeave}
          >
            <div
              className={`w-3 h-1 rounded ${!isVisible ? 'opacity-40' : ''}`}
              style={{ backgroundColor: series.color }}
            />
            <LegendLabel isVisible={isVisible} color={series.color}>
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
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function LegendButton({
  children,
  isVisible,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: LegendButtonProps) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all ${
        isHovered ? 'bg-gray-700' : 'hover:bg-gray-800'
      } ${!isVisible ? 'opacity-40' : ''}`}
    >
      {children}
    </button>
  );
}

interface LegendLabelProps {
  children: React.ReactNode;
  isVisible: boolean;
  color?: string;
}

function LegendLabel({ children, isVisible, color }: LegendLabelProps) {
  return (
    <span
      className={`${!isVisible ? 'line-through text-gray-500' : 'text-gray-300'}`}
      style={{ color: isVisible ? color : undefined }}
    >
      {children}
    </span>
  );
}

export const ChartLegend = memo(ChartLegendComponent);
