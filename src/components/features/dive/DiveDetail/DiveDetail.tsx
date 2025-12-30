import { useState, memo, useCallback } from 'react';
import { Database } from 'lucide-react';
import { useSelectedDive, getFreeDivePBId, useFilteredDives } from '@/hooks';
import { useDiveStore } from '@/store';
import { DiveChart } from '../DiveChart';
import { DiveStats } from '../DiveStats';
import { ResizablePanels } from '@/components/layout';
import { TabButton } from '@/components/common';
import { uiLabels } from '@/constants';
import { formatDepth, formatDurationReadable, formatTimeForChart } from '@/utils';
import type { ViewMode, Dive, DiveProfilePoint } from '@/types';

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 格式化数字，保留1位小数
 */
function fmt(value: number | undefined | null, unit = ''): string {
  if (value === undefined || value === null) return '-';
  const formatted = Number.isInteger(value) ? value.toString() : value.toFixed(1);
  return unit ? `${formatted}${unit}` : formatted;
}

// ============================================================================
// 基础 UI 组件
// ============================================================================

/**
 * 空状态组件
 */
const EmptyState = memo(function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full bg-zinc-900 text-zinc-500">
      <Database className="w-12 h-12 mr-3 opacity-50" />
      <span className="text-lg">{uiLabels.emptyState}</span>
    </div>
  );
});

/**
 * 信息卡片
 */
const InfoCard = memo(function InfoCard({
  label,
  value,
  highlight,
  className = '',
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-zinc-500 uppercase tracking-wider">{label}</span>
      <span className={`text-base font-medium ${highlight ? 'text-amber-500' : 'text-zinc-200'} ${className}`}>
        {value}
      </span>
    </div>
  );
});

/**
 * Section 分组
 */
