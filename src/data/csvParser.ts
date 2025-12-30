/**
 * Shearwater CSV 数据解析模块
 */

import { Dive, DiveProfilePoint, DiveType } from '@/types';
import summaryCSV from './shearwater-export-summary.csv?raw';
import samplesCSV from './shearwater-export-samples.csv?raw';

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
  TankPressureInBar: string;
  SAC: string;
  Temperature: string;
  BatteryVoltage: string;
  GasTimeRemainingInMinutes: string;
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
 * 将 Mode 转换为 DiveType
 */
function modeToDiveType(mode: string): DiveType {
  switch (mode) {
    case 'Air':
      return 'Air';
    case 'Nitrox':
      return 'Nitrox';
    case 'Gauge':
      return 'Gauge';
    case 'CCR':
      return 'CCR';
    default:
      return 'Air';
  }
}

/**
 * 从日期时间字符串提取日期和时间
 */
function parseDateTime(dateTimeStr: string): { date: string; time: string } {
  // 格式: "2024-09-27 11:49:56"
  const [date, timeFull] = dateTimeStr.split(' ');
  const time = timeFull ? timeFull.substring(0, 5) : '00:00'; // HH:MM
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
 * 将样本数据转换为 DiveProfilePoint
 */
function sampleToProfilePoint(
  sample: SampleRow,
  ascentRate: number
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
    // tank1Pressure 需要特殊处理，CSV 中可能是 "AI is off"
    tank1Pressure: sample.TankPressureInBar !== 'AI is off' 
      ? parseNum(sample.TankPressureInBar) 
      : undefined,
    // SAC 也可能是 "GTR and SAC are off"
    sac: sample.SAC !== 'GTR and SAC are off' 
      ? parseNum(sample.SAC) 
      : undefined,
    tts: parseNum(sample.TimeToSurfaceInMinutes),
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

  // 按潜水编号分组样本数据
  const samplesByDive = new Map<string, SampleRow[]>();
  sampleRows.forEach((sample) => {
    const diveNum = sample.Number;
    if (!samplesByDive.has(diveNum)) {
      samplesByDive.set(diveNum, []);
    }
    samplesByDive.get(diveNum)!.push(sample);
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
    
    // 生成 profile 数据
    const profile: DiveProfilePoint[] = samples.map((sample, index) => {
      const ascentRate = calculateAscentRate(samples, index);
      return sampleToProfilePoint(sample, ascentRate);
    });

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

    return {
      id: diveNum,
      diveNumber: parseInt(diveNum, 10),
      date,
      startTime,
      endTime,
      duration: parseInt(summary.DurationInSeconds, 10) || 0,
      maxDepth: parseFloat(summary.DepthInMetersMax) || 0,
      avgDepth: parseFloat(summary.DepthInMetersAvg) || 0,
      diveType: modeToDiveType(summary.Mode),
      location: summary.Location || 'Unknown',
      site: summary.Site || 'Unknown',
      buddy: summary.Buddy || undefined,
      notes: summary.Note || undefined,
      tags: summary.Note ? summary.Note.split(';').map(t => t.trim()).filter(t => t.length > 0) : [],
      rating: 3,
      profile,
      
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
