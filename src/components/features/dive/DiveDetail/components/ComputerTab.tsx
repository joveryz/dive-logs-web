import { memo } from 'react';
import { Dive } from '@/types';
import { InfoRowSimple, SectionTitle } from './FormComponents';

interface ComputerTabProps {
  dive: Dive;
}

/**
 * Computer Tab - 显示潜水电脑详细信息
 */
export const ComputerTab = memo(function ComputerTab({
  dive,
}: ComputerTabProps) {
  const info = dive.computerInfo;

  return (
    <div className="grid grid-cols-2 gap-8">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Computer Section */}
        <div>
          <SectionTitle>Computer:</SectionTitle>
          <div className="space-y-2 text-sm ml-2">
            <InfoRowSimple
              label="Model:"
              value={info?.model || dive.diveComputer.model}
            />
            <InfoRowSimple
              label="Serial Number:"
              value={info?.serial || dive.diveComputer.serial}
            />
            <InfoRowSimple label="OEM:" value={info?.oem || '-'} />
            <InfoRowSimple
              label="Firmware Version:"
              value={info?.firmwareVersion || '-'}
              valueColor="cyan"
            />
            <InfoRowSimple label="Language:" value={info?.language || '-'} />
            <InfoRowSimple label="Data Format:" value={info?.dataFormat || '-'} />
            <InfoRowSimple
              label="Log Version:"
              value={info?.logVersion || '-'}
              valueColor="cyan"
            />
            <InfoRowSimple
              label="DB Version:"
              value={info?.dbVersion || '-'}
              valueColor="cyan"
            />
          </div>
        </div>

        {/* Battery Section */}
        <div>
          <SectionTitle>Battery:</SectionTitle>
          <div className="space-y-2 text-sm ml-2">
            <InfoRowSimple
              label="Battery Type:"
              value={info?.battery?.type || '-'}
            />
            <InfoRowSimple
              label="Battery V(Start):"
              value={info?.battery?.vStart?.toFixed(2) || '-'}
              valueColor="cyan"
            />
            <InfoRowSimple
              label="Battery V(End):"
              value={info?.battery?.vEnd?.toFixed(2) || '-'}
              valueColor="cyan"
            />
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Date/Time Section */}
        <div>
          <SectionTitle>Date / Time:</SectionTitle>
          <div className="space-y-2 text-sm ml-2">
            <InfoRowSimple
              label="Timezone Offset:"
              value={`${info?.dateTime?.timezoneOffset || 0}h`}
              valueColor="cyan"
            />
            <InfoRowSimple
              label="Daylight Savings:"
              value={info?.dateTime?.daylightSavings ? 'On' : 'Off'}
            />
          </div>
        </div>

        {/* Dive Section */}
        <div>
          <SectionTitle>Dive:</SectionTitle>
          <div className="space-y-2 text-sm ml-2">
            <InfoRowSimple
              label="Mode:"
              value={info?.dive?.mode || dive.diveType}
            />
            <InfoRowSimple
              label="Sample Rate:"
              value={`${info?.dive?.sampleRate || 10}s`}
              valueColor="cyan"
            />
            <InfoRowSimple
              label="Recorded Units:"
              value={info?.dive?.recordedUnits || 'Metric'}
            />
            <InfoRowSimple
              label="Salinity Setting:"
              value={info?.dive?.salinitySetting || '-'}
            />
            <InfoRowSimple
              label="Surface Pressure:"
              value={`${info?.dive?.surfacePressure || '-'}`}
              valueColor="cyan"
              unit="mBar"
            />
            <InfoRowSimple
              label="Surface Interval:"
              value={info?.dive?.surfaceInterval || '-'}
              valueColor="cyan"
            />
          </div>
        </div>

        {/* Deco Section */}
        <div>
          <SectionTitle>Deco:</SectionTitle>
          <div className="space-y-2 text-sm ml-2">
            <InfoRowSimple
              label="CNS Start:"
              value={info?.deco?.cnsStart?.toString() || '0'}
            />
            <InfoRowSimple
              label="CNS End:"
              value={info?.deco?.cnsEnd?.toString() || '0'}
            />
            <InfoRowSimple
              label="Deco Model:"
              value={info?.deco?.decoModel || '-'}
            />
            <InfoRowSimple
              label="End Surface GF:"
              value={`${info?.deco?.endSurfaceGF || '-'}%`}
              valueColor="cyan"
            />
            <InfoRowSimple
              label="Conservatism:"
              value={info?.deco?.conservatism || '-'}
            />
          </div>
        </div>
      </div>
    </div>
  );
});
