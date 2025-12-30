import { memo } from 'react';
import { Dive } from '@/types';
import { InfoRow, InfoRowWithUnit } from './FormComponents';
import { formatDepth, formatDurationReadable } from '@/utils';
import { fieldLabels } from '@/constants';

interface SummaryTabProps {
  dive: Dive;
}

/**
 * Summary Tab - 显示潜水基本信息和笔记
 */
export const SummaryTab = memo(function SummaryTab({ dive }: SummaryTabProps) {
  const env = dive.environment;
  const deco = dive.computerInfo?.deco;
  const diveSettings = dive.computerInfo?.dive;

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left Column - Dive Info */}
      <div className="space-y-4">
        <InfoRow
          label={fieldLabels.maxDepth}
          value={formatDepth(dive.maxDepth)}
          highlight
        />
        <InfoRow label={fieldLabels.avgDepth} value={formatDepth(dive.avgDepth)} />
        <InfoRow label={fieldLabels.startTime} value={dive.startTime} />
        <InfoRow
          label={fieldLabels.duration}
          value={formatDurationReadable(dive.duration)}
          highlight
          className="text-green-400"
        />
        <InfoRow label={fieldLabels.endTime} value={dive.endTime} />

        <div className="pt-4 border-t border-gray-700">
          <InfoRow label={fieldLabels.diveNumber} value={dive.diveNumber.toString()} />
          <InfoRow label={fieldLabels.diveType} value={dive.diveType} />
          <div className="flex gap-2 mt-2">
            <span className="px-3 py-1.5 bg-cyan-900/50 text-cyan-300 rounded text-sm">
              {dive.date}
            </span>
            <span className="px-3 py-1.5 bg-cyan-900/50 text-cyan-300 rounded text-sm">
              {dive.startTime}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <InfoRow label={fieldLabels.buddy} value={dive.buddy || '-'} />
        </div>

        <div className="pt-4 border-t border-gray-700">
          <InfoRow label={fieldLabels.location} value={dive.location} />
          <InfoRow label={fieldLabels.site} value={dive.site} />
        </div>
      </div>

      {/* Middle Column - Environment & Deco */}
      <div className="space-y-4">
        {/* Temperature Section */}
        <div>
          <h3 className="text-gray-400 text-sm mb-2">Temperature</h3>
          <div className="space-y-2">
            <InfoRowWithUnit label={fieldLabels.minTemp} value={env?.minTemp} unit="°C" />
            <InfoRowWithUnit label={fieldLabels.maxTemp} value={env?.maxTemp} unit="°C" />
            <InfoRowWithUnit label={fieldLabels.avgTemp} value={env?.avgTemp} unit="°C" />
          </div>
        </div>

        {/* Surface Info */}
        <div className="pt-4 border-t border-gray-700">
          <h3 className="text-gray-400 text-sm mb-2">Surface</h3>
          <div className="space-y-2">
            <InfoRowWithUnit 
              label={fieldLabels.surfacePressure} 
              value={env?.surfacePressure} 
              unit="mBar" 
            />
            <InfoRow 
              label={fieldLabels.surfaceInterval} 
              value={diveSettings?.surfaceInterval || '-'} 
            />
          </div>
        </div>

        {/* Deco Section */}
        <div className="pt-4 border-t border-gray-700">
          <h3 className="text-gray-400 text-sm mb-2">Decompression</h3>
          <div className="space-y-2">
            <InfoRow label={fieldLabels.decoModel} value={deco?.decoModel || '-'} />
            <InfoRow label="GF Setting" value={deco?.conservatism || '-'} />
            <InfoRowWithUnit label="CNS Start" value={deco?.cnsStart} unit="%" />
            <InfoRowWithUnit label="CNS End" value={deco?.cnsEnd} unit="%" />
          </div>
        </div>
      </div>

      {/* Right Column - Dive Notes */}
      <div>
        <h3 className="text-gray-400 text-sm mb-2">{fieldLabels.notes}</h3>
        <div className="bg-gray-800 rounded-lg p-4 min-h-[200px]">
          <p className="text-gray-300 text-sm whitespace-pre-wrap">
            {dive.notes || 'No notes for this dive.'}
          </p>
        </div>

        {dive.tags && dive.tags.length > 0 && (
          <div className="mt-4">
            <h3 className="text-gray-400 text-sm mb-2">{fieldLabels.tags}</h3>
            <div className="flex flex-wrap gap-2">
              {dive.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {dive.rating && (
          <div className="mt-4">
            <h3 className="text-gray-400 text-sm mb-2">{fieldLabels.rating}</h3>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-xl ${star <= dive.rating! ? 'text-yellow-400' : 'text-gray-600'}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
