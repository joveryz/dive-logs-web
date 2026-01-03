import { useMemo, useState, useRef } from 'react';
import { useDiveStore, selectDives } from '@/store';
import { useFilteredDives, getFreeDivePBId } from '@/hooks';
import { SearchInput, DiveTypeBadge } from '@/components/common';
import { formatDuration, formatDepth } from '@/utils';
import type { SortField, SortDirection, Dive } from '@/types';

// 潜水卡片组件
const DiveCard = ({ 
  dive, 
  isSelected, 
  isPB, 
  onClick,
  onKeyDown 
}: { 
  dive: Dive; 
  isSelected: boolean; 
  isPB: boolean;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) => (
  <div
    onClick={onClick}
    onKeyDown={onKeyDown}
    tabIndex={0}
    role="button"
    aria-selected={isSelected}
    className={`group relative p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
      isSelected
        ? 'bg-gradient-to-br from-cyan-900/40 to-cyan-800/20 border-cyan-500/60 shadow-lg shadow-cyan-900/20'
        : 'bg-dive-card/40 border-dive-border/50 hover:bg-dive-card/70 hover:border-dive-border'
    }`}
  >
    {/* 顶部：编号、日期、类型 */}
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <span className={`text-xl font-bold tabular-nums ${isSelected ? 'text-cyan-400' : 'text-dive-text group-hover:text-cyan-400'}`}>
          #{dive.diveNumber}
        </span>
        <DiveTypeBadge diveType={dive.diveType} />
        {isPB && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            PB
          </span>
        )}
      </div>
      <div className="text-right">
        <div className="text-sm font-medium text-dive-text">{dive.date}</div>
        <div className="text-xs text-dive-text-muted">{dive.startTime}</div>
      </div>
    </div>

    {/* 中间：地点 */}
    <div className="mb-2">
      <div className="flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5 text-cyan-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <span className="text-cyan-400 font-medium text-sm truncate">{dive.site}</span>
        {dive.site !== dive.location && (
          <span className="text-dive-text-muted text-xs">• {dive.location}</span>
        )}
      </div>
    </div>

    {/* 底部：核心数据 */}
    <div className="flex items-center justify-between pt-2 border-t border-dive-border/30">
      <div className="flex items-center gap-3">
        {/* 深度 */}
        <div className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
          </svg>
          <span className="font-mono font-semibold text-sm text-blue-400">{formatDepth(dive.maxDepth)}</span>
        </div>
        {/* 时长 */}
        <div className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-mono font-semibold text-sm text-green-400">{formatDuration(dive.duration)}</span>
        </div>
      </div>
      
      {/* 右侧信息 */}
      <div className="flex items-center gap-2">
        {dive.buddy && (
          <span className="text-xs text-dive-text-muted bg-dive-hover/50 px-2 py-0.5 rounded">
            {dive.buddy}
          </span>
        )}
        {dive.tags && dive.tags.length > 0 && (
          <div className="flex gap-1">
            {dive.tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 rounded text-[10px] bg-purple-900/40 text-purple-300"
              >
                #{tag}
              </span>
            ))}
            {dive.tags.length > 2 && (
              <span className="text-[10px] text-dive-text-muted">+{dive.tags.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);

export function DiveList() {
  const { 
    selectedDiveId, 
    setSelectedDiveId, 
    searchQuery, 
    setSearchQuery, 
    filterValidDivesOnly, 
    setFilterValidDivesOnly,
    filterDiveType,
    setFilterDiveType 
  } = useDiveStore();
  const filteredDives = useFilteredDives();
  const allDivesForTypes = useDiveStore(selectDives);
  
  // 获取所有可用的潜水类型（去重）
  const availableDiveTypes = useMemo(() => {
    const types = new Set(allDivesForTypes.map(d => d.diveType));
    return Array.from(types).sort();
  }, [allDivesForTypes]);
  const [sortField, setSortField] = useState<SortField>('diveNumber');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const containerRef = useRef<HTMLDivElement>(null);

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
        case 'location':
          comparison = a.site.localeCompare(b.site);
          break;
        case 'maxDepth':
          comparison = a.maxDepth - b.maxDepth;
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
        default:
          comparison = a.diveNumber - b.diveNumber;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredDives, sortField, sortDirection]);

  // FreeDive PB (Personal Best) - 深度最深的 FreeDive
  const allDives = useDiveStore(selectDives);
  const freeDivePBId = useMemo(() => {
    return getFreeDivePBId(allDives);
  }, [allDives]);
  
  // 键盘导航处理
  const handleKeyDown = (e: React.KeyboardEvent, diveId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedDiveId(diveId);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-dive-surface" role="region" aria-label="Dive List">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dive-border/50">
        <div className="flex items-center gap-3">
          <h2 className="text-cyan-400 font-semibold text-lg">Dives</h2>
          <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-900/30 text-cyan-400 tabular-nums">
            {filteredDives.length}
          </span>
        </div>
        <span className="text-dive-text-muted text-xs">
          of {useDiveStore.getState().dives.length} total
        </span>
      </div>
      
      {/* Search & Filter */}
      <div className="p-3 border-b border-dive-border/50 space-y-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search dives..."
        />
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={filterValidDivesOnly}
              aria-label="Filter valid dives only"
              onClick={() => setFilterValidDivesOnly(!filterValidDivesOnly)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                filterValidDivesOnly 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'bg-dive-card/50 text-dive-text-muted border border-transparent hover:bg-dive-card hover:text-dive-text-secondary'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {filterValidDivesOnly ? 'Valid Only' : 'All Dives'}
            </button>
            
            {/* 潜水类型筛选器 */}
            <select
              value={filterDiveType || ''}
              onChange={(e) => setFilterDiveType(e.target.value || null)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer focus:outline-none [&>option]:bg-dive-card [&>option]:text-dive-text ${
                filterDiveType 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'bg-dive-card/50 text-dive-text-muted border border-transparent hover:bg-dive-card hover:text-dive-text-secondary'
              }`}
              aria-label="Filter by dive type"
            >
              <option value="">All Types</option>
              {availableDiveTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          {/* 排序选择器 */}
          <div className="flex items-center gap-1.5">
            <select
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-') as [SortField, SortDirection];
                setSortField(field);
                setSortDirection(direction);
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-dive-card/50 text-dive-text-muted border border-transparent hover:bg-dive-card hover:text-dive-text-secondary focus:outline-none focus:bg-dive-card focus:text-dive-text-secondary transition-all duration-200 cursor-pointer [&>option]:bg-dive-card [&>option]:text-dive-text"
            >
              <option value="diveNumber-desc"># Descending</option>
              <option value="diveNumber-asc"># Ascending</option>
              <option value="date-desc">Latest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="maxDepth-desc">Deepest First</option>
              <option value="maxDepth-asc">Shallowest First</option>
              <option value="duration-desc">Longest First</option>
              <option value="duration-asc">Shortest First</option>
            </select>
            {(sortField !== 'diveNumber' || sortDirection !== 'desc') && (
              <button
                type="button"
                onClick={() => {
                  setSortField('diveNumber');
                  setSortDirection('desc');
                }}
                className="p-1.5 rounded-lg text-dive-text-muted hover:text-dive-text-secondary hover:bg-dive-card/50 transition-all duration-200"
                aria-label="Reset sort"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* 卡片列表 */}
      <div ref={containerRef} className="flex-1 overflow-auto p-3 space-y-2">
        {sortedDives.map((dive) => (
          <DiveCard
            key={dive.id}
            dive={dive}
            isSelected={selectedDiveId === dive.id}
            isPB={dive.diveType === 'FreeDive' && dive.id === freeDivePBId}
            onClick={() => setSelectedDiveId(dive.id)}
            onKeyDown={(e) => handleKeyDown(e, dive.id)}
          />
        ))}
        {sortedDives.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg className="w-12 h-12 text-dive-text-muted/50 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <p className="text-dive-text-muted text-sm">No dives found</p>
            {searchQuery && (
              <p className="text-dive-text-muted/70 text-xs mt-1">Try adjusting your search</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
