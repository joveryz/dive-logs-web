import { memo } from 'react';
import { InfoCard, Section } from '@/components/common';
import { uiLabels } from '@/constants';
import { formatNumber } from '@/utils';
import type { Dive } from '@/types';

interface ComputerTabProps {
  dive: Dive;
}

/**
 * Computer Tab - 电脑与设置信息展示
 */
export const ComputerTab = memo(function ComputerTab({ dive }: ComputerTabProps) {
  const computerInfo = dive.computerInfo;
  const battery = computerInfo?.battery;
  const diveSettings = computerInfo?.dive;
  const deco = computerInfo?.deco;

  return (
    <div className="space-y-4">
      {/* 顶部：核心指标卡片 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-dive-card/60 rounded-lg p-3 text-center">
          <div className="text-xs text-dive-text-muted uppercase">{uiLabels.model}</div>
          <div className="text-xl font-bold text-cyan-400">{dive.diveComputer.model}</div>
        </div>
        <div className="bg-dive-card/60 rounded-lg p-3 text-center">
          <div className="text-xs text-dive-text-muted uppercase">{uiLabels.serial}</div>
          <div className="text-xl font-bold text-green-400">{dive.diveComputer.serial || '-'}</div>
        </div>
        <div className="bg-dive-card/60 rounded-lg p-3 text-center">
          <div className="text-xs text-dive-text-muted uppercase">{uiLabels.firmware}</div>
          <div className="text-xl font-bold text-purple-400">{computerInfo?.firmwareVersion || '-'}</div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-12 gap-4">
        {/* 左侧：电池信息 */}
        <div className="col-span-6 space-y-4">
          <Section title={uiLabels.sectionBattery}>
            <div className="grid grid-cols-3 gap-3">
              <InfoCard label={uiLabels.type} value={battery?.type || '-'} />
              <InfoCard label={uiLabels.voltageStart} value={formatNumber(battery?.vStart, ' V')} />
              <InfoCard label={uiLabels.voltageEnd} value={formatNumber(battery?.vEnd, ' V')} />
            </div>
          </Section>

          <Section title={uiLabels.sectionDiveSettings}>
            <div className="grid grid-cols-3 gap-3">
              <InfoCard label={uiLabels.mode} value={diveSettings?.mode || '-'} />
              <InfoCard label={uiLabels.sampleRate} value={diveSettings?.sampleRate ? `${diveSettings.sampleRate}s` : '-'} />
              <InfoCard label={uiLabels.dataFormat} value={computerInfo?.dataFormat || '-'} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <InfoCard label={uiLabels.salinityType} value={diveSettings?.salinityType || '-'} />
              <InfoCard label={uiLabels.salinity} value={diveSettings?.salinitySetting || '-'} />
              <InfoCard label={uiLabels.surfacePressure} value={formatNumber(diveSettings?.surfacePressure, ' mBar')} />
            </div>
          </Section>
        </div>

        {/* 右侧：减压设置 */}
        <div className="col-span-6 space-y-4">
          <Section title={uiLabels.sectionDecoSettings}>
            <div className="grid grid-cols-3 gap-3">
              <InfoCard label={uiLabels.decoModel} value={deco?.decoModel || '-'} />
              <InfoCard label={uiLabels.gfSetting} value={deco?.conservatism || '-'} />
              <InfoCard label={uiLabels.gf99Max} value={formatNumber(deco?.gf99Max, '%')} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <InfoCard label={uiLabels.cnsStart} value={formatNumber(deco?.cnsStart, '%')} />
              <InfoCard label={uiLabels.cnsEnd} value={formatNumber(deco?.cnsEnd, '%')} />
              <InfoCard label={uiLabels.surfaceGFEnd} value={formatNumber(deco?.endSurfaceGF, '%')} />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
});
