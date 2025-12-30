import { useMemo, useState } from 'react';
import { useDiveStore } from '@/store';
import { useFilteredDives } from '@/hooks';
import { SearchInput } from '@/components/common';
import { formatDuration, formatDepth } from '@/utils';
import { fieldLabels } from '@/constants';

type SortField = 'diveNumber' | 'date' | 'diveType' | 'location' | 'maxDepth' | 'duration';
type SortDirection = 'asc' | 'desc';

export function DiveList() {
  const { selectedDiveId, setSelectedDiveId, filterText, setFilterText } = useDiveStore();
  const filteredDives = useFilteredDives();
  const [sortField, setSortField] = useState<SortField>('diveNumber');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // 排序后的潜水列表
  const sortedDives = useMemo(() => {
    return [...filteredDives].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'diveNumber':
          comparison = a.diveNumber - b.diveNumber;
          break;
        case 'date':
          comparison = `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`);
          break;
        case 'diveType':
          comparison = a.diveType.localeCompare(b.diveType);
          break;
        case 'location':
          comparison = a.site.localeCompare(b.site);
          break;
        case 'maxDepth':
          comparison = a.maxDepth - b.maxDepth;
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredDives, sortField, sortDirection]);

  // 处理列头点击排序
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // 排序图标
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="ml-1 text-gray-600">⇅</span>;
    }
    return (
      <span className="ml-1 text-cyan-400">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };
  
  // 键盘导航处理
  const handleKeyDown = (e: React.KeyboardEvent, diveId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedDiveId(diveId);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-900" role="region" aria-label="Dive List">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <h2 className="text-cyan-400 font-semibold text-lg">Dive List</h2>
        <span className="text-gray-400 text-sm" aria-live="polite">
          Visible: {filteredDives.length} of {useDiveStore.getState().dives.length}
        </span>
      </div>
      
      {/* Search */}
      <div className="p-3 border-b border-gray-700">
        <SearchInput
          value={filterText}
          onChange={setFilterText}
          placeholder="Filter Dives"
        />
      </div>
      
      {/* Table */}
      <div className="flex-1 overflow-auto" role="table" aria-label="Dive records">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-900 z-10">
            <tr className="text-left text-gray-400 border-b border-gray-700">
              <th 
                className="px-2 md:px-3 py-2 font-medium cursor-pointer hover:text-cyan-400 select-none" 
                scope="col"
                onClick={() => handleSort('diveNumber')}
              >
                {fieldLabels.diveNumber}<SortIcon field="diveNumber" />
              </th>
              <th 
                className="px-2 md:px-3 py-2 font-medium cursor-pointer hover:text-cyan-400 select-none" 
                scope="col"
                onClick={() => handleSort('date')}
              >
                <span className="hidden sm:inline">{fieldLabels.date} / {fieldLabels.time}</span>
                <span className="sm:hidden">{fieldLabels.date}</span>
                <SortIcon field="date" />
              </th>
              <th className="hidden lg:table-cell px-3 py-2 font-medium" scope="col">{fieldLabels.diveComputer}</th>
              <th 
                className="px-2 md:px-3 py-2 font-medium cursor-pointer hover:text-cyan-400 select-none" 
                scope="col"
                onClick={() => handleSort('location')}
              >
                {fieldLabels.location}<SortIcon field="location" />
              </th>
              <th 
                className="hidden md:table-cell px-3 py-2 font-medium cursor-pointer hover:text-cyan-400 select-none" 
                scope="col"
                onClick={() => handleSort('diveType')}
              >
                {fieldLabels.diveType}<SortIcon field="diveType" />
              </th>
              <th className="hidden xl:table-cell px-3 py-2 font-medium" scope="col">{fieldLabels.buddy}</th>
              <th className="hidden xl:table-cell px-3 py-2 font-medium" scope="col">{fieldLabels.tags}</th>
              <th 
                className="px-2 md:px-3 py-2 font-medium text-right cursor-pointer hover:text-cyan-400 select-none" 
                scope="col"
                onClick={() => handleSort('maxDepth')}
              >
                {fieldLabels.maxDepth}<SortIcon field="maxDepth" />
              </th>
              <th 
                className="hidden sm:table-cell px-3 py-2 font-medium text-right cursor-pointer hover:text-cyan-400 select-none" 
                scope="col"
                onClick={() => handleSort('duration')}
              >
                {fieldLabels.duration}<SortIcon field="duration" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedDives.map((dive) => (
              <tr
                key={dive.id}
                onClick={() => setSelectedDiveId(dive.id)}
                onKeyDown={(e) => handleKeyDown(e, dive.id)}
                tabIndex={0}
                role="row"
                aria-selected={selectedDiveId === dive.id}
                className={`cursor-pointer border-b border-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-inset ${
                  selectedDiveId === dive.id
                    ? 'bg-cyan-900/40 text-cyan-100'
                    : 'text-gray-300 hover:bg-gray-800/50'
                }`}
              >
                <td className="px-2 md:px-3 py-2">{dive.diveNumber}</td>
                <td className="px-2 md:px-3 py-2">
                  <span className="hidden sm:inline">{dive.date} {dive.startTime}</span>
                  <span className="sm:hidden">{dive.date}</span>
                </td>
                <td className="hidden lg:table-cell px-3 py-2 text-gray-400">
                  {dive.diveComputer.model}
                </td>
                <td className="px-2 md:px-3 py-2">
                  <span className="text-cyan-400">{dive.site}</span>
                  <span className="hidden md:inline">
                    {dive.site !== dive.location && (
                      <span className="text-gray-500 ml-1">({dive.location})</span>
                    )}
                  </span>
                </td>
                <td className="hidden md:table-cell px-3 py-2">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                    dive.diveType === 'CC/BO' ? 'bg-purple-900/50 text-purple-300' :
                    dive.diveType === 'OC Tec' ? 'bg-red-900/50 text-red-300' :
                    dive.diveType.startsWith('OC Rec') ? 'bg-blue-900/50 text-blue-300' :
                    dive.diveType === 'FreeDive' ? 'bg-cyan-900/50 text-cyan-300' :
                    dive.diveType === 'Avelo' ? 'bg-green-900/50 text-green-300' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {dive.diveType}
                  </span>
                </td>
                <td className="hidden xl:table-cell px-3 py-2 text-gray-400">
                  {dive.buddy || '-'}
                </td>
                <td className="hidden xl:table-cell px-3 py-2">
                  {dive.tags && dive.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {dive.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-2 py-0.5 rounded text-xs bg-purple-900/50 text-purple-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-600">-</span>
                  )}
                </td>
                <td className="px-2 md:px-3 py-2 text-right font-mono">
                  {formatDepth(dive.maxDepth)}
                </td>
                <td className="hidden sm:table-cell px-3 py-2 text-right font-mono">
                  {formatDuration(dive.duration)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {sortedDives.length === 0 && (
          <div className="text-center text-gray-500 py-10" role="status">
            No dives found matching "{filterText}"
          </div>
        )}
      </div>
    </div>
  );
}
