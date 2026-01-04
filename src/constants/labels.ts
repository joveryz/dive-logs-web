/**
 * UI 标签常量
 * @module constants/labels
 */

// ============================================================================
// 图表系列标签（基于 Sample 字段 + 派生字段）
// ============================================================================

export const chartSeriesLabels: Record<string, string> = {
  depth: 'Depth',
  temperature: 'Temperature',
  heartRate: 'Heart Rate',
  ndl: 'NDL',
  tts: 'TTS',
  tts5: 'TTS @+5',
  cns: 'CNS',
  gf99: 'GF99',
  gasDensity: 'Gas Density',
  ppO2: 'ppO₂',
  ppN2: 'ppN₂',
  ppHe: 'ppHe',
  tank1Pressure: 'Tank 1',
  tank2Pressure: 'Tank 2',
  tank3Pressure: 'Tank 3',
  tank4Pressure: 'Tank 4',
  sac: 'SAC',
  ascentRate: 'Ascent',
  deco: 'Deco',
  ceiling: 'Ceiling',
};

// ============================================================================
// UI 通用标签（用于界面显示）
// ============================================================================

export const uiLabels = {
  // Tab 标签
  diveSummary: 'Summary',
  computer: 'Computer',
  diveList: 'Dive List',
  diveDetail: 'Dive Detail',
  graph: 'Graph',
  stats: 'Stats',
  
  // Section 标题
  sectionDiveInfo: 'Dive Info',
  sectionLocationBuddy: 'Location & Buddy',
  sectionEnvironment: 'Environment',
  sectionDecompression: 'Decompression',
  sectionGases: 'Gases',
  sectionGear: 'Gear',
  sectionTags: 'Tags',
  sectionComputer: 'Computer',
  sectionBattery: 'Battery',
  sectionDiveSettings: 'Dive Settings',
  sectionDecoSettings: 'Decompression Settings',
  
  // 列表表头
  diveNumber: '#',
  date: 'Date',
  type: 'Type',
  diveType: 'Type',
  diveComputer: 'Computer',
  location: 'Location',
  maxDepth: 'Depth',
  duration: 'Duration',
  
  // 详情页标签
  avgDepth: 'Avg Depth',
  maxAscent: 'Max Ascent',
  maxDescent: 'Max Descent',
  avgAscent: 'Avg Ascent',
  avgDescent: 'Avg Descent',
  startTime: 'Start Time',
  endTime: 'End Time',
  buddy: 'Buddy',
  site: 'Site',
  notes: 'Notes',
  tags: 'Tags',
  rating: 'Rating',
  
  // 环境标签
  minTemp: 'Min Temp',
  maxTemp: 'Max Temp',
  avgTemp: 'Avg Temp',
  surfacePressure: 'Surface Pressure',
  maxHeartRate: 'Max HR',
  minHeartRate: 'Min HR',
  avgHeartRate: 'Avg HR',
  airTemp: 'Air Temp',
  visibility: 'Visibility',
  weather: 'Weather',
  platform: 'Platform',
  environment: 'Environment',
  conditions: 'Conditions',
  waterDensity: 'Water Density',
  waterType: 'Water Type',
  surfaceInterval: 'Surface Interval',
  
  // 电脑标签
  model: 'Model',
  serial: 'Serial',
  serialNumber: 'Serial Number',
  oem: 'OEM',
  firmware: 'Firmware',
  firmwareVersion: 'Firmware Version',
  language: 'Language',
  dataFormat: 'Data Format',
  batteryType: 'Battery Type',
  voltageStart: 'Voltage Start',
  voltageEnd: 'Voltage End',
  
  // 潜水设置标签
  mode: 'Mode',
  sampleRate: 'Sample Rate',
  
  // 减压标签
  deco: 'Deco',
  decoModel: 'Deco Model',
  gfSetting: 'GF Setting',
  cns: 'CNS',
  cnsStart: 'CNS Start',
  cnsEnd: 'CNS End',
  gf99Max: 'GF99 Max',
  surfaceGFEnd: 'SurGF End',
  
  // 装备标签
  dress: 'Dress',
  weight: 'Weight',
  tank: 'Tank',
  
  // 气体标签
  gases: 'Gases',
  ocGases: 'OC Gases',
  ccGases: 'CC Gases',
  programmed: 'Programmed',
  used: 'Used',
  airIntegration: 'Air Integration',
  aiEnabled: 'AI Enabled',
  transmitters: 'Transmitters',
  transmitter: 'Transmitter',
  sacRecorded: 'SAC (Recorded)',
  sacCalculated: 'SAC (Calculated)',
  startPressure: 'Start Pressure',
  endPressure: 'End Pressure',
  pressureChange: 'Pressure Change',
  gasUsage: 'Gas Usage',
  gasNotes: 'Gas Notes',
  noGasesData: 'No gases data available.',
  noTankData: 'No tank data available.',
  
  // 状态文案
  emptyState: 'Select a dive to view details',
  statsComingSoon: 'Statistics view coming soon...',
  noNotes: 'No notes for this dive.',
} as const;

// ============================================================================
// 向后兼容：合并所有标签为 fieldLabels
// ============================================================================

export const fieldLabels: Record<string, string> = {
  ...chartSeriesLabels,
  ...uiLabels,
};

// ============================================================================
// Dive Mode 映射（CSV Mode -> DiveType）
// ============================================================================

import type { DiveType } from '@/types';

export const diveModeMapping: Record<string, DiveType> = {
  'CC/BO': 'CC/BO',
  'OC Tec': 'OC Tec',
  'OC Rec': 'OC Rec',
  'Gauge': 'FreeDive',
  'Free Dive': 'FreeDive',
  'Avelo': 'Avelo',
  'None': 'None',
  '3 Gas Nx': 'OC Rec(3GasNx)',
  'Air': 'OC Rec',
  'Nitrox': 'OC Rec(EAN)',
};

/**
 * 将 CSV Mode 转换为 DiveType
 */
export function mapDiveMode(mode: string): DiveType {
  return diveModeMapping[mode] || 'OC Rec';
}


