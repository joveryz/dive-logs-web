import { memo } from 'react';
import { ChartSeriesConfig, CHART_COLORS } from '@/constants';

interface ChartLegendProps {
  seriesConfigs: ChartSeriesConfig[];
  hoveredSeries: string | null;
  onToggleVisibility: (key: string) => void;
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
  onMouseEnter,
  onMouseLeave,
}: ChartLegendProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 px-2 py-2 border-t border-gray-700">
      {seriesConfigs.map((series) => {
        const isVisible = series.visible;
        const isHovered = hoveredSeries === series.key;
        const isOtherHovered =
          hoveredSeries !== null && hoveredSeries !== series.key;

        // Ascent Rate 特殊图例 - 显示双色
        if (series.key === 'ascentRate') {
          return (
            <LegendButton
              key={series.key}
              isVisible={isVisible}
              isHovered={isHovered}
              isOtherHovered={isOtherHovered}
              onClick={() => onToggleVisibility(series.key)}
              onMouseEnter={() => onMouseEnter(series.key)}
              onMouseLeave={onMouseLeave}
            >
              <div
                className={`flex gap-0.5 ${!isVisible ? 'opacity-40' : ''}`}
              >
                <div
                  className="w-1.5 h-3 rounded-sm"
                  style={{ backgroundColor: CHART_COLORS.ascent.up }}
                />
                <div
                  className="w-1.5 h-3 rounded-sm"
                  style={{ backgroundColor: CHART_COLORS.ascent.down }}
                />
              </div>
              <LegendLabel isVisible={isVisible}>{series.name}</LegendLabel>
            </LegendButton>
          );
        }

        return (
          <LegendButton
            key={series.key}
            isVisible={isVisible}
            isHovered={isHovered}
            isOtherHovered={isOtherHovered}
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
  isOtherHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function LegendButton({
  children,
  isVisible,
  isHovered,
  isOtherHovered,
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
      } ${isOtherHovered ? 'opacity-30' : ''} ${!isVisible ? 'opacity-40' : ''}`}
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
