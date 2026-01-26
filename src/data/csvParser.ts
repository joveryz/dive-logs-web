/**
 * Shearwater CSV 数据解析模块
 * CSV 数据以 Base64 编码存储，运行时解码
 */

import { Dive, DiveProfilePoint, ExporterVersion, GasesInfo, TankInfo } from '@/types';
import { mapDiveMode } from '@/constants/labels';
import summariesB64 from './general-dive-log-summaries.b64?raw';
import samplesB64 from './general-dive-log-samples.b64?raw';
import tanksB64 from './general-dive-log-tanks.b64?raw';
import versionB64 from './general-dive-log-exporter-version.b64?raw';

// Base64 解码函数
function decodeBase64(encoded: string): string {
  return atob(encoded);
}

// 解码后的 CSV 内容
const summariesCSV = decodeBase64(summariesB64);
const samplesCSV = decodeBase64(samplesB64);
const tanksCSV = decodeBase64(tanksB64);
const versionCSV = decodeBase64(versionB64);

interface SummaryRow {
  Number: string;
  Mode: string;
  StartDate: string;
  EndDate: string;
  DurationInSeconds: string;
  Diver: string;
  Buddy: string;
  Location: string;
  Site: string;
  Note: string;
  DepthInMetersMax: string;
  DepthInMetersAvg: string;
  HeartRateMax: string;
  HeartRateMin: string;
  HeartRateAvg: string;
  TemperatureInCelsiusMax: string;
  TemperatureInCelsiusMin: string;
  TemperatureInCelsiusAvg: string;
  SurfacePressureInMillibarPreDive: string;
  SurfacePressureInMillibarPostDive: string;
  SurfaceIntervalInSeconds: string;
  WaterDenisity: string;
  WaterType: string;
  ComputerModel: string;
  ComputerSerialNumber: string;
  ComputerFirmwareVersion: string;
  BatteryType: string;
  BatteryVoltagePreDive: string;
  BatteryVoltagePostDive: string;
  SampleRateInMs: string;
  DataFormat: string;
  DecoModel: string;
  GradientFactorLow: string;
  GradientFactorHigh: string;
  GradientFactorSurfaceEnd: string;
  CentralNervousSystemPercentPreDive: string;
  CentralNervousSystemPercentPostDive: string;
}

interface SampleRow {
  Number: string;
  ElapsedTimeInSeconds: string;
  Depth: string;
  Temperature: string;
  HeartRate: string;
  BatteryVoltage: string;
  TimeToSurfaceInMinutes: string;
  TimeToSurfaceInMinutesAtPlusFive: string;
  NoDecoLimit: string;
  CentralNervousSystemPercent: string;
  GasDensity: string;
  GradientFactor99: string;
  PPO2: string;
  PPN2: string;
  PPHe: string;
  Tank1PressureInBar: string;
  Tank2PressureInBar: string;
  Tank3PressureInBar: string;
  Tank4PressureInBar: string;
  SurfaceAirConsumptionInBar: string;
  GasTimeRemainingInMinutes: string;
}

interface TankRow {
  Number: string;
  Index: string;
  Enabled: string;
  TransmitterName: string;
  TransmitterSerialNumber: string;
  AverageDepthInMeters: string;
  GasO2Percent: string;
  GasHePercent: string;
  GasN2Percent: string;
}

interface ExporterVersionRow {
  Version: string;
  Commit: string;
  BuildDate: string;
}

/**
 * 解析 CSV 文本为对象数组
 */
