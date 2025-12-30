import { memo } from 'react';
import { DiveProfilePoint } from '@/types';
import { ChartSeriesConfig } from '@/constants';
import { formatTimeForChart, formatNumber } from '@/utils';

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: DiveProfilePoint;
    dataKey: string;
    value: number;
    color: string;
  }>;
  seriesConfigs: ChartSeriesConfig[];
}

/**
 * 图表自定义 Tooltip 组件
 * 显示鼠标悬停位置的所有可见数据系列值
 */
function ChartTooltipComponent({
  active,
  payload,
  seriesConfigs,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-zinc-900/95 border border-zinc-600 rounded-lg p-2 shadow-xl text-xs">
      <div className="text-yellow-400 font-mono mb-1.5 border-b border-zinc-600 pb-1">
        Time: {formatTimeForChart(data.time)}
      </div>
      <div className="grid grid-cols-4 gap-x-3 gap-y-0.5">
        {seriesConfigs
          .filter((s) => s.visible)
          .map((series) => {
            const value = data[series.key as keyof DiveProfilePoint];
            if (value === undefined) return null;

            const formattedValue =
              typeof value === 'number'
                ? formatNumber(value, '', series.key)
                : value;

            return (
              <div key={series.key} className="contents">
                <div style={{ color: series.color }} className="truncate">
                  {series.name}:
                </div>
                <div
                  style={{ color: series.color }}
                  className="font-mono text-right"
                >
                  {formattedValue} {series.unit}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export const ChartTooltip = memo(ChartTooltipComponent);
