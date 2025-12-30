import { memo } from 'react';
import { InfoCard, Section, DiveTypeBadge } from '@/components/common';
import { uiLabels } from '@/constants';
import { formatDepth, formatDurationReadable, formatNumber } from '@/utils';
import type { Dive } from '@/types';

interface DiveTabProps {
  dive: Dive;
  isPB: boolean;
}

/**
 * Dive Tab - 潜水核心信息展示
 */
export const DiveTab = memo(function DiveTab({ dive, isPB }: DiveTabProps) {
  const env = dive.environment;
  const deco = dive.computerInfo?.deco;
  const gear = dive.gear;
  const gases = dive.gases;
  const diveSettings = dive.computerInfo?.dive;

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* 左侧：主要信息 */}
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
              <DiveTypeBadge diveType={dive.diveType} className="text-base w-fit" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.avgDepth} value={formatDepth(dive.avgDepth)} />
            <InfoCard label={uiLabels.date} value={`${dive.date} ${dive.startTime} - ${dive.endTime}`} />
          </div>
          
          {/* 升降速率统计 */}
          {dive.ascentRateStats && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <InfoCard 
                  label={uiLabels.maxAscent} 
                  value={`${Math.abs(dive.ascentRateStats.maxAscent).toFixed(2)} m/s`}
                  style={{ color: '#22c55e' }}
                />
                <InfoCard 
                  label={uiLabels.maxDescent} 
                  value={`${Math.abs(dive.ascentRateStats.maxDescent).toFixed(2)} m/s`}
                  style={{ color: '#ef4444' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InfoCard 
                  label={uiLabels.avgAscent} 
                  value={`${Math.abs(dive.ascentRateStats.avgAscent).toFixed(2)} m/s`}
                  style={{ color: '#22c55e' }}
                />
                <InfoCard 
                  label={uiLabels.avgDescent} 
                  value={`${Math.abs(dive.ascentRateStats.avgDescent).toFixed(2)} m/s`}
                  style={{ color: '#ef4444' }}
                />
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

      {/* 右侧：环境与气体装备 */}
      <div className="col-span-6 space-y-4">
        {/* 环境 */}
        <Section title={uiLabels.sectionEnvironment}>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.minTemp} value={formatNumber(env?.minTemp, '°C')} />
            <InfoCard label={uiLabels.maxTemp} value={formatNumber(env?.maxTemp, '°C')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.avgTemp} value={formatNumber(env?.avgTemp, '°C')} />
            <InfoCard label={uiLabels.surfacePressure} value={formatNumber(env?.surfacePressure, ' mBar')} />
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
            <InfoCard label={uiLabels.cnsStart} value={formatNumber(deco?.cnsStart, '%')} />
            <InfoCard label={uiLabels.cnsEnd} value={formatNumber(deco?.cnsEnd, '%')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.gf99Max} value={formatNumber(deco?.endSurfaceGF, '%')} />
            <InfoCard label={uiLabels.surfaceGFEnd} value={formatNumber(deco?.endSurfaceGF, '%')} />
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
                    O₂: {formatNumber(gas.o2)}% {(gas.he ?? 0) > 0 && `He: ${formatNumber(gas.he)}%`}
                  </span>
                  {gas.startPressure && (
                    <span className="text-zinc-500">
                      {formatNumber(gas.startPressure)} → {formatNumber(gas.endPressure) || '?'} bar
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
              {gear.weight && <InfoCard label={uiLabels.weight} value={formatNumber(gear.weight, ' kg')} />}
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
