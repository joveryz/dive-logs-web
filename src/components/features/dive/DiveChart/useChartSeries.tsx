import { useMemo } from 'react';
import { Line, Area } from 'recharts';
import { EffectiveSeriesConfig } from '@/hooks/useDiveChartData';
import { CHART_COLORS, CHART_CONFIG } from '@/constants';

interface UseChartSeriesProps {
  seriesConfigs: EffectiveSeriesConfig[];
  hoveredSeries: string | null;
  onMouseEnter: (key: string) => void;
  onMouseLeave: () => void;
}

/**
 * 生成图表数据系列的 Hook
 * 返回可直接在 ComposedChart 中渲染的元素数组
 */
export function useChartSeries({
  seriesConfigs,
  hoveredSeries,
  onMouseEnter,
  onMouseLeave,
}: UseChartSeriesProps): JSX.Element[] {
  return useMemo(() => {
    // 获取线条宽度（悬停时加粗）
    const getStrokeWidth = (seriesKey: string, baseWidth: number) => {
      if (hoveredSeries === null) return baseWidth;
      return hoveredSeries === seriesKey ? baseWidth + 1.5 : baseWidth;
    };

    // 先渲染非depth的系列，再渲染depth（确保depth在最上层）
    const nonDepthSeries = seriesConfigs.filter(
      (s) => s.visible && s.key !== 'depth'
    );
    const depthSeries = seriesConfigs.find(
      (s) => s.visible && s.key === 'depth'
    );

    const renderOneSeries = (series: EffectiveSeriesConfig): JSX.Element[] => {
      const isDepth = series.key === 'depth';
      const isAscentRate = series.key === 'ascentRate';
      const dataKey = isDepth ? 'depth' : `${series.key}_normalized`;
      const yAxisId = isDepth ? 'depth' : 'normalized';

      // Ascent Rate 特殊处理：双色填充
      if (series.type === 'bar' && isAscentRate) {
        return renderAscentRateSeries(series, yAxisId, getStrokeWidth, onMouseEnter, onMouseLeave);
      }

      if (series.type === 'bar') {
        return [renderBarSeries(series, dataKey, yAxisId)];
      }

      if (isDepth) {
        return renderDepthSeries(series, dataKey, yAxisId, getStrokeWidth, onMouseEnter, onMouseLeave);
      }

      return renderLineSeries(series, dataKey, yAxisId, getStrokeWidth, onMouseEnter, onMouseLeave);
    };

    // 先渲染其他系列，最后渲染depth（确保在最上层）
    const result: JSX.Element[] = nonDepthSeries.flatMap(renderOneSeries);
    if (depthSeries) {
      result.push(...renderOneSeries(depthSeries));
    }
    return result;
  }, [seriesConfigs, hoveredSeries, onMouseEnter, onMouseLeave]);
}

/**
 * 渲染 Ascent Rate 系列（双色填充：绿色上升，红色下降）
 */
function renderAscentRateSeries(
  series: EffectiveSeriesConfig,
  yAxisId: string,
  getStrokeWidth: (key: string, baseWidth: number) => number,
  onMouseEnter: (key: string) => void,
  onMouseLeave: () => void
): JSX.Element[] {
  const strokeWidth = getStrokeWidth(series.key, CHART_CONFIG.lineWidth);
  
  return [
    // 透明的宽线作为悬停区域
    <Line
      key={`${series.key}_hitbox`}
      yAxisId={yAxisId}
      dataKey="ascentRate_up"
      type="stepAfter"
      stroke="transparent"
      strokeWidth={CHART_CONFIG.hitboxWidth}
      dot={false}
      activeDot={false}
      onMouseEnter={() => onMouseEnter(series.key)}
      onMouseLeave={onMouseLeave}
      style={{ cursor: 'pointer' }}
    />,
    // 绿色填充 - 0线以上（上升/负值）
    <Area
      key="ascentRate_up"
      yAxisId={yAxisId}
      dataKey="ascentRate_up"
      name="Ascent Up"
      type="stepAfter"
      stroke={CHART_COLORS.ascent.up}
      strokeWidth={strokeWidth}
      fill={CHART_COLORS.ascent.up}
      fillOpacity={0.5}
      baseValue={50}
      dot={false}
      activeDot={false}
      style={{ pointerEvents: 'none' }}
    />,
    // 红色填充 - 0线以下（下降/正值）
    <Area
      key="ascentRate_down"
      yAxisId={yAxisId}
      dataKey="ascentRate_down"
      name="Ascent Down"
      type="stepAfter"
      stroke={CHART_COLORS.ascent.down}
      strokeWidth={strokeWidth}
      fill={CHART_COLORS.ascent.down}
      fillOpacity={0.5}
      baseValue={50}
      dot={false}
      activeDot={false}
      style={{ pointerEvents: 'none' }}
    />,
  ];
}

