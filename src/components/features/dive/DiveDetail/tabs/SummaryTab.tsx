import { memo } from 'react';
import { InfoCard, Section, DiveTypeBadge } from '@/components/common';
import { uiLabels } from '@/constants';
import { formatDepth, formatDurationReadable, formatNumber } from '@/utils';
import type { Dive } from '@/types';

interface SummaryTabProps {
  dive: Dive;
  /** 是否为个人最佳记录 (FreeDive) */
  isPersonalBest: boolean;
}

/**
 * Summary Tab - 潜水核心信息展示
 */
export const SummaryTab = memo(function SummaryTab({ dive, isPersonalBest }: SummaryTabProps) {
  const environment = dive.environment;
  const decoSettings = dive.computerInfo?.deco;
  const gearInfo = dive.gear;
  const gasConfigs = dive.gases;
  const computerDiveSettings = dive.computerInfo?.dive;
  
  // 检查是否有心率数据
  const hasHeartRateData = environment?.minHeartRate || environment?.maxHeartRate || environment?.avgHeartRate;
  
  // 检查是否有减压数据
  const hasDecoData = decoSettings?.decoModel || decoSettings?.conservatism || decoSettings?.gf99Max || 
                      decoSettings?.cnsStart || decoSettings?.cnsEnd || decoSettings?.endSurfaceGF;

  return (
    <div className="space-y-4">
      {/* 顶部：核心指标卡片 */}
      <div className="grid grid-cols-3 gap-3">
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
        <div className="bg-dive-card/60 rounded-lg p-3 text-center">
          <div className="text-xs text-dive-text-muted uppercase">{uiLabels.type}</div>
          <DiveTypeBadge diveType={dive.diveType} className="text-base justify-center" />
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-12 gap-4">
        {/* 左列 */}
        <div className="col-span-6 space-y-4">
          {/* 潜水基本信息 */}
          <Section title={uiLabels.sectionDiveInfo}>
            <div className="grid grid-cols-3 gap-3">
              <InfoCard label={uiLabels.diveNumber} value={`#${dive.diveNumber}`} />
              <InfoCard label={uiLabels.avgDepth} value={formatDepth(dive.avgDepth)} />
              <InfoCard label={uiLabels.surfaceInterval} value={computerDiveSettings?.surfaceInterval || '-'} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <InfoCard label={uiLabels.date} value={dive.date} />
              <InfoCard label="Start" value={dive.startTime} />
              <InfoCard label="End" value={dive.endTime} />
            </div>
          </Section>

          {/* 升降速率 */}
          {dive.ascentRateStats && (
            <Section title="Ascent / Descent">
              <div className="grid grid-cols-3 gap-3">
                <InfoCard 
                  label="Avg Ascent"
                  value={formatNumber(Math.abs(dive.ascentRateStats.avgAscent), ' m/s', 'ascentRate')}
                  style={{ color: '#22c55e' }}
                />
                <InfoCard 
                  label="Max Ascent"
                  value={formatNumber(Math.abs(dive.ascentRateStats.maxAscent), ' m/s', 'ascentRate')}
                  style={{ color: '#22c55e' }}
                />
                <div /> {/* 占位 */}
                <InfoCard 
                  label="Avg Descent"
                  value={formatNumber(Math.abs(dive.ascentRateStats.avgDescent), ' m/s', 'ascentRate')}
                  style={{ color: '#ef4444' }}
                />
                <InfoCard 
                  label="Max Descent"
                  value={formatNumber(Math.abs(dive.ascentRateStats.maxDescent), ' m/s', 'ascentRate')}
                  style={{ color: '#ef4444' }}
                />
              </div>
            </Section>
          )}

          {/* 心率数据 - 仅在有数据时显示 */}
          {hasHeartRateData && (
            <Section title="Heart Rate">
              <div className="grid grid-cols-3 gap-3">
                <InfoCard label={uiLabels.minHeartRate} value={formatNumber(environment?.minHeartRate, ' bpm')} />
                <InfoCard label={uiLabels.maxHeartRate} value={formatNumber(environment?.maxHeartRate, ' bpm')} />
                <InfoCard label={uiLabels.avgHeartRate} value={formatNumber(environment?.avgHeartRate, ' bpm')} />
              </div>
            </Section>
          )}
        </div>

        {/* 右列 */}
        <div className="col-span-6 space-y-4">
          {/* 环境条件 */}
          <Section title={uiLabels.sectionEnvironment}>
            <div className="grid grid-cols-3 gap-3">
              <InfoCard label={uiLabels.minTemp} value={formatNumber(environment?.minTemp, '°C', 'temperature')} />
              <InfoCard label={uiLabels.maxTemp} value={formatNumber(environment?.maxTemp, '°C', 'temperature')} />
              <InfoCard label={uiLabels.avgTemp} value={formatNumber(environment?.avgTemp, '°C', 'temperature')} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <InfoCard label={uiLabels.waterType} value={computerDiveSettings?.waterType || '-'} />
              <InfoCard label={uiLabels.waterDensity} value={computerDiveSettings?.waterDensity ? `${computerDiveSettings.waterDensity} kg/m³` : '-'} />
              <InfoCard label={uiLabels.surfacePressure} value={formatNumber(environment?.surfacePressure, ' mBar')} />
            </div>
          </Section>

          {/* 减压/安全信息 */}
          {hasDecoData && (
            <Section title={uiLabels.sectionDecompression}>
              <div className="grid grid-cols-3 gap-3">
                <InfoCard label={uiLabels.model} value={decoSettings?.decoModel || '-'} />
                <InfoCard label={uiLabels.gfSetting} value={decoSettings?.conservatism || '-'} />
                <InfoCard label={uiLabels.gf99Max} value={formatNumber(decoSettings?.gf99Max, '%', 'gf99')} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <InfoCard label={uiLabels.cnsStart} value={formatNumber(decoSettings?.cnsStart, '%', 'cns')} />
                <InfoCard label={uiLabels.cnsEnd} value={formatNumber(decoSettings?.cnsEnd, '%', 'cns')} />
                <InfoCard label={uiLabels.surfaceGFEnd} value={formatNumber(decoSettings?.endSurfaceGF, '%', 'gf99')} />
              </div>
            </Section>
          )}

          {/* 地点信息 */}
          <Section title={uiLabels.sectionLocationBuddy}>
            <div className="grid grid-cols-3 gap-3">
              <InfoCard label={uiLabels.site} value={dive.site} highlight />
              {dive.site !== dive.location ? (
                <InfoCard label={uiLabels.location} value={dive.location} />
              ) : (
                <div />
              )}
              <InfoCard 
                label={uiLabels.diverAndBuddy} 
                value={dive.buddy && dive.buddy !== 'Solo' ? `${dive.diver} & ${dive.buddy}` : dive.diver || '-'} 
              />
            </div>
          </Section>

          {/* 气体配置 */}
          {gasConfigs && gasConfigs.length > 0 && (
            <Section title={uiLabels.sectionGases}>
              <div className="space-y-1.5">
                {gasConfigs.map((gas, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-dive-hover/50 rounded px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-dive-card rounded text-dive-text font-medium">
                        {gas.name || `Gas ${idx + 1}`}
                      </span>
                      <span className="text-dive-text-secondary">
                        O₂: {formatNumber(gas.o2)}% {(gas.he ?? 0) > 0 && `• He: ${formatNumber(gas.he)}%`}
                      </span>
                    </div>
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
        </div>
      </div>

      {/* 底部：装备和标签 */}
      <div className="grid grid-cols-12 gap-4">
        {/* 装备 */}
        {gearInfo && (gearInfo.dress || gearInfo.weight || gearInfo.tankSize) && (
          <div className="col-span-6">
            <Section title={uiLabels.sectionGear}>
              <div className="grid grid-cols-3 gap-3 text-sm">
                {gearInfo.dress && <InfoCard label={uiLabels.dress} value={gearInfo.dress} />}
                {gearInfo.weight && <InfoCard label={uiLabels.weight} value={formatNumber(gearInfo.weight, ' kg')} />}
                {gearInfo.tankSize && <InfoCard label={uiLabels.tank} value={gearInfo.tankSize} />}
              </div>
            </Section>
          </div>
        )}

        {/* 标签 */}
        {dive.tags && dive.tags.length > 0 && (
          <div className={gearInfo && (gearInfo.dress || gearInfo.weight || gearInfo.tankSize) ? 'col-span-6' : 'col-span-12'}>
            <Section title={uiLabels.sectionTags}>
              <div className="flex flex-wrap gap-1.5">
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
          </div>
        )}
      </div>
    </div>
  );
});
