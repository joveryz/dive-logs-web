/**
 * 图表数据 Hook - 统一入口
 * 组合多个模块化 hooks 提供完整的图表数据管理功能
 * @module hooks/useChartData
 */

import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import type { DiveProfilePoint, DiveType } from '@/types';
import type { ChartSeriesConfig } from '@/constants';
import { DEFAULT_CHART_SERIES } from '@/constants';
import { calculateDynamicRange, normalizeValue } from '@/utils/chart';
import {
  FREEDIVE_AVAILABLE_KEYS,
  FREEDIVE_DEFAULT_VISIBLE_KEYS,
  SCUBA_DEFAULT_VISIBLE_KEYS,
  CHART_SERIES_KEYS,
  type ChartSeriesKey,
} from '@/constants/chartKeys';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 带计算范围的系列配置
 */
export interface EffectiveSeriesConfig extends ChartSeriesConfig {
  minValue?: number;
  maxValue?: number;
  hasData?: boolean;
}

/**
 * 归一化后的图表数据点
 */
export type NormalizedChartData = Record<string, number>;

/**
 * 容器尺寸
 */
export interface ContainerSize {
  width: number;
  height: number;
}

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 获取默认可见系列
 */
function getDefaultVisibleKeys(diveType?: DiveType): readonly ChartSeriesKey[] {
  return diveType === 'FreeDive' ? FREEDIVE_DEFAULT_VISIBLE_KEYS : SCUBA_DEFAULT_VISIBLE_KEYS;
}

/**
 * 获取可用系列（legend 中显示的选项）
 */
function getAvailableSeries(diveType?: DiveType): ChartSeriesConfig[] {
  if (diveType === 'FreeDive') {
    return DEFAULT_CHART_SERIES.filter(s =>
      (FREEDIVE_AVAILABLE_KEYS as readonly string[]).includes(s.key)
    );
  }
  return DEFAULT_CHART_SERIES;
}

/**
 * 计算系列配置及数据范围
 */
function computeSeriesConfigs(
  profile: DiveProfilePoint[],
  availableSeries: ChartSeriesConfig[]
): EffectiveSeriesConfig[] {
  return availableSeries.map((config) => {
    if (config.key === CHART_SERIES_KEYS.DEPTH) {
      return { ...config, hasData: true };
    }

    const values = profile
      .map((p) => p[config.key as keyof DiveProfilePoint] as number | undefined)
      .filter((v): v is number => v !== undefined);

    const hasData = values.length > 0;
    const { min, max } = calculateDynamicRange(values, config.key);

    return { ...config, minValue: min, maxValue: max, hasData };
  });
}

/**
 * 归一化单个数据点
 */
function normalizeDataPoint(
  point: DiveProfilePoint,
  seriesConfigs: EffectiveSeriesConfig[]
): NormalizedChartData {
  const normalized: NormalizedChartData = {
    time: point.time,
    depth: point.depth,
  };

  for (const config of seriesConfigs) {
    if (config.key === CHART_SERIES_KEYS.DEPTH) continue;

    const value = point[config.key as keyof DiveProfilePoint] as number | undefined;
    if (value === undefined || config.minValue === undefined || config.maxValue === undefined) {
      continue;
    }

    if (config.key === CHART_SERIES_KEYS.ASCENT_RATE) {
      const maxAbs = config.maxValue;
      const scale = 45;
      normalized['ascentRate_up'] = value > 0 ? 50 + (value / maxAbs) * scale : 50;
      normalized['ascentRate_down'] = value < 0 ? 50 - (Math.abs(value) / maxAbs) * scale : 50;
      normalized[`${config.key}_normalized`] = 50;
    } else {
      normalized[`${config.key}_normalized`] = normalizeValue(value, config.minValue, config.maxValue);
    }

    normalized[config.key] = value;
  }

  return normalized;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * 图表数据处理主 Hook
 */
export function useChartData(profile: DiveProfilePoint[], diveType?: DiveType) {
  const availableSeries = useMemo(() => getAvailableSeries(diveType), [diveType]);
  const defaultVisibleKeys = useMemo(() => getDefaultVisibleKeys(diveType), [diveType]);

  // 初始化时使用默认可见系列
  const [visibilityOverrides, setVisibilityOverrides] = useState<Record<string, boolean>>(() => {
    const keys = getDefaultVisibleKeys(diveType);
    const overrides: Record<string, boolean> = {};
    DEFAULT_CHART_SERIES.forEach(s => {
      overrides[s.key] = (keys as readonly string[]).includes(s.key);
    });
    return overrides;
  });

  // 计算系列配置
  const seriesConfigs = useMemo<EffectiveSeriesConfig[]>(
    () => computeSeriesConfigs(profile, availableSeries),
    [profile, availableSeries]
  );

  // 合并可见性
  const effectiveSeriesConfigs = useMemo<EffectiveSeriesConfig[]>(
    () => seriesConfigs.map((config) => ({
      ...config,
      visible: visibilityOverrides[config.key] ?? config.visible,
    })),
    [seriesConfigs, visibilityOverrides]
  );

  // 归一化数据
  const chartData = useMemo<NormalizedChartData[]>(
    () => profile.map((point) => normalizeDataPoint(point, seriesConfigs)),
    [profile, seriesConfigs]
  );

  // 可见性操作
  const toggleSeriesVisibility = useCallback((key: string) => {
    setVisibilityOverrides((prev) => {
      const current = prev[key] ?? availableSeries.find((s) => s.key === key)?.visible ?? true;
      return { ...prev, [key]: !current };
    });
  }, [availableSeries]);

  const resetToDefault = useCallback(() => {
    setVisibilityOverrides(() => {
      const overrides: Record<string, boolean> = {};
      availableSeries.forEach((s) => {
        overrides[s.key] = (defaultVisibleKeys as readonly string[]).includes(s.key);
      });
      return overrides;
    });
  }, [availableSeries, defaultVisibleKeys]);

  const showAllSeries = useCallback(() => {
    setVisibilityOverrides(() => {
      const overrides: Record<string, boolean> = {};
      availableSeries.forEach((s) => { overrides[s.key] = true; });
      return overrides;
    });
  }, [availableSeries]);

  const hideAllSeries = useCallback(() => {
    setVisibilityOverrides(() => {
      const overrides: Record<string, boolean> = {};
      availableSeries.forEach((s) => { overrides[s.key] = false; });
      return overrides;
    });
  }, [availableSeries]);

  return {
    chartData,
    seriesConfigs: effectiveSeriesConfigs,
    toggleSeriesVisibility,
    resetToDefault,
    showAllSeries,
    hideAllSeries,
  };
}

/**
 * 容器尺寸监听 Hook
 * 支持屏幕旋转和 resize 事件
 */
export function useContainerSize(threshold: number = 1) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<ContainerSize>({ width: 0, height: 0 });
  const rafIdRef = useRef<number | null>(null);
  const lastSizeRef = useRef<ContainerSize>({ width: 0, height: 0 });

  // 更新尺寸的函数
  const updateSize = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const { clientWidth: width, clientHeight: height } = container;
    const { width: lastWidth, height: lastHeight } = lastSizeRef.current;
    
    if (Math.abs(width - lastWidth) > threshold || Math.abs(height - lastHeight) > threshold) {
      lastSizeRef.current = { width, height };
      setContainerSize({ width, height });
    }
  }, [threshold]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 初始化尺寸
    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(updateSize);
    });

    // 监听屏幕方向变化
    const mediaQuery = window.matchMedia('(orientation: portrait)');
    const handleOrientationChange = () => {
      // 延迟更新，等待布局稳定
      setTimeout(updateSize, 100);
      setTimeout(updateSize, 300);
    };
    mediaQuery.addEventListener('change', handleOrientationChange);

    // 监听 resize 事件作为后备
    window.addEventListener('resize', updateSize);

    resizeObserver.observe(container);
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      resizeObserver.disconnect();
      mediaQuery.removeEventListener('change', handleOrientationChange);
      window.removeEventListener('resize', updateSize);
    };
  }, [updateSize]);

  return { containerRef, containerSize };
}

/**
 * 系列悬停和选中状态 Hook
 * - hoveredSeries: 当前悬停的系列
 * - selectedSeries: 上次选中的系列（点击后保留，用于右侧Y轴显示）
 */
export function useSeriesHover() {
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<string | null>('ascentRate'); // 默认选中 ascentRate

  const handleSeriesMouseEnter = useCallback((seriesKey: string) => {
    setHoveredSeries(seriesKey);
  }, []);

  const handleSeriesMouseLeave = useCallback(() => {
    setHoveredSeries(null);
  }, []);

  // 点击选中某条线，用于保持右侧Y轴显示
  const handleSeriesClick = useCallback((seriesKey: string) => {
    setSelectedSeries(seriesKey);
  }, []);

  const getOpacity = useCallback(
    (seriesKey: string) => hoveredSeries === null ? 1 : (hoveredSeries === seriesKey ? 1 : 0.15),
    [hoveredSeries]
  );

  // 用于右侧Y轴显示的系列：优先显示悬停的，否则显示选中的
  const activeSeriesForYAxis = hoveredSeries || selectedSeries;

  return { 
    hoveredSeries, 
    selectedSeries,
    activeSeriesForYAxis,
    handleSeriesMouseEnter, 
    handleSeriesMouseLeave, 
    handleSeriesClick,
    getOpacity 
  };
}