/**
 * 渲染柱状图系列
 */
function renderBarSeries(
  series: EffectiveSeriesConfig,
  dataKey: string,
  yAxisId: string
): JSX.Element {
  return (
    <Area
      key={series.key}
      yAxisId={yAxisId}
      dataKey={dataKey}
      name={series.name}
      type="stepAfter"
      stroke={series.color}
      fill={series.color}
      fillOpacity={0.7}
      strokeWidth={0}
      baseValue={0}
      dot={false}
      activeDot={false}
    />
  );
}

/**
 * 渲染深度线（较粗）
 */
function renderDepthSeries(
  series: EffectiveSeriesConfig,
  dataKey: string,
  yAxisId: string,
  getStrokeWidth: (key: string, baseWidth: number) => number,
  onMouseEnter: (key: string) => void,
  onMouseLeave: () => void
): JSX.Element[] {
  return [
    // 透明的宽线作为悬停区域
    <Line
      key={`${series.key}_hitbox`}
      yAxisId={yAxisId}
      dataKey={dataKey}
      type="monotone"
      stroke="transparent"
      strokeWidth={CHART_CONFIG.hitboxWidth + 3}
      dot={false}
      activeDot={false}
      onMouseEnter={() => onMouseEnter(series.key)}
      onMouseLeave={onMouseLeave}
      style={{ cursor: 'pointer' }}
    />,
    // 实际可见的线
    <Line
      key={series.key}
      yAxisId={yAxisId}
      dataKey={dataKey}
      name={series.name}
      type="monotone"
      strokeWidth={getStrokeWidth(series.key, CHART_CONFIG.depthLineWidth)}
      stroke="#ffffff"
      strokeLinecap="round"
      strokeLinejoin="round"
      dot={false}
      activeDot={false}
      style={{ pointerEvents: 'none' }}
    />,
  ];
}

/**
 * 渲染普通数据线
 */
function renderLineSeries(
  series: EffectiveSeriesConfig,
  dataKey: string,
  yAxisId: string,
  getStrokeWidth: (key: string, baseWidth: number) => number,
  onMouseEnter: (key: string) => void,
  onMouseLeave: () => void
): JSX.Element[] {
  return [
    // 透明的宽线作为悬停区域
    <Line
      key={`${series.key}_hitbox`}
      yAxisId={yAxisId}
      dataKey={dataKey}
      type="monotone"
      stroke="transparent"
      strokeWidth={CHART_CONFIG.hitboxWidth}
      dot={false}
      activeDot={false}
      onMouseEnter={() => onMouseEnter(series.key)}
      onMouseLeave={onMouseLeave}
      style={{ cursor: 'pointer' }}
    />,
    // 实际可见的线
    <Line
      key={series.key}
      yAxisId={yAxisId}
      dataKey={dataKey}
      name={series.name}
      type="monotone"
      stroke={series.color}
      strokeWidth={getStrokeWidth(series.key, CHART_CONFIG.lineWidth)}
      dot={false}
      activeDot={false}
      style={{ pointerEvents: 'none' }}
    />,
  ];
}
