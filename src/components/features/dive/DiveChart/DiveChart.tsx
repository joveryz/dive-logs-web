import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { DiveProfilePoint } from '@/types';
import { formatTimeForChart } from '@/utils';

interface DiveChartProps {
  profile: DiveProfilePoint[];
  maxDepth: number;
}

// 数据系列配置
interface SeriesConfig {
  key: string;
  name: string;
  color: string;
  type: 'line' | 'bar';
  visible: boolean;
  unit: string;
  // 数据范围，用于归一化
  minValue?: number;
  maxValue?: number;
}

const defaultSeriesConfigs: SeriesConfig[] = [
  { key: 'depth', name: 'Depth', color: '#ffffff', type: 'line', visible: true, unit: 'm' },
  { key: 'deco', name: 'Deco', color: '#ef4444', type: 'line', visible: true, unit: 'min' },
  { key: 'tts', name: 'TTS', color: '#f97316', type: 'line', visible: true, unit: 'min' },
  { key: 'ndl', name: 'NDL', color: '#ec4899', type: 'line', visible: true, unit: 'min' },
  { key: 'ascentRate', name: 'Ascent', color: '#22c55e', type: 'bar', visible: true, unit: 'm/s' },
  { key: 'cns', name: 'CNS', color: '#f59e0b', type: 'line', visible: true, unit: '%' },
  { key: 'gasDensity', name: 'Gas Density', color: '#14b8a6', type: 'line', visible: true, unit: 'g/L' },
  { key: 'gf99', name: 'GF99', color: '#f43f5e', type: 'line', visible: true, unit: '%' },
  { key: 'ppO2', name: 'ppO2', color: '#10b981', type: 'line', visible: true, unit: 'bar' },
  { key: 'ppHe', name: 'ppHe', color: '#9ca3af', type: 'line', visible: false, unit: 'bar' },
  { key: 'ppN2', name: 'ppN2', color: '#eab308', type: 'line', visible: true, unit: 'bar' },
  { key: 'tank1Pressure', name: 'Tank 1', color: '#a855f7', type: 'line', visible: true, unit: 'bar' },
  { key: 'tank2Pressure', name: 'Tank 2', color: '#8b5cf6', type: 'line', visible: false, unit: 'bar' },
  { key: 'sac', name: 'SAC', color: '#d946ef', type: 'line', visible: true, unit: 'L/min' },
  { key: 'temperature', name: 'Temp', color: '#06b6d4', type: 'line', visible: true, unit: '°C' },
];

// 计算数据的动态范围，添加 padding
function calculateDynamicRange(values: number[], key: string): { min: number; max: number } {
  if (values.length === 0) return { min: 0, max: 100 };
  
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  
  // ascentRate 特殊处理：对称范围，以0为中心
  if (key === 'ascentRate') {
    const maxAbs = Math.max(Math.abs(dataMin), Math.abs(dataMax), 1);
    // 添加 20% padding，并取整到合适的值
    const padded = Math.ceil(maxAbs * 1.2);
    return { min: -padded, max: padded };
  }
  
  // 其他数据：添加 padding 使数据不紧贴边界
  const range = dataMax - dataMin;
  const padding = range * 0.1; // 10% padding
  
  // 最小值处理：某些数据最小值应该是0（如压力、百分比等）
  const zeroBasedKeys = ['cns', 'gf99', 'deco', 'tts', 'ndl', 'ppO2', 'ppHe', 'ppN2', 'gasDensity', 'sac'];
  let min = zeroBasedKeys.includes(key) ? 0 : Math.floor((dataMin - padding) * 10) / 10;
  let max = Math.ceil((dataMax + padding) * 10) / 10;
  
  // 确保有效范围
  if (max <= min) max = min + 1;
  
  // 对于某些数据类型，取整到更漂亮的数字
  if (key === 'tank1Pressure' || key === 'tank2Pressure') {
    max = Math.ceil(max / 50) * 50;
  } else if (key === 'ndl') {
    max = Math.min(100, Math.ceil(max / 10) * 10);
  } else if (key === 'temperature') {
    min = Math.floor(min / 5) * 5;
    max = Math.ceil(max / 5) * 5;
  }
  
  return { min, max };
}

