import { useMemo, useCallback, useState, useEffect } from 'react';
import {
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { DiveProfilePoint, DiveType } from '@/types';
import { formatTimeForChart } from '@/utils';
import { calculateNiceYMax, formatYAxisTick, isSymmetricSeries, SYMMETRIC_AXIS_TICKS, LINEAR_AXIS_TICKS, NORMALIZED_AXIS } from '@/utils/chart';
import { CHART_COLORS, CHART_CONFIG, BREAKPOINTS } from '@/constants';
import {
  useChartData,
  useContainerSize,
  useSeriesHover,
} from '@/hooks';
import { ChartTooltip } from './ChartTooltip';
import { ChartLegend } from './ChartLegend';
import { useChartSeries } from './useChartSeries';

interface DiveChartProps {
  profile: DiveProfilePoint[];
  maxDepth: number;
  diveType?: DiveType;
  onCursorChange?: (data: DiveProfilePoint | null) => void;
}

/**
 * 潜水剖面图表组件
 * 显示深度、温度、气压等多种数据的交互式图表
 */
export function DiveChart({ profile, maxDepth, diveType, onCursorChange }: DiveChartProps) {
  const { containerRef, containerSize } = useContainerSize();
  const { chartData, seriesConfigs, toggleSeriesVisibility, resetToDefault, showAllSeries, hideAllSeries } =
    useChartData(profile, diveType);
  const {
    hoveredSeries,
    selectedSeries,
    activeSeriesForYAxis,
    handleSeriesMouseEnter,
    handleSeriesMouseLeave,
    handleSeriesClick,
  } = useSeriesHover();
  
  // 检测是否应该隐藏 tooltip 内容框
  // 仅在竖屏窄屏（手机竖屏）时隐藏，横屏时显示 tooltip
  const [shouldHideTooltipContent, setShouldHideTooltipContent] = useState(false);
  useEffect(() => {
    const checkCondition = () => {
      const isNarrowPortrait = window.innerWidth < BREAKPOINTS.mobilePortrait && window.innerHeight > window.innerWidth;
      setShouldHideTooltipContent(isNarrowPortrait);
    };
    checkCondition();
    
    window.addEventListener('resize', checkCondition);
    const mediaQuery = window.matchMedia('(orientation: portrait)');
    mediaQuery.addEventListener('change', checkCondition);
    
    return () => {
      window.removeEventListener('resize', checkCondition);
      mediaQuery.removeEventListener('change', checkCondition);
    };
  }, []);

  // 处理鼠标/触摸移动事件 - Recharts 3.x 使用 CategoricalChartState 类型
  const handleChartEvent = useCallback((state: unknown) => {
    const chartState = state as { activePayload?: Array<{ payload: DiveProfilePoint }> };
    if (chartState?.activePayload?.[0]?.payload && onCursorChange) {
      onCursorChange(chartState.activePayload[0].payload);
    }
  }, [onCursorChange]);

  const handleMouseLeave = useCallback(() => {
    if (onCursorChange) {
      onCursorChange(null);
    }
  }, [onCursorChange]);

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

  // 计算 X 轴刻度值（根据潜水类型和屏幕宽度动态调整间隔）
  const xTicks = useMemo(() => {
    const [min, max] = xDomain;
    const duration = max - min;
    
    // 根据容器宽度计算合适的刻度数量（每 50 像素左右一个刻度）
    const chartWidth = containerSize.width - CHART_CONFIG.yAxisWidth * 2 - 20; // 减去左右 Y 轴和边距
    const targetTickCount = Math.max(3, Math.floor(chartWidth / 30));
    
    // 根据潜水类型确定基础刻度间隔
    let baseInterval: number;
    if (diveType === 'FreeDive') {
      baseInterval = 1; // FreeDive: 最小 1秒
    } else if (diveType?.startsWith('OC Rec')) {
      baseInterval = 30; // OC Rec 系列: 最小 30秒
    } else {
      baseInterval = 5; // 其他类型: 最小 5秒
    }
    
    // 计算理想间隔，但必须是基础间隔的整数倍
    const idealInterval = duration / targetTickCount;
    const multiplier = Math.max(1, Math.ceil(idealInterval / baseInterval));
    const interval = baseInterval * multiplier;
    
    const ticks: number[] = [];
    for (let t = min; t <= max; t += interval) {
      ticks.push(t);
    }
    // 确保最后一个刻度不超过 max
    if (ticks[ticks.length - 1] < max && max - ticks[ticks.length - 1] > interval / 2) {
      ticks.push(ticks[ticks.length - 1] + interval);
    }
    return ticks;
  }, [xDomain, diveType, containerSize.width]);

  // 获取当前悬停的系列配置（用于 Y 轴显示）
  // 优先显示悬停的系列，否则显示上次选中的系列
  const hoveredConfig = useMemo(() => {
    if (activeSeriesForYAxis) {
      return seriesConfigs.find((s) => s.key === activeSeriesForYAxis && s.visible) || null;
    }
    return null;
  }, [activeSeriesForYAxis, seriesConfigs]);

  return (
    <div className="h-full flex flex-col">
      {/* 图表区域 - 触屏设备使用 touch-action: none 防止滚动干扰 */}
      <div 
        ref={containerRef} 
        className="flex-1 relative min-h-0" 
        onMouseLeave={handleMouseLeave}
        style={{ touchAction: 'none' }}
      >
        {containerSize.width > 0 && containerSize.height > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              onMouseMove={handleChartEvent}
              onMouseDown={handleChartEvent}
              onClick={handleChartEvent}
            >
              {/* 网格 - 只绘制水平线，垂直线用 ReferenceLine 绘制以确保与刻度对齐 */}
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART_COLORS.grid}
                vertical={false}
              />

              {/* 垂直网格线 - 与 X 轴刻度对齐 */}
              {xTicks.map((tick) => (
                <ReferenceLine
                  key={`grid-${tick}`}
                  x={tick}
                  yAxisId="depth"
                  stroke={CHART_COLORS.grid}
                  strokeDasharray="3 3"
                />
              ))}

              {/* X轴 - 时间 */}
              <XAxis
                dataKey="time"
                type="number"
                domain={xDomain}
                ticks={xTicks}
                tickFormatter={formatTimeForChart}
                stroke={CHART_COLORS.axis}
                tick={{ fill: CHART_COLORS.axisLabel, fontSize: CHART_CONFIG.fontSize }}
                tickLine={{ stroke: CHART_COLORS.axis }}
                axisLine={{ stroke: CHART_COLORS.axis }}
                scale="linear"
                allowDataOverflow={false}
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
                domain={[NORMALIZED_AXIS.MIN, NORMALIZED_AXIS.MAX]}
                stroke={CHART_COLORS.axis}
                tick={{
                  fill: hoveredConfig?.color || '#9ca3af',
                  fontSize: CHART_CONFIG.fontSize,
                }}
                tickLine={{ stroke: CHART_COLORS.axis }}
                axisLine={{ stroke: CHART_COLORS.axis }}
                tickCount={CHART_CONFIG.tickCount}
                ticks={activeSeriesForYAxis && isSymmetricSeries(activeSeriesForYAxis) ? [...SYMMETRIC_AXIS_TICKS] : [...LINEAR_AXIS_TICKS]}
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

              {/* 零线参考 - 对称系列 (CENTER 点是 0 值) */}
              <ReferenceLine
                yAxisId="normalized"
                y={NORMALIZED_AXIS.CENTER}
                stroke="#666"
                strokeWidth={1}
                strokeDasharray="3 3"
              />

              {/* 渲染所有数据系列 */}
              {chartSeriesElements}

              {/* Tooltip - 竖屏窄屏时只显示 cursor 竖线，横屏时显示完整内容 */}
              <Tooltip
                content={shouldHideTooltipContent ? () => null : <ChartTooltip seriesConfigs={seriesConfigs} />}
                cursor={{
                  stroke: CHART_COLORS.tooltip.cursor,
                  strokeWidth: 1,
                  strokeDasharray: '5 5',
                }}
                isAnimationActive={false}
                allowEscapeViewBox={{ x: false, y: false }}
                wrapperStyle={{ zIndex: 100 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 底部图例 */}
      <ChartLegend
        seriesConfigs={seriesConfigs}
        hoveredSeries={hoveredSeries}
        selectedSeries={selectedSeries}
        onToggleVisibility={toggleSeriesVisibility}
        onResetToDefault={resetToDefault}
        onShowAll={showAllSeries}
        onHideAll={hideAllSeries}
        onMouseEnter={handleSeriesMouseEnter}
        onMouseLeave={handleSeriesMouseLeave}
        onSelect={handleSeriesClick}
      />
    </div>
  );
}