const Section = memo(function Section({
  title,
  children,
  className = '',
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {title && (
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-700/50 pb-1">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
});

// ============================================================================
// Tab 内容组件
// ============================================================================

type TabId = 'dive' | 'computer' | 'cursor';

/**
 * Dive Tab - 潜水核心信息
 */
const DiveTab = memo(function DiveTab({
  dive,
  env,
  deco,
  gear,
  gases,
  diveSettings,
  isPB,
}: {
  dive: Dive;
  env: Dive['environment'];
  deco: NonNullable<Dive['computerInfo']>['deco'];
  gear: Dive['gear'];
  gases: Dive['gases'];
  diveSettings: NonNullable<Dive['computerInfo']>['dive'];
  isPB: boolean;
}) {
  return (
    <div className="grid grid-cols-12 gap-4">
      {/* 主要信息 */}
      <div className="col-span-6 space-y-4">
        {/* 核心数据 */}
        <Section>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800/60 rounded-lg p-3 text-center">
              <div className="text-xs text-zinc-500 uppercase">{uiLabels.maxDepth}</div>
              <div className="text-xl font-bold text-amber-500 flex items-center justify-center gap-1">
                {isPB && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-400">
                    PB
                  </span>
                )}
                {formatDepth(dive.maxDepth)}
              </div>
            </div>
            <div className="bg-zinc-800/60 rounded-lg p-3 text-center">
              <div className="text-xs text-zinc-500 uppercase">{uiLabels.duration}</div>
              <div className="text-xl font-bold text-green-400">{formatDurationReadable(dive.duration)}</div>
            </div>
          </div>
        </Section>

        {/* 潜水信息 */}
        <Section title={uiLabels.sectionDiveInfo}>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.diveNumber} value={dive.diveNumber} />
            <div className="flex flex-col">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">{uiLabels.type}</span>
              <span className={`inline-block w-fit px-1.5 py-0.5 rounded text-base font-medium ${
                dive.diveType === 'CC/BO' ? 'bg-purple-900/50 text-purple-300' :
                dive.diveType === 'OC Tec' ? 'bg-red-900/50 text-red-300' :
                dive.diveType.startsWith('OC Rec') ? 'bg-blue-900/50 text-blue-300' :
                dive.diveType === 'FreeDive' ? 'bg-teal-900/50 text-teal-300' :
                dive.diveType === 'Avelo' ? 'bg-green-900/50 text-green-300' :
                'bg-zinc-700 text-zinc-300'
              }`}>
                {dive.diveType}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.avgDepth} value={formatDepth(dive.avgDepth)} />
            <InfoCard label={uiLabels.date} value={`${dive.date} ${dive.startTime} - ${dive.endTime}`} />
          </div>
          {dive.ascentRateStats && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">{uiLabels.maxAscent}</span>
                  <span className="text-base font-medium" style={{ color: '#22c55e' }}>{Math.abs(dive.ascentRateStats.maxAscent).toFixed(2)} m/s</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">{uiLabels.maxDescent}</span>
                  <span className="text-base font-medium" style={{ color: '#ef4444' }}>{Math.abs(dive.ascentRateStats.maxDescent).toFixed(2)} m/s</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">{uiLabels.avgAscent}</span>
                  <span className="text-base font-medium" style={{ color: '#22c55e' }}>{Math.abs(dive.ascentRateStats.avgAscent).toFixed(2)} m/s</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">{uiLabels.avgDescent}</span>
                  <span className="text-base font-medium" style={{ color: '#ef4444' }}>{Math.abs(dive.ascentRateStats.avgDescent).toFixed(2)} m/s</span>
                </div>
              </div>
            </>
          )}
        </Section>

        {/* 地点与潜伴 */}
        <Section title={uiLabels.sectionLocationBuddy}>
          <InfoCard label={uiLabels.site} value={dive.site} highlight />
          {dive.site !== dive.location && (
            <InfoCard label={uiLabels.location} value={dive.location} />
          )}
          <InfoCard label={uiLabels.buddy} value={dive.buddy || '-'} />
        </Section>
      </div>

      {/* 环境与气体装备 */}
      <div className="col-span-6 space-y-4">
        {/* 环境 */}
        <Section title={uiLabels.sectionEnvironment}>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.minTemp} value={fmt(env?.minTemp, '°C')} />
            <InfoCard label={uiLabels.maxTemp} value={fmt(env?.maxTemp, '°C')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.avgTemp} value={fmt(env?.avgTemp, '°C')} />
            <InfoCard label={uiLabels.surfacePressure} value={fmt(env?.surfacePressure, ' mBar')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.salinity} value={diveSettings?.salinitySetting || '-'} />
            <InfoCard label={uiLabels.surfaceInterval} value={diveSettings?.surfaceInterval || '-'} />
          </div>
        </Section>

        {/* 减压信息 */}
        <Section title={uiLabels.sectionDecompression}>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.model} value={deco?.decoModel || '-'} />
            <InfoCard label={uiLabels.gfSetting} value={deco?.conservatism || '-'} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.cnsStart} value={fmt(deco?.cnsStart, '%')} />
            <InfoCard label={uiLabels.cnsEnd} value={fmt(deco?.cnsEnd, '%')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.gf99Max} value={fmt(deco?.endSurfaceGF, '%')} />
            <InfoCard label={uiLabels.surfaceGFEnd} value={fmt(deco?.endSurfaceGF, '%')} />
          </div>
        </Section>

        {/* 气体 */}
        {gases && gases.length > 0 && (
          <Section title={uiLabels.sectionGases}>
            <div className="space-y-1">
              {gases.map((gas, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <span className="px-1.5 py-0.5 bg-zinc-700 rounded text-zinc-300">
                    {gas.name || `Gas ${idx + 1}`}
                  </span>
                  <span className="text-zinc-400">
                    O₂: {fmt(gas.o2)}% {(gas.he ?? 0) > 0 && `He: ${fmt(gas.he)}%`}
                  </span>
                  {gas.startPressure && (
                    <span className="text-zinc-500">
                      {fmt(gas.startPressure)} → {fmt(gas.endPressure) || '?'} bar
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 装备 */}
        {gear && (
          <Section title={uiLabels.sectionGear}>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {gear.dress && <InfoCard label={uiLabels.dress} value={gear.dress} />}
              {gear.weight && <InfoCard label={uiLabels.weight} value={fmt(gear.weight, ' kg')} />}
              {gear.tankSize && <InfoCard label={uiLabels.tank} value={gear.tankSize} />}
            </div>
          </Section>
        )}

        {/* 标签 */}
        {dive.tags && dive.tags.length > 0 && (
          <Section title={uiLabels.sectionTags}>
            <div className="flex flex-wrap gap-1">
              {dive.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-purple-900/40 text-purple-300 rounded text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
});

/**
 * Cursor Tab - 显示图表上鼠标位置的数据
 */
const CursorTab = memo(function CursorTab({
  cursorData,
}: {
  cursorData: DiveProfilePoint | null;
}) {
  if (!cursorData) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        <span>Hover over the chart to see data</span>
      </div>
    );
  }

  // 获取所有有值的数据项
  const dataItems: { key: string; label: string; value: string; color: string; unit: string }[] = [];
  
  // 遍历所有可能的数据系列
  const seriesMap: Record<string, { label: string; color: string; unit: string; decimals: number }> = {
    depth: { label: 'Depth', color: '#f59e0b', unit: 'm', decimals: 1 },
    temperature: { label: 'Temperature', color: '#06b6d4', unit: '°C', decimals: 1 },
    ascentRate: { label: 'Ascent Rate', color: '#22c55e', unit: 'm/s', decimals: 2 },
    ndl: { label: 'NDL', color: '#10b981', unit: 'min', decimals: 0 },
    gf99: { label: 'GF99', color: '#8b5cf6', unit: '%', decimals: 0 },
    cns: { label: 'CNS', color: '#ec4899', unit: '%', decimals: 0 },
    gasDensity: { label: 'Gas Density', color: '#14b8a6', unit: 'g/L', decimals: 2 },
    ppO2: { label: 'ppO₂', color: '#3b82f6', unit: 'ATA', decimals: 2 },
    ppHe: { label: 'ppHe', color: '#a855f7', unit: 'ATA', decimals: 2 },
    ppN2: { label: 'ppN₂', color: '#6366f1', unit: 'ATA', decimals: 2 },
    tank1Pressure: { label: 'Tank 1', color: '#ef4444', unit: 'Bar', decimals: 0 },
    tank2Pressure: { label: 'Tank 2', color: '#f97316', unit: 'Bar', decimals: 0 },
    sac: { label: 'SAC', color: '#84cc16', unit: 'L/min', decimals: 1 },
    deco: { label: 'Deco', color: '#f43f5e', unit: 'min', decimals: 0 },
    tts: { label: 'TTS', color: '#fb923c', unit: 'min', decimals: 0 },
  };

  Object.entries(seriesMap).forEach(([key, config]) => {
    const value = cursorData[key as keyof DiveProfilePoint];
    if (value !== undefined && value !== null && typeof value === 'number') {
      dataItems.push({
        key,
        label: config.label,
        value: value.toFixed(config.decimals),
        color: config.color,
        unit: config.unit,
      });
    }
  });

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

      {/* 数据网格 - 使用与其他 tab 相同的 InfoCard 样式 */}
      <div className="col-span-6 space-y-4">
        <Section title="Depth & Environment">
          <div className="grid grid-cols-2 gap-3">
            {dataItems.filter(d => ['depth', 'temperature', 'ascentRate'].includes(d.key)).map(({ key, label, value, color, unit }) => (
              <div key={key} className="flex flex-col">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">{label}</span>
                <span className="text-base font-medium" style={{ color }}>
                  {value} {unit}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Decompression">
          <div className="grid grid-cols-2 gap-3">
            {dataItems.filter(d => ['ndl', 'gf99', 'cns', 'deco', 'tts'].includes(d.key)).map(({ key, label, value, color, unit }) => (
              <div key={key} className="flex flex-col">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">{label}</span>
                <span className="text-base font-medium" style={{ color }}>
                  {value} {unit}
                </span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div className="col-span-6 space-y-4">
        <Section title="Gas & Pressure">
          <div className="grid grid-cols-2 gap-3">
            {dataItems.filter(d => ['ppO2', 'ppN2', 'ppHe', 'gasDensity'].includes(d.key)).map(({ key, label, value, color, unit }) => (
              <div key={key} className="flex flex-col">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">{label}</span>
                <span className="text-base font-medium" style={{ color }}>
                  {value} {unit}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Tank & Consumption">
          <div className="grid grid-cols-2 gap-3">
            {dataItems.filter(d => ['tank1Pressure', 'tank2Pressure', 'sac'].includes(d.key)).map(({ key, label, value, color, unit }) => (
              <div key={key} className="flex flex-col">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">{label}</span>
                <span className="text-base font-medium" style={{ color }}>
                  {value} {unit}
                </span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
});

/**
 * Computer Tab - 电脑与设置信息
 */
const ComputerTab = memo(function ComputerTab({
  dive,
  computerInfo,
  battery,
  diveSettings,
  deco,
}: {
  dive: Dive;
  computerInfo: Dive['computerInfo'];
  battery: NonNullable<Dive['computerInfo']>['battery'];
  diveSettings: NonNullable<Dive['computerInfo']>['dive'];
  deco: NonNullable<Dive['computerInfo']>['deco'];
}) {
  return (
    <div className="grid grid-cols-12 gap-4">
      {/* 电脑与数据格式 */}
      <div className="col-span-6 space-y-4">
        <Section title={uiLabels.sectionComputer}>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.model} value={dive.diveComputer.model} />
            <InfoCard label={uiLabels.serial} value={dive.diveComputer.serial || '-'} />
          </div>
          <InfoCard label={uiLabels.firmware} value={computerInfo?.firmwareVersion || '-'} />
        </Section>

        <Section title={uiLabels.sectionDataFormat}>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.format} value={computerInfo?.dataFormat || '-'} />
            <InfoCard label={uiLabels.logVersion} value={computerInfo?.logVersion || '-'} />
          </div>
          <InfoCard label={uiLabels.dbVersion} value={computerInfo?.dbVersion || '-'} />
        </Section>

        <Section title={uiLabels.sectionBattery}>
          <InfoCard label={uiLabels.type} value={battery?.type || '-'} />
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.voltageStart} value={fmt(battery?.vStart, 'V')} />
            <InfoCard label={uiLabels.voltageEnd} value={fmt(battery?.vEnd, 'V')} />
          </div>
        </Section>
      </div>

      {/* 潜水设置与减压 */}
      <div className="col-span-6 space-y-4">
        <Section title={uiLabels.sectionDiveSettings}>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.mode} value={diveSettings?.mode || '-'} />
            <InfoCard label={uiLabels.sampleRate} value={diveSettings?.sampleRate ? `${diveSettings.sampleRate}s` : '-'} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.salinity} value={diveSettings?.salinitySetting || '-'} />
            <InfoCard label={uiLabels.surfaceInterval} value={diveSettings?.surfaceInterval || '-'} />
          </div>
          <InfoCard label={uiLabels.surfacePressure} value={fmt(diveSettings?.surfacePressure, ' mBar')} />
        </Section>

        <Section title={uiLabels.sectionDecoSettings}>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.decoModel} value={deco?.decoModel || '-'} />
            <InfoCard label={uiLabels.gfSetting} value={deco?.conservatism || '-'} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.cnsStart} value={fmt(deco?.cnsStart, '%')} />
            <InfoCard label={uiLabels.cnsEnd} value={fmt(deco?.cnsEnd, '%')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.gf99Max} value={fmt(deco?.endSurfaceGF, '%')} />
            <InfoCard label={uiLabels.surfaceGFEnd} value={fmt(deco?.endSurfaceGF, '%')} />
          </div>
        </Section>
      </div>
    </div>
  );
});

// ============================================================================
// 详情内容组件
// ============================================================================

/**
 * 详情内容 - 带有三个Tab的潜水信息
 */
const DetailContent = memo(function DetailContent({ 
  dive, 
  cursorData 
}: { 
  dive: Dive; 
  cursorData: DiveProfilePoint | null;
}) {
  const [activeTab, setActiveTab] = useState<TabId>('dive');
  
  const env = dive.environment;
  const deco = dive.computerInfo?.deco;
  const gear = dive.gear;
  const gases = dive.gases;
  const computerInfo = dive.computerInfo;
  const diveSettings = computerInfo?.dive;
  const battery = computerInfo?.battery;
  
  // 检查是否是 FreeDive PB
  const freeDivePBId = getFreeDivePBId(useDiveStore.getState().dives);
  const isPB = dive.diveType === 'FreeDive' && dive.id === freeDivePBId;

  return (
    <div className="h-full flex flex-col bg-zinc-900">
      {/* Tab 导航 */}
      <div className="flex border-b border-zinc-700 flex-shrink-0">
        <TabButton active={activeTab === 'dive'} onClick={() => setActiveTab('dive')}>
          {uiLabels.diveSummary}
        </TabButton>
        <TabButton active={activeTab === 'computer'} onClick={() => setActiveTab('computer')}>
          {uiLabels.computer}
        </TabButton>
        <TabButton active={activeTab === 'cursor'} onClick={() => setActiveTab('cursor')}>
          Cursor
        </TabButton>
      </div>

      {/* Tab 内容 */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'dive' && (
          <DiveTab 
            dive={dive} 
            env={env} 
            deco={deco} 
            gear={gear} 
            gases={gases} 
            diveSettings={diveSettings}
            isPB={isPB} 
          />
        )}
        {activeTab === 'computer' && (
          <ComputerTab 
            dive={dive} 
            computerInfo={computerInfo} 
            battery={battery} 
            diveSettings={diveSettings}
            deco={deco}
          />
        )}
        {activeTab === 'cursor' && (
          <CursorTab cursorData={cursorData} />
        )}
      </div>
    </div>
  );
});

// ============================================================================
// 主组件
// ============================================================================

/**
 * 潜水详情主组件
 */
export function DiveDetail() {
  const dive = useSelectedDive();
  const filteredDives = useFilteredDives();
  const [viewMode, setViewMode] = useState<ViewMode>('graph');
  const [cursorData, setCursorData] = useState<DiveProfilePoint | null>(null);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);
  
  const handleCursorChange = useCallback((data: DiveProfilePoint | null) => {
    setCursorData(data);
  }, []);

  if (!dive) {
    return <EmptyState />;
  }

  // 图表区域内容
  const chartContent = (
    <div className="flex flex-col h-full bg-zinc-900">
      {/* Header Tabs - Graph / Stats */}
      <div className="flex border-b border-zinc-700 flex-shrink-0">
        <TabButton
          active={viewMode === 'graph'}
          onClick={() => handleViewModeChange('graph')}
        >
          {uiLabels.graph}
        </TabButton>
        <TabButton
          active={viewMode === 'stats'}
          onClick={() => handleViewModeChange('stats')}
        >
          {uiLabels.stats}
        </TabButton>
      </div>

      {/* Chart Area */}
      <div className="flex-1 min-h-0">
        {viewMode === 'graph' ? (
          <DiveChart 
            profile={dive.profile} 
            maxDepth={dive.maxDepth} 
            diveType={dive.diveType}
            onCursorChange={handleCursorChange}
          />
        ) : (
          <DiveStats dives={filteredDives} />
        )}
      </div>
    </div>
  );

  return (
    <ResizablePanels
      direction="vertical"
      panels={[
        {
          content: chartContent,
          minSize: 150,
          defaultSize: 45,
        },
        {
          content: <DetailContent dive={dive} cursorData={cursorData} />,
          minSize: 100,
          defaultSize: 55,
        },
      ]}
    />
  );
}
