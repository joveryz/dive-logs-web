import { useState, memo, useCallback } from 'react';
import { Database } from 'lucide-react';
import { useSelectedDive, getFreeDivePBId } from '@/hooks';
import { useDiveStore } from '@/store';
import { DiveChart } from '../DiveChart';
import { ResizablePanels } from '@/components/layout';
import { TabButton } from '@/components/common';
import { uiLabels } from '@/constants';
import { formatDepth, formatDurationReadable } from '@/utils';
import type { ViewMode, Dive } from '@/types';

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
    <div className="flex items-center justify-center h-full bg-gray-900 text-gray-500">
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
      <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
      <span className={`text-base font-medium ${highlight ? 'text-cyan-400' : 'text-gray-200'} ${className}`}>
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
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-700/50 pb-1">
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

type TabId = 'dive' | 'computer';

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
            <div className="bg-gray-800/60 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 uppercase">{uiLabels.maxDepth}</div>
              <div className="text-xl font-bold text-cyan-400 flex items-center justify-center gap-1">
                {isPB && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-400">
                    PB
                  </span>
                )}
                {formatDepth(dive.maxDepth)}
              </div>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 uppercase">{uiLabels.duration}</div>
              <div className="text-xl font-bold text-green-400">{formatDurationReadable(dive.duration)}</div>
            </div>
          </div>
        </Section>

        {/* 潜水信息 */}
        <Section title={uiLabels.sectionDiveInfo}>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.diveNumber} value={dive.diveNumber} />
            <InfoCard label={uiLabels.type} value={dive.diveType} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.avgDepth} value={formatDepth(dive.avgDepth)} />
            <InfoCard label={uiLabels.date} value={dive.date} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.time} value={`${dive.startTime} - ${dive.endTime}`} />
          </div>
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
                  <span className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">
                    {gas.name || `Gas ${idx + 1}`}
                  </span>
                  <span className="text-gray-400">
                    O₂: {fmt(gas.o2)}% {(gas.he ?? 0) > 0 && `He: ${fmt(gas.he)}%`}
                  </span>
                  {gas.startPressure && (
                    <span className="text-gray-500">
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
 * 详情内容 - 带有两个Tab的潜水信息
 */
const DetailContent = memo(function DetailContent({ dive }: { dive: Dive }) {
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
    <div className="h-full flex flex-col bg-gray-900">
      {/* Tab 导航 */}
      <div className="flex border-b border-gray-700 flex-shrink-0">
        <TabButton active={activeTab === 'dive'} onClick={() => setActiveTab('dive')}>
          {uiLabels.diveSummary}
        </TabButton>
        <TabButton active={activeTab === 'computer'} onClick={() => setActiveTab('computer')}>
          {uiLabels.computer}
        </TabButton>
      </div>

      {/* Tab 内容 */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'dive' ? (
          <DiveTab 
            dive={dive} 
            env={env} 
            deco={deco} 
            gear={gear} 
            gases={gases} 
            diveSettings={diveSettings}
            isPB={isPB} 
          />
        ) : (
          <ComputerTab 
            dive={dive} 
            computerInfo={computerInfo} 
            battery={battery} 
            diveSettings={diveSettings}
            deco={deco}
          />
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
  const [viewMode, setViewMode] = useState<ViewMode>('graph');

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  if (!dive) {
    return <EmptyState />;
  }

  // 图表区域内容
  const chartContent = (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header Tabs - Graph / Stats */}
      <div className="flex border-b border-gray-700 flex-shrink-0">
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
          <DiveChart profile={dive.profile} maxDepth={dive.maxDepth} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            {uiLabels.statsComingSoon}
          </div>
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
          content: <DetailContent dive={dive} />,
          minSize: 100,
          defaultSize: 55,
        },
      ]}
    />
  );
}
