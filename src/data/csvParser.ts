/**
 * Shearwater CSV 数据解析模块
 */

import { Dive, DiveProfilePoint, GasesInfo, TankInfo } from '@/types';
import { mapDiveMode } from '@/constants/labels';
import summaryCSV from './shearwater-export-summary.csv?raw';
import samplesCSV from './shearwater-export-samples.csv?raw';
import tanksCSV from './shearwater-export-tanks.csv?raw';

interface SummaryRow {
  Number: string;
  Mode: string;
  StartDate: string;
  EndDate: string;
  DurationInSeconds: string;
  DepthInMetersMax: string;
  DepthInMetersAvg: string;
  Buddy: string;
  Location: string;
  Site: string;
  Note: string;
  TemperatureInCelsiusMax: string;
  TemperatureInCelsiusMin: string;
  TemperatureInCelsiusAvg: string;
  Salinity: string;
  SurfaceIntervalInSeconds: string;
  SurfacePressureInMillibarPreDive: string;
  SurfacePressureInMillibarPostDive: string;
  DecoModel: string;
  GradientFactorLow: string;
  GradientFactorHigh: string;
  GradientFactor99Max: string;
  CNSPercentPreDive: string;
  CNSPercentPostDive: string;
  ComputerModel: string;
  ComputerSerialNumber: string;
  ComputerFirmwareVersion: string;
  BatteryType: string;
  BatteryVoltagePreDive: string;
  BatteryVoltagePostDive: string;
  SampleRateInMs: string;
  DataFormat: string;
  LogVersion: string;
  DatabaseVersion: string;
  O2SensorStatusPreDive: string;
  O2SensorStatusPostDive: string;
  SensorDisplay: string;
  PPO2SetpointLowPreDive: string;
  PPO2SetpointLowPostDive: string;
  PPO2SetpointHighPreDive: string;
  PPO2SetpointHighPostDive: string;
  Features: string;
}

interface SampleRow {
  Number: string;
  ElapsedTimeInSeconds: string;
  Depth: string;
  TimeToSurfaceInMinutes: string;
  TimeToSurfaceInMinutesAtPlusFive: string;
  NoDecoLimit: string;
  CNS: string;
  GasDensity: string;
  GradientFactor99: string;
  PPO2: string;
  PPN2: string;
  PPHE: string;
  Tank1PressureInBar: string;
  Tank2PressureInBar: string;
  Tank3PressureInBar: string;
  Tank4PressureInBar: string;
  SAC: string;
  Temperature: string;
  BatteryVoltage: string;
  GasTimeRemainingInMinutes: string;
}

interface TankRow {
  Number: string;
  Tank1Enabled: string;
  Tank1TransmitterName: string;
  Tank1TransmitterSerialNumber: string;
  Tank1AverageDepthInMeters: string;
  Tank1GasO2Percent: string;
  Tank1GasHePercent: string;
  Tank1GasN2Percent: string;
  Tank2Enabled: string;
  Tank2TransmitterName: string;
  Tank2TransmitterSerialNumber: string;
  Tank2AverageDepthInMeters: string;
  Tank2GasO2Percent: string;
  Tank2GasHePercent: string;
  Tank2GasN2Percent: string;
}

/**
 * 解析 CSV 文本为对象数组
 */
function parseCSV<T>(csv: string): T[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',');
  const rows: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row as T);
  }

  return rows;
}

/**
 * 从日期时间字符串提取日期和时间
 */
function parseDateTime(dateTimeStr: string): { date: string; time: string } {
  // 格式: "2024-09-27 11:49:56"
  const [date, timeFull] = dateTimeStr.split(' ');
  const time = timeFull || '00:00:00'; // HH:MM:SS
  return { date, time };
}

/**
 * 计算上升速率 (m/s)
 * 正值 = 下降, 负值 = 上升
 */
