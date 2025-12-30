import { memo, useState } from 'react';
import { Dive } from '@/types';
import { useStats, StatsCategory, STATS_CATEGORY_LABELS, STATS_ROW_LABELS, FormattedStats } from '@/hooks/useStats';

interface DiveStatsProps {
  dives: Dive[];
}

/**
 * 统计表格行
 */
const StatsRow = memo(function StatsRow({
  label,
  values,
  isHighlight = false,
}: {
  label: string;
  values: string[];
  isHighlight?: boolean;
}) {
  return (
    <tr className={isHighlight ? 'bg-zinc-800/30' : ''}>
      <td className="px-4 py-2 text-zinc-400 font-medium">{label}</td>
      {values.map((value, idx) => (
        <td 
          key={idx} 
          className={`px-4 py-2 text-center ${idx === 0 ? 'text-amber-500 font-medium' : 'text-zinc-300'}`}
        >
          {value}
        </td>
      ))}
    </tr>
  );
});

/**
 * 潜水统计组件
 */
export const DiveStats = memo(function DiveStats({ dives }: DiveStatsProps) {
  const [category, setCategory] = useState<StatsCategory>('diveType');
  const { totalDives, categories } = useStats(dives, category);

  // 提取统计行数据
  const getRowValues = (key: keyof FormattedStats): string[] => {
    return categories.map(cat => cat[key]);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
        <div className="flex items-center gap-4">
          <span className="text-zinc-400 text-sm">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as StatsCategory)}
            className="bg-zinc-800 text-zinc-200 px-3 py-1.5 rounded border border-zinc-600 text-sm focus:outline-none focus:border-amber-500"
          >
            {Object.entries(STATS_CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div className="text-zinc-400 text-sm">
          Included: <span className="text-amber-500">{totalDives}/{totalDives}</span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-zinc-800">
            <tr>
              <th className="px-4 py-2 text-left text-zinc-400 font-medium">Statistic</th>
              {categories.map((cat, idx) => (
                <th 
                  key={idx} 
                  className={`px-4 py-2 text-center font-medium ${idx === 0 ? 'text-amber-500' : 'text-zinc-300'}`}
                >
                  {idx === 0 ? 'All' : cat.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            <StatsRow label={STATS_ROW_LABELS.totalTime} values={getRowValues('totalTime')} isHighlight />
            <StatsRow label={STATS_ROW_LABELS.totalDepth} values={getRowValues('totalDepth')} />
            <StatsRow label={STATS_ROW_LABELS.maxDepth} values={getRowValues('maxDepth')} isHighlight />
            <StatsRow label={STATS_ROW_LABELS.avgMaxDepth} values={getRowValues('avgMaxDepth')} />
            <StatsRow label={STATS_ROW_LABELS.longestDive} values={getRowValues('longestDive')} isHighlight />
            <StatsRow label={STATS_ROW_LABELS.avgDiveTime} values={getRowValues('avgDiveTime')} />
            <StatsRow label={STATS_ROW_LABELS.mostVisitedLocation} values={getRowValues('mostVisitedLocation')} isHighlight />
            <StatsRow label={STATS_ROW_LABELS.uniqueLocations} values={getRowValues('uniqueLocations')} />
            <StatsRow label={STATS_ROW_LABELS.mostVisitedSite} values={getRowValues('mostVisitedSite')} isHighlight />
            <StatsRow label={STATS_ROW_LABELS.uniqueSites} values={getRowValues('uniqueSites')} />
          </tbody>
        </table>
      </div>
    </div>
  );
});
