import { memo } from 'react';
import { Dive } from '@/types';
import { InfoRow } from './FormComponents';
import { formatDepth, formatDurationReadable } from '@/utils';

interface SummaryTabProps {
  dive: Dive;
}

/**
 * Summary Tab - 显示潜水基本信息和笔记
 */
export const SummaryTab = memo(function SummaryTab({ dive }: SummaryTabProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left Column - Dive Info */}
      <div className="space-y-4">
        <InfoRow
          label="Max Depth"
          value={formatDepth(dive.maxDepth)}
          highlight
        />
        <InfoRow label="Average Depth" value={formatDepth(dive.avgDepth)} />
        <InfoRow label="Start Time" value={dive.startTime} />
        <InfoRow
          label="Duration"
          value={formatDurationReadable(dive.duration)}
          highlight
          className="text-green-400"
        />
        <InfoRow label="End Time" value={dive.endTime} />

        <div className="pt-4 border-t border-gray-700">
          <InfoRow label="Dive Number" value={dive.diveNumber.toString()} />
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
          <InfoRow label="Buddy" value={dive.buddy || '-'} />
        </div>

        <div className="pt-4 border-t border-gray-700">
          <InfoRow label="Location" value={dive.location} />
          <InfoRow label="Site" value={dive.site} />
        </div>
      </div>

      {/* Right Column - Dive Notes */}
      <div>
        <h3 className="text-gray-400 text-sm mb-2">Dive Notes</h3>
        <div className="bg-gray-800 rounded-lg p-4 min-h-[200px]">
          <p className="text-gray-300 text-sm">
            {dive.notes || 'No notes for this dive.'}
          </p>
        </div>

        {dive.tags && dive.tags.length > 0 && (
          <div className="mt-4">
            <h3 className="text-gray-400 text-sm mb-2">Tags</h3>
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
            <h3 className="text-gray-400 text-sm mb-2">Rating</h3>
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
