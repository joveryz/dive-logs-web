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
    const getOpacity = (seriesKey: string) => {
      if (hoveredSeries === null) return 1;
      return hoveredSeries === seriesKey ? 1 : 0.15;
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

      if (series.type === 'bar' && isAscentRate) {
        return renderAscentRateSeries(series, yAxisId, getOpacity, onMouseEnter, onMouseLeave);
      }

      if (series.type === 'bar') {
        return [renderBarSeries(series, dataKey, yAxisId, getOpacity, onMouseEnter, onMouseLeave)];
      }

      if (isDepth) {
        return renderDepthSeries(series, dataKey, yAxisId, getOpacity, onMouseEnter, onMouseLeave);
      }

      return renderLineSeries(series, dataKey, yAxisId, getOpacity, onMouseEnter, onMouseLeave);
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
 * 渲染 Ascent Rate 系列（双色区域图）
 */
function renderAscentRateSeries(
  series: EffectiveSeriesConfig,
  yAxisId: string,
  getOpacity: (key: string) => number,
  onMouseEnter: (key: string) => void,
  onMouseLeave: () => void
): JSX.Element[] {
  const areaOpacity = getOpacity(series.key) * 0.7;
  const commonProps = {
    yAxisId,
    type: 'stepAfter' as const,
    strokeWidth: 0,
    baseValue: 50,
    dot: false,
    activeDot: false,
    onMouseEnter: () => onMouseEnter(series.key),
    onMouseLeave,
    style: { cursor: 'pointer' },
  };

  return [
    <Area
      key="ascentRate_up"
      dataKey="ascentRate_up"
      name="Ascent Up"
      stroke={CHART_COLORS.ascent.up}
      fill={CHART_COLORS.ascent.up}
      fillOpacity={areaOpacity}
      {...commonProps}
    />,
    <Area
      key="ascentRate_down"
      dataKey="ascentRate_down"
      name="Ascent Down"
      stroke={CHART_COLORS.ascent.down}
      fill={CHART_COLORS.ascent.down}
      fillOpacity={areaOpacity}
      {...commonProps}
    />,
  ];
}

/**
 * 渲染柱状图系列
 */
function renderBarSeries(
  series: EffectiveSeriesConfig,
  dataKey: string,
  yAxisId: string,
  getOpacity: (key: string) => number,
  onMouseEnter: (key: string) => void,
  onMouseLeave: () => void
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
      fillOpacity={getOpacity(series.key) * 0.7}
      strokeWidth={0}
      baseValue={0}
      dot={false}
      activeDot={false}
      onMouseEnter={() => onMouseEnter(series.key)}
      onMouseLeave={onMouseLeave}
      style={{ cursor: 'pointer' }}
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
  getOpacity: (key: string) => number,
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
      strokeWidth={CHART_CONFIG.depthLineWidth}
      stroke="#ffffff"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={getOpacity(series.key)}
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
  getOpacity: (key: string) => number,
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
      strokeWidth={CHART_CONFIG.lineWidth}
      opacity={getOpacity(series.key)}
      dot={false}
      activeDot={false}
      style={{ pointerEvents: 'none' }}
    />,
  ];
}
