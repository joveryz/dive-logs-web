import { useMemo } from 'react';
import {
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { DiveProfilePoint } from '@/types';
import { formatTimeForChart } from '@/utils';
import { calculateNiceYMax, formatYAxisTick } from '@/utils/chart';
import { CHART_COLORS, CHART_CONFIG } from '@/constants';
import {
  useDiveChartData,
  useContainerSize,
  useSeriesHover,
} from '@/hooks/useDiveChartData';
import { ChartTooltip } from './ChartTooltip';
import { ChartLegend } from './ChartLegend';
import { useChartSeries } from './useChartSeries';

interface DiveChartProps {
  profile: DiveProfilePoint[];
  maxDepth: number;
}

/**
 * 潜水剖面图表组件
 * 显示深度、温度、气压等多种数据的交互式图表
 */
export function DiveChart({ profile, maxDepth }: DiveChartProps) {
  const { containerRef, containerSize } = useContainerSize();
  const { chartData, seriesConfigs, toggleSeriesVisibility, hideAllSeries, showAllSeries } =
    useDiveChartData(profile);
  const {
    hoveredSeries,
    handleSeriesMouseEnter,
    handleSeriesMouseLeave,
  } = useSeriesHover();

  // 生成图表系列元素
  const chartSeriesElements = useChartSeries({
    seriesConfigs,
    hoveredSeries,
    onMouseEnter: handleSeriesMouseEnter,
    onMouseLeave: handleSeriesMouseLeave,
  });

  // 计算 Y 轴域值
  const yDomain = useMemo<[number, number]>(() => {
    const niceMax = calculateNiceYMax(maxDepth);
    return [0, Math.max(niceMax, 10)];
  }, [maxDepth]);

  // 计算 X 轴域值（时间范围）
  const xDomain = useMemo<[number, number]>(() => {
    if (profile.length === 0) return [0, 100];
    const maxTime = Math.max(...profile.map((p) => p.time));
    return [0, maxTime];
  }, [profile]);

  // 获取当前悬停的系列配置（用于 Y 轴显示）
  const hoveredConfig = hoveredSeries
    ? seriesConfigs.find((s) => s.key === hoveredSeries)
    : null;

  return (
    <div className="h-full flex flex-col">
      {/* 图表区域 */}
      <div ref={containerRef} className="flex-1 relative min-h-0">
        {containerSize.width > 0 && containerSize.height > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
            >
              {/* 网格 */}
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART_COLORS.grid}
                vertical={true}
              />

              {/* X轴 - 时间 */}
              <XAxis
                dataKey="time"
                type="number"
                domain={xDomain}
                tickFormatter={formatTimeForChart}
                stroke={CHART_COLORS.axis}
                tick={{ fill: CHART_COLORS.axisLabel, fontSize: CHART_CONFIG.fontSize }}
                tickLine={{ stroke: CHART_COLORS.axis }}
                axisLine={{ stroke: CHART_COLORS.axis }}
                scale="linear"
                allowDataOverflow={false}
                tickCount={8}
              />

              {/* Y轴左侧 - 深度（反转） */}
              <YAxis
                yAxisId="depth"
                orientation="left"
                domain={yDomain}
                reversed={true}
                stroke={CHART_COLORS.axis}
                tick={{ fill: CHART_COLORS.axisLabel, fontSize: CHART_CONFIG.fontSize }}
                tickLine={{ stroke: CHART_COLORS.axis }}
                axisLine={{ stroke: CHART_COLORS.axis }}
                tickCount={CHART_CONFIG.tickCount}
                tickFormatter={(v) => `${v}`}
                width={CHART_CONFIG.yAxisWidth}
                label={{
                  value: 'Depth [m]',
                  angle: -90,
                  position: 'center',
                  fill: CHART_COLORS.axisLabel,
                  fontSize: CHART_CONFIG.fontSize,
                  fontWeight: 500,
                  dx: -25,
                }}
              />

              {/* Y轴右侧 - 归一化数据 (0-100) */}
              <YAxis
                yAxisId="normalized"
                orientation="right"
                domain={[0, 100]}
                stroke={CHART_COLORS.axis}
                tick={{
                  fill: hoveredConfig?.color || '#9ca3af',
                  fontSize: CHART_CONFIG.fontSize,
                }}
                tickLine={{ stroke: CHART_COLORS.axis }}
                axisLine={{ stroke: CHART_COLORS.axis }}
                tickCount={CHART_CONFIG.tickCount}
                ticks={hoveredSeries === 'ascentRate' ? [5, 27.5, 50, 72.5, 95] : [0, 20, 40, 60, 80, 100]}
                width={CHART_CONFIG.yAxisWidth}
                tickFormatter={(v) => {
                  if (!hoveredConfig || hoveredConfig.key === 'depth') return '';
                  return formatYAxisTick(
                    v,
                    hoveredConfig.key,
                    hoveredConfig.minValue ?? 0,
                    hoveredConfig.maxValue ?? 100
                  );
                }}
                label={
                  hoveredConfig && hoveredConfig.key !== 'depth'
                    ? {
                        value: `${hoveredConfig.name} [${hoveredConfig.unit}]`,
                        angle: -90,
                        position: 'center',
                        fill: hoveredConfig.color,
                        fontSize: CHART_CONFIG.fontSize,
                        fontWeight: 500,
                        dx: 28,
                      }
                    : undefined
                }
              />

              {/* 零线参考 - 深度 */}
              <ReferenceLine
                yAxisId="depth"
                y={0}
                stroke={CHART_COLORS.referenceLine}
                strokeWidth={2}
              />

              {/* 零线参考 - Ascent Rate (y=50 是 0 点) */}
              <ReferenceLine
                yAxisId="normalized"
                y={50}
                stroke="#666"
                strokeWidth={1}
                strokeDasharray="3 3"
              />

              {/* 渲染所有数据系列 */}
              {chartSeriesElements}

              {/* Tooltip */}
              <Tooltip
                content={<ChartTooltip seriesConfigs={seriesConfigs} />}
                cursor={{
                  stroke: CHART_COLORS.tooltip.cursor,
                  strokeWidth: 1,
                  strokeDasharray: '5 5',
                }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 底部图例 */}
      <ChartLegend
        seriesConfigs={seriesConfigs}
        hoveredSeries={hoveredSeries}
        onToggleVisibility={toggleSeriesVisibility}
        onHideAll={hideAllSeries}
        onShowAll={showAllSeries}
        onMouseEnter={handleSeriesMouseEnter}
        onMouseLeave={handleSeriesMouseLeave}
      />
    </div>
  );
}
