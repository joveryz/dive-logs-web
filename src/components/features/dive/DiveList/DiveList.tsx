import { useMemo, useState } from 'react';
import { useDiveStore } from '@/store';
import { useFilteredDives, getFreeDivePBId, useLayoutMode } from '@/hooks';
import { SearchInput, DiveTypeBadge } from '@/components/common';
import { formatDuration, formatDepth } from '@/utils';
import { fieldLabels } from '@/constants';
import type { SortField, SortDirection, Dive } from '@/types';

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
  const isMobileLayout = useLayoutMode();
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
      return <span className="ml-1 text-dive-text-muted">⇅</span>;
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

  // 移动端卡片组件
  const MobileCard = ({ dive, isSelected, isPB }: { dive: Dive; isSelected: boolean; isPB: boolean }) => (
    <div
      onClick={() => setSelectedDiveId(dive.id)}
      onKeyDown={(e) => handleKeyDown(e, dive.id)}
      tabIndex={0}
      role="button"
      aria-selected={isSelected}
      className={`p-3 rounded-lg border transition-all cursor-pointer ${
        isSelected
          ? 'bg-cyan-900/30 border-cyan-500 ring-1 ring-cyan-500/50'
          : 'bg-dive-card border-dive-border hover:bg-dive-hover hover:border-dive-text-muted'
      }`}
    >
      {/* Row 1: Number + Location | Type + Date */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className={`font-bold text-base shrink-0 ${isSelected ? 'text-cyan-400' : 'text-dive-text'}`}>
            #{dive.diveNumber}
          </span>
          <span className="text-cyan-400 truncate font-medium">{dive.site}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <DiveTypeBadge diveType={dive.diveType} />
          {isPB && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-400">
              PB
            </span>
          )}
          <span className="text-dive-text-muted text-sm">{dive.date}</span>
        </div>
      </div>
      
      {/* Row 2: Stats with separators */}
      <div className="flex items-center text-sm text-dive-text-secondary">
        <span className="font-mono text-dive-text">{formatDepth(dive.maxDepth)}</span>
        <span className="mx-2 text-dive-border">·</span>
        <span className="font-mono text-dive-text">{formatDuration(dive.duration)}</span>
        <span className="mx-2 text-dive-border">·</span>
        <span>{dive.buddy}</span>
        <span className="mx-2 text-dive-border">·</span>
        <span className="text-dive-text-muted truncate">{dive.diveComputer.model}</span>
        {dive.tags && dive.tags.length > 0 && (
          <>
            <span className="mx-2 text-dive-border">·</span>
            <div className="flex gap-1">
              {dive.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded text-[10px] bg-purple-900/50 text-purple-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
  
  return (
    <div className="flex flex-col h-full bg-dive-surface" role="region" aria-label="Dive List">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-dive-border">
        <h2 className="text-cyan-400 font-semibold text-lg">Dive List</h2>
        <span className="text-dive-text-secondary text-sm" aria-live="polite">
          Visible: <span className="text-cyan-400">{filteredDives.length}/{useDiveStore.getState().dives.length}</span>
        </span>
      </div>
      
      {/* Search & Filter */}
      <div className={`p-3 border-b border-dive-border ${isMobileLayout ? 'flex flex-col gap-2' : 'flex items-center gap-3'}`}>
        <div className={isMobileLayout ? 'w-full' : 'flex-1'}>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Filter Dives"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            role="switch"
            aria-checked={filterValidDivesOnly}
            aria-label="Filter valid dives only"
            onClick={() => setFilterValidDivesOnly(!filterValidDivesOnly)}
            title={filterValidDivesOnly ? "Showing valid dives only" : "Showing all dives"}
            className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs transition-all duration-200 ${
              filterValidDivesOnly 
                ? 'bg-cyan-900/40 text-cyan-400 hover:bg-cyan-900/60' 
                : 'bg-dive-card text-dive-text-muted hover:bg-dive-hover hover:text-dive-text-secondary'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className={`transition-colors ${filterValidDivesOnly ? 'text-cyan-400' : 'text-dive-text-muted group-hover:text-dive-text-secondary'}`}>
              {filterValidDivesOnly ? 'Valid' : 'All'}
            </span>
          </button>
          
          {/* 移动端排序选择器 */}
          {isMobileLayout && (
            <select
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-') as [SortField, SortDirection];
                setSortField(field);
                setSortDirection(direction);
              }}
              className="px-2 py-1.5 rounded-md text-xs bg-dive-card text-dive-text-muted border border-dive-border focus:border-cyan-500 focus:outline-none"
            >
              <option value="diveNumber-desc">Newest First</option>
              <option value="diveNumber-asc">Oldest First</option>
              <option value="maxDepth-desc">Depth ↓</option>
              <option value="maxDepth-asc">Depth ↑</option>
              <option value="duration-desc">Duration ↓</option>
              <option value="duration-asc">Duration ↑</option>
              <option value="date-desc">Date ↓</option>
              <option value="date-asc">Date ↑</option>
            </select>
          )}
        </div>
      </div>
      
      {/* 移动端卡片列表 */}
      {isMobileLayout ? (
        <div className="flex-1 overflow-auto p-3 space-y-2">
          {sortedDives.map((dive) => (
            <MobileCard
              key={dive.id}
              dive={dive}
              isSelected={selectedDiveId === dive.id}
              isPB={dive.diveType === 'FreeDive' && dive.id === freeDivePBId}
            />
          ))}
          {sortedDives.length === 0 && (
            <div className="text-center text-dive-text-muted py-10" role="status">
              No dives found matching "{searchQuery}"
            </div>
          )}
        </div>
      ) : (
      /* Desktop table */
      <div className="flex-1 overflow-auto" role="table" aria-label="Dive records">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-dive-surface z-10">
            <tr className="text-left text-dive-text-secondary border-b border-dive-border whitespace-nowrap">
              <th 
                className="px-2 py-1.5 font-medium cursor-pointer hover:text-cyan-400 select-none" 
                scope="col"
                onClick={() => handleSort('diveNumber')}
              >
                {fieldLabels.diveNumber}<SortIcon field="diveNumber" />
              </th>
              <th 
                className="px-2 py-1.5 font-medium cursor-pointer hover:text-cyan-400 select-none" 
                scope="col"
                onClick={() => handleSort('date')}
              >
                {fieldLabels.date}
                <SortIcon field="date" />
              </th>
              <th 
                className="px-2 py-1.5 font-medium cursor-pointer hover:text-cyan-400 select-none" 
                scope="col"
                onClick={() => handleSort('diveComputer')}
              >
                {fieldLabels.diveComputer}<SortIcon field="diveComputer" />
              </th>
              <th 
                className="px-2 py-1.5 font-medium cursor-pointer hover:text-cyan-400 select-none" 
                scope="col"
                onClick={() => handleSort('location')}
              >
                {fieldLabels.location}<SortIcon field="location" />
              </th>
              <th 
                className="px-2 py-1.5 font-medium cursor-pointer hover:text-cyan-400 select-none" 
                scope="col"
                onClick={() => handleSort('diveType')}
              >
                {fieldLabels.diveType}<SortIcon field="diveType" />
              </th>
              <th 
                className="px-2 py-1.5 font-medium cursor-pointer hover:text-cyan-400 select-none" 
                scope="col"
                onClick={() => handleSort('buddy')}
              >
                {fieldLabels.buddy}<SortIcon field="buddy" />
              </th>
              <th 
                className="px-2 py-1.5 font-medium cursor-pointer hover:text-cyan-400 select-none" 
                scope="col"
                onClick={() => handleSort('tags')}
              >
                {fieldLabels.tags}<SortIcon field="tags" />
              </th>
              <th 
                className="px-2 py-1.5 font-medium text-right cursor-pointer hover:text-cyan-400 select-none" 
                scope="col"
                onClick={() => handleSort('maxDepth')}
              >
                {fieldLabels.maxDepth}<SortIcon field="maxDepth" />
              </th>
              <th 
                className="px-2 py-1.5 font-medium text-right cursor-pointer hover:text-cyan-400 select-none" 
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
                    ? 'bg-cyan-900/30 text-cyan-100 border-cyan-500'
                    : 'text-dive-text hover:bg-dive-card/50 border-dive-card'
                }`}
              >
                <td className="px-2 py-1.5">{dive.diveNumber}</td>
                <td className="px-2 py-1.5">
                  {dive.date} {dive.startTime}
                </td>
                <td className="px-2 py-1.5 text-dive-text-secondary">
                  {dive.diveComputer.model}
                </td>
                <td className="px-2 py-1.5">
                  <span className="text-cyan-400">{dive.site}</span>
                  {dive.site !== dive.location && (
                    <span className="text-dive-text-muted ml-1">({dive.location})</span>
                  )}
                </td>
                <td className="px-2 py-1.5">
                  <DiveTypeBadge diveType={dive.diveType} />
                </td>
                <td className="px-2 py-1.5 text-dive-text-secondary">
                  {dive.buddy}
                </td>
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
                    <span className="text-dive-text-muted">-</span>
                  )}
                </td>
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
          <div className="text-center text-dive-text-muted py-10" role="status">
            No dives found matching "{searchQuery}"
          </div>
        )}
      </div>
      )}
    </div>
  );
}
