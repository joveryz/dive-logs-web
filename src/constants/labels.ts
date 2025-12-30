/**
 * CSV Header 到 UI 显示名称的映射
 * 仅包含 Shearwater CSV 导出文件中的字段
 */

// ============================================================================
// Summary CSV Header 映射
// ============================================================================

export const summaryHeaderLabels: Record<string, string> = {
  Number: 'Dive #',
  Mode: 'Dive Type',
  StartDate: 'Start Time',
  EndDate: 'End Time',
  DurationInSeconds: 'Duration',
  DepthInMetersMax: 'Max Depth',
  DepthInMetersAvg: 'Avg Depth',
  Buddy: 'Buddy',
  Location: 'Location',
  Site: 'Site',
  Note: 'Notes',
  TemperatureInCelsiusMax: 'Max Temp',
  TemperatureInCelsiusMin: 'Min Temp',
  TemperatureInCelsiusAvg: 'Avg Temp',
  Salinity: 'Salinity',
  SurfaceIntervalInSeconds: 'Surface Interval',
  SurfacePressureInMillibarPreDive: 'Surface Pressure (Pre)',
  SurfacePressureInMillibarPostDive: 'Surface Pressure (Post)',
  DecoModel: 'Deco Model',
  GradientFactorLow: 'GF Low',
  GradientFactorHigh: 'GF High',
  GradientFactor99Max: 'GF99 Max',
  CNSPercentPreDive: 'CNS (Pre)',
  CNSPercentPostDive: 'CNS (Post)',
  ComputerModel: 'Computer Model',
  ComputerSerialNumber: 'Serial Number',
  ComputerFirmwareVersion: 'Firmware Version',
  BatteryType: 'Battery Type',
  BatteryVoltagePreDive: 'Battery (Pre)',
  BatteryVoltagePostDive: 'Battery (Post)',
  SampleRateInMs: 'Sample Rate',
  DataFormat: 'Data Format',
  LogVersion: 'Log Version',
  DatabaseVersion: 'DB Version',
  O2SensorStatusPreDive: 'O2 Sensor (Pre)',
  O2SensorStatusPostDive: 'O2 Sensor (Post)',
  SensorDisplay: 'Sensor Display',
  PPO2SetpointLowPreDive: 'PPO₂ Low (Pre)',
  PPO2SetpointLowPostDive: 'PPO₂ Low (Post)',
  PPO2SetpointHighPreDive: 'PPO₂ High (Pre)',
  PPO2SetpointHighPostDive: 'PPO₂ High (Post)',
  Features: 'Features',
};

// ============================================================================
// Sample CSV Header 映射
// ============================================================================

export const sampleHeaderLabels: Record<string, string> = {
  Number: 'Dive #',
  ElapsedTimeInSeconds: 'Time',
  Depth: 'Depth',
  TimeToSurfaceInMinutes: 'TTS',
  TimeToSurfaceInMinutesAtPlusFive: 'TTS +5m',
  NoDecoLimit: 'NDL',
  CNS: 'CNS',
  GasDensity: 'Gas Density',
  GradientFactor99: 'GF99',
  PPO2: 'PPO₂',
  PPN2: 'PPN₂',
  PPHE: 'PPHe',
  TankPressureInBar: 'Tank Pressure',
  SAC: 'SAC',
  Temperature: 'Temperature',
  BatteryVoltage: 'Battery',
  GasTimeRemainingInMinutes: 'GTR',
};

// ============================================================================
// 图表系列标签（基于 Sample 字段 + 派生字段）
// ============================================================================

export const chartSeriesLabels: Record<string, string> = {
  depth: 'Depth',
  temperature: 'Temperature',
  ndl: 'NDL',
  tts: 'TTS',
  cns: 'CNS',
  gf99: 'GF99',
  gasDensity: 'Gas Density',
  ppO2: 'PPO₂',
  ppN2: 'PPN₂',
  ppHe: 'PPHe',
  tank1Pressure: 'Tank 1',
  tank2Pressure: 'Tank 2',
  sac: 'SAC',
  ascentRate: 'Ascent Rate',
  deco: 'Deco',
  ceiling: 'Ceiling',
};

// ============================================================================
// UI 通用标签（用于界面显示）
// ============================================================================

export const uiLabels: Record<string, string> = {
  // 列表表头
  diveNumber: 'Dive #',
  date: 'Date',
  time: 'Time',
  diveType: 'Dive Type',
  diveComputer: 'Dive Computer',
  location: 'Location',
  maxDepth: 'Max Depth',
  duration: 'Duration',
  
  // 详情页标签
  avgDepth: 'Avg Depth',
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
  airTemp: 'Air Temp',
  visibility: 'Visibility',
  weather: 'Weather',
  platform: 'Platform',
  environment: 'Environment',
  conditions: 'Conditions',
  salinity: 'Salinity',
  surfaceInterval: 'Surface Interval',
  
  // 电脑标签
  model: 'Model',
  serialNumber: 'Serial Number',
  oem: 'OEM',
  firmwareVersion: 'Firmware Version',
  language: 'Language',
  dataFormat: 'Data Format',
  logVersion: 'Log Version',
  dbVersion: 'DB Version',
  batteryType: 'Battery Type',
  
  // 减压标签
  deco: 'Deco',
  decoModel: 'Deco Model',
  cns: 'CNS',
};

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

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 获取 Summary Header 的显示名称
 */
export function getSummaryHeaderLabel(header: string): string {
  return summaryHeaderLabels[header] || header;
}

/**
 * 获取 Sample Header 的显示名称
 */
export function getSampleHeaderLabel(header: string): string {
  return sampleHeaderLabels[header] || header;
}

/**
 * 获取字段的 UI 显示标签
 */
export function getFieldLabel(field: string): string {
  return fieldLabels[field] || field;
}

/**
 * 获取所有 Summary Headers
 */
export function getSummaryHeaders(): string[] {
  return Object.keys(summaryHeaderLabels);
}

/**
 * 获取所有 Sample Headers
 */
export function getSampleHeaders(): string[] {
  return Object.keys(sampleHeaderLabels);
}