function calculateAscentRate(
  samples: SampleRow[],
  index: number
): number {
  if (index === 0) return 0;
  
  const currentDepth = parseFloat(samples[index].Depth) || 0;
  const prevDepth = parseFloat(samples[index - 1].Depth) || 0;
  const currentTime = parseInt(samples[index].ElapsedTimeInSeconds, 10) || 0;
  const prevTime = parseInt(samples[index - 1].ElapsedTimeInSeconds, 10) || 0;
  const timeDiffSec = currentTime - prevTime;
  
  if (timeDiffSec <= 0) return 0;
  
  // 深度变化（米），正值=下降，负值=上升
  const depthChange = currentDepth - prevDepth;
  // m/s
  return depthChange / timeDiffSec;
}

/**
 * 解析气瓶压力值，处理特殊情况
 */
function parseTankPressure(val: string): number | undefined {
  if (!val || val === 'AI is off' || val === '0') return undefined;
  const num = parseFloat(val);
  return isNaN(num) || num <= 0 ? undefined : num;
}

/**
 * 从样本数据中提取气瓶信息
 */
function extractGasesInfo(samples: SampleRow[], mode: string, avgDepth: number, tankRow?: TankRow): GasesInfo | undefined {
  if (samples.length === 0) return undefined;

  // 获取有效的气瓶压力数据（带时间和深度）
  const tank1Data = samples
    .map(s => ({
      pressure: parseTankPressure(s.Tank1PressureInBar),
      time: parseInt(s.ElapsedTimeInSeconds, 10) || 0,
      depth: parseFloat(s.Depth) || 0,
    }))
    .filter((d): d is { pressure: number; time: number; depth: number } => d.pressure !== undefined && d.pressure > 0);
  
  const tank2Data = samples
    .map(s => ({
      pressure: parseTankPressure(s.Tank2PressureInBar),
      time: parseInt(s.ElapsedTimeInSeconds, 10) || 0,
      depth: parseFloat(s.Depth) || 0,
    }))
    .filter((d): d is { pressure: number; time: number; depth: number } => d.pressure !== undefined && d.pressure > 0);
  
  // 检查是否有气体集成（AI）数据
  const hasAI = tank1Data.length > 0 || tank2Data.length > 0;
  
  if (!hasAI) return undefined;

  const tanks: TankInfo[] = [];

  // 从 tankRow 获取 transmitter 序列号
  const tank1Serial = tankRow?.Tank1TransmitterSerialNumber && tankRow.Tank1TransmitterSerialNumber !== '000000' 
    ? tankRow.Tank1TransmitterSerialNumber 
    : undefined;
  const tank2Serial = tankRow?.Tank2TransmitterSerialNumber && tankRow.Tank2TransmitterSerialNumber !== '000000' 
    ? tankRow.Tank2TransmitterSerialNumber 
    : undefined;

  // Tank 1
  if (tank1Data.length > 0) {
    const startPressure = tank1Data[0].pressure;
    const endPressure = tank1Data[tank1Data.length - 1].pressure;
    const pressureChange = startPressure - endPressure;
    const startTime = tank1Data[0].time;
    const endTime = tank1Data[tank1Data.length - 1].time;
    const durationMin = (endTime - startTime) / 60;
    
    // SAC = (压力变化 / 时间) / 环境压力(ATA)
    // 环境压力 = 平均深度/10 + 1
    const ambientPressure = avgDepth / 10 + 1;
    const sacCalculated = durationMin > 0 && ambientPressure > 0 
      ? Math.round((pressureChange / durationMin / ambientPressure) * 100) / 100
      : undefined;
    
    tanks.push({
      name: 'Tank 1',
      startPressure: Math.round(startPressure * 100) / 100,
      endPressure: Math.round(endPressure * 100) / 100,
      pressureChange: Math.round(pressureChange * 100) / 100,
      transmitter: tank1Serial ? `T1 (${tank1Serial})` : 'T1',
      avgDepth: Math.round(avgDepth * 100) / 100,
      sacCalculated,
    });
  }

  // Tank 2
  if (tank2Data.length > 0) {
    const startPressure = tank2Data[0].pressure;
    const endPressure = tank2Data[tank2Data.length - 1].pressure;
    const pressureChange = startPressure - endPressure;
    const startTime = tank2Data[0].time;
    const endTime = tank2Data[tank2Data.length - 1].time;
    const durationMin = (endTime - startTime) / 60;
    
    const ambientPressure = avgDepth / 10 + 1;
    const sacCalculated = durationMin > 0 && ambientPressure > 0 
      ? Math.round((pressureChange / durationMin / ambientPressure) * 100) / 100
      : undefined;
    
    tanks.push({
      name: 'Tank 2',
      startPressure: Math.round(startPressure * 100) / 100,
      endPressure: Math.round(endPressure * 100) / 100,
      pressureChange: Math.round(pressureChange * 100) / 100,
      transmitter: tank2Serial ? `T2 (${tank2Serial})` : 'T2',
      avgDepth: Math.round(avgDepth * 100) / 100,
      sacCalculated,
    });
  }

  // 构建发射器列表
  const transmitters: string[] = [];
  if (tank1Data.length > 0) transmitters.push(tank1Serial ? `T1 (${tank1Serial})` : 'T1');
  if (tank2Data.length > 0) transmitters.push(tank2Serial ? `T2 (${tank2Serial})` : 'T2');

  // 根据模式判断 OC/CC gases
  const isCC = mode.toLowerCase().includes('cc') || mode.toLowerCase().includes('closed');
  const gasString = mode === 'Air' ? '21/0' : mode;

  return {
    ocGases: !isCC ? {
      programmed: gasString,
      used: gasString,
    } : undefined,
    ccGases: isCC ? {
      programmed: gasString,
      used: gasString,
    } : {
      programmed: 'None',
      used: 'None',
    },
    airIntegration: {
      aiEnabled: hasAI,
      transmitters: transmitters.length > 0 ? transmitters : undefined,
      gtrMode: tanks.length === 1 ? 'T1 (Single Tank)' : tanks.length > 1 ? 'Average' : undefined,
    },
    tanks: tanks.length > 0 ? tanks : undefined,
  };
}

