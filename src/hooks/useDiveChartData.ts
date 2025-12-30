import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { DiveProfilePoint } from '@/types';
import { ChartSeriesConfig, DEFAULT_CHART_SERIES } from '@/constants';
import { calculateDynamicRange } from '@/utils/chart';

/**
 * 图表数据系列配置（包含计算后的范围）
 */
export interface EffectiveSeriesConfig extends ChartSeriesConfig {
  minValue?: number;
  maxValue?: number;
}

/**
 * 处理图表数据的 Hook
 * 负责计算数据范围、归一化数据、管理系列可见性
 */
export function useDiveChartData(profile: DiveProfilePoint[]) {
  // 可见性覆盖状态
  const [visibilityOverrides, setVisibilityOverrides] = useState<
    Record<string, boolean>
  >({});

  // 根据数据动态计算每个系列的范围
  const seriesConfigs = useMemo<EffectiveSeriesConfig[]>(() => {
    return DEFAULT_CHART_SERIES.map((config) => {
      if (config.key === 'depth') return config;

      // 提取该系列的所有值
      const values = profile
        .map((p) => p[config.key as keyof DiveProfilePoint] as number | undefined)
        .filter((v): v is number => v !== undefined);

      const { min, max } = calculateDynamicRange(values, config.key);

      return {
        ...config,
        minValue: min,
        maxValue: max,
      };
    });
  }, [profile]);

  // 合并动态配置和可见性覆盖
  const effectiveSeriesConfigs = useMemo<EffectiveSeriesConfig[]>(() => {
    return seriesConfigs.map((config) => ({
      ...config,
      visible: visibilityOverrides[config.key] ?? config.visible,
    }));
  }, [seriesConfigs, visibilityOverrides]);

  // 切换系列可见性
  const toggleSeriesVisibility = useCallback((key: string) => {
    setVisibilityOverrides((prev) => {
      const currentVisible =
        prev[key] ??
        DEFAULT_CHART_SERIES.find((s) => s.key === key)?.visible ??
        true;
      return { ...prev, [key]: !currentVisible };
    });
  }, []);

  // 默认系列 keys
  const DEFAULT_VISIBLE_KEYS = ['depth', 'ascentRate', 'temperature'];

  // 重置为默认显示（depth, ascentRate, temperature）
  const resetToDefault = useCallback(() => {
    setVisibilityOverrides((prev) => {
      const newOverrides: Record<string, boolean> = { ...prev };
      DEFAULT_CHART_SERIES.forEach((s) => {
        newOverrides[s.key] = DEFAULT_VISIBLE_KEYS.includes(s.key);
      });
      return newOverrides;
    });
  }, []);

  // 显示所有系列
  const showAllSeries = useCallback(() => {
    setVisibilityOverrides((prev) => {
      const newOverrides: Record<string, boolean> = { ...prev };
      DEFAULT_CHART_SERIES.forEach((s) => {
        newOverrides[s.key] = true; // 所有系列都可见
      });
      return newOverrides;
    });
  }, []);

  // 检查是否所有非 depth 系列都被隐藏
  const allHidden = useMemo(() => {
    return effectiveSeriesConfigs
      .filter((s) => s.key !== 'depth')
      .every((s) => !s.visible);
  }, [effectiveSeriesConfigs]);

  // 准备图表数据 - 归一化所有非depth数据到0-100范围
  // 注意：只依赖 seriesConfigs (基于 profile 计算的范围)，不依赖 visibilityOverrides
  // 这样切换可见性时不会重新计算数据
  const chartData = useMemo(() => {
    return profile.map((point) => {
      const normalized: Record<string, number> = {
        time: point.time,
        depth: point.depth,
      };

      // 归一化其他数据（使用基础 seriesConfigs，不考虑可见性）
      seriesConfigs.forEach((config) => {
        if (config.key === 'depth') return;
        const value = point[config.key as keyof DiveProfilePoint] as
          | number
          | undefined;
        if (
          value !== undefined &&
          config.minValue !== undefined &&
          config.maxValue !== undefined
        ) {
          // ascentRate 特殊处理：拆分为正负两个系列，0点在中心
          if (config.key === 'ascentRate') {
            // 使用 maxValue 作为缩放基准（范围是对称的）
            const maxAbs = config.maxValue;
            // 0点在Y轴中点(50)，上下各占用45的范围(5-95)
            const scale = 45;
            // 上升部分 (负值 -> 从50向上延伸，绿色)
            normalized['ascentRate_up'] =
              value < 0 ? 50 + (Math.abs(value) / maxAbs) * scale : 50;
            // 下降部分 (正值 -> 从50向下延伸，红色)
            normalized['ascentRate_down'] =
              value > 0 ? 50 - (value / maxAbs) * scale : 50;
            normalized[`${config.key}_normalized`] = 50;
          } else {
            // 其他数据归一化到 0-100 范围
            const range = config.maxValue - config.minValue;
            // 如果 range 为 0（数据没有变化），居中显示
            normalized[`${config.key}_normalized`] = range === 0 
              ? 50 
              : ((value - config.minValue) / range) * 100;
          }
          normalized[config.key] = value; // 保留原始值用于tooltip
        }
      });

      return normalized;
    });
  }, [profile, seriesConfigs]); // 只依赖 profile 和 seriesConfigs，不依赖可见性

  return {
    chartData,
    seriesConfigs: effectiveSeriesConfigs,
    toggleSeriesVisibility,
    resetToDefault,
    showAllSeries,
    allHidden,
  };
}

/**
 * 处理容器尺寸监听的 Hook
 */
export function useContainerSize() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number;
    let lastWidth = 0;
    let lastHeight = 0;

    const resizeObserver = new ResizeObserver((entries) => {
      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          // 只有尺寸真正变化时才更新
          if (
            Math.abs(width - lastWidth) > 1 ||
            Math.abs(height - lastHeight) > 1
          ) {
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

  return { containerRef, containerSize };
}

/**
 * 处理图表系列悬停状态的 Hook
 */
export function useSeriesHover() {
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

  const handleSeriesMouseEnter = useCallback((seriesKey: string) => {
    setHoveredSeries(seriesKey);
  }, []);

  const handleSeriesMouseLeave = useCallback(() => {
    setHoveredSeries(null);
  }, []);

  const getOpacity = useCallback(
    (seriesKey: string) => {
      if (hoveredSeries === null) return 1;
      return hoveredSeries === seriesKey ? 1 : 0.15;
    },
    [hoveredSeries]
  );

  return {
    hoveredSeries,
    handleSeriesMouseEnter,
    handleSeriesMouseLeave,
    getOpacity,
  };
}