// 自定义 Tooltip 组件
function CustomTooltip({ 
  active, 
  payload,
  seriesConfigs,
}: { 
  active?: boolean; 
  payload?: Array<{ payload: DiveProfilePoint; dataKey: string; value: number; color: string }>;
  seriesConfigs: SeriesConfig[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  
  const data = payload[0].payload;
  
  return (
    <div className="bg-gray-900/95 border border-gray-600 rounded-lg p-2 shadow-xl text-xs">
      <div className="text-yellow-400 font-mono mb-1.5 border-b border-gray-600 pb-1">
        Time: {formatTimeForChart(data.time)}
      </div>
      <div className="grid grid-cols-4 gap-x-3 gap-y-0.5">
        {seriesConfigs.filter(s => s.visible).map((series) => {
          const value = data[series.key as keyof DiveProfilePoint];
          if (value === undefined) return null;
          
          return (
            <div key={series.key} className="contents">
              <div style={{ color: series.color }} className="truncate">{series.name}:</div>
              <div style={{ color: series.color }} className="font-mono text-right">
                {typeof value === 'number' ? value.toFixed(
                  series.key === 'depth' || series.key === 'temperature' ? 1 : 
                  series.key === 'ppO2' || series.key === 'ppN2' || series.key === 'ascentRate' ? 2 : 0
                ) : value} {series.unit}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DiveChart({ profile, maxDepth }: DiveChartProps) {
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 根据数据动态计算每个系列的范围
  const seriesConfigs = useMemo(() => {
    return defaultSeriesConfigs.map(config => {
      if (config.key === 'depth') return config;
      
      // 提取该系列的所有值
      const values = profile
        .map(p => p[config.key as keyof DiveProfilePoint] as number | undefined)
        .filter((v): v is number => v !== undefined);
      
      const { min, max } = calculateDynamicRange(values, config.key);
      
      return {
        ...config,
        minValue: min,
        maxValue: max,
      };
    });
  }, [profile]);
  
  // 用于切换可见性的状态
  const [visibilityOverrides, setVisibilityOverrides] = useState<Record<string, boolean>>({});
  
  // 合并动态配置和可见性覆盖
  const effectiveSeriesConfigs = useMemo(() => {
    return seriesConfigs.map(config => ({
      ...config,
      visible: visibilityOverrides[config.key] ?? config.visible,
    }));
  }, [seriesConfigs, visibilityOverrides]);
  
  // 监听容器尺寸变化（带防抖）
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    let rafId: number;
    let lastWidth = 0;
    let lastHeight = 0;
    
    const resizeObserver = new ResizeObserver((entries) => {
      // 取消上一次的 RAF
      if (rafId) cancelAnimationFrame(rafId);
      
      rafId = requestAnimationFrame(() => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          // 只有尺寸真正变化时才更新
          if (Math.abs(width - lastWidth) > 1 || Math.abs(height - lastHeight) > 1) {
            lastWidth = width;
            lastHeight = height;
            setContainerSize({ width, height });
          }
        }
      });
    });
    
    resizeObserver.observe(container);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, []);
  
  // 切换系列可见性
  const toggleSeriesVisibility = useCallback((key: string) => {
    setVisibilityOverrides(prev => {
      const currentVisible = prev[key] ?? defaultSeriesConfigs.find(s => s.key === key)?.visible ?? true;
      return { ...prev, [key]: !currentVisible };
    });
  }, []);
  
  // 处理系列鼠标悬停
  const handleSeriesMouseEnter = useCallback((seriesKey: string) => {
    setHoveredSeries(seriesKey);
  }, []);
  
  const handleSeriesMouseLeave = useCallback(() => {
    setHoveredSeries(null);
  }, []);
  
  // 准备图表数据 - 归一化所有非depth数据到0-100范围
  const chartData = useMemo(() => {
    return profile.map((point) => {
      const normalized: Record<string, number> = {
        time: point.time,
        depth: point.depth,
      };
      
      // 归一化其他数据
      effectiveSeriesConfigs.forEach(config => {
        if (config.key === 'depth') return;
        const value = point[config.key as keyof DiveProfilePoint] as number | undefined;
        if (value !== undefined && config.minValue !== undefined && config.maxValue !== undefined) {
          // ascentRate 特殊处理：拆分为正负两个系列
          if (config.key === 'ascentRate') {
            // ascentRate: 负值=上升(绿色，向上), 正值=下降(红色，向下)
            const maxAbs = Math.max(Math.abs(config.minValue), Math.abs(config.maxValue));
            // 上升部分 (负值 -> 从50向上延伸的绝对Y坐标)
            // 例如：-10 (上升10m/min) -> 50 + 25 = 75
            normalized['ascentRate_up'] = value < 0 ? 50 + Math.abs(value / maxAbs) * 50 : 50;
            // 下降部分 (正值 -> 从50向下延伸的绝对Y坐标)  
            // 例如：+10 (下降10m/min) -> 50 - 25 = 25
            normalized['ascentRate_down'] = value > 0 ? 50 - (value / maxAbs) * 50 : 50;
            normalized[`${config.key}_normalized`] = 50; // 基准线位置
          } else {
            // 其他数据归一化到 0-100 范围
            const range = config.maxValue - config.minValue;
            normalized[`${config.key}_normalized`] = ((value - config.minValue) / range) * 100;
          }
          normalized[config.key] = value; // 保留原始值用于tooltip
        }
      });
      
      return normalized;
    });
  }, [profile, effectiveSeriesConfigs]);
  
  // 计算Y轴域值 - 使用更好的刻度分割
  const yDomain = useMemo(() => {
    // 计算合适的最大值，使其能被5或10整除
    const niceMax = maxDepth <= 20 
      ? Math.ceil(maxDepth / 5) * 5 
      : Math.ceil(maxDepth / 10) * 10;
    return [0, Math.max(niceMax, 10)];
  }, [maxDepth]);
  
  // 计算X轴域值（时间范围）
  const xDomain = useMemo(() => {
    if (profile.length === 0) return [0, 100];
    const maxTime = Math.max(...profile.map(p => p.time));
    return [0, maxTime];
  }, [profile]);
  
  // 渲染数据系列 - 使用 useMemo 避免重复创建
  const renderedSeries = useMemo(() => {
    // 先渲染非depth的系列，再渲染depth（确保epth在最上层）
    const nonDepthSeries = effectiveSeriesConfigs.filter(s => s.visible && s.key !== 'depth');
    const depthSeries = effectiveSeriesConfigs.find(s => s.visible && s.key === 'depth');
    
    const getOpacity = (seriesKey: string) => {
      if (hoveredSeries === null) return 1;
      return hoveredSeries === seriesKey ? 1 : 0.15;
    };
    
    const renderOneSeries = (series: typeof effectiveSeriesConfigs[0]) => {
      const isDepth = series.key === 'depth';
      const isAscentRate = series.key === 'ascentRate';
      const dataKey = isDepth ? 'depth' : `${series.key}_normalized`;
      const yAxisId = isDepth ? 'depth' : 'normalized';
      
      if (series.type === 'bar' && isAscentRate) {
        // Ascent Rate：使用Area从基准线50填充
        const areaOpacity = getOpacity(series.key) * 0.7;
        return [
          // 上升部分 - 绿色，从50向上填充
          <Area
            key="ascentRate_up"
            yAxisId={yAxisId}
            dataKey="ascentRate_up"
            name="Ascent Up"
            type="stepAfter"
            stroke="#22c55e"
            fill="#22c55e"
            fillOpacity={areaOpacity}
            strokeWidth={0}
            baseValue={50}
            dot={false}
            activeDot={false}
            onMouseEnter={() => handleSeriesMouseEnter(series.key)}
            onMouseLeave={handleSeriesMouseLeave}
            style={{ cursor: 'pointer' }}
          />,
          // 下降部分 - 红色，从50向下填充
          <Area
            key="ascentRate_down"
            yAxisId={yAxisId}
            dataKey="ascentRate_down"
            name="Ascent Down"
            type="stepAfter"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={areaOpacity}
            strokeWidth={0}
            baseValue={50}
            dot={false}
            activeDot={false}
            onMouseEnter={() => handleSeriesMouseEnter(series.key)}
            onMouseLeave={handleSeriesMouseLeave}
            style={{ cursor: 'pointer' }}
          />,
        ];
      } else if (series.type === 'bar') {
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
            onMouseEnter={() => handleSeriesMouseEnter(series.key)}
            onMouseLeave={handleSeriesMouseLeave}
            style={{ cursor: 'pointer' }}
          />
        );
      } else if (isDepth) {
        // Depth 线：更粗、更明显，添加透明hitbox增加悬停区域
        return [
          // 透明的宽线作为悬停区域
          <Line
            key={`${series.key}_hitbox`}
            yAxisId={yAxisId}
            dataKey={dataKey}
            type="monotone"
            stroke="transparent"
            strokeWidth={15}
            dot={false}
            activeDot={false}
            onMouseEnter={() => handleSeriesMouseEnter(series.key)}
            onMouseLeave={handleSeriesMouseLeave}
            style={{ cursor: 'pointer' }}
          />,
          // 实际可见的线
          <Line
            key={series.key}
            yAxisId={yAxisId}
            dataKey={dataKey}
            name={series.name}
            type="monotone"
            strokeWidth={3}
            stroke="#ffffff"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={getOpacity(series.key)}
            dot={false}
            activeDot={false}
            style={{ pointerEvents: 'none' }}
          />,
        ];
      } else {
        // 其他线：添加透明hitbox增加悬停区域
        return [
          // 透明的宽线作为悬停区域
          <Line
            key={`${series.key}_hitbox`}
            yAxisId={yAxisId}
            dataKey={dataKey}
            type="monotone"
            stroke="transparent"
            strokeWidth={12}
            dot={false}
            activeDot={false}
            onMouseEnter={() => handleSeriesMouseEnter(series.key)}
            onMouseLeave={handleSeriesMouseLeave}
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
            strokeWidth={1.5}
            opacity={getOpacity(series.key)}
            dot={false}
            activeDot={false}
            style={{ pointerEvents: 'none' }}
          />,
        ];
      }
    };
    
    // 先渲染其他系列，最后渲染depth（确保在最上层）
    const result = nonDepthSeries.flatMap(renderOneSeries);
    if (depthSeries) {
      result.push(renderOneSeries(depthSeries) as JSX.Element);
    }
    return result;
  }, [effectiveSeriesConfigs, hoveredSeries, handleSeriesMouseEnter, handleSeriesMouseLeave]);
  
  // 获取当前悬停的系列配置
  const hoveredConfig = hoveredSeries ? effectiveSeriesConfigs.find(s => s.key === hoveredSeries) : null;
  
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
                stroke="#374151" 
                vertical={true}
              />
              
              {/* X轴 - 时间 */}
              <XAxis
                dataKey="time"
                type="number"
                domain={xDomain}
                tickFormatter={formatTimeForChart}
                stroke="#6b7280"
                tick={{ fill: '#d1d5db', fontSize: 12 }}
                tickLine={{ stroke: '#6b7280' }}
                axisLine={{ stroke: '#6b7280' }}
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
              stroke="#6b7280"
              tick={{ fill: '#d1d5db', fontSize: 12 }}
              tickLine={{ stroke: '#6b7280' }}
              axisLine={{ stroke: '#6b7280' }}
              tickCount={6}
              tickFormatter={(v) => `${v}`}
              width={60}
              label={{ 
                value: 'Depth [m]', 
                angle: -90, 
                position: 'center',
                fill: '#d1d5db',
                fontSize: 12,
                fontWeight: 500,
                dx: -25,
              }}
            />
            
            {/* Y轴右侧 - 归一化数据 (0-100) */}
            <YAxis
              yAxisId="normalized"
              orientation="right"
              domain={[0, 100]}
              stroke="#6b7280"
              tick={{ fill: hoveredConfig?.color || '#9ca3af', fontSize: 12 }}
              tickLine={{ stroke: '#6b7280' }}
              axisLine={{ stroke: '#6b7280' }}
              tickCount={6}
              ticks={[0, 20, 40, 60, 80, 100]}
              width={60}
              tickFormatter={(v) => {
                if (!hoveredConfig || hoveredConfig.key === 'depth') return '';
                const { minValue = 0, maxValue = 100, key } = hoveredConfig;
                
                // ascentRate 特殊处理：0在中点(50)
                if (key === 'ascentRate') {
                  const maxAbs = Math.max(Math.abs(minValue), Math.abs(maxValue));
                  const actualValue = (50 - v) / 50 * maxAbs;
                  return actualValue.toFixed(2);
                }
                
                const actualValue = (v / 100) * (maxValue - minValue) + minValue;
                return actualValue.toFixed(key.includes('pp') ? 2 : 0);
              }}
              label={hoveredConfig && hoveredConfig.key !== 'depth' ? { 
                value: `${hoveredConfig.name} [${hoveredConfig.unit}]`, 
                angle: -90, 
                position: 'center',
                fill: hoveredConfig.color,
                fontSize: 12,
                fontWeight: 500,
                dx: 28,
              } : undefined}
            />
            
            {/* 零线参考 - 深度 */}
            <ReferenceLine 
              yAxisId="depth" 
              y={0} 
              stroke="#4b5563" 
              strokeWidth={2}
            />
            
            {/* 零线参考 - Ascent Rate (在50的位置，即0点) */}
            {hoveredSeries === 'ascentRate' && (
              <ReferenceLine 
                yAxisId="normalized" 
                y={50} 
                stroke="#6b7280" 
                strokeWidth={1}
                strokeDasharray="3 3"
              />
            )}
            
            {/* 渲染所有数据系列 */}
            {renderedSeries}
            
            {/* Tooltip */}
            <Tooltip
              content={<CustomTooltip seriesConfigs={effectiveSeriesConfigs} />}
              cursor={{ stroke: '#fbbf24', strokeWidth: 1, strokeDasharray: '5 5' }}
              isAnimationActive={false}
            />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
      
      {/* 底部图例 */}
      <div className="flex flex-wrap justify-center gap-2 px-2 py-2 border-t border-gray-700">
        {effectiveSeriesConfigs.map((series) => {
          const isVisible = series.visible;
          const isHovered = hoveredSeries === series.key;
          const isOtherHovered = hoveredSeries !== null && hoveredSeries !== series.key;
          
          // Special legend for Ascent - show both colors
          if (series.key === 'ascentRate') {
            return (
              <button
                key={series.key}
                onClick={() => toggleSeriesVisibility(series.key)}
                onMouseEnter={() => handleSeriesMouseEnter(series.key)}
                onMouseLeave={handleSeriesMouseLeave}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all ${
                  isHovered ? 'bg-gray-700' : 'hover:bg-gray-800'
                } ${isOtherHovered ? 'opacity-30' : ''} ${!isVisible ? 'opacity-40' : ''}`}
              >
                <div className={`flex gap-0.5 ${!isVisible ? 'opacity-40' : ''}`}>
                  <div className="w-1.5 h-3 rounded-sm" style={{ backgroundColor: '#22c55e' }} />
                  <div className="w-1.5 h-3 rounded-sm" style={{ backgroundColor: '#ef4444' }} />
                </div>
                <span 
                  className={`${!isVisible ? 'line-through text-gray-500' : 'text-gray-300'}`}
                >
                  {series.name}
                </span>
              </button>
            );
          }

          return (
            <button
              key={series.key}
              onClick={() => toggleSeriesVisibility(series.key)}
              onMouseEnter={() => handleSeriesMouseEnter(series.key)}
              onMouseLeave={handleSeriesMouseLeave}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all ${
                isHovered ? 'bg-gray-700' : 'hover:bg-gray-800'
              } ${isOtherHovered ? 'opacity-30' : ''} ${!isVisible ? 'opacity-40' : ''}`}
            >
              <div 
                className={`w-3 h-1 rounded ${!isVisible ? 'opacity-40' : ''}`}
                style={{ backgroundColor: series.color }}
              />
              <span 
                className={`${!isVisible ? 'line-through text-gray-500' : 'text-gray-300'}`}
                style={{ color: isVisible ? series.color : undefined }}
              >
                {series.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
