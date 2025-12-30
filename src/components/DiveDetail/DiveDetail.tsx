import { useState } from 'react';
import { useSelectedDive } from '../../store';
import { DiveChart } from '../DiveChart';
import { ResizablePanels } from '../ResizablePanels';
import { formatDepth, formatDurationReadable } from '../../utils';
import { Database, ChevronDown, ChevronUp } from 'lucide-react';

type TabId = 'summary' | 'gear' | 'environment' | 'gases' | 'problems' | 'computer';

const tabs: { id: TabId; label: string }[] = [
  { id: 'summary', label: 'Summary' },
  { id: 'gear', label: 'Gear' },
  { id: 'environment', label: 'Environment' },
  { id: 'gases', label: 'Gases' },
  { id: 'problems', label: 'Problems' },
  { id: 'computer', label: 'Computer' },
];

export function DiveDetail() {
  const dive = useSelectedDive();
  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const [viewMode, setViewMode] = useState<'graph' | 'stats'>('graph');
  
  if (!dive) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-gray-500">
        <Database className="w-12 h-12 mr-3 opacity-50" />
        <span className="text-lg">Select a dive to view details</span>
      </div>
    );
  }
  
  // 图表区域内容
  const chartContent = (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header Tabs - Graph / Stats */}
      <div className="flex border-b border-gray-700 flex-shrink-0">
        <button
          onClick={() => setViewMode('graph')}
          className={`px-6 py-2 text-sm font-medium transition-colors ${
            viewMode === 'graph'
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Graph
        </button>
        <button
          onClick={() => setViewMode('stats')}
          className={`px-6 py-2 text-sm font-medium transition-colors ${
            viewMode === 'stats'
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Stats
        </button>
        
        {/* Secondary Tabs */}
        <div className="flex-1 flex justify-center gap-2 px-4">
          {['Data', 'Analysis', 'Display', 'Settings'].map((label) => (
            <button
              key={label}
              className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Chart Area */}
      <div className="flex-1 min-h-0">
        {viewMode === 'graph' ? (
          <DiveChart profile={dive.profile} maxDepth={dive.maxDepth} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Statistics view coming soon...
          </div>
        )}
      </div>
    </div>
  );
  
  // 详情区域内容
  const detailContent = (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Detail Tabs */}
      <div className="flex border-b border-gray-700 bg-gray-800/50 flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-white bg-cyan-600'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'summary' && <SummaryTab dive={dive} />}
        {activeTab === 'gear' && <GearTab dive={dive} />}
        {activeTab === 'environment' && <EnvironmentTab dive={dive} />}
        {activeTab === 'gases' && <GasesTab dive={dive} />}
        {activeTab === 'problems' && <ProblemsTab dive={dive} />}
        {activeTab === 'computer' && <ComputerTab dive={dive} />}
      </div>
    </div>
  );
  
  return (
    <ResizablePanels
      direction="vertical"
      panels={[
        {
          content: chartContent,
          minSize: 150,
          defaultSize: 45,
        },
        {
          content: detailContent,
          minSize: 150,
          defaultSize: 55,
        },
      ]}
    />
  );
}

// Summary Tab
function SummaryTab({ dive }: { dive: NonNullable<ReturnType<typeof useSelectedDive>> }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left Column - Dive Info */}
      <div className="space-y-4">
        <InfoRow label="Max Depth" value={formatDepth(dive.maxDepth)} highlight />
        <InfoRow label="Average Depth" value={formatDepth(dive.avgDepth)} />
        <InfoRow label="Start Time" value={dive.startTime} />
        <InfoRow label="Duration" value={formatDurationReadable(dive.duration)} highlight className="text-green-400" />
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
}

// Gear Tab - 按截图布局
function GearTab({ dive }: { dive: NonNullable<ReturnType<typeof useSelectedDive>> }) {
  const gear = dive.gear;
  
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left Column - Form Fields */}
      <div className="col-span-2 space-y-6">
        {/* Dress */}
        <div>
          <label className="block text-white font-medium mb-2">Dress</label>
          <SelectField value={gear?.dress || ''} />
        </div>
        
        {/* Apparatus */}
        <div>
          <label className="block text-white font-medium mb-2">Apparatus</label>
          <SelectField value={gear?.apparatus || ''} />
        </div>
        
        {/* Tank Size */}
        <div>
          <label className="block text-white font-medium mb-2">Tank Size</label>
          <InputField value={gear?.tankSize || ''} />
        </div>
        
        {/* Weight */}
        <div>
          <label className="block text-white font-medium mb-2">Weight</label>
          <InputField value={gear?.weight ? `${gear.weight}` : ''} />
        </div>
      </div>
      
      {/* Right Column - Notes */}
      <div>
        <label className="block text-white font-medium mb-2">Gear Notes</label>
        <textarea 
          className="w-full h-64 bg-gray-700 border-none rounded-lg p-3 text-gray-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
          value={gear?.notes || ''}
          readOnly
          placeholder="No gear notes..."
        />
      </div>
    </div>
  );
}