/**
 * 将样本数据转换为 DiveProfilePoint
 * @param sample 当前样本
 * @param ascentRate 上升速率
 * @param prevSample 上一个样本（用于计算 SAC）
 * @param sampleRateMs 采样率（毫秒）
 */
function sampleToProfilePoint(
  sample: SampleRow,
  ascentRate: number,
  prevSample: SampleRow | null,
  sampleRateMs: number
): DiveProfilePoint {
  const parseNum = (val: string): number | undefined => {
    const num = parseFloat(val);
    return isNaN(num) ? undefined : num;
  };

  const depth = parseNum(sample.Depth) ?? 0;
  const ndl = parseNum(sample.NoDecoLimit);
  const gf99Str = sample.GradientFactor99;
  // GF99 可能是 255 表示无效值
  const gf99Raw = parseNum(gf99Str);
  const gf99 = gf99Raw !== undefined && gf99Raw < 200 ? gf99Raw : undefined;

  const tank1Pressure = parseTankPressure(sample.Tank1PressureInBar);
  const tank2Pressure = parseTankPressure(sample.Tank2PressureInBar);
  
  // 从气瓶压力计算 SAC
  // SAC = (压力变化率 bar/min) / (深度/10 + 1)
  let sac: number | undefined = undefined;
  if (prevSample && depth > 0) {
    const prevTank1 = parseTankPressure(prevSample.Tank1PressureInBar);
    const sampleRateMin = sampleRateMs / 1000 / 60; // 转换为分钟
    
    if (tank1Pressure !== undefined && prevTank1 !== undefined && sampleRateMin > 0) {
      const pressureChangeRate = (prevTank1 - tank1Pressure) / sampleRateMin; // bar/min
      const ambientPressure = depth / 10 + 1; // ATA
      if (pressureChangeRate >= 0 && ambientPressure > 0) {
        sac = pressureChangeRate / ambientPressure;
      }
    }
  }

  return {
    time: parseInt(sample.ElapsedTimeInSeconds, 10) || 0,
    depth: Math.round(depth * 10) / 10,
    temperature: parseNum(sample.Temperature),
    ascentRate: Math.round(ascentRate * 100) / 100,
    ndl: ndl !== undefined && ndl < 100 ? ndl : 99,
    gf99,
    cns: parseNum(sample.CNS),
    gasDensity: parseNum(sample.GasDensity),
    ppO2: parseNum(sample.PPO2),
    ppN2: parseNum(sample.PPN2),
    ppHe: parseNum(sample.PPHE),
    tank1Pressure,
    tank2Pressure,
    sac: sac !== undefined ? Math.round(sac * 100) / 100 : undefined,
    tts: parseNum(sample.TimeToSurfaceInMinutes),
    tts5: parseNum(sample.TimeToSurfaceInMinutesAtPlusFive),
    deco: 0,
    ceiling: 0,
  };
}

