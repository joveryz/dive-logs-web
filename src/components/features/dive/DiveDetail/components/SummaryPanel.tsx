import { memo, useState } from 'react';
import { Dive } from '@/types';
import { formatDepth, formatDurationReadable } from '@/utils';
import { getFreeDivePBId } from '@/hooks';
import { useDiveStore } from '@/store';

interface SummaryPanelProps {
  dive: Dive;
}

/**
 * 格式化数字，保留1位小数
 */
function fmt(value: number | undefined | null, unit = ''): string {
  if (value === undefined || value === null) return '-';
  const formatted = Number.isInteger(value) ? value.toString() : value.toFixed(1);
  return unit ? `${formatted}${unit}` : formatted;
}

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

type TabId = 'dive' | 'computer';

/**
 * Tab 按钮 - 与 Chart Tab 风格一致
 */
const TabButton = memo(function TabButton({
  id,
  label,
  active,
  onClick,
}: {
  id: TabId;
  label: string;
  active: boolean;
  onClick: (id: TabId) => void;
}) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-2 text-sm font-medium transition-colors ${
        active
          ? 'bg-cyan-600 text-white'
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );
});

/**
 * Summary Panel - 带有两个Tab的潜水信息面板
 */
export const SummaryPanel = memo(function SummaryPanel({ dive }: SummaryPanelProps) {
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
    <div className="h-full flex flex-col">
      {/* Tab 导航 - 与 Chart 风格一致 */}
      <div className="flex border-b border-gray-700 flex-shrink-0">
        <TabButton id="dive" label="Dive Summary" active={activeTab === 'dive'} onClick={setActiveTab} />
        <TabButton id="computer" label="Computer & Settings" active={activeTab === 'computer'} onClick={setActiveTab} />
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
              <div className="text-xs text-gray-500 uppercase">Max Depth</div>
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
              <div className="text-xs text-gray-500 uppercase">Duration</div>
              <div className="text-xl font-bold text-green-400">{formatDurationReadable(dive.duration)}</div>
            </div>
          </div>
        </Section>

        {/* 潜水信息 */}
        <Section title="Dive Info">
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="Dive #" value={dive.diveNumber} />
            <InfoCard label="Type" value={dive.diveType} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="Avg Depth" value={formatDepth(dive.avgDepth)} />
            <InfoCard label="Date" value={dive.date} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="Time" value={`${dive.startTime} - ${dive.endTime}`} />
          </div>
        </Section>

        {/* 地点与潜伴 */}
        <Section title="Location & Buddy">
          <InfoCard label="Site" value={dive.site} highlight />
          {dive.site !== dive.location && (
            <InfoCard label="Location" value={dive.location} />
          )}
          <InfoCard label="Buddy" value={dive.buddy || '-'} />
        </Section>
      </div>

      {/* 环境与气体装备 */}
      <div className="col-span-6 space-y-4">
        {/* 环境 */}
        <Section title="Environment">
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="Min Temp" value={fmt(env?.minTemp, '°C')} />
            <InfoCard label="Max Temp" value={fmt(env?.maxTemp, '°C')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="Avg Temp" value={fmt(env?.avgTemp, '°C')} />
            <InfoCard label="Surface Pressure" value={fmt(env?.surfacePressure, ' mBar')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="Salinity" value={diveSettings?.salinitySetting || '-'} />
            <InfoCard label="Surface Interval" value={diveSettings?.surfaceInterval || '-'} />
          </div>
        </Section>

        {/* 减压信息 */}
        <Section title="Decompression">
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="Model" value={deco?.decoModel || '-'} />
            <InfoCard label="GF Setting" value={deco?.conservatism || '-'} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="CNS Start" value={fmt(deco?.cnsStart, '%')} />
            <InfoCard label="CNS End" value={fmt(deco?.cnsEnd, '%')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="GF99 Max" value={fmt(deco?.endSurfaceGF, '%')} />
            <InfoCard label="SurGF End" value={fmt(deco?.endSurfaceGF, '%')} />
          </div>
        </Section>

        {/* 气体 */}
        {gases && gases.length > 0 && (
          <Section title="Gases">
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
          <Section title="Gear">
            <div className="grid grid-cols-3 gap-3 text-sm">
              {gear.dress && <InfoCard label="Dress" value={gear.dress} />}
              {gear.weight && <InfoCard label="Weight" value={fmt(gear.weight, ' kg')} />}
              {gear.tankSize && <InfoCard label="Tank" value={gear.tankSize} />}
            </div>
          </Section>
        )}

        {/* 标签 */}
        {dive.tags && dive.tags.length > 0 && (
          <Section title="Tags">
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
        <Section title="Computer">
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="Model" value={dive.diveComputer.model} />
            <InfoCard label="Serial" value={dive.diveComputer.serial || '-'} />
          </div>
          <InfoCard label="Firmware" value={computerInfo?.firmwareVersion || '-'} />
        </Section>

        <Section title="Data Format">
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="Format" value={computerInfo?.dataFormat || '-'} />
            <InfoCard label="Log Version" value={computerInfo?.logVersion || '-'} />
          </div>
          <InfoCard label="DB Version" value={computerInfo?.dbVersion || '-'} />
        </Section>

        <Section title="Battery">
          <InfoCard label="Type" value={battery?.type || '-'} />
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="Voltage Start" value={fmt(battery?.vStart, 'V')} />
            <InfoCard label="Voltage End" value={fmt(battery?.vEnd, 'V')} />
          </div>
        </Section>
      </div>

      {/* 潜水设置与减压 */}
      <div className="col-span-6 space-y-4">
        <Section title="Dive Settings">
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="Mode" value={diveSettings?.mode || '-'} />
            <InfoCard label="Sample Rate" value={diveSettings?.sampleRate ? `${diveSettings.sampleRate}s` : '-'} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="Salinity" value={diveSettings?.salinitySetting || '-'} />
            <InfoCard label="Surface Interval" value={diveSettings?.surfaceInterval || '-'} />
          </div>
          <InfoCard label="Surface Pressure" value={fmt(diveSettings?.surfacePressure, ' mBar')} />
        </Section>

        <Section title="Decompression Settings">
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="Deco Model" value={deco?.decoModel || '-'} />
            <InfoCard label="GF Setting" value={deco?.conservatism || '-'} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="CNS Start" value={fmt(deco?.cnsStart, '%')} />
            <InfoCard label="CNS End" value={fmt(deco?.cnsEnd, '%')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="GF99 Max" value={fmt(deco?.endSurfaceGF, '%')} />
            <InfoCard label="SurGF End" value={fmt(deco?.endSurfaceGF, '%')} />
          </div>
        </Section>
      </div>
    </div>
  );
});
