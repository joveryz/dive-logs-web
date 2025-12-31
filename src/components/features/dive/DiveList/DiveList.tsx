import { useMemo, useState, useRef, useEffect } from 'react';
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
  
  // 检测容器宽度，决定是否使用 card 模式
  const containerRef = useRef<HTMLDivElement>(null);
  const [useCardMode, setUseCardMode] = useState(false);
  const TABLE_MIN_WIDTH = 840; // 表格最小宽度阈值
  
  useEffect(() => {
    if (isMobileLayout) return; // 移动端始终使用 card 模式
    
    const container = containerRef.current;
    if (!container) return;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setUseCardMode(width < TABLE_MIN_WIDTH);
      }
    });
    
    observer.observe(container);
    return () => observer.disconnect();
  }, [isMobileLayout]);

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
      className={`px-4 py-3 border-b transition-all cursor-pointer ${
        isSelected
          ? 'bg-cyan-900/30 border-cyan-500'
          : 'border-dive-border hover:bg-dive-card/50'
      }`}
    >
      {/* Row 1: Number | Location | Type | Date */}
      <div className="flex items-center mb-1.5">
        <span className={`w-14 shrink-0 font-bold text-base ${isSelected ? 'text-cyan-400' : 'text-dive-text'}`}>
          #{dive.diveNumber}
        </span>
        <span className="flex-1 min-w-0 truncate text-base">
          <span className="text-cyan-400">{dive.site}</span>
          {dive.site !== dive.location && (
            <span className="text-dive-text-muted ml-1">({dive.location})</span>
          )}
        </span>
        <span className="w-16 shrink-0 text-center">
          <DiveTypeBadge diveType={dive.diveType} />
        </span>
        <span className="w-24 shrink-0 text-right">{dive.date}</span>
      </div>
      
      {/* Row 2: Tags | Computer | Buddy | Depth (with PB) | Duration */}
      <div className="flex items-center text-sm">
        <div className="flex-1 min-w-0 flex gap-1.5 items-center">
          {dive.tags && dive.tags.length > 0 && dive.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded text-xs bg-purple-900/50 text-purple-300"
            >
              #{tag}
            </span>
          ))}
        </div>
        <span className="w-16 shrink-0 truncate text-dive-text-secondary text-center text-xs">{dive.diveComputer.model}</span>
        <span className="w-14 shrink-0 truncate text-center text-dive-text-secondary text-xs">{dive.buddy}</span>
        <span className="w-20 shrink-0 font-mono text-right flex items-center justify-end gap-1">
          {isPB && (
            <span className="px-1 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-400" title="Personal Best FreeDive">
              PB
            </span>
          )}
          {formatDepth(dive.maxDepth)}
        </span>
        <span className="w-14 shrink-0 font-mono text-right">{formatDuration(dive.duration)}</span>
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
          
          {/* 卡片模式排序选择器 */}
          {(isMobileLayout || useCardMode) && (
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
      
      {/* 卡片列表 (移动端或宽度不足时) */}
      {(isMobileLayout || useCardMode) ? (
        <div ref={containerRef} className="flex-1 overflow-auto">
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
      <div ref={containerRef} className="flex-1 overflow-auto" role="table" aria-label="Dive records">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 bg-dive-surface z-10">
            <tr className="text-left text-dive-text-secondary border-b-2 border-dive-border">
              <th 
                className="px-3 py-2.5 font-semibold cursor-pointer hover:text-cyan-400 select-none w-16" 
                scope="col"
                onClick={() => handleSort('diveNumber')}
              >
                {fieldLabels.diveNumber}<SortIcon field="diveNumber" />
              </th>
              <th 
                className="px-3 py-2.5 font-semibold cursor-pointer hover:text-cyan-400 select-none w-40" 
                scope="col"
                onClick={() => handleSort('date')}
              >
                {fieldLabels.date}
                <SortIcon field="date" />
              </th>
              <th 
                className="px-3 py-2.5 font-semibold cursor-pointer hover:text-cyan-400 select-none" 
                scope="col"
                onClick={() => handleSort('location')}
              >
                {fieldLabels.location}<SortIcon field="location" />
              </th>
              <th 
                className="px-3 py-2.5 font-semibold cursor-pointer hover:text-cyan-400 select-none w-20" 
                scope="col"
                onClick={() => handleSort('diveType')}
              >
                {fieldLabels.diveType}<SortIcon field="diveType" />
              </th>
              <th 
                className="px-3 py-2.5 font-semibold cursor-pointer hover:text-cyan-400 select-none w-24" 
                scope="col"
                onClick={() => handleSort('diveComputer')}
              >
                {fieldLabels.diveComputer}<SortIcon field="diveComputer" />
              </th>
              <th 
                className="px-3 py-2.5 font-semibold cursor-pointer hover:text-cyan-400 select-none w-24" 
                scope="col"
                onClick={() => handleSort('buddy')}
              >
                {fieldLabels.buddy}<SortIcon field="buddy" />
              </th>
              <th 
                className="px-3 py-2.5 font-semibold cursor-pointer hover:text-cyan-400 select-none" 
                scope="col"
                onClick={() => handleSort('tags')}
              >
                {fieldLabels.tags}<SortIcon field="tags" />
              </th>
              <th 
                className="px-3 py-2.5 font-semibold text-right cursor-pointer hover:text-cyan-400 select-none w-24" 
                scope="col"
                onClick={() => handleSort('maxDepth')}
              >
                {fieldLabels.maxDepth}<SortIcon field="maxDepth" />
              </th>
              <th 
                className="px-3 py-2.5 font-semibold text-right cursor-pointer hover:text-cyan-400 select-none w-20" 
                scope="col"
                onClick={() => handleSort('duration')}
              >
                {fieldLabels.duration}<SortIcon field="duration" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dive-border/50">
            {sortedDives.map((dive, index) => (
              <tr
                key={dive.id}
                onClick={() => setSelectedDiveId(dive.id)}
                onKeyDown={(e) => handleKeyDown(e, dive.id)}
                tabIndex={0}
                role="row"
                aria-selected={selectedDiveId === dive.id}
                className={`cursor-pointer transition-all focus:outline-none focus:ring-1 focus:ring-cyan-500/50 ${
                  selectedDiveId === dive.id
                    ? 'bg-cyan-900/30 text-cyan-100'
                    : index % 2 === 0 
                      ? 'bg-transparent hover:bg-dive-card/30' 
                      : 'bg-dive-card/20 hover:bg-dive-card/40'
                }`}
              >
                <td className={`px-3 py-2.5 font-bold text-base ${selectedDiveId === dive.id ? 'text-cyan-400' : ''}`}>#{dive.diveNumber}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="text-sm">{dive.date}</div>
                  <div className="text-xs text-dive-text-muted">{dive.startTime}</div>
                </td>
                <td className="px-3 py-2.5">
                  <span className="text-cyan-400 font-medium">{dive.site}</span>
                  {dive.site !== dive.location && (
                    <span className="text-dive-text-muted text-xs ml-1.5">({dive.location})</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <DiveTypeBadge diveType={dive.diveType} />
                </td>
                <td className="px-3 py-2.5 text-dive-text-secondary text-sm truncate max-w-24">
                  {dive.diveComputer.model}
                </td>
                <td className="px-3 py-2.5 text-dive-text-secondary text-sm truncate max-w-24">
                  {dive.buddy || <span className="text-dive-text-muted">-</span>}
                </td>
                <td className="px-3 py-2.5">
                  {dive.tags && dive.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
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
                <td className="px-3 py-2.5 text-right font-mono text-sm whitespace-nowrap">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    {dive.diveType === 'FreeDive' && dive.id === freeDivePBId && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-400" title="Personal Best FreeDive">
                        PB
                      </span>
                    )}
                    <span className="font-medium">{formatDepth(dive.maxDepth)}</span>
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-sm font-medium">
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
