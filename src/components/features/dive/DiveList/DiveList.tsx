import { useMemo, useState, useRef, useEffect } from 'react';
import { useDiveStore } from '@/store';
import { useFilteredDives, getFreeDivePBId } from '@/hooks';
import { SearchInput, DiveTypeBadge } from '@/components/common';
import { formatDuration, formatDepth } from '@/utils';
import { fieldLabels } from '@/constants';
import type { SortField, SortDirection } from '@/types';

// 可切换显示的列
type OptionalColumnKey = 'diveComputer' | 'location' | 'buddy' | 'tags';

const OPTIONAL_COLUMNS: { key: OptionalColumnKey; label: string }[] = [
  { key: 'diveComputer', label: fieldLabels.diveComputer },
  { key: 'location', label: fieldLabels.location },
  { key: 'buddy', label: fieldLabels.buddy },
  { key: 'tags', label: fieldLabels.tags },
];

export function DiveList() {
  const { 
    selectedDiveId, 
    setSelectedDiveId, 
    searchQuery, 
    setSearchQuery, 
    filterValidDivesOnly, 
    setFilterValidDivesOnly 
  } = useDiveStore();
  const filteredDives = useFilteredDives();
  const [sortField, setSortField] = useState<SortField>('diveNumber');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // 列可见性状态 - 移动端默认关闭可选列
  const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768;
  const [columnVisibility, setColumnVisibility] = useState<Record<OptionalColumnKey, boolean>>({
    diveComputer: !isMobileDevice,
    location: !isMobileDevice,
    buddy: !isMobileDevice,
    tags: !isMobileDevice,
  });
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const columnMenuRef = useRef<HTMLDivElement>(null);
  
  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (columnMenuRef.current && !columnMenuRef.current.contains(e.target as Node)) {
        setIsColumnMenuOpen(false);
      }
    };
    if (isColumnMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isColumnMenuOpen]);
  
  const toggleColumnVisibility = (columnKey: OptionalColumnKey) => {
    setColumnVisibility(prev => ({ ...prev, [columnKey]: !prev[columnKey] }));
  };

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
        case 'diveComputer':
          comparison = a.diveComputer.model.localeCompare(b.diveComputer.model);
          break;
        case 'diveType':
          comparison = a.diveType.localeCompare(b.diveType);
          break;
        case 'location':
          comparison = a.site.localeCompare(b.site);
          break;
        case 'buddy':
          comparison = (a.buddy || '').localeCompare(b.buddy || '');
          break;
        case 'tags':
          comparison = (a.tags?.join(',') || '').localeCompare(b.tags?.join(',') || '');
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

  // FreeDive PB (Personal Best) - 深度最深的 FreeDive
  const allDives = useDiveStore((state) => state.dives);
  const freeDivePBId = useMemo(() => {
    return getFreeDivePBId(allDives);
  }, [allDives]);

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
      return <span className="ml-1 text-zinc-600">⇅</span>;
    }
    return (
      <span className="ml-1 text-amber-500">
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
    <div className="flex flex-col h-full bg-zinc-900" role="region" aria-label="Dive List">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-zinc-700">
        <h2 className="text-amber-500 font-semibold text-lg">Dive List</h2>
        <span className="text-zinc-400 text-sm" aria-live="polite">
          Visible: <span className="text-amber-500">{filteredDives.length}/{useDiveStore.getState().dives.length}</span>
        </span>
      </div>
      
      {/* Search & Filter */}
      <div className="p-3 border-b border-zinc-700 flex items-center gap-3">
        <div className="flex-1">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Filter Dives"
          />
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={filterValidDivesOnly}
          aria-label="Filter valid dives only"
          onClick={() => setFilterValidDivesOnly(!filterValidDivesOnly)}
          title={filterValidDivesOnly ? "Showing valid dives only" : "Showing all dives"}
          className={`group flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all duration-200 ${
            filterValidDivesOnly 
              ? 'bg-amber-900/40 text-amber-500 hover:bg-amber-900/60' 
              : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-400'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className={`transition-colors ${filterValidDivesOnly ? 'text-amber-500' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
            {filterValidDivesOnly ? 'Valid' : 'All'}
          </span>
        </button>
        
        {/* Column Selector */}
        <div className="relative" ref={columnMenuRef}>
          <button
            type="button"
            aria-label="Select columns"
            aria-expanded={isColumnMenuOpen}
            onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
            title="Select visible columns"
            className={`group flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all duration-200 ${
              isColumnMenuOpen
                ? 'bg-amber-900/40 text-amber-500'
                : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-400'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            <span className="transition-colors">Columns</span>
          </button>
          
          {isColumnMenuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-50 min-w-[140px] py-1">
              {OPTIONAL_COLUMNS.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-700 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={columnVisibility[key]}
                    onChange={() => toggleColumnVisibility(key)}
                    className="w-3.5 h-3.5 rounded border-zinc-600 bg-zinc-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-0"
                  />
                  <span className={columnVisibility[key] ? 'text-zinc-200' : 'text-zinc-500'}>
                    {label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Table */}
      <div className="flex-1 overflow-auto" role="table" aria-label="Dive records">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-zinc-900 z-10">
            <tr className="text-left text-zinc-400 border-b border-zinc-700 whitespace-nowrap">
              <th 
                className="px-2 py-1.5 font-medium cursor-pointer hover:text-amber-500 select-none" 
                scope="col"
                onClick={() => handleSort('diveNumber')}
              >
                {fieldLabels.diveNumber}<SortIcon field="diveNumber" />
              </th>
              <th 
                className="px-2 py-1.5 font-medium cursor-pointer hover:text-amber-500 select-none" 
                scope="col"
                onClick={() => handleSort('date')}
              >
                {fieldLabels.date}
                <SortIcon field="date" />
              </th>
              {columnVisibility.diveComputer && (
                <th 
                  className="px-2 py-1.5 font-medium cursor-pointer hover:text-amber-500 select-none" 
                  scope="col"
                  onClick={() => handleSort('diveComputer')}
                >
                  {fieldLabels.diveComputer}<SortIcon field="diveComputer" />
                </th>
              )}
              {columnVisibility.location && (
                <th 
                  className="px-2 py-1.5 font-medium cursor-pointer hover:text-amber-500 select-none" 
                  scope="col"
                  onClick={() => handleSort('location')}
                >
                  {fieldLabels.location}<SortIcon field="location" />
                </th>
              )}
              <th 
                className="px-2 py-1.5 font-medium cursor-pointer hover:text-amber-500 select-none" 
                scope="col"
                onClick={() => handleSort('diveType')}
              >
                {fieldLabels.diveType}<SortIcon field="diveType" />
              </th>
              {columnVisibility.buddy && (
                <th 
                  className="px-2 py-1.5 font-medium cursor-pointer hover:text-amber-500 select-none" 
                  scope="col"
                  onClick={() => handleSort('buddy')}
                >
                  {fieldLabels.buddy}<SortIcon field="buddy" />
                </th>
              )}
              {columnVisibility.tags && (
                <th 
                  className="px-2 py-1.5 font-medium cursor-pointer hover:text-amber-500 select-none" 
                  scope="col"
                  onClick={() => handleSort('tags')}
                >
                  {fieldLabels.tags}<SortIcon field="tags" />
                </th>
              )}
              <th 
                className="px-2 py-1.5 font-medium text-right cursor-pointer hover:text-amber-500 select-none" 
                scope="col"
                onClick={() => handleSort('maxDepth')}
              >
                {fieldLabels.maxDepth}<SortIcon field="maxDepth" />
              </th>
              <th 
                className="px-2 py-1.5 font-medium text-right cursor-pointer hover:text-amber-500 select-none" 
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
                className={`cursor-pointer transition-colors focus:outline-none whitespace-nowrap border-b ${
                  selectedDiveId === dive.id
                    ? 'bg-amber-900/30 text-amber-100 border-amber-600'
                    : 'text-zinc-300 hover:bg-zinc-800/50 border-zinc-800'
                }`}
              >
                <td className="px-2 py-1.5">{dive.diveNumber}</td>
                <td className="px-2 py-1.5">
                  {dive.date} {dive.startTime}
                </td>
                {columnVisibility.diveComputer && (
                  <td className="px-2 py-1.5 text-zinc-400">
                    {dive.diveComputer.model}
                  </td>
                )}
                {columnVisibility.location && (
                  <td className="px-2 py-1.5">
                    <span className="text-amber-500">{dive.site}</span>
                    {dive.site !== dive.location && (
                      <span className="text-zinc-500 ml-1">({dive.location})</span>
                    )}
                  </td>
                )}
                <td className="px-2 py-1.5">
                  <DiveTypeBadge diveType={dive.diveType} />
                </td>
                {columnVisibility.buddy && (
                  <td className="px-2 py-1.5 text-zinc-400">
                    {dive.buddy || '-'}
                  </td>
                )}
                {columnVisibility.tags && (
                  <td className="px-2 py-1.5">
                    {dive.tags && dive.tags.length > 0 ? (
                      <div className="flex flex-nowrap gap-1">
                        {dive.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-1.5 py-0.5 rounded text-xs bg-purple-900/50 text-purple-300"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-zinc-600">-</span>
                    )}
                  </td>
                )}
                <td className="px-2 py-1.5 text-right font-mono">
                  <span className="flex items-center justify-end gap-1">
                    {dive.diveType === 'FreeDive' && dive.id === freeDivePBId && (
                      <span className="px-1 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-400" title="Personal Best FreeDive">
                        PB
                      </span>
                    )}
                    {formatDepth(dive.maxDepth)}
                  </span>
                </td>
                <td className="px-2 py-1.5 text-right font-mono">
                  {formatDuration(dive.duration)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {sortedDives.length === 0 && (
          <div className="text-center text-zinc-500 py-10" role="status">
            No dives found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}