function parseCSV<T>(csv: string): T[] {
  // 处理 Windows 换行符 \r\n
  const lines = csv.trim().replace(/\r/g, '').split('\n');
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
 * 从 UTC 日期时间字符串解析并转换为本地时间
 * @param dateTimeStr UTC 时间字符串，格式: "2024-09-27 11:49:56"
 * @returns 本地日期和时间 { date: "YYYY-MM-DD", time: "HH:MM" }
 */
function parseDateTime(dateTimeStr: string): { date: string; time: string } {
  // CSV 中的时间是 UTC，转换为浏览器本地时间
  const utcDate = new Date(dateTimeStr.replace(' ', 'T') + 'Z');
  
  if (isNaN(utcDate.getTime())) {
    // 解析失败，返回原始值
    const [date, timeFull] = dateTimeStr.split(' ');
    return { date: date || '1970-01-01', time: timeFull?.substring(0, 5) || '00:00' };
  }
  
  // 格式化为本地时间
  const year = utcDate.getFullYear();
  const month = String(utcDate.getMonth() + 1).padStart(2, '0');
  const day = String(utcDate.getDate()).padStart(2, '0');
  const hours = String(utcDate.getHours()).padStart(2, '0');
  const minutes = String(utcDate.getMinutes()).padStart(2, '0');
  
  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`
  };
}

/**
 * 计算上升速率 (m/s)
 * 正值 = 上升, 负值 = 下降
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
  
  // 深度变化（米），取反使得：正值=上升，负值=下降
  const depthChange = prevDepth - currentDepth;
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
function extractGasesInfo(samples: SampleRow[], mode: string, avgDepth: number, tankRows: TankRow[]): GasesInfo | undefined {
  if (samples.length === 0) return undefined;

  // 辅助函数：提取气瓶压力数据
  const extractTankData = (pressureKey: keyof SampleRow) => samples
    .map(s => ({
      pressure: parseTankPressure(s[pressureKey]),
      time: parseInt(s.ElapsedTimeInSeconds, 10) || 0,
      depth: parseFloat(s.Depth) || 0,
    }))
    .filter((d): d is { pressure: number; time: number; depth: number } => d.pressure !== undefined && d.pressure > 0);

  // 获取有效的气瓶压力数据（带时间和深度）
  const tank1Data = extractTankData('Tank1PressureInBar');
  const tank2Data = extractTankData('Tank2PressureInBar');
  const tank3Data = extractTankData('Tank3PressureInBar');
  const tank4Data = extractTankData('Tank4PressureInBar');
  
  // 检查是否有气体集成（AI）数据
  const hasAI = tank1Data.length > 0 || tank2Data.length > 0 || tank3Data.length > 0 || tank4Data.length > 0;
  
  if (!hasAI) return undefined;

  const tanks: TankInfo[] = [];

  // 从 tankRows 中按 Index 获取对应气瓶的 transmitter 序列号
  const getSerial = (serial?: string) => serial && serial !== '000000' ? serial : undefined;
  const getTankRowByIndex = (index: number) => tankRows.find(t => parseInt(t.Index, 10) === index);
  const tank1Row = getTankRowByIndex(0);
  const tank2Row = getTankRowByIndex(1);
  const tank3Row = getTankRowByIndex(2);
  const tank4Row = getTankRowByIndex(3);
  const tank1Serial = getSerial(tank1Row?.TransmitterSerialNumber);
  const tank2Serial = getSerial(tank2Row?.TransmitterSerialNumber);
  const tank3Serial = getSerial(tank3Row?.TransmitterSerialNumber);
  const tank4Serial = getSerial(tank4Row?.TransmitterSerialNumber);

  // 辅助函数：计算并添加气瓶信息
  const addTankInfo = (
    tankData: { pressure: number; time: number; depth: number }[],
    tankNum: number,
    serial?: string,
    tankRowData?: TankRow
  ) => {
    if (tankData.length === 0) return;
    
    const startPressure = tankData[0].pressure;
    const endPressure = tankData[tankData.length - 1].pressure;
    const pressureChange = startPressure - endPressure;
    const startTime = tankData[0].time;
    const endTime = tankData[tankData.length - 1].time;
    const durationMin = (endTime - startTime) / 60;
    
    // 使用 tankRow 中的平均深度，如果没有则使用传入的 avgDepth
    const tankAvgDepth = tankRowData ? parseFloat(tankRowData.AverageDepthInMeters) || avgDepth : avgDepth;
    
    // SAC = (压力变化 / 时间) / 环境压力(ATA)
    const ambientPressure = tankAvgDepth / 10 + 1;
    const sacCalculated = durationMin > 0 && ambientPressure > 0 
      ? Math.round((pressureChange / durationMin / ambientPressure) * 100) / 100
      : undefined;

    // 获取气体名称
    const transmitterName = tankRowData?.TransmitterName || `T${tankNum}`;
    
    tanks.push({
      name: transmitterName,
      startPressure: Math.round(startPressure * 100) / 100,
      endPressure: Math.round(endPressure * 100) / 100,
      pressureChange: Math.round(pressureChange * 100) / 100,
      transmitter: serial ? `${transmitterName} (${serial})` : transmitterName,
      avgDepth: Math.round(tankAvgDepth * 100) / 100,
      sacCalculated,
    });
  };

  // 添加各气瓶信息
  addTankInfo(tank1Data, 1, tank1Serial, tank1Row);
  addTankInfo(tank2Data, 2, tank2Serial, tank2Row);
  addTankInfo(tank3Data, 3, tank3Serial, tank3Row);
  addTankInfo(tank4Data, 4, tank4Serial, tank4Row);

  // 构建发射器列表
  const transmitters: string[] = [];
  if (tank1Data.length > 0) transmitters.push(tank1Serial ? `${tank1Row?.TransmitterName || 'T1'} (${tank1Serial})` : tank1Row?.TransmitterName || 'T1');
  if (tank2Data.length > 0) transmitters.push(tank2Serial ? `${tank2Row?.TransmitterName || 'T2'} (${tank2Serial})` : tank2Row?.TransmitterName || 'T2');
  if (tank3Data.length > 0) transmitters.push(tank3Serial ? `${tank3Row?.TransmitterName || 'T3'} (${tank3Serial})` : tank3Row?.TransmitterName || 'T3');
  if (tank4Data.length > 0) transmitters.push(tank4Serial ? `${tank4Row?.TransmitterName || 'T4'} (${tank4Serial})` : tank4Row?.TransmitterName || 'T4');

  // 根据模式判断 OC/CC gases
  const isCC = mode.toLowerCase().includes('cc') || mode.toLowerCase().includes('closed');
  
  // 从 tankRows 中提取气体组成（统一使用三混气格式 O2/He）
  const formatGasComposition = () => {
    if (tankRows.length === 0) {
      return mode === 'Air' ? '21/0' : mode;
    }
    
    // 获取唯一的气体组成（去重）
    const uniqueGases = new Map<string, { o2: number; he: number; name: string }>();
    tankRows.forEach(row => {
      const o2 = parseInt(row.GasO2Percent, 10) || 21;
      const he = parseInt(row.GasHePercent, 10) || 0;
      const key = `${o2}/${he}`;
      if (!uniqueGases.has(key)) {
        uniqueGases.set(key, { o2, he, name: row.TransmitterName || 'Gas' });
      }
    });
    
    // 格式化输出（统一使用 O2/He 格式）
    return Array.from(uniqueGases.values()).map(gas => `${gas.o2}/${gas.he}`).join(', ');
  };

  const gasString = formatGasComposition();

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
  const tank3Pressure = parseTankPressure(sample.Tank3PressureInBar);
  const tank4Pressure = parseTankPressure(sample.Tank4PressureInBar);
  
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
    heartRate: parseNum(sample.HeartRate),
    ascentRate: Math.round(ascentRate * 100) / 100,
    ndl: ndl !== undefined && ndl < 100 ? ndl : 99,
    gf99,
    cns: parseNum(sample.CentralNervousSystemPercent),
    gasDensity: parseNum(sample.GasDensity),
    ppO2: parseNum(sample.PPO2),
    ppN2: parseNum(sample.PPN2),
    ppHe: parseNum(sample.PPHe),
    tank1Pressure,
    tank2Pressure,
    tank3Pressure,
    tank4Pressure,
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
  const summaryRows = parseCSV<SummaryRow>(summariesCSV);
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

  // 按潜水编号分组 tank 数据（新格式：每个气瓶一行）
  const tanksByDive = new Map<string, TankRow[]>();
  tankRows.forEach((tank) => {
    const diveNum = tank.Number;
    if (!tanksByDive.has(diveNum)) {
      tanksByDive.set(diveNum, []);
    }
    tanksByDive.get(diveNum)!.push(tank);
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
    const diveTankRows = tanksByDive.get(diveNum) || [];
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

    // 线性插值填充气瓶压力缺失值
    const interpolateTankPressure = (key: 'tank1Pressure' | 'tank2Pressure' | 'tank3Pressure' | 'tank4Pressure') => {
      // 找到所有有效数据点的索引
      const validIndices: number[] = [];
      for (let i = 0; i < profile.length; i++) {
        if (profile[i][key] !== undefined) {
          validIndices.push(i);
        }
      }
      
      if (validIndices.length < 2) return; // 不足两个点无法插值
      
      // 对每个缺失值进行线性插值
      for (let i = 0; i < profile.length; i++) {
        if (profile[i][key] !== undefined) continue;
        
        // 找到前后最近的有效点
        let prevIdx = -1, nextIdx = -1;
        for (const idx of validIndices) {
          if (idx < i) prevIdx = idx;
          if (idx > i && nextIdx === -1) nextIdx = idx;
        }
        
        if (prevIdx !== -1 && nextIdx !== -1) {
          // 线性插值
          const prevVal = profile[prevIdx][key]!;
          const nextVal = profile[nextIdx][key]!;
          const ratio = (i - prevIdx) / (nextIdx - prevIdx);
          profile[i][key] = Math.round((prevVal + (nextVal - prevVal) * ratio) * 100) / 100;
        } else if (prevIdx !== -1) {
          // 只有前面的点，使用前向填充
          profile[i][key] = profile[prevIdx][key];
        } else if (nextIdx !== -1) {
          // 只有后面的点，使用后向填充
          profile[i][key] = profile[nextIdx][key];
        }
      }
    };
    
    // 对所有气瓶进行插值处理
    interpolateTankPressure('tank1Pressure');
    interpolateTankPressure('tank2Pressure');
    interpolateTankPressure('tank3Pressure');
    interpolateTankPressure('tank4Pressure');

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
      const ascents = ascentRates.filter(r => r > 0); // 正值 = 上升
      const descents = ascentRates.filter(r => r < 0); // 负值 = 下降
      return {
        maxAscent: ascents.length > 0 ? Math.max(...ascents) : 0,
        maxDescent: descents.length > 0 ? Math.min(...descents) : 0,
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
      diver: summary.Diver || 'Unknown',
      buddy: summary.Buddy || 'Solo',
      // 去掉 Note 字段首尾的双引号
      notes: summary.Note ? summary.Note.replace(/^"|"$/g, '') : undefined,
      tags: summary.Note ? summary.Note.replace(/^"|"$/g, '').split(';').map(t => t.trim()).filter(t => t.length > 0) : [],
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
        battery: {
          type: summary.BatteryType || undefined,
          vStart: parseNum(summary.BatteryVoltagePreDive),
          vEnd: parseNum(summary.BatteryVoltagePostDive),
        },
        dive: {
          mode: summary.Mode,
          sampleRate: parseIntNum(summary.SampleRateInMs) ? parseIntNum(summary.SampleRateInMs)! / 1000 : 10,
          waterDensity: summary.WaterDenisity || undefined,
          waterType: summary.WaterType || undefined,
          surfacePressure: Math.min(
            parseNum(summary.SurfacePressureInMillibarPreDive) ?? Infinity,
            parseNum(summary.SurfacePressureInMillibarPostDive) ?? Infinity
          ) === Infinity ? undefined : Math.min(
            parseNum(summary.SurfacePressureInMillibarPreDive) ?? Infinity,
            parseNum(summary.SurfacePressureInMillibarPostDive) ?? Infinity
          ),
          surfaceInterval: formatSurfaceInterval(surfaceIntervalSec),
        },
        deco: {
          cnsStart: parseNum(summary.CentralNervousSystemPercentPreDive),
          cnsEnd: parseNum(summary.CentralNervousSystemPercentPostDive),
          decoModel: summary.DecoModel || undefined,
          endSurfaceGF: parseNum(summary.GradientFactorSurfaceEnd),
          gf99Max: (() => {
            const max = profile.reduce((m, p) => p.gf99 !== undefined && p.gf99 > m ? p.gf99 : m, 0);
            return max > 0 ? max : undefined;
          })(),
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
        surfacePressure: Math.min(
          parseNum(summary.SurfacePressureInMillibarPreDive) ?? Infinity,
          parseNum(summary.SurfacePressureInMillibarPostDive) ?? Infinity
        ) === Infinity ? undefined : Math.min(
          parseNum(summary.SurfacePressureInMillibarPreDive) ?? Infinity,
          parseNum(summary.SurfacePressureInMillibarPostDive) ?? Infinity
        ),
        maxHeartRate: parseNum(summary.HeartRateMax),
        minHeartRate: parseNum(summary.HeartRateMin),
        avgHeartRate: parseNum(summary.HeartRateAvg),
      },
      
      // 气体信息
      gasesInfo: extractGasesInfo(samples, summary.Mode, avgDepth, diveTankRows),
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

/**
 * 解析版本信息 CSV
 */
export function parseExporterVersion(): ExporterVersion | null {
  const rows = parseCSV<ExporterVersionRow>(versionCSV);
  if (rows.length === 0) return null;
  
  const row = rows[0];
  return {
    version: row.Version || '',
    commit: row.Commit || '',
    buildDate: row.BuildDate || '',
  };
}
