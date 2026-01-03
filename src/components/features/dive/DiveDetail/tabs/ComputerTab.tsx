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
    <div className="grid grid-cols-12 gap-4">
      {/* 左侧：电脑与电池 */}
      <div className="col-span-6 space-y-4">
        <Section title={uiLabels.sectionComputer}>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.model} value={dive.diveComputer.model} />
            <InfoCard label={uiLabels.serial} value={dive.diveComputer.serial || '-'} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.firmware} value={computerInfo?.firmwareVersion || '-'} />
            <InfoCard label={uiLabels.dataFormat} value={computerInfo?.dataFormat || '-'} />
          </div>
        </Section>

        <Section title={uiLabels.sectionBattery}>
          <InfoCard label={uiLabels.type} value={battery?.type || '-'} />
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.voltageStart} value={formatNumber(battery?.vStart, 'V')} />
            <InfoCard label={uiLabels.voltageEnd} value={formatNumber(battery?.vEnd, 'V')} />
          </div>
        </Section>
      </div>

      {/* 右侧：潜水设置与减压 */}
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
          <InfoCard label={uiLabels.surfacePressure} value={formatNumber(diveSettings?.surfacePressure, ' mBar')} />
        </Section>

        <Section title={uiLabels.sectionDecoSettings}>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.decoModel} value={deco?.decoModel || '-'} />
            <InfoCard label={uiLabels.gfSetting} value={deco?.conservatism || '-'} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.cnsStart} value={formatNumber(deco?.cnsStart, '%')} />
            <InfoCard label={uiLabels.cnsEnd} value={formatNumber(deco?.cnsEnd, '%')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={uiLabels.gf99Max} value={formatNumber(deco?.gf99Max, '%')} />
            <InfoCard label={uiLabels.surfaceGFEnd} value={formatNumber(deco?.endSurfaceGF, '%')} />
          </div>
        </Section>
      </div>
    </div>
  );
});