// Environment Tab - 按截图布局
function EnvironmentTab({ dive }: { dive: NonNullable<ReturnType<typeof useSelectedDive>> }) {
  const env = dive.environment;
  
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left Column - Temperature Info */}
      <div className="space-y-4">
        <InfoRowWithUnit label="Min Temperature" value={env?.minTemp} unit="°C" />
        <InfoRowWithUnit label="Max Temperature" value={env?.maxTemp} unit="°C" />
        <InfoRowWithUnit label="Average Temperature" value={env?.avgTemp} unit="°C" />
        <InfoRowWithUnit label="Surface Pressure" value={env?.surfacePressure} unit="mBar" />
        
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div>
            <label className="block text-white font-medium mb-2">Air Temperature ( C F):</label>
            <InputField value={env?.airTemp?.toString() || ''} />
          </div>
          <div>
            <label className="block text-white font-medium mb-2">Visibility</label>
            <InputField value={env?.visibility?.toString() || ''} />
          </div>
        </div>
      </div>
      
      {/* Middle Column - Dropdowns */}
      <div className="space-y-4">
        <div>
          <label className="block text-white font-medium mb-2">Weather</label>
          <SelectField value={env?.weather || ''} />
        </div>
        
        <div>
          <label className="block text-white font-medium mb-2">Platform</label>
          <SelectField value={env?.platform || ''} />
        </div>
        
        <div>
          <label className="block text-white font-medium mb-2">Environment</label>
          <SelectField value={env?.environment || ''} />
        </div>
        
        <div>
          <label className="block text-white font-medium mb-2">Conditions</label>
          <SelectField value={env?.conditions || ''} />
        </div>
      </div>
      
      {/* Right Column - Notes */}
      <div>
        <label className="block text-white font-medium mb-2">Environment Notes</label>
        <textarea 
          className="w-full h-64 bg-gray-700 border-none rounded-lg p-3 text-gray-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
          value={env?.notes || ''}
          readOnly
          placeholder="No environment notes..."
        />
      </div>
    </div>
  );
}

