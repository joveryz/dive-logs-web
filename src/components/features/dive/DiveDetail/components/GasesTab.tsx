import { memo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Dive, TankInfo } from '@/types';
import { SelectField, TextAreaField, Label } from './FormComponents';

interface GasesTabProps {
  dive: Dive;
}

/**
 * Gases Tab - 显示气体配置信息
 */
export const GasesTab = memo(function GasesTab({ dive }: GasesTabProps) {
  const gasesInfo = dive.gasesInfo;
  const [expandedTanks, setExpandedTanks] = useState<Record<string, boolean>>({
    'Tank 1 (T1)': true,
  });

  const toggleTank = (tankName: string) => {
    setExpandedTanks((prev) => ({ ...prev, [tankName]: !prev[tankName] }));
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left Column - Gas Types & Air Integration */}
      <div className="space-y-6">
        {/* OC Gases */}
        <GasSection title="OC Gases">
          <GasRow label="Programmed" value={gasesInfo?.ocGases?.programmed} />
          <GasRow label="Used" value={gasesInfo?.ocGases?.used} />
        </GasSection>

        {/* CC Gases */}
        <GasSection title="CC Gases">
          <GasRow
            label="Programmed"
            value={gasesInfo?.ccGases?.programmed}
            defaultValue="None"
          />
          <GasRow
            label="Used"
            value={gasesInfo?.ccGases?.used}
            defaultValue="None"
          />
        </GasSection>

        {/* Air Integration */}
        <GasSection title="Air Integration">
          <GasRow
            label="AI Enabled"
            value={gasesInfo?.airIntegration?.aiEnabled ? 'On' : 'Off'}
          />
          <div className="flex justify-between">
            <span className="text-gray-400">Transmitters</span>
            <div className="text-gray-200 text-right">
              {gasesInfo?.airIntegration?.transmitters?.map((t, i) => (
                <div key={i}>{t}</div>
              )) || '-'}
            </div>
          </div>
          <GasRow label="GTR Mode" value={gasesInfo?.airIntegration?.gtrMode} />
          <div className="flex justify-between">
            <span className="text-gray-400">SAC (Recorded)</span>
            <span className="text-cyan-400">
              {gasesInfo?.airIntegration?.sacRecorded?.toFixed(2) || '-'}{' '}
              <span className="text-cyan-400">Bar/min</span>
            </span>
          </div>
        </GasSection>
      </div>

      {/* Middle Column - Tanks */}
      <div className="space-y-4">
        {gasesInfo?.tanks?.map((tank) => (
          <TankCard
            key={tank.name}
            tank={tank}
            isExpanded={expandedTanks[tank.name] ?? false}
            onToggle={() => toggleTank(tank.name)}
          />
        ))}
      </div>

      {/* Right Column - Notes */}
      <div>
        <Label>Gas Notes</Label>
        <TextAreaField value={gasesInfo?.notes} placeholder="No gas notes..." />
      </div>
    </div>
  );
});

/**
 * 气体信息区块组件
 */
interface GasSectionProps {
  title: string;
  children: React.ReactNode;
}

const GasSection = memo(function GasSection({
  title,
  children,
}: GasSectionProps) {
  return (
    <div>
      <h3 className="text-white font-bold mb-3">{title}</h3>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  );
});

/**
 * 气体信息行组件
 */
interface GasRowProps {
  label: string;
  value?: string;
  defaultValue?: string;
}

const GasRow = memo(function GasRow({
  label,
  value,
  defaultValue = '-',
}: GasRowProps) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-200">{value || defaultValue}</span>
    </div>
  );
});

/**
 * 气瓶卡片组件
 */
interface TankCardProps {
  tank: TankInfo;
  isExpanded: boolean;
  onToggle: () => void;
}

const TankCard = memo(function TankCard({
  tank,
  isExpanded,
  onToggle,
}: TankCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      {/* Tank Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-700 transition-colors"
      >
        <span className="text-white font-medium">{tank.name}</span>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Tank Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 text-sm">
          <TankPressureField
            label="Start Pressure (Bar)"
            value={tank.startPressure}
          />
          <TankPressureField
            label="End Pressure (Bar)"
            value={tank.endPressure}
          />
          <TankStatRow
            label="Pressure Change"
            value={tank.pressureChange?.toFixed(2)}
            unit="Bar"
          />
          <div className="flex justify-between">
            <span className="text-gray-400">Transmitter</span>
            <span className="text-gray-200">{tank.transmitter || '-'}</span>
          </div>

          {tank.gasUsage && (
            <>
              <div>
                <span className="text-white font-medium">Gas Usage</span>
                <SelectField value={tank.gasUsage} className="mt-2" />
              </div>
              <TankStatRow
                label="Average Depth"
                value={tank.avgDepth?.toFixed(1)}
                unit="m"
              />
              <TankStatRow
                label="SAC (Calculated)"
                value={tank.sacCalculated?.toFixed(2)}
                unit="Bar/min"
              />
            </>
          )}
        </div>
      )}
    </div>
  );
});

/**
 * 气瓶压力字段组件
 */
interface TankPressureFieldProps {
  label: string;
  value?: number;
}

const TankPressureField = memo(function TankPressureField({
  label,
  value,
}: TankPressureFieldProps) {
  return (
    <div>
      <span className="text-cyan-400">{label}</span>
      <div className="text-gray-200 mt-1">{value?.toFixed(2) || '-'}</div>
    </div>
  );
});

/**
 * 气瓶统计行组件
 */
interface TankStatRowProps {
  label: string;
  value?: string;
  unit: string;
}

const TankStatRow = memo(function TankStatRow({
  label,
  value,
  unit,
}: TankStatRowProps) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}</span>
      <span className="text-cyan-400">
        {value || '-'} <span className="text-cyan-400">{unit}</span>
      </span>
    </div>
  );
});
