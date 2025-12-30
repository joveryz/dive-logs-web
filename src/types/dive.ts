/**
 * 潜水日志应用类型定义
 * @module types/dive
 */

// ============================================================================
// 基础类型定义
// ============================================================================

/**
 * 潜水类型
 */
export type DiveType = 
  | 'CC/BO' 
  | 'OC Tec' 
  | 'OC Rec' 
  | 'OC Rec(Air)' 
  | 'OC Rec(EAN)' 
  | 'OC Rec(3GasNx)' 
  | 'FreeDive' 
  | 'Avelo' 
  | 'None';

/**
 * 水体类型
 */
export type WaterType = 'Salt' | 'Fresh' | 'Brackish';

/**
 * 水流强度
 */
export type CurrentStrength = 'None' | 'Light' | 'Moderate' | 'Strong';

/**
 * 波浪状态
 */
export type WaveCondition = 'Calm' | 'Light' | 'Moderate' | 'Rough';

/**
 * 严重程度
 */
export type Severity = 'Low' | 'Medium' | 'High';

// ============================================================================
// 潜水剖面相关类型
// ============================================================================

/**
 * 潜水剖面数据点
 * @description 记录潜水过程中每个时间点的各项数据
 */
export interface DiveProfilePoint {
  /** 时间（秒） */
  time: number;
  /** 深度（米） */
  depth: number;
  /** 温度（摄氏度） */
  temperature?: number;
  /** 上升/下降速率（米/分钟），负值表示上升 */
  ascentRate?: number;
  /** 免减压极限时间（分钟） */
  ndl?: number;
  /** GF99 梯度因子值（%） */
  gf99?: number;
  /** CNS 氧中毒指数（%） */
  cns?: number;
  /** 气体密度（g/L） */
  gasDensity?: number;
  /** 氧分压（ATA） */
  ppO2?: number;
  /** 氦分压（ATA） */
  ppHe?: number;
  /** 氮分压（ATA） */
  ppN2?: number;
  /** 气瓶1压力（Bar） */
  tank1Pressure?: number;
  /** 气瓶2压力（Bar） */
  tank2Pressure?: number;
  /** 气瓶3压力（Bar） */
  tank3Pressure?: number;
  /** 气瓶4压力（Bar） */
  tank4Pressure?: number;
  /** 气体消耗率（L/min） */
  sac?: number;
  /** 减压停留时间（分钟），0 = 无需减压 */
  deco?: number;
  /** 到达水面所需时间（分钟） */
  tts?: number;
  /** 到达水面所需时间@+5m（分钟） */
  tts5?: number;
  /** 减压上限深度（米） */
  ceiling?: number;
}

// ============================================================================
// 设备相关类型
// ============================================================================

/**
 * 潜水电脑基本信息
 */
export interface DiveComputer {
  /** 型号名称 */
  model: string;
  /** 序列号 */
  serial: string;
}

/**
 * 气瓶信息
 */
export interface TankInfo {
  /** 气瓶名称/编号 */
  name: string;
  /** 起始压力（Bar） */
  startPressure: number;
  /** 结束压力（Bar） */
  endPressure: number;
  /** 压力变化量（Bar） */
  pressureChange: number;
  /** 发射器ID */
  transmitter?: string;
  /** 气体用途 */
  gasUsage?: string;
  /** 平均深度（米） */
  avgDepth?: number;
  /** 计算的 SAC（Bar/min） */
  sacCalculated?: number;
}

/**
 * 气体配置
 */
export interface GasConfig {
  /** 气体名称 */
  name: string;
  /** 氧气百分比 */
  o2: number;
  /** 氦气百分比（技术潜水） */
  he?: number;
  /** 起始气压（Bar） */
  startPressure?: number;
  /** 结束气压（Bar） */
  endPressure?: number;
}

// ============================================================================
// 详细信息类型
// ============================================================================

/**
 * 气体详细信息
 */
export interface GasesInfo {
  /** 开放式（OC）气体 */
  ocGases?: {
    programmed: string;
    used: string;
  };
  /** 密闭式（CC）气体 */
  ccGases?: {
    programmed: string;
    used: string;
  };
  /** 气体整合信息 */
  airIntegration?: {
    aiEnabled: boolean;
    transmitters?: string[];
    gtrMode?: string;
    sacRecorded?: number;
  };
  /** 气瓶列表 */
  tanks?: TankInfo[];
  /** 备注 */
  notes?: string;
}

/**
 * 装备信息
 */
export interface GearInfo {
  /** 潜水服类型 */
  dress?: string;
  /** 装备类型 */
  apparatus?: string;
  /** 气瓶容量 */
  tankSize?: string;
  /** 配重（kg） */
  weight?: number;
  /** 潜水服 */
  suit?: string;
  /** 气瓶 */
  tank?: string;
  /** BCD */
  bcd?: string;
  /** 脚蹼 */
  fins?: string;
  /** 面镜 */
  mask?: string;
  /** 潜水电脑 */
  computer?: string;
  /** 备注 */
  notes?: string;
}

/**
 * 环境信息
 */
