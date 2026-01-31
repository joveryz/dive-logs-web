import { memo } from 'react';
import { Section } from '@/components/common';
import { uiLabels } from '@/constants';
import { formatTimeForChart, formatNumber } from '@/utils';
import type { DiveProfilePoint } from '@/types';

/**
 * 游标数据显示配置 - 定义各个数据点的显示样式
 */
const CURSOR_DATA_DISPLAY_CONFIG: Record<string, { 
  label: string; 
  color: string; 
  unit: string;
  group: 'environment' | 'decompression' | 'gas' | 'tank';
}> = {
  depth: { label: 'Depth', color: '#f59e0b', unit: 'm', group: 'environment' },
  temperature: { label: 'Temperature', color: '#06b6d4', unit: '°C', group: 'environment' },
  heartRate: { label: 'Heart Rate', color: '#f472b6', unit: 'bpm', group: 'environment' },
  ascentRate: { label: 'Ascent Rate', color: '#22c55e', unit: 'm/s', group: 'environment' },
  ndl: { label: 'NDL', color: '#10b981', unit: 'min', group: 'decompression' },
  gf99: { label: 'GF99', color: '#8b5cf6', unit: '%', group: 'decompression' },
  cns: { label: 'CNS', color: '#ec4899', unit: '%', group: 'decompression' },
  deco: { label: 'Deco', color: '#f43f5e', unit: 'min', group: 'decompression' },
  tts: { label: 'TTS', color: '#fb923c', unit: 'min', group: 'decompression' },
  ceiling: { label: 'Ceiling', color: '#f97316', unit: 'm', group: 'decompression' },
  gasDensity: { label: 'Gas Density', color: '#14b8a6', unit: 'g/L', group: 'gas' },
  ppO2: { label: 'ppO₂', color: '#3b82f6', unit: 'ATA', group: 'gas' },
  ppHe: { label: 'ppHe', color: '#a855f7', unit: 'ATA', group: 'gas' },
  ppN2: { label: 'ppN₂', color: '#6366f1', unit: 'ATA', group: 'gas' },
  tank1Pressure: { label: 'Tank 1', color: '#ef4444', unit: 'Bar', group: 'tank' },
  tank2Pressure: { label: 'Tank 2', color: '#f97316', unit: 'Bar', group: 'tank' },
  tank3Pressure: { label: 'Tank 3', color: '#eab308', unit: 'Bar', group: 'tank' },
  tank4Pressure: { label: 'Tank 4', color: '#84cc16', unit: 'Bar', group: 'tank' },
  sac: { label: 'SAC', color: '#84cc16', unit: 'bar/min', group: 'tank' },
};

interface DataItem {
  key: string;
  label: string;
  value: string;
  color: string;
  unit: string;
}

/**
 * 从游标数据中提取可显示的数据项
 */
function extractDisplayableDataItems(cursorData: DiveProfilePoint): DataItem[] {
  const items: DataItem[] = [];
  
  Object.entries(CURSOR_DATA_DISPLAY_CONFIG).forEach(([key, config]) => {
    const value = cursorData[key as keyof DiveProfilePoint];
    if (value !== undefined && value !== null && typeof value === 'number') {
      items.push({
        key,
        label: config.label,
        value: formatNumber(value, '', key),
        color: config.color,
        unit: config.unit,
      });
    }
  });
  
  return items;
}

/**
 * 数据值展示组件
 */
const DataValue = memo(function DataValue({ item }: { item: DataItem }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-dive-text-muted uppercase tracking-wider">{item.label}</span>
      <span className="text-base font-medium" style={{ color: item.color }}>
        {item.value} {item.unit}
      </span>
    </div>
  );
});

interface CursorTabProps {
  cursorData: DiveProfilePoint | null;
}

/**
 * Cursor Tab - 显示图表上鼠标/触摸位置的实时数据
 */
export const CursorTab = memo(function CursorTab({ cursorData }: CursorTabProps) {
  if (!cursorData) {
    return (
      <div className="flex items-center justify-center h-full text-dive-text-muted">
        <span>{uiLabels.cursorHint}</span>
      </div>
    );
  }

  const dataItems = extractDisplayableDataItems(cursorData);
  
  // 按指定键过滤数据项
  const filterItemsByKeys = (keys: string[]) => 
    dataItems.filter(item => keys.includes(item.key));

  return (
    <div className="space-y-4">
      {/* 时间显示 - 横跨整行 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-dive-card/60 rounded-lg p-3 text-center">
          <div className="text-xs text-dive-text-muted uppercase">Time</div>
          <div className="text-xl font-bold text-cyan-400">
            {formatTimeForChart(cursorData.time)}
          </div>
        </div>
        {filterItemsByKeys(['depth']).map(item => (
          <div key={item.key} className="bg-dive-card/60 rounded-lg p-3 text-center">
            <div className="text-xs text-dive-text-muted uppercase">{item.label}</div>
            <div className="text-xl font-bold" style={{ color: item.color }}>
              {item.value} {item.unit}
            </div>
          </div>
        ))}
        {filterItemsByKeys(['temperature']).map(item => (
          <div key={item.key} className="bg-dive-card/60 rounded-lg p-3 text-center">
            <div className="text-xs text-dive-text-muted uppercase">{item.label}</div>
            <div className="text-xl font-bold" style={{ color: item.color }}>
              {item.value} {item.unit}
            </div>
          </div>
        ))}
      </div>

      {/* 主要内容区域 - 响应式：窄屏单栏，宽屏双栏 */}
      <div className="grid grid-cols-1 tablet:grid-cols-12 gap-4">
        {/* 左侧数据 */}
        <div className="tablet:col-span-6 space-y-4">
          {filterItemsByKeys(['ascentRate', 'heartRate']).length > 0 && (
            <Section title="Environment">
              <div className="grid grid-cols-3 gap-3">
                {filterItemsByKeys(['ascentRate', 'heartRate']).map(item => (
                  <DataValue key={item.key} item={item} />
                ))}
              </div>
            </Section>
          )}

          {filterItemsByKeys(['ndl', 'gf99', 'cns', 'deco', 'tts', 'ceiling']).length > 0 && (
            <Section title="Decompression">
              <div className="grid grid-cols-3 gap-3">
                {filterItemsByKeys(['ndl', 'gf99', 'cns', 'deco', 'tts', 'ceiling']).map(item => (
                  <DataValue key={item.key} item={item} />
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* 右侧数据 */}
        <div className="tablet:col-span-6 space-y-4">
          {filterItemsByKeys(['ppO2', 'ppN2', 'ppHe', 'gasDensity']).length > 0 && (
            <Section title="Gas & Pressure">
              <div className="grid grid-cols-3 gap-3">
                {filterItemsByKeys(['ppO2', 'ppN2', 'ppHe', 'gasDensity']).map(item => (
                  <DataValue key={item.key} item={item} />
                ))}
              </div>
            </Section>
          )}

          {filterItemsByKeys(['tank1Pressure', 'tank2Pressure', 'tank3Pressure', 'tank4Pressure', 'sac']).length > 0 && (
            <Section title="Tank & Consumption">
              <div className="grid grid-cols-3 gap-3">
                {filterItemsByKeys(['tank1Pressure', 'tank2Pressure', 'tank3Pressure', 'tank4Pressure', 'sac']).map(item => (
                  <DataValue key={item.key} item={item} />
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
});