/**
 * 解析 CSV 文件并生成潜水数据
 */
export function parseDivesFromCSV(): Dive[] {
  const summaryRows = parseCSV<SummaryRow>(summaryCSV);
  const sampleRows = parseCSV<SampleRow>(samplesCSV);
  const tankRows = parseCSV<TankRow>(tanksCSV);

  // 按潜水编号分组样本数据
  const samplesByDive = new Map<string, SampleRow[]>();
  sampleRows.forEach((sample) => {
    const diveNum = sample.Number;
    if (!samplesByDive.has(diveNum)) {
      samplesByDive.set(diveNum, []);
    }
    samplesByDive.get(diveNum)!.push(sample);
  });

  // 按潜水编号索引 tank 数据
  const tanksByDive = new Map<string, TankRow>();
  tankRows.forEach((tank) => {
    tanksByDive.set(tank.Number, tank);
  });

  const parseNum = (val: string): number | undefined => {
    const num = parseFloat(val);
    return isNaN(num) ? undefined : num;
  };

  const parseIntNum = (val: string): number | undefined => {
    const num = parseInt(val, 10);
    return isNaN(num) ? undefined : num;
  };

  const dives: Dive[] = summaryRows.map((summary) => {
    const diveNum = summary.Number;
    const samples = samplesByDive.get(diveNum) || [];
    const tankRow = tanksByDive.get(diveNum);
    const sampleRateMs = parseIntNum(summary.SampleRateInMs) || 10000;
    
    // 生成 profile 数据
    const profile: DiveProfilePoint[] = samples.map((sample, index) => {
      const ascentRate = calculateAscentRate(samples, index);
      const prevSample = index > 0 ? samples[index - 1] : null;
      return sampleToProfilePoint(sample, ascentRate, prevSample, sampleRateMs);
    });

    // 填充 GF99 缺失值：使用之前的已知点，默认值为 0
    let lastKnownGf99 = 0;
    for (const point of profile) {
      if (point.gf99 !== undefined) {
        lastKnownGf99 = point.gf99;
      } else {
        point.gf99 = lastKnownGf99;
      }
    }

    // 使用滑动窗口平均平滑 SAC 值
    const sacWindowSize = 6; // 6个采样点的窗口
    const rawSacValues = profile.map(p => p.sac);
    for (let i = 0; i < profile.length; i++) {
      const windowStart = Math.max(0, i - Math.floor(sacWindowSize / 2));
      const windowEnd = Math.min(profile.length, i + Math.ceil(sacWindowSize / 2));
      const windowValues = rawSacValues.slice(windowStart, windowEnd).filter((v): v is number => v !== undefined && v > 0);
      if (windowValues.length > 0) {
        profile[i].sac = Math.round(windowValues.reduce((a, b) => a + b, 0) / windowValues.length * 100) / 100;
      }
    }

    // 计算上升/下降速率统计
    const ascentRates = profile.map(p => p.ascentRate ?? 0).filter(r => r !== 0);
    const ascentRateStats = ascentRates.length > 0 ? (() => {
      const ascents = ascentRates.filter(r => r < 0); // 负值 = 上升
      const descents = ascentRates.filter(r => r > 0); // 正值 = 下降
      return {
        maxAscent: ascents.length > 0 ? Math.min(...ascents) : 0,
        maxDescent: descents.length > 0 ? Math.max(...descents) : 0,
        avgAscent: ascents.length > 0 ? ascents.reduce((a, b) => a + b, 0) / ascents.length : 0,
        avgDescent: descents.length > 0 ? descents.reduce((a, b) => a + b, 0) / descents.length : 0,
      };
    })() : undefined;

    const { date, time: startTime } = parseDateTime(summary.StartDate);
    const { time: endTime } = parseDateTime(summary.EndDate);

    // 格式化 surface interval
    const surfaceIntervalSec = parseIntNum(summary.SurfaceIntervalInSeconds);
    const formatSurfaceInterval = (sec?: number): string | undefined => {
      if (sec === undefined) return undefined;
      const hours = Math.floor(sec / 3600);
      const minutes = Math.floor((sec % 3600) / 60);
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    };

    const avgDepth = parseFloat(summary.DepthInMetersAvg) || 0;

    return {
      id: diveNum,
      diveNumber: parseInt(diveNum, 10),
      date,
      startTime,
      endTime,
      duration: parseInt(summary.DurationInSeconds, 10) || 0,
      maxDepth: parseFloat(summary.DepthInMetersMax) || 0,
      avgDepth,
      diveType: mapDiveMode(summary.Mode),
      location: summary.Location || 'Unknown',
      site: summary.Site || 'Unknown',
      buddy: summary.Buddy || undefined,
      notes: summary.Note || undefined,
      tags: summary.Note ? summary.Note.split(';').map(t => t.trim()).filter(t => t.length > 0) : [],
      rating: 3,
      profile,
      ascentRateStats,
      
      // 潜水电脑基本信息
      diveComputer: {
        model: summary.ComputerModel || 'Unknown',
        serial: summary.ComputerSerialNumber || '',
      },
      
      // 潜水电脑详细信息
      computerInfo: {
        model: summary.ComputerModel || 'Unknown',
        serial: summary.ComputerSerialNumber || '',
        firmwareVersion: summary.ComputerFirmwareVersion || undefined,
        dataFormat: summary.DataFormat || undefined,
        logVersion: summary.LogVersion || undefined,
        dbVersion: summary.DatabaseVersion || undefined,
        battery: {
          type: summary.BatteryType || undefined,
          vStart: parseNum(summary.BatteryVoltagePreDive),
          vEnd: parseNum(summary.BatteryVoltagePostDive),
        },
        dive: {
          mode: summary.Mode,
          sampleRate: parseIntNum(summary.SampleRateInMs) ? parseIntNum(summary.SampleRateInMs)! / 1000 : 10,
          salinitySetting: summary.Salinity || undefined,
          surfacePressure: parseNum(summary.SurfacePressureInMillibarPreDive),
          surfaceInterval: formatSurfaceInterval(surfaceIntervalSec),
        },
        deco: {
          cnsStart: parseNum(summary.CNSPercentPreDive),
          cnsEnd: parseNum(summary.CNSPercentPostDive),
          decoModel: summary.DecoModel || undefined,
          endSurfaceGF: parseNum(summary.GradientFactor99Max),
          conservatism: summary.GradientFactorLow && summary.GradientFactorHigh 
            ? `GF ${summary.GradientFactorLow}/${summary.GradientFactorHigh}`
            : undefined,
        },
      },
      
      // 环境信息
      environment: {
        minTemp: parseNum(summary.TemperatureInCelsiusMin),
        maxTemp: parseNum(summary.TemperatureInCelsiusMax),
        avgTemp: parseNum(summary.TemperatureInCelsiusAvg),
        surfacePressure: parseNum(summary.SurfacePressureInMillibarPreDive),
      },
      
      // 气体信息
      gasesInfo: extractGasesInfo(samples, summary.Mode, avgDepth, tankRow),
    };
  });

  // 按日期和时间排序（最新的在前）
  dives.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return b.startTime.localeCompare(a.startTime);
  });

  return dives;
}
