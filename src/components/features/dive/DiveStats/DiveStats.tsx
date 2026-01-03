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
    <tr className={isHighlight ? 'bg-dive-card/30' : ''}>
      <td className="px-4 py-2 text-dive-text-secondary font-medium whitespace-nowrap">{label}</td>
      {values.map((value, idx) => (
        <td 
          key={idx} 
          className={`px-4 py-2 text-center whitespace-nowrap ${idx === 0 ? 'text-cyan-400 font-medium' : 'text-dive-text'}`}
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
    <div className="h-full flex flex-col overflow-hidden bg-dive-surface">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dive-border">
        <div className="flex items-center gap-4">
          <span className="text-dive-text-secondary text-sm">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as StatsCategory)}
            className="bg-dive-card text-dive-text px-3 py-1.5 rounded border border-dive-border text-sm focus:outline-none focus:border-cyan-400"
          >
            {Object.entries(STATS_CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div className="text-dive-text-secondary text-sm">
          Included: <span className="text-cyan-400">{totalDives}/{totalDives}</span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-dive-card">
            <tr>
              <th className="px-4 py-2 text-left text-dive-text-secondary font-medium whitespace-nowrap">Statistic</th>
              {categories.map((cat, idx) => (
                <th 
                  key={idx} 
                  className={`px-4 py-2 text-center font-medium whitespace-nowrap ${idx === 0 ? 'text-cyan-400' : 'text-dive-text'}`}
                >
                  {idx === 0 ? 'All' : cat.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dive-card">
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
