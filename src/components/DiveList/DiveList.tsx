import { useDiveStore, useFilteredDives } from '../../store';
import { SearchInput } from '../ui';
import { formatDuration, formatDepth } from '../../utils';

export function DiveList() {
  const { selectedDiveId, setSelectedDiveId, filterText, setFilterText } = useDiveStore();
  const filteredDives = useFilteredDives();
  
  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <h2 className="text-cyan-400 font-semibold text-lg">Dive List</h2>
        <span className="text-gray-400 text-sm">
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
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-900 z-10">
            <tr className="text-left text-gray-400 border-b border-gray-700">
              <th className="px-3 py-2 font-medium">Dive #</th>
              <th className="px-3 py-2 font-medium">Date / Time</th>
              <th className="px-3 py-2 font-medium">Dive Computer</th>
              <th className="px-3 py-2 font-medium">Dive Type</th>
              <th className="px-3 py-2 font-medium">Location</th>
              <th className="px-3 py-2 font-medium text-right">Max Depth</th>
              <th className="px-3 py-2 font-medium text-right">Duration</th>
            </tr>
          </thead>
          <tbody>
            {filteredDives.map((dive) => (
              <tr
                key={dive.id}
                onClick={() => setSelectedDiveId(dive.id)}
                className={`cursor-pointer border-b border-gray-800 transition-colors ${
                  selectedDiveId === dive.id
                    ? 'bg-cyan-900/40 text-cyan-100'
                    : 'text-gray-300 hover:bg-gray-800/50'
                }`}
              >
                <td className="px-3 py-2">{dive.diveNumber}</td>
                <td className="px-3 py-2">
                  {dive.date} {dive.startTime}
                </td>
                <td className="px-3 py-2">
                  {dive.diveComputer.model} ({dive.diveComputer.serial})
                </td>
                <td className="px-3 py-2">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                    dive.diveType === 'Air' ? 'bg-blue-900/50 text-blue-300' :
                    dive.diveType === 'Nitrox' ? 'bg-green-900/50 text-green-300' :
                    dive.diveType === 'Gauge' ? 'bg-yellow-900/50 text-yellow-300' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {dive.diveType}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className="text-cyan-400">{dive.site}</span>
                  {dive.site !== dive.location && (
                    <span className="text-gray-500 ml-1">({dive.location})</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right font-mono">
                  {formatDepth(dive.maxDepth)}
                </td>
                <td className="px-3 py-2 text-right font-mono">
                  {formatDuration(dive.duration)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredDives.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            No dives found matching "{filterText}"
          </div>
        )}
      </div>
    </div>
  );
}
