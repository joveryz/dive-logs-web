import { useMemo, useState, useRef, useEffect, useCallback, memo } from 'react';
import { MapPin, ArrowDown, Clock, Filter, Search, ChevronDown, ChevronUp, ChevronRight, Heart, Calendar, ListOrdered } from 'lucide-react';
import { useDiveStore, selectDives } from '@/store';
import { useFilteredDives, getFreeDivePBIds } from '@/hooks';
import { SearchInput, Badge } from '@/components/common';
import { formatDuration, formatDepth, compareOptional, compareNumbers } from '@/utils';
import type { SortField, SortDirection, Dive } from '@/types';

// 潜水卡片组件 - 两行紧凑布局
const DiveCard = ({ 
  dive, 
  isSelected, 
  isPB, 
  displayNumber,
  onClick,
  onKeyDown 
}: { 
  dive: Dive; 
  isSelected: boolean; 
  isPB: boolean;
  displayNumber?: number;
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
    {/* 第一行：编号、类型、PB、地点、日期时间 */}
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className={`text-xl font-bold tabular-nums shrink-0 leading-none ${isSelected ? 'text-cyan-400' : 'text-dive-text group-hover:text-cyan-400'}`}>
          #{displayNumber !== undefined ? displayNumber : dive.diveNumber}
        </span>
        <Badge variant={dive.diveType} className="text-xs whitespace-nowrap shrink-0">{dive.diveType}</Badge>
        {isPB && (
          <Badge variant="PB" className="text-xs shrink-0">PB</Badge>
        )}
        <div 
          className="flex items-center gap-1 ml-1 min-w-0 text-cyan-400 font-semibold"
          title={dive.site !== dive.location ? `${dive.site} (${dive.location})` : dive.site}
        >
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="text-sm truncate">
            {dive.site}
            {dive.site !== dive.location && ` (${dive.location})`}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-sm leading-none shrink-0 ml-2 text-dive-text">
        <span>{dive.date}</span>
        <span>{dive.startTime}</span>
      </div>
    </div>

    {/* 第二行：深度、时长、心率、潜水员、伙伴、标签 */}
    <div className="flex items-center justify-between pt-2 border-t border-dive-border/30">
      <div className="flex items-center gap-3 shrink-0">
        {/* 深度 */}
        <div className="flex items-center gap-1">
          <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-mono font-semibold text-sm text-blue-400">{formatDepth(dive.maxDepth)}</span>
        </div>
        {/* 时长 */}
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-green-400" />
          <span className="font-mono font-semibold text-sm text-green-400">{formatDuration(dive.duration)}</span>
        </div>
        {/* 心率：平均/最低 */}
        {(dive.environment?.avgHeartRate || dive.environment?.minHeartRate) && (
          <div className="flex items-center gap-1" title="心率 (平均/最低)">
            <Heart className="w-3.5 h-3.5 text-pink-400" />
            <span className="font-mono font-semibold text-sm text-pink-400">
              {dive.environment?.avgHeartRate ?? '-'}/{dive.environment?.minHeartRate ?? '-'}
            </span>
          </div>
        )}
      </div>
      
      {/* 右侧信息 */}
      <div className="flex items-center gap-2">
        {dive.diver && (
          <Badge variant="diver" className="text-xs">{dive.diver}</Badge>
        )}
        {dive.buddy && (
          <Badge variant="buddy" className="text-xs">{dive.buddy}</Badge>
        )}
        {dive.tags && dive.tags.length > 0 && (
          <div className="flex gap-1">
            {dive.tags.slice(0, 2).map((tag, idx) => (
              <Badge key={idx} variant="tag" className="text-[10px]">#{tag}</Badge>
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

// 日期分组标题组件
const DateHeader = memo(({ 
  date, 
  count, 
  isExpanded, 
  onToggle 
}: { 
  date: string; 
  count: number; 
  isExpanded: boolean;
  onToggle: () => void;
}) => (
  <div
    onClick={onToggle}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onToggle();
      }
    }}
    tabIndex={0}
    role="button"
    aria-expanded={isExpanded}
    className="sticky top-0 z-10 flex items-center justify-between px-3 py-2 bg-dive-surface/95 backdrop-blur border-b border-dive-border/30 cursor-pointer hover:bg-dive-card/50 transition-colors group"
  >
    <div className="flex items-center gap-2">
      {isExpanded ? (
        <ChevronDown className="w-4 h-4 text-dive-text-muted group-hover:text-cyan-400 transition-colors" />
      ) : (
        <ChevronRight className="w-4 h-4 text-dive-text-muted group-hover:text-cyan-400 transition-colors" />
      )}
      <Calendar className="w-4 h-4 text-cyan-400" />
      <span className="text-sm font-medium text-dive-text">{date}</span>
    </div>
    <Badge variant="default" className="text-xs">
      {count} dive{count > 1 ? 's' : ''}
    </Badge>
  </div>
));
DateHeader.displayName = 'DateHeader';

// 分组项类型
type GroupedItem = 
  | { type: 'header'; date: string; count: number }
  | { type: 'dive'; date: string; dive: Dive };

export function DiveList() {
  const { 
    selectedDiveId, 
    setSelectedDiveId, 
    searchQuery, 
    setSearchQuery, 
    filterValidDivesOnly, 
    setFilterValidDivesOnly,
    filterDiveType,
    setFilterDiveType,
    filterDiver,
    setFilterDiver,
    filterDateMonth,
    setFilterDateMonth,
    filterTag,
    setFilterTag,
    filterLocation,
    setFilterLocation,
    filterSite,
    setFilterSite,
    listScrollTop,
    setListScrollTop,
    showFilteredIndex,
    setShowFilteredIndex
  } = useDiveStore();
  const filteredDives = useFilteredDives();
  const allDivesForTypes = useDiveStore(selectDives);
  
  // 获取所有可用的潜水类型（去重）
  const availableDiveTypes = useMemo(() => {
    const types = new Set(allDivesForTypes.map(d => d.diveType));
    return Array.from(types).sort();
  }, [allDivesForTypes]);
  
  // 获取所有可用的潜水员（去重）
  const availableDivers = useMemo(() => {
    const divers = new Set(allDivesForTypes.map(d => d.diver).filter((d): d is string => !!d));
    return Array.from(divers).sort();
  }, [allDivesForTypes]);

  // 获取所有可用的月份（去重，降序）
  const availableDates = useMemo(() => {
    const dates = new Set(allDivesForTypes.map(d => d.date));
    return Array.from(dates).sort().reverse();
  }, [allDivesForTypes]);

  // 获取所有可用的标签（去重，按字母排序）
  const availableTags = useMemo(() => {
    const tags = new Set(allDivesForTypes.flatMap(d => d.tags || []));
    return Array.from(tags).sort();
  }, [allDivesForTypes]);

  // 获取所有可用的地点（去重，按字母排序）
  const availableLocations = useMemo(() => {
    const locations = new Set(allDivesForTypes.map(d => d.location));
    return Array.from(locations).sort();
  }, [allDivesForTypes]);

  // 获取所有可用的潜点（去重，按字母排序）
  const availableSites = useMemo(() => {
    const sites = new Set(allDivesForTypes.map(d => d.site));
    return Array.from(sites).sort();
  }, [allDivesForTypes]);

  const [sortField, setSortField] = useState<SortField>('diveNumber');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());

  // 切换日期折叠状态
  const toggleDateCollapse = useCallback((date: string) => {
    setCollapsedDates(prev => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  }, []);
  const containerRef = useRef<HTMLDivElement>(null);

  // 恢复滚动位置
  useEffect(() => {
    if (containerRef.current && listScrollTop > 0) {
      containerRef.current.scrollTop = listScrollTop;
    }
  }, []);

  // 保存滚动位置
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setListScrollTop(containerRef.current.scrollTop);
    }
  }, [setListScrollTop]);

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
        case 'avgHeartRate':
          comparison = compareOptional(
            a.environment?.avgHeartRate,
            b.environment?.avgHeartRate,
            compareNumbers,
            sortDirection
          );
          break;
        case 'minHeartRate':
          comparison = compareOptional(
            a.environment?.minHeartRate,
            b.environment?.minHeartRate,
            compareNumbers,
            sortDirection
          );
          break;
        default:
          comparison = a.diveNumber - b.diveNumber;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredDives, sortField, sortDirection]);

  // FreeDive PB (Personal Best) - 每个 diver 的最深 FreeDive
  const allDives = useDiveStore(selectDives);
  const freeDivePBIds = useMemo(() => {
    return getFreeDivePBIds(allDives);
  }, [allDives]);

  // 是否启用日期分组（仅在 diveNumber 或 date 排序时）
  const enableDateGrouping = sortField === 'diveNumber' || sortField === 'date';

  // 按日期分组的列表项
  const groupedItems = useMemo<GroupedItem[]>(() => {
    if (!enableDateGrouping) return [];

    // 按日期分组
    const groups = new Map<string, Dive[]>();
    for (const dive of sortedDives) {
      const existing = groups.get(dive.date);
      if (existing) {
        existing.push(dive);
      } else {
        groups.set(dive.date, [dive]);
      }
    }

    // 转换为扁平列表
    const items: GroupedItem[] = [];
    // 日期组顺序与当前排序方向一致
    const sortedDates = Array.from(groups.keys()).sort((a, b) => {
      const cmp = a.localeCompare(b);
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    for (const date of sortedDates) {
      const dives = groups.get(date)!;
      items.push({ type: 'header', date, count: dives.length });
      if (!collapsedDates.has(date)) {
        for (const dive of dives) {
          items.push({ type: 'dive', date, dive });
        }
      }
    }

    return items;
  }, [enableDateGrouping, sortedDives, sortDirection, collapsedDates]);

  // 计算每个 dive 的显示序号映射（基于 sortedDives 索引，倒序）
  const diveIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    const total = sortedDives.length;
    sortedDives.forEach((dive, index) => {
      map.set(dive.id, total - index);
    });
    return map;
  }, [sortedDives]);
  
  // 键盘导航处理
  const handleKeyDown = (e: React.KeyboardEvent, diveId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedDiveId(diveId);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-dive-surface" role="region" aria-label="Dive List">
      {/* Search & Filter */}
      <div className="p-3 border-b border-dive-border/50 space-y-2">
        <div className="flex items-center gap-2">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search... (e.g. depth>20)"
            suffix={<><span className="text-cyan-400">{filteredDives.length}</span>/{useDiveStore.getState().dives.length}</>}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded transition-all ${showFilters ? 'bg-cyan-500/20 text-cyan-400' : 'text-dive-text-muted hover:text-dive-text-secondary'}`}
            aria-label={showFilters ? 'Hide filters' : 'Show filters'}
            aria-expanded={showFilters}
          >
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        {showFilters && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Valid 筛选 */}
            <button
              type="button"
              role="switch"
              aria-checked={filterValidDivesOnly}
              aria-label="Filter valid dives only"
              onClick={() => setFilterValidDivesOnly(!filterValidDivesOnly)}
              className={`h-6 px-2 flex items-center justify-center gap-1 rounded text-xs font-medium transition-all ${
                filterValidDivesOnly 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'bg-dive-card/50 text-dive-text-muted border border-transparent hover:text-dive-text-secondary'
              }`}
            >
              <Filter className="w-3 h-3" />
              {filterValidDivesOnly ? 'Valid' : 'All'}
            </button>
            
            {/* 临时序号 Toggle */}
            <button
              type="button"
              role="switch"
              aria-checked={showFilteredIndex}
              aria-label="Show filtered index numbers"
              onClick={() => setShowFilteredIndex(!showFilteredIndex)}
              className={`h-6 px-2 flex items-center justify-center gap-1 rounded text-xs font-medium transition-all ${
                showFilteredIndex 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'bg-dive-card/50 text-dive-text-muted border border-transparent hover:text-dive-text-secondary'
              }`}
            >
              <ListOrdered className="w-3 h-3" />
              Renumber
            </button>
            
            {/* 潜水员筛选器 */}
            {availableDivers.length > 1 && (
              <select
                value={filterDiver || ''}
                onChange={(e) => setFilterDiver(e.target.value || null)}
                className={`h-6 px-1 rounded text-xs font-medium transition-all cursor-pointer focus:outline-none [&>option]:bg-dive-card [&>option]:text-dive-text ${
                  filterDiver 
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                    : 'bg-dive-card/50 text-dive-text-muted border border-transparent hover:text-dive-text-secondary'
                }`}
                aria-label="Filter by diver"
              >
                <option value="">Diver</option>
                {availableDivers.map((diver) => (
                  <option key={diver} value={diver}>{diver}</option>
                ))}
              </select>
            )}
          
            {/* 潜水类型筛选器 */}
            <select
              value={filterDiveType || ''}
              onChange={(e) => setFilterDiveType(e.target.value || null)}
              className={`h-6 px-1 rounded text-xs font-medium transition-all cursor-pointer focus:outline-none [&>option]:bg-dive-card [&>option]:text-dive-text ${
                filterDiveType 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'bg-dive-card/50 text-dive-text-muted border border-transparent hover:text-dive-text-secondary'
              }`}
              aria-label="Filter by dive type"
            >
              <option value="">Type</option>
              {availableDiveTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            {/* 日期筛选器 */}
            <select
              value={filterDateMonth || ''}
              onChange={(e) => setFilterDateMonth(e.target.value || null)}
              className={`h-6 px-1 rounded text-xs font-medium transition-all cursor-pointer focus:outline-none [&>option]:bg-dive-card [&>option]:text-dive-text ${
                filterDateMonth 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'bg-dive-card/50 text-dive-text-muted border border-transparent hover:text-dive-text-secondary'
              }`}
              aria-label="Filter by date"
            >
              <option value="">Date</option>
              {availableDates.map((date) => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
            
            {/* 标签筛选器 */}
            {availableTags.length > 0 && (
              <select
                value={filterTag || ''}
                onChange={(e) => setFilterTag(e.target.value || null)}
                className={`h-6 px-1 rounded text-xs font-medium transition-all cursor-pointer focus:outline-none [&>option]:bg-dive-card [&>option]:text-dive-text ${
                  filterTag 
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                    : 'bg-dive-card/50 text-dive-text-muted border border-transparent hover:text-dive-text-secondary'
                }`}
                aria-label="Filter by tag"
              >
                <option value="">Tag</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>#{tag}</option>
                ))}
              </select>
            )}

            {/* 地点筛选器 */}
            {availableLocations.length > 1 && (
              <select
                value={filterLocation || ''}
                onChange={(e) => setFilterLocation(e.target.value || null)}
                className={`h-6 px-1 rounded text-xs font-medium transition-all cursor-pointer focus:outline-none [&>option]:bg-dive-card [&>option]:text-dive-text ${
                  filterLocation 
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                    : 'bg-dive-card/50 text-dive-text-muted border border-transparent hover:text-dive-text-secondary'
                }`}
                aria-label="Filter by location"
              >
                <option value="">Location</option>
                {availableLocations.map((location) => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            )}

            {/* 潜点筛选器 */}
            {availableSites.length > 1 && (
              <select
                value={filterSite || ''}
                onChange={(e) => setFilterSite(e.target.value || null)}
                className={`h-6 px-1 rounded text-xs font-medium transition-all cursor-pointer focus:outline-none [&>option]:bg-dive-card [&>option]:text-dive-text ${
                  filterSite 
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                    : 'bg-dive-card/50 text-dive-text-muted border border-transparent hover:text-dive-text-secondary'
                }`}
                aria-label="Filter by site"
              >
                <option value="">Site</option>
                {availableSites.map((site) => (
                  <option key={site} value={site}>{site}</option>
                ))}
              </select>
            )}

            {/* 排序 */}
            <select
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-') as [SortField, SortDirection];
                setSortField(field);
                setSortDirection(direction);
              }}
              className="h-6 px-1 rounded text-xs font-medium bg-dive-card/50 text-dive-text-muted border border-transparent hover:text-dive-text-secondary focus:outline-none transition-all cursor-pointer [&>option]:bg-dive-card [&>option]:text-dive-text"
            >
              <option value="diveNumber-desc"># ↓</option>
              <option value="diveNumber-asc"># ↑</option>
              <option value="date-desc">Date ↓</option>
              <option value="date-asc">Date ↑</option>
              <option value="maxDepth-desc">Depth ↓</option>
              <option value="maxDepth-asc">Depth ↑</option>
              <option value="duration-desc">Time ↓</option>
              <option value="duration-asc">Time ↑</option>
              <option value="avgHeartRate-desc">Avg HR ↓</option>
              <option value="avgHeartRate-asc">Avg HR ↑</option>
              <option value="minHeartRate-desc">Min HR ↓</option>
              <option value="minHeartRate-asc">Min HR ↑</option>
            </select>
          </div>
        )}
      </div>
      
      {/* 卡片列表 */}
      <div ref={containerRef} className="flex-1 overflow-auto p-3 space-y-2" onScroll={handleScroll}>
        {enableDateGrouping ? (
          // 日期分组模式
          groupedItems.map((item) => 
            item.type === 'header' ? (
              <DateHeader
                key={`header-${item.date}`}
                date={item.date}
                count={item.count}
                isExpanded={!collapsedDates.has(item.date)}
                onToggle={() => toggleDateCollapse(item.date)}
              />
            ) : (
              <DiveCard
                key={item.dive.id}
                dive={item.dive}
                isSelected={selectedDiveId === item.dive.id}
                isPB={item.dive.diveType === 'FreeDive' && freeDivePBIds.has(item.dive.id)}
                displayNumber={showFilteredIndex ? diveIndexMap.get(item.dive.id) : undefined}
                onClick={() => setSelectedDiveId(item.dive.id)}
                onKeyDown={(e) => handleKeyDown(e, item.dive.id)}
              />
            )
          )
        ) : (
          // 普通排序模式
          sortedDives.map((dive, index) => (
            <DiveCard
              key={dive.id}
              dive={dive}
              isSelected={selectedDiveId === dive.id}
              isPB={dive.diveType === 'FreeDive' && freeDivePBIds.has(dive.id)}
              displayNumber={showFilteredIndex ? sortedDives.length - index : undefined}
              onClick={() => setSelectedDiveId(dive.id)}
              onKeyDown={(e) => handleKeyDown(e, dive.id)}
            />
          ))
        )}
        {sortedDives.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="w-12 h-12 text-dive-text-muted/50 mb-3" />
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
