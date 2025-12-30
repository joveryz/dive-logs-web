import { memo } from 'react';
import { InfoCard, Section, DiveTypeBadge } from '@/components/common';
import { uiLabels } from '@/constants';
import { formatDepth, formatDurationReadable, formatNumber } from '@/utils';
import type { Dive } from '@/types';

interface DiveTabProps {
  dive: Dive;
  /** 是否为个人最佳记录 (FreeDive) */
  isPersonalBest: boolean;
}

/**
 * Dive Tab - 潜水核心信息展示
 */
export const DiveTab = memo(function DiveTab({ dive, isPersonalBest }: DiveTabProps) {
  const environment = dive.environment;
  const decoSettings = dive.computerInfo?.deco;
  const gearInfo = dive.gear;
  const gasConfigs = dive.gases;
  const computerDiveSettings = dive.computerInfo?.dive;

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* 左侧：主要信息 */}
      <div className="col-span-6 space-y-4">
        {/* 核心数据 */}
        <Section>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-dive-card/60 rounded-lg p-3 text-center">
              <div className="text-xs text-dive-text-muted uppercase">{uiLabels.maxDepth}</div>
              <div className="text-xl font-bold text-cyan-400 flex items-center justify-center gap-1">
                {isPersonalBest && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-400">
                    PB
                  </span>
                )}
                {formatDepth(dive.maxDepth)}
              </div>
            </div>
            <div className="bg-dive-card/60 rounded-lg p-3 text-center">
              <div className="text-xs text-dive-text-muted uppercase">{uiLabels.duration}</div>
              <div className="text-xl font-bold text-green-400">{formatDurationReadable(dive.duration)}</div>
            </div>
          </div>
        </Section>

        {/* 潜水信息 */}
        <Section title={uiLabels.sectionDiveInfo}>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.diveNumber} value={dive.diveNumber} />
            <div className="flex flex-col">
              <span className="text-xs text-dive-text-muted uppercase tracking-wider">{uiLabels.type}</span>
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
                  value={formatNumber(Math.abs(dive.ascentRateStats.maxAscent), ' m/s', 'ascentRate')}
                  style={{ color: '#22c55e' }}
                />
                <InfoCard 
                  label={uiLabels.maxDescent} 
                  value={formatNumber(Math.abs(dive.ascentRateStats.maxDescent), ' m/s', 'ascentRate')}
                  style={{ color: '#ef4444' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InfoCard 
                  label={uiLabels.avgAscent} 
                  value={formatNumber(Math.abs(dive.ascentRateStats.avgAscent), ' m/s', 'ascentRate')}
                  style={{ color: '#22c55e' }}
                />
                <InfoCard 
                  label={uiLabels.avgDescent} 
                  value={formatNumber(Math.abs(dive.ascentRateStats.avgDescent), ' m/s', 'ascentRate')}
                  style={{ color: '#ef4444' }}
                />
              </div>
            </>
          )}
        </Section>

        {/* 地点与潜伴 */}
        <Section title={uiLabels.sectionLocationBuddy}>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.site} value={dive.site} highlight />
            {dive.site !== dive.location ? (
              <InfoCard label={uiLabels.location} value={dive.location} />
            ) : (
              <InfoCard label={uiLabels.buddy} value={dive.buddy || '-'} />
            )}
          </div>
          {dive.site !== dive.location && (
            <div className="grid grid-cols-2 gap-3">
              <InfoCard label={uiLabels.buddy} value={dive.buddy || '-'} />
            </div>
          )}
        </Section>
      </div>

      {/* 右侧：环境与气体装备 */}
      <div className="col-span-6 space-y-4">
        {/* 环境 */}
        <Section title={uiLabels.sectionEnvironment}>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.minTemp} value={formatNumber(environment?.minTemp, '°C', 'temperature')} />
            <InfoCard label={uiLabels.maxTemp} value={formatNumber(environment?.maxTemp, '°C', 'temperature')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.avgTemp} value={formatNumber(environment?.avgTemp, '°C', 'temperature')} />
            <InfoCard label={uiLabels.surfacePressure} value={formatNumber(environment?.surfacePressure, ' mBar')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.salinity} value={computerDiveSettings?.salinitySetting || '-'} />
            <InfoCard label={uiLabels.surfaceInterval} value={computerDiveSettings?.surfaceInterval || '-'} />
          </div>
        </Section>

        {/* 减压信息 */}
        <Section title={uiLabels.sectionDecompression}>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.model} value={decoSettings?.decoModel || '-'} />
            <InfoCard label={uiLabels.gfSetting} value={decoSettings?.conservatism || '-'} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.cnsStart} value={formatNumber(decoSettings?.cnsStart, '%', 'cns')} />
            <InfoCard label={uiLabels.cnsEnd} value={formatNumber(decoSettings?.cnsEnd, '%', 'cns')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.gf99Max} value={formatNumber(decoSettings?.endSurfaceGF, '%', 'gf99')} />
            <InfoCard label={uiLabels.surfaceGFEnd} value={formatNumber(decoSettings?.endSurfaceGF, '%', 'gf99')} />
          </div>
        </Section>

        {/* 气体 */}
        {gasConfigs && gasConfigs.length > 0 && (
          <Section title={uiLabels.sectionGases}>
            <div className="space-y-1">
              {gasConfigs.map((gas, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <span className="px-1.5 py-0.5 bg-dive-hover rounded text-dive-text">
                    {gas.name || `Gas ${idx + 1}`}
                  </span>
                  <span className="text-dive-text-secondary">
                    O₂: {formatNumber(gas.o2)}% {(gas.he ?? 0) > 0 && `He: ${formatNumber(gas.he)}%`}
                  </span>
                  {gas.startPressure && (
                    <span className="text-dive-text-muted">
                      {formatNumber(gas.startPressure, '', 'tank1Pressure')} → {formatNumber(gas.endPressure, '', 'tank1Pressure') || '?'} bar
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 装备 */}
        {gearInfo && (
          <Section title={uiLabels.sectionGear}>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {gearInfo.dress && <InfoCard label={uiLabels.dress} value={gearInfo.dress} />}
              {gearInfo.weight && <InfoCard label={uiLabels.weight} value={formatNumber(gearInfo.weight, ' kg')} />}
              {gearInfo.tankSize && <InfoCard label={uiLabels.tank} value={gearInfo.tankSize} />}
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
