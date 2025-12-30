import { memo } from 'react';
import { InfoCard, Section } from '@/components/common';
import { uiLabels } from '@/constants';
import { formatNumber } from '@/utils';
import type { Dive, TankInfo } from '@/types';

interface GasesTabProps {
  dive: Dive;
}

/**
 * 单个气瓶信息卡片
 */
const TankCard = memo(function TankCard({ tank }: { tank: TankInfo }) {
  return (
    <div className="bg-zinc-800/40 rounded-lg p-3 space-y-3">
      {/* 标题栏：气瓶名称和发射器 */}
      <div className="flex items-center justify-between border-b border-zinc-700 pb-2">
        <span className="text-sm font-medium text-amber-500">{tank.name}</span>
        {tank.transmitter && (
          <span className="text-xs text-zinc-500">Transmitter: {tank.transmitter}</span>
        )}
      </div>
      
      {/* 压力信息 */}
      <div className="grid grid-cols-2 gap-3">
        <InfoCard 
          label={uiLabels.startPressure} 
          value={tank.startPressure !== undefined ? `${formatNumber(tank.startPressure)} bar` : '-'} 
        />
        <InfoCard 
          label={uiLabels.endPressure} 
          value={tank.endPressure !== undefined ? `${formatNumber(tank.endPressure)} bar` : '-'} 
        />
        <InfoCard 
          label={uiLabels.pressureChange} 
          value={tank.pressureChange !== undefined ? `${formatNumber(tank.pressureChange)} bar` : '-'} 
        />
        {tank.avgDepth !== undefined && (
          <InfoCard 
            label={uiLabels.avgDepth} 
            value={`${formatNumber(tank.avgDepth)} m`} 
          />
        )}
      </div>
      
      {/* SAC */}
      {tank.sacCalculated !== undefined && (
        <div className="grid grid-cols-2 gap-3">
          <InfoCard 
            label={uiLabels.sacCalculated} 
            value={formatNumber(tank.sacCalculated, ' bar/min', 'sac')} 
          />
        </div>
      )}
    </div>
  );
});

/**
 * Gases Tab - 气体配置和气瓶信息展示
 */
export const GasesTab = memo(function GasesTab({ dive }: GasesTabProps) {
  const gasesInfo = dive.gasesInfo;

  // 如果没有气体信息，显示空状态
  if (!gasesInfo) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        {uiLabels.noGasesData}
      </div>
    );
  }

  const { ocGases, ccGases, airIntegration, tanks } = gasesInfo;

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* 左侧：气体配置 */}
      <div className="space-y-4">
        {/* OC Gases */}
        <Section title={uiLabels.ocGases}>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard 
              label={uiLabels.programmed} 
              value={ocGases?.programmed || '-'} 
            />
            <InfoCard 
              label={uiLabels.used} 
              value={ocGases?.used || '-'} 
            />
          </div>
        </Section>

        {/* CC Gases */}
        <Section title={uiLabels.ccGases}>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard 
              label={uiLabels.programmed} 
              value={ccGases?.programmed || '-'} 
            />
            <InfoCard 
              label={uiLabels.used} 
              value={ccGases?.used || '-'} 
            />
          </div>
        </Section>

        {/* Air Integration */}
        <Section title={uiLabels.airIntegration}>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard 
              label={uiLabels.aiEnabled} 
              value={airIntegration?.aiEnabled ? 'On' : 'Off'} 
            />
            {airIntegration?.transmitters && airIntegration.transmitters.length > 0 && (
              <InfoCard 
                label={uiLabels.transmitters} 
                value={airIntegration.transmitters.join('\n')} 
              />
            )}
            {airIntegration?.gtrMode && (
              <InfoCard 
                label={uiLabels.gtrMode} 
                value={airIntegration.gtrMode} 
              />
            )}
            {airIntegration?.sacRecorded !== undefined && (
              <InfoCard 
                label={uiLabels.sacRecorded} 
                value={formatNumber(airIntegration.sacRecorded, ' bar/min', 'sac')} 
              />
            )}
          </div>
        </Section>
      </div>

      {/* 右侧：气瓶详情 */}
      <div className="space-y-4">
        {tanks && tanks.length > 0 ? (
          tanks.map((tank, index) => (
            <TankCard key={tank.name || index} tank={tank} />
          ))
        ) : (
          <div className="text-zinc-500 text-sm">{uiLabels.noTankData}</div>
        )}
      </div>
    </div>
  );
});