// Gases Tab - 按截图布局
function GasesTab({ dive }: { dive: NonNullable<ReturnType<typeof useSelectedDive>> }) {
  const gasesInfo = dive.gasesInfo;
  const [expandedTanks, setExpandedTanks] = useState<Record<string, boolean>>({ 'Tank 1 (T1)': true });
  
  const toggleTank = (tankName: string) => {
    setExpandedTanks(prev => ({ ...prev, [tankName]: !prev[tankName] }));
  };
  
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left Column - Gas Types & Air Integration */}
      <div className="space-y-6">
        {/* OC Gases */}
        <div>
          <h3 className="text-white font-bold mb-3">OC Gases</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Programmed</span>
              <span className="text-gray-200">{gasesInfo?.ocGases?.programmed || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Used</span>
              <span className="text-gray-200">{gasesInfo?.ocGases?.used || '-'}</span>
            </div>
          </div>
        </div>
        
        {/* CC Gases */}
        <div>
          <h3 className="text-white font-bold mb-3">CC Gases</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Programmed</span>
              <span className="text-gray-200">{gasesInfo?.ccGases?.programmed || 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Used</span>
              <span className="text-gray-200">{gasesInfo?.ccGases?.used || 'None'}</span>
            </div>
          </div>
        </div>
        
        {/* Air Integration */}
        <div>
          <h3 className="text-white font-bold mb-3">Air Integration</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">AI Enabled</span>
              <span className="text-gray-200">{gasesInfo?.airIntegration?.aiEnabled ? 'On' : 'Off'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Transmitters</span>
              <div className="text-gray-200 text-right">
                {gasesInfo?.airIntegration?.transmitters?.map((t, i) => (
                  <div key={i}>{t}</div>
                )) || '-'}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">GTR Mode</span>
              <span className="text-gray-200">{gasesInfo?.airIntegration?.gtrMode || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">SAC (Recorded)</span>
              <span className="text-cyan-400">{gasesInfo?.airIntegration?.sacRecorded?.toFixed(2) || '-'} <span className="text-cyan-400">Bar/min</span></span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Middle Column - Tanks */}
      <div className="space-y-4">
        {gasesInfo?.tanks?.map((tank) => (
          <div key={tank.name} className="bg-gray-800 rounded-lg overflow-hidden">
            {/* Tank Header */}
            <button
              onClick={() => toggleTank(tank.name)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-700 transition-colors"
            >
              <span className="text-white font-medium">{tank.name}</span>
              {expandedTanks[tank.name] ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {/* Tank Content */}
            {expandedTanks[tank.name] && (
              <div className="px-4 pb-4 space-y-3 text-sm">
                <div>
                  <span className="text-cyan-400">Start Pressure (Bar)</span>
                  <div className="text-gray-200 mt-1">{tank.startPressure?.toFixed(2) || '-'}</div>
                </div>
                <div>
                  <span className="text-cyan-400">End Pressure (Bar)</span>
                  <div className="text-gray-200 mt-1">{tank.endPressure?.toFixed(2) || '-'}</div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pressure Change</span>
                  <span className="text-cyan-400">{tank.pressureChange?.toFixed(2) || '-'} <span className="text-cyan-400">Bar</span></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Transmitter</span>
                  <span className="text-gray-200">{tank.transmitter || '-'}</span>
                </div>
                
                {tank.gasUsage && (
                  <>
                    <div>
                      <span className="text-white font-medium">Gas Usage</span>
                      <SelectField value={tank.gasUsage} className="mt-2" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Average Depth</span>
                      <span className="text-cyan-400">{tank.avgDepth?.toFixed(1) || '-'} <span className="text-cyan-400">m</span></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">SAC (Calculated)</span>
                      <span className="text-cyan-400">{tank.sacCalculated?.toFixed(2) || '-'} <span className="text-cyan-400">Bar/min</span></span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Right Column - Notes */}
      <div>
        <label className="block text-white font-medium mb-2">Gas Notes</label>
        <textarea 
          className="w-full h-64 bg-gray-700 border-none rounded-lg p-3 text-gray-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
          value={gasesInfo?.notes || ''}
          readOnly
          placeholder="No gas notes..."
        />
      </div>
    </div>
  );
}

// Problems Tab - 按截图布局
function ProblemsTab({ dive }: { dive: NonNullable<ReturnType<typeof useSelectedDive>> }) {
  const problemsInfo = dive.problemsInfo;
  
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="space-y-6">
        <div>
          <label className="block text-white font-medium mb-2">Thermal Comfort</label>
          <SelectField value={problemsInfo?.thermalComfort || ''} />
        </div>
        
        <div>
          <label className="block text-white font-medium mb-2">Workload</label>
          <SelectField value={problemsInfo?.workload || ''} />
        </div>
        
        <div>
          <label className="block text-white font-medium mb-2">Problems</label>
          <SelectField value={problemsInfo?.problems || ''} />
        </div>
      </div>
      
      {/* Middle Column */}
      <div className="space-y-6">
        <div>
          <label className="block text-white font-medium mb-2">Equipment Malfunction</label>
          <SelectField value={problemsInfo?.equipmentMalfunction || ''} />
        </div>
        
        <div>
          <label className="block text-white font-medium mb-2">Any Symptoms</label>
          <SelectField value={problemsInfo?.anySymptoms || ''} />
        </div>
        
        <div>
          <label className="block text-white font-medium mb-2">Exposure to Altitude</label>
          <SelectField value={problemsInfo?.exposureToAltitude || ''} />
        </div>
      </div>
      
      {/* Right Column - Notes */}
      <div>
        <label className="block text-white font-medium mb-2">Problems Notes</label>
        <textarea 
          className="w-full h-64 bg-gray-700 border-none rounded-lg p-3 text-gray-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
          value={problemsInfo?.notes || ''}
          readOnly
          placeholder="No problems notes..."
        />
      </div>
    </div>
  );
}

// Computer Tab - 按截图布局
function ComputerTab({ dive }: { dive: NonNullable<ReturnType<typeof useSelectedDive>> }) {
  const info = dive.computerInfo;
  
  return (
    <div className="grid grid-cols-2 gap-8">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Computer Section */}
        <div>
          <h3 className="text-white font-bold mb-4">Computer:</h3>
          <div className="space-y-2 text-sm ml-2">
            <InfoRowSimple label="Model:" value={info?.model || dive.diveComputer.model} />
            <InfoRowSimple label="Serial Number:" value={info?.serial || dive.diveComputer.serial} />
            <InfoRowSimple label="OEM:" value={info?.oem || '-'} />
            <InfoRowSimple label="Firmware Version:" value={info?.firmwareVersion || '-'} valueColor="cyan" />
            <InfoRowSimple label="Language:" value={info?.language || '-'} />
            <InfoRowSimple label="Data Format:" value={info?.dataFormat || '-'} />
            <InfoRowSimple label="Log Version:" value={info?.logVersion || '-'} valueColor="cyan" />
            <InfoRowSimple label="DB Version:" value={info?.dbVersion || '-'} valueColor="cyan" />
          </div>
        </div>
        
        {/* Battery Section */}
        <div>
          <h3 className="text-white font-bold mb-4">Battery:</h3>
          <div className="space-y-2 text-sm ml-2">
            <InfoRowSimple label="Battery Type:" value={info?.battery?.type || '-'} />
            <InfoRowSimple label="Battery V(Start):" value={info?.battery?.vStart?.toFixed(2) || '-'} valueColor="cyan" />
            <InfoRowSimple label="Battery V(End):" value={info?.battery?.vEnd?.toFixed(2) || '-'} valueColor="cyan" />
          </div>
        </div>
      </div>
      
      {/* Right Column */}
      <div className="space-y-6">
        {/* Date/Time Section */}
        <div>
          <h3 className="text-white font-bold mb-4">Date / Time:</h3>
          <div className="space-y-2 text-sm ml-2">
            <InfoRowSimple label="Timezone Offset:" value={`${info?.dateTime?.timezoneOffset || 0}h`} valueColor="cyan" />
            <InfoRowSimple label="Daylight Savings:" value={info?.dateTime?.daylightSavings ? 'On' : 'Off'} />
          </div>
        </div>
        
        {/* Dive Section */}
        <div>
          <h3 className="text-white font-bold mb-4">Dive:</h3>
          <div className="space-y-2 text-sm ml-2">
            <InfoRowSimple label="Mode:" value={info?.dive?.mode || dive.diveType} />
            <InfoRowSimple label="Sample Rate:" value={`${info?.dive?.sampleRate || 10}s`} valueColor="cyan" />
            <InfoRowSimple label="Recorded Units:" value={info?.dive?.recordedUnits || 'Metric'} />
            <InfoRowSimple label="Salinity Setting:" value={info?.dive?.salinitySetting || '-'} />
            <InfoRowSimple label="Surface Pressure:" value={`${info?.dive?.surfacePressure || '-'}`} valueColor="cyan" unit="mBar" />
            <InfoRowSimple label="Surface Interval:" value={info?.dive?.surfaceInterval || '-'} valueColor="cyan" />
          </div>
        </div>
        
        {/* Deco Section */}
        <div>
          <h3 className="text-white font-bold mb-4">Deco:</h3>
          <div className="space-y-2 text-sm ml-2">
            <InfoRowSimple label="CNS Start:" value={info?.deco?.cnsStart?.toString() || '0'} />
            <InfoRowSimple label="CNS End:" value={info?.deco?.cnsEnd?.toString() || '0'} />
            <InfoRowSimple label="Deco Model:" value={info?.deco?.decoModel || '-'} />
            <InfoRowSimple label="End Surface GF:" value={`${info?.deco?.endSurfaceGF || '-'}%`} valueColor="cyan" />
            <InfoRowSimple label="Conservatism:" value={info?.deco?.conservatism || '-'} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function InfoRow({ 
  label, 
  value, 
  highlight = false,
  className = ''
}: { 
  label: string; 
  value: string; 
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className={`font-mono ${highlight ? 'text-cyan-400 font-semibold' : 'text-gray-200'} ${className}`}>
        {value}
      </span>
    </div>
  );
}

function InfoRowWithUnit({ label, value, unit }: { label: string; value?: number; unit: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-gray-400">{label}</span>
      <span>
        <span className="text-gray-200">{value ?? '-'}</span>
        {value !== undefined && <span className="text-cyan-400 ml-1">{unit}</span>}
      </span>
    </div>
  );
}

function InfoRowSimple({ 
  label, 
  value, 
  valueColor = 'white',
  unit 
}: { 
  label: string; 
  value: string; 
  valueColor?: 'white' | 'cyan';
  unit?: string;
}) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-gray-400">{label}</span>
      <span className={valueColor === 'cyan' ? 'text-cyan-400' : 'text-gray-200'}>
        {value}{unit && <span className="text-cyan-400 ml-1">{unit}</span>}
      </span>
    </div>
  );
}

function SelectField({ value, className = '' }: { value: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="w-full px-4 py-2.5 bg-gray-700 rounded-lg text-gray-300 text-sm flex items-center justify-between">
        <span>{value || '\u00A0'}</span>
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
}

function InputField({ value }: { value: string }) {
  return (
    <div className="border-b border-gray-600 py-2">
      <span className="text-gray-300">{value || '\u00A0'}</span>
    </div>
  );
}

function EmptyState({ message, icon = '📋' }: { message: string; icon?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-40 text-gray-500">
      <span className="text-4xl mb-3">{icon}</span>
      <span>{message}</span>
    </div>
  );
}
