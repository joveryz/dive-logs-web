// 潜水类型
export type DiveType = 'Air' | 'Nitrox' | 'Gauge' | 'Freedive' | 'CCR';

// 潜水电脑品牌
export interface DiveComputer {
  model: string;
  serial: string;
}

// 潜水剖面数据点
export interface DiveProfilePoint {
  time: number; // 秒
  depth: number; // 米
  temperature?: number; // 摄氏度
  ascentRate?: number; // 米/分钟
  ndl?: number; // 免减压极限（分钟）
  gf99?: number; // GF99 值 (%)
  cns?: number; // CNS 氧中毒 (%)
  gasDensity?: number; // 气体密度 (g/l)
  ppO2?: number; // 氧分压 (ATA)
  ppHe?: number; // 氦分压 (ATA)
  ppN2?: number; // 氮分压 (ATA)
  tank1Pressure?: number; // 气瓶1压力 (Bar)
  tank2Pressure?: number; // 气瓶2压力 (Bar)
  sac?: number; // 气体消耗率 (Bar/min)
  deco?: number; // 减压停留时间 (分钟), 0 = None
  tts?: number; // 到达水面时间 (分钟)
  ceiling?: number; // 减压上限深度 (米)
}

// 气瓶信息
export interface TankInfo {
  name: string;
  startPressure: number; // bar
  endPressure: number; // bar
  pressureChange: number; // bar
  transmitter?: string;
  gasUsage?: string;
  avgDepth?: number; // m
  sacCalculated?: number; // bar/min
}

// 气体配置
export interface GasConfig {
  name: string;
  o2: number; // 氧气百分比
  he?: number; // 氦气百分比（技术潜水）
  startPressure?: number; // 起始气压 (bar)
  endPressure?: number; // 结束气压 (bar)
}

// 气体详细信息
export interface GasesInfo {
  ocGases?: {
    programmed: string;
    used: string;
  };
  ccGases?: {
    programmed: string;
    used: string;
  };
  airIntegration?: {
    aiEnabled: boolean;
    transmitters?: string[];
    gtrMode?: string;
    sacRecorded?: number; // bar/min
  };
  tanks?: TankInfo[];
  notes?: string;
}

// 装备信息
export interface GearInfo {
  dress?: string;
  apparatus?: string;
  tankSize?: string;
  weight?: number; // kg
  suit?: string;
  tank?: string;
  bcd?: string;
  fins?: string;
  mask?: string;
  computer?: string;
  notes?: string;
}

// 环境信息
export interface EnvironmentInfo {
  minTemp?: number; // 摄氏度
  maxTemp?: number; // 摄氏度
  avgTemp?: number; // 摄氏度
  surfacePressure?: number; // mBar
  airTemp?: number; // 摄氏度
  visibility?: number; // 米
  weather?: string;
  platform?: string;
  environment?: string;
  conditions?: string;
  waterType?: 'Salt' | 'Fresh' | 'Brackish';
  current?: 'None' | 'Light' | 'Moderate' | 'Strong';
  surfaceTemp?: number; // 摄氏度
  waterTemp?: number; // 摄氏度
  waves?: 'Calm' | 'Light' | 'Moderate' | 'Rough';
  notes?: string;
}

// 问题/事件记录
export interface ProblemsInfo {
  thermalComfort?: string;
  workload?: string;
  problems?: string;
  equipmentMalfunction?: string;
  anySymptoms?: string;
  exposureToAltitude?: string;
  notes?: string;
}

// 电脑详细信息
export interface ComputerInfo {
  model: string;
  serial: string;
  oem?: string;
  firmwareVersion?: string;
  language?: string;
  dataFormat?: string;
  logVersion?: string;
  dbVersion?: string;
  battery?: {
    type?: string;
    vStart?: number;
    vEnd?: number;
  };
  dateTime?: {
    timezoneOffset?: number;
    daylightSavings?: boolean;
  };
  dive?: {
    mode?: string;
    sampleRate?: number; // 秒
    recordedUnits?: string;
    salinitySetting?: string;
    surfacePressure?: number; // mBar
    surfaceInterval?: string;
  };
  deco?: {
    cnsStart?: number;
    cnsEnd?: number;
    decoModel?: string;
    endSurfaceGF?: number;
    conservatism?: string;
  };
}

// 旧问题类型（保持兼容）
export interface DiveProblem {
  type: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High';
}

// 主潜水记录接口
export interface Dive {
  id: string;
  diveNumber: number;
  date: string; // ISO 日期字符串
  startTime: string; // HH:mm
  endTime: string;
  duration: number; // 秒
  maxDepth: number; // 米
  avgDepth: number; // 米
  diveType: DiveType;
  location: string;
  site: string;
  buddy?: string;
  diveComputer: DiveComputer;
  computerInfo?: ComputerInfo;
  profile: DiveProfilePoint[];
  gases?: GasConfig[];
  gasesInfo?: GasesInfo;
  gear?: GearInfo;
  environment?: EnvironmentInfo;
  problemsInfo?: ProblemsInfo;
  problems?: DiveProblem[];
  notes?: string;
  rating?: number; // 1-5
  tags?: string[];
}

// 潜水统计
export interface DiveStats {
  totalDives: number;
  totalDiveTime: number; // 秒
  maxDepth: number;
  avgDepth: number;
  favoriteLocations: { name: string; count: number }[];
  divesByMonth: { month: string; count: number }[];
}