export interface EnvironmentInfo {
  /** 最低温度（摄氏度） */
  minTemp?: number;
  /** 最高温度（摄氏度） */
  maxTemp?: number;
  /** 平均温度（摄氏度） */
  avgTemp?: number;
  /** 水面气压（mBar） */
  surfacePressure?: number;
  /** 气温（摄氏度） */
  airTemp?: number;
  /** 能见度（米） */
  visibility?: number;
  /** 天气状况 */
  weather?: string;
  /** 入水平台 */
  platform?: string;
  /** 环境类型 */
  environment?: string;
  /** 水况 */
  conditions?: string;
  /** 水体类型 */
  waterType?: WaterType;
  /** 水流强度 */
  current?: CurrentStrength;
  /** 水面温度（摄氏度） */
  surfaceTemp?: number;
  /** 水温（摄氏度） */
  waterTemp?: number;
  /** 波浪状态 */
  waves?: WaveCondition;
  /** 备注 */
  notes?: string;
}

/**
 * 问题/事件记录
 */
export interface ProblemsInfo {
  /** 热舒适度 */
  thermalComfort?: string;
  /** 工作强度 */
  workload?: string;
  /** 遇到的问题 */
  problems?: string;
  /** 设备故障 */
  equipmentMalfunction?: string;
  /** 任何症状 */
  anySymptoms?: string;
  /** 是否暴露于高海拔 */
  exposureToAltitude?: string;
  /** 备注 */
  notes?: string;
}

/**
 * 潜水电脑详细信息
 */
export interface ComputerInfo {
  /** 型号 */
  model: string;
  /** 序列号 */
  serial: string;
  /** OEM 厂商 */
  oem?: string;
  /** 固件版本 */
  firmwareVersion?: string;
  /** 语言 */
  language?: string;
  /** 数据格式 */
  dataFormat?: string;
  /** 日志版本 */
  logVersion?: string;
  /** 数据库版本 */
  dbVersion?: string;
  /** 电池信息 */
  battery?: {
    type?: string;
    vStart?: number;
    vEnd?: number;
  };
  /** 日期时间设置 */
  dateTime?: {
    timezoneOffset?: number;
    daylightSavings?: boolean;
  };
  /** 潜水设置 */
  dive?: {
    mode?: string;
    sampleRate?: number;
    recordedUnits?: string;
    salinitySetting?: string;
    surfacePressure?: number;
    surfaceInterval?: string;
  };
  /** 减压设置 */
  deco?: {
    cnsStart?: number;
    cnsEnd?: number;
    decoModel?: string;
    endSurfaceGF?: number;
    conservatism?: string;
  };
}

/**
 * 潜水问题（旧版兼容）
 * @deprecated 使用 ProblemsInfo 替代
 */
export interface DiveProblem {
  type: string;
  description: string;
  severity: Severity;
}

// ============================================================================
// 主记录类型
// ============================================================================

/**
 * 潜水记录
 * @description 完整的潜水记录，包含所有相关信息
 */
export interface Dive {
  /** 唯一标识符 */
  id: string;
  /** 潜水编号 */
  diveNumber: number;
  /** 日期（ISO 格式） */
  date: string;
  /** 开始时间（HH:mm） */
  startTime: string;
  /** 结束时间 */
  endTime: string;
  /** 持续时间（秒） */
  duration: number;
  /** 最大深度（米） */
  maxDepth: number;
  /** 平均深度（米） */
  avgDepth: number;
  /** 潜水类型 */
  diveType: DiveType;
  /** 地点 */
  location: string;
  /** 潜点名称 */
  site: string;
  /** 潜伴 */
  buddy: string;
  /** 潜水电脑 */
  diveComputer: DiveComputer;
  /** 电脑详细信息 */
  computerInfo?: ComputerInfo;
  /** 潜水剖面数据 */
  profile: DiveProfilePoint[];
  /** 气体配置 */
  gases?: GasConfig[];
  /** 气体详细信息 */
  gasesInfo?: GasesInfo;
  /** 装备信息 */
  gear?: GearInfo;
  /** 环境信息 */
  environment?: EnvironmentInfo;
  /** 问题记录 */
  problemsInfo?: ProblemsInfo;
  /** 问题列表（旧版） */
  problems?: DiveProblem[];
  /** 上升/下降速率统计 */
  ascentRateStats?: {
    /** 最大上升速率（负值，m/s） */
    maxAscent: number;
    /** 最大下降速率（正值，m/s） */
    maxDescent: number;
    /** 平均上升速率（负值，m/s） */
    avgAscent: number;
    /** 平均下降速率（正值，m/s） */
    avgDescent: number;
  };
  /** 备注 */
  notes?: string;
  /** 评分（1-5） */
  rating?: number;
  /** 标签 */
  tags?: string[];
}

// ============================================================================
// 统计类型
// ============================================================================

/**
 * 潜水统计
 */
export interface DiveStats {
  /** 总潜水次数 */
  totalDives: number;
  /** 总潜水时间（秒） */
  totalDiveTime: number;
  /** 最大深度（米） */
  maxDepth: number;
  /** 平均深度（米） */
  avgDepth: number;
  /** 常去地点 */
  favoriteLocations: { name: string; count: number }[];
  /** 按月统计 */
  divesByMonth: { month: string; count: number }[];
}