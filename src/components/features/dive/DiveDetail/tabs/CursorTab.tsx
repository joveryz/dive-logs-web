import { memo } from 'react';
import { Section } from '@/components/common';
import { formatTimeForChart } from '@/utils';
import type { DiveProfilePoint } from '@/types';

/**
 * 游标数据显示配置 - 定义各个数据点的显示样式
 */
const CURSOR_DATA_DISPLAY_CONFIG: Record<string, { 
  label: string; 
  color: string; 
  unit: string; 
  decimals: number;
  group: 'environment' | 'decompression' | 'gas' | 'tank';
}> = {
  depth: { label: 'Depth', color: '#f59e0b', unit: 'm', decimals: 1, group: 'environment' },
  temperature: { label: 'Temperature', color: '#06b6d4', unit: '°C', decimals: 1, group: 'environment' },
  ascentRate: { label: 'Ascent Rate', color: '#22c55e', unit: 'm/s', decimals: 2, group: 'environment' },
  ndl: { label: 'NDL', color: '#10b981', unit: 'min', decimals: 0, group: 'decompression' },
  gf99: { label: 'GF99', color: '#8b5cf6', unit: '%', decimals: 0, group: 'decompression' },
  cns: { label: 'CNS', color: '#ec4899', unit: '%', decimals: 0, group: 'decompression' },
  deco: { label: 'Deco', color: '#f43f5e', unit: 'min', decimals: 0, group: 'decompression' },
  tts: { label: 'TTS', color: '#fb923c', unit: 'min', decimals: 0, group: 'decompression' },
  gasDensity: { label: 'Gas Density', color: '#14b8a6', unit: 'g/L', decimals: 2, group: 'gas' },
  ppO2: { label: 'ppO₂', color: '#3b82f6', unit: 'ATA', decimals: 2, group: 'gas' },
  ppHe: { label: 'ppHe', color: '#a855f7', unit: 'ATA', decimals: 2, group: 'gas' },
  ppN2: { label: 'ppN₂', color: '#6366f1', unit: 'ATA', decimals: 2, group: 'gas' },
  tank1Pressure: { label: 'Tank 1', color: '#ef4444', unit: 'Bar', decimals: 0, group: 'tank' },
  tank2Pressure: { label: 'Tank 2', color: '#f97316', unit: 'Bar', decimals: 0, group: 'tank' },
  sac: { label: 'SAC', color: '#84cc16', unit: 'L/min', decimals: 1, group: 'tank' },
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
        value: value.toFixed(config.decimals),
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
      <span className="text-xs text-zinc-500 uppercase tracking-wider">{item.label}</span>
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
      <div className="flex items-center justify-center h-full text-zinc-500">
        <span>Hover over the chart to see data</span>
      </div>
    );
  }

  const dataItems = extractDisplayableDataItems(cursorData);
  
  // 按指定键过滤数据项
  const filterItemsByKeys = (keys: string[]) => 
    dataItems.filter(item => keys.includes(item.key));

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* 时间显示 - 横跨整行 */}
      <div className="col-span-12">
        <Section>
          <div className="bg-zinc-800/60 rounded-lg p-3 text-center">
            <div className="text-xs text-zinc-500 uppercase">Time</div>
            <div className="text-xl font-bold text-amber-500">
              {formatTimeForChart(cursorData.time)}
            </div>
          </div>
        </Section>
      </div>

      {/* 左侧数据 */}
      <div className="col-span-6 space-y-4">
        <Section title="Depth & Environment">
          <div className="grid grid-cols-2 gap-3">
            {filterItemsByKeys(['depth', 'temperature', 'ascentRate']).map(item => (
              <DataValue key={item.key} item={item} />
            ))}
          </div>
        </Section>

        <Section title="Decompression">
          <div className="grid grid-cols-2 gap-3">
            {filterItemsByKeys(['ndl', 'gf99', 'cns', 'deco', 'tts']).map(item => (
              <DataValue key={item.key} item={item} />
            ))}
          </div>
        </Section>
      </div>

      {/* 右侧数据 */}
      <div className="col-span-6 space-y-4">
        <Section title="Gas & Pressure">
          <div className="grid grid-cols-2 gap-3">
            {filterItemsByKeys(['ppO2', 'ppN2', 'ppHe', 'gasDensity']).map(item => (
              <DataValue key={item.key} item={item} />
            ))}
          </div>
        </Section>

        <Section title="Tank & Consumption">
          <div className="grid grid-cols-2 gap-3">
            {filterItemsByKeys(['tank1Pressure', 'tank2Pressure', 'sac']).map(item => (
              <DataValue key={item.key} item={item} />
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
});
