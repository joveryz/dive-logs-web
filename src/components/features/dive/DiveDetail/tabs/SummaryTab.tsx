import { memo } from 'react';
import { InfoCard, Section, Badge } from '@/components/common';
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
  const gasConfigs = dive.gases;
  const surfaceInterval = dive.computerInfo?.dive?.surfaceInterval;
  
  // 检查是否有心率数据
  const hasHeartRateData = environment?.minHeartRate || environment?.maxHeartRate || environment?.avgHeartRate;

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
          <Badge variant={dive.diveType} className="text-base font-semibold justify-center">{dive.diveType}</Badge>
        </div>
      </div>

      {/* 主要内容区域 - 响应式：窄屏单栏，宽屏双栏 */}
      <div className="grid grid-cols-1 tablet:grid-cols-12 gap-4">
        {/* 第一行左：Dive Info */}
        <div className="tablet:col-span-6">
          <Section title={uiLabels.sectionDiveInfo}>
            <div className="grid grid-cols-3 gap-3">
              <InfoCard label={uiLabels.diveNumber} value={`#${dive.diveNumber}`} />
              <InfoCard label={uiLabels.date} value={dive.date} />
              <InfoCard label={uiLabels.avgDepth} value={formatDepth(dive.avgDepth)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <InfoCard label="Start" value={dive.startTime} />
              <InfoCard label="End" value={dive.endTime} />
              <InfoCard label={uiLabels.surfaceInterval} value={surfaceInterval || '-'} />
            </div>
          </Section>
        </div>

        {/* 第一行右：Ascent & Heart Rate */}
        {(dive.ascentRateStats || hasHeartRateData) && (
          <div className="tablet:col-span-6">
            <Section title="Ascent & Heart Rate">
              {dive.ascentRateStats && (
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
              )}
              {hasHeartRateData && (
                <div className="grid grid-cols-3 gap-3">
                  <InfoCard label={uiLabels.minHeartRate} value={formatNumber(environment?.minHeartRate, ' bpm')} />
                  <InfoCard label={uiLabels.maxHeartRate} value={formatNumber(environment?.maxHeartRate, ' bpm')} />
                  <InfoCard label={uiLabels.avgHeartRate} value={formatNumber(environment?.avgHeartRate, ' bpm')} />
                </div>
              )}
            </Section>
          </div>
        )}

        {/* 第二行左：Environment */}
        <div className="tablet:col-span-6">
          <Section title={uiLabels.sectionEnvironment}>
            <div className="grid grid-cols-3 gap-3">
              <InfoCard label={uiLabels.minTemp} value={formatNumber(environment?.minTemp, '°C', 'temperature')} />
              <InfoCard label={uiLabels.maxTemp} value={formatNumber(environment?.maxTemp, '°C', 'temperature')} />
              <InfoCard label={uiLabels.avgTemp} value={formatNumber(environment?.avgTemp, '°C', 'temperature')} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <InfoCard label={uiLabels.surfacePressure} value={formatNumber(environment?.surfacePressure, ' mBar')} />
            </div>
          </Section>
        </div>

        {/* 第二行右：Location & Diver */}
        <div className="tablet:col-span-6">
          <Section title="Location & Diver">
            <div className="grid grid-cols-3 gap-3">
              <InfoCard label={uiLabels.site} value={dive.site} style={{ color: '#22d3ee' }} />
              {dive.site !== dive.location ? (
                <InfoCard label={uiLabels.location} value={dive.location} style={{ color: '#22d3ee' }} />
              ) : (
                <div />
              )}
              <InfoCard 
                label={uiLabels.diverAndBuddy} 
                value={dive.buddy && dive.buddy !== 'Solo' ? `${dive.diver} & ${dive.buddy}` : dive.diver || '-'} 
                style={{ color: '#fb923c' }}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <InfoCard 
                label={uiLabels.sectionTags} 
                value={dive.tags && dive.tags.length > 0 ? dive.tags.map(t => `#${t}`).join(', ') : '-'} 
                style={{ color: '#d8b4fe' }}
              />
            </div>
          </Section>
        </div>

        {/* 气体配置 */}
        {gasConfigs && gasConfigs.length > 0 && (
          <div className="tablet:col-span-6">
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
          </div>
        )}
      </div>
    </div>
  );
});
