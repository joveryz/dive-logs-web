import { Dive, DiveProfilePoint } from '../types';

// 生成模拟的潜水剖面数据（包含所有数据系列）
function generateDiveProfile(maxDepth: number, duration: number): DiveProfilePoint[] {
  const points: DiveProfilePoint[] = [];
  const intervalSeconds = 10; // 每10秒一个数据点
  const totalPoints = Math.floor(duration / intervalSeconds);
  
  // 下潜阶段 (约15%时间)
  const descentPoints = Math.floor(totalPoints * 0.15);
  // 底部阶段 (约60%时间)
  const bottomPoints = Math.floor(totalPoints * 0.6);
  // 上升阶段 (约25%时间)
  const ascentPoints = totalPoints - descentPoints - bottomPoints;
  
  let currentDepth = 0;
  let time = 0;
  let tank1Pressure = 200; // 起始气压
  let cumulativeCns = 0;
  
  // 辅助函数：计算各种参数
  const calcPpO2 = (depth: number) => Math.round((1 + depth / 10) * 0.21 * 100) / 100;
  const calcPpN2 = (depth: number) => Math.round((1 + depth / 10) * 0.79 * 100) / 100;
  const calcGasDensity = (depth: number) => Math.round((1 + depth / 10) * 1.2 * 10) / 10;
  
  // 下潜阶段
  for (let i = 0; i < descentPoints; i++) {
    const progress = i / descentPoints;
    currentDepth = maxDepth * Math.sin(progress * Math.PI / 2);
    const prevDepth = i > 0 ? points[i - 1].depth : 0;
    const ascentRate = (currentDepth - prevDepth) / intervalSeconds; // m/s
    const sac = 1.5 + Math.random() * 0.5;
    tank1Pressure -= sac * (intervalSeconds / 60) * (1 + currentDepth / 10);
    cumulativeCns += calcPpO2(currentDepth) > 0.5 ? 0.01 : 0;
    
    points.push({
      time,
      depth: Math.round(currentDepth * 10) / 10,
      temperature: 28 - currentDepth * 0.1 + Math.random() * 0.5,
      ascentRate: Math.round(ascentRate * 100) / 100,
      ndl: Math.max(5, 99 - Math.floor(currentDepth * 2)),
      gf99: Math.floor(20 + currentDepth * 1.5 + Math.random() * 5),
      cns: Math.round(cumulativeCns * 100) / 100,
      gasDensity: calcGasDensity(currentDepth),
      ppO2: calcPpO2(currentDepth),
      ppHe: 0,
      ppN2: calcPpN2(currentDepth),
      tank1Pressure: Math.round(tank1Pressure * 10) / 10,
      tank2Pressure: 200, // Tank 2 备用
      sac: Math.round(sac * 10) / 10,
      deco: 0,
      tts: 5,
      ceiling: 0,
    });
    time += intervalSeconds;
  }
  
  // 底部巡游（带轻微波动）
  for (let i = 0; i < bottomPoints; i++) {
    const variation = Math.sin(i * 0.3) * (maxDepth * 0.15);
    currentDepth = maxDepth - Math.abs(variation);
    const prevDepth = points.length > 0 ? points[points.length - 1].depth : currentDepth;
    const ascentRate = (currentDepth - prevDepth) / intervalSeconds; // m/s
    const ndl = Math.max(5, 70 - Math.floor(i * 0.5));
    const sac = 1.6 + Math.random() * 0.6 + (Math.abs(ascentRate) > 0.08 ? 0.3 : 0);
    tank1Pressure -= sac * (intervalSeconds / 60) * (1 + currentDepth / 10);
    cumulativeCns += calcPpO2(currentDepth) > 0.5 ? 0.02 : 0.01;
    
    points.push({
      time,
      depth: Math.round(currentDepth * 10) / 10,
      temperature: 27 - currentDepth * 0.08 + Math.random() * 0.3,
      ascentRate: Math.round(ascentRate * 100) / 100,
      ndl,
      gf99: Math.floor(40 + i * 0.3 + Math.random() * 10),
      cns: Math.round(cumulativeCns * 100) / 100,
      gasDensity: calcGasDensity(currentDepth),
      ppO2: calcPpO2(currentDepth),
      ppHe: 0,
      ppN2: calcPpN2(currentDepth),
      tank1Pressure: Math.round(Math.max(0, tank1Pressure) * 10) / 10,
      tank2Pressure: 200,
      sac: Math.round(sac * 10) / 10,
      deco: ndl < 10 ? Math.floor((10 - ndl) / 2) : 0,
      tts: 5 + (ndl < 10 ? Math.floor((10 - ndl) / 2) : 0),
      ceiling: ndl < 10 ? 3 : 0,
    });
    time += intervalSeconds;
  }
  
  // 上升阶段（包含安全停留）
  const safetyStopDepth = 5;
  const safetyStopPoints = Math.floor(ascentPoints * 0.4);
  const regularAscentPoints = ascentPoints - safetyStopPoints;
  
  // 先上升到安全停留深度
  for (let i = 0; i < regularAscentPoints; i++) {
    const progress = i / regularAscentPoints;
    currentDepth = maxDepth - (maxDepth - safetyStopDepth) * progress;
    const prevDepth = points[points.length - 1].depth;
    const ascentRate = (prevDepth - currentDepth) / intervalSeconds; // m/s
    const sac = 1.4 + Math.random() * 0.4;
    tank1Pressure -= sac * (intervalSeconds / 60) * (1 + currentDepth / 10);
    cumulativeCns = Math.max(0, cumulativeCns - 0.005);
    
    points.push({
      time,
      depth: Math.round(currentDepth * 10) / 10,
      temperature: 27 + progress * 1,
      ascentRate: Math.round(-ascentRate * 100) / 100, // 负值表示上升
      ndl: 99,
      gf99: Math.floor(60 - i * 2 + Math.random() * 5),
      cns: Math.round(cumulativeCns * 100) / 100,
      gasDensity: calcGasDensity(currentDepth),
      ppO2: calcPpO2(currentDepth),
      ppHe: 0,
      ppN2: calcPpN2(currentDepth),
      tank1Pressure: Math.round(Math.max(0, tank1Pressure) * 10) / 10,
      tank2Pressure: 200,
      sac: Math.round(sac * 10) / 10,
      deco: 0,
      tts: Math.ceil((currentDepth / 9) + 3), // 约9m/min + 3min安全停留
      ceiling: 0,
    });
    time += intervalSeconds;
  }
  
  // 安全停留
  for (let i = 0; i < safetyStopPoints; i++) {
    currentDepth = safetyStopDepth + Math.sin(i * 0.5) * 0.5;
    const prevDepth = points[points.length - 1].depth;
    const ascentRate = (prevDepth - currentDepth) / intervalSeconds; // m/s
    const sac = 1.2 + Math.random() * 0.3;
    tank1Pressure -= sac * (intervalSeconds / 60) * (1 + currentDepth / 10);
    cumulativeCns = Math.max(0, cumulativeCns - 0.01);
    
    points.push({
      time,
      depth: Math.round(currentDepth * 10) / 10,
      temperature: 28,
      ascentRate: Math.round(-ascentRate * 100) / 100,
      ndl: 99,
      gf99: Math.floor(30 - i * 0.5),
      cns: Math.round(cumulativeCns * 100) / 100,
      gasDensity: calcGasDensity(currentDepth),
      ppO2: calcPpO2(currentDepth),
      ppHe: 0,
      ppN2: calcPpN2(currentDepth),
      tank1Pressure: Math.round(Math.max(0, tank1Pressure) * 10) / 10,
      tank2Pressure: 200,
      sac: Math.round(sac * 10) / 10,
      deco: 0,
      tts: Math.max(1, 3 - Math.floor(i / 3)),
      ceiling: 0,
    });
    time += intervalSeconds;
  }
  
  // 最后上升到水面
  points.push({
    time,
    depth: 0,
    temperature: 29,
    ascentRate: -0.08, // ~5m/min = 0.08m/s
    ndl: 99,
    gf99: 0,
    cns: Math.round(cumulativeCns * 100) / 100,
    gasDensity: 1.2,
    ppO2: 0.21,
    ppHe: 0,
    ppN2: 0.79,
    tank1Pressure: Math.round(Math.max(0, tank1Pressure) * 10) / 10,
    tank2Pressure: 200,
    sac: 0,
    deco: 0,
    tts: 0,
    ceiling: 0,
  });
  
  return points;
}

// 生成模拟潜水数据
export const mockDives: Dive[] = [
  {
    id: '1',
    diveNumber: 21,
    date: '2024-10-03',
    startTime: '10:39',
    endTime: '11:26',
    duration: 46 * 60 + 55,
    maxDepth: 29.5,
    avgDepth: 12.5,
    diveType: 'Air',
    location: 'Semporna',
    site: 'BBB Fun Diver',
    buddy: 'Lacy',
    diveComputer: { model: 'Perdix 2', serial: 'AA6F51C3' },
    computerInfo: {
      model: 'Perdix 2',
      serial: 'AA6F51C3',
      oem: 'SRI',
      firmwareVersion: 'v152',
      language: '简体中文',
      dataFormat: 'sw-pnf',
      logVersion: 'v14',
      dbVersion: 'v12',
      battery: {
        type: 'Lithium',
        vStart: 1.50,
        vEnd: 1.40,
      },
      dateTime: {
        timezoneOffset: 0,
        daylightSavings: false,
      },
      dive: {
        mode: 'Air',
        sampleRate: 10,
        recordedUnits: 'Metric',
        salinitySetting: 'EN13319',
        surfacePressure: 1027,
        surfaceInterval: '18h 55min',
      },
      deco: {
        cnsStart: 0,
        cnsEnd: 1,
        decoModel: 'GF',
        endSurfaceGF: 29,
        conservatism: '40/85',
      },
    },
    profile: generateDiveProfile(29.5, 46 * 60 + 55),
    gases: [{ name: 'Air', o2: 21, startPressure: 200, endPressure: 50 }],
    gasesInfo: {
      ocGases: {
        programmed: '21/00',
        used: '21/00',
      },
      ccGases: {
        programmed: 'None',
        used: 'None',
      },
      airIntegration: {
        aiEnabled: true,
        transmitters: ['T1 (SN: 234374)', 'T2 (SN: 233526)'],
        gtrMode: 'T1 (Single Tank)',
        sacRecorded: 1.84,
      },
      tanks: [
        {
          name: 'Tank 1 (T1)',
          startPressure: 184.78,
          endPressure: 43.71,
          pressureChange: 141.07,
          transmitter: 'T1',
          gasUsage: 'OC/BO 21/0 (0min - 35min 5...)',
          avgDepth: 11.3,
          sacCalculated: 1.87,
        },
        {
          name: 'Tank 2 (T2)',
          startPressure: 186.57,
          endPressure: 0,
          pressureChange: 0,
        },
      ],
    },
    gear: {
      dress: '3mm Full Wetsuit',
      apparatus: 'Open Circuit',
      tankSize: 'AL80',
      weight: 4,
      suit: '3mm Full Wetsuit',
      tank: 'AL80',
      bcd: 'Scubapro Hydros Pro',
    },
    environment: {
      minTemp: 26,
      maxTemp: 29,
      avgTemp: 27.8,
      surfacePressure: 1027,
      waterType: 'Salt',
      visibility: 20,
      current: 'Light',
      waterTemp: 28,
      surfaceTemp: 31,
      waves: 'Calm',
      weather: 'Sunny',
      platform: 'Boat',
      environment: 'Ocean',
      conditions: 'Good',
    },
    problemsInfo: {
      thermalComfort: 'Comfortable',
      workload: 'Light',
      problems: 'None',
      equipmentMalfunction: 'None',
      anySymptoms: 'None',
      exposureToAltitude: 'None',
    },
    notes: 'Great visibility, saw several sea turtles',
    rating: 5,
    tags: ['turtles', 'coral', 'good-viz'],
  },
  {
    id: '2',
    diveNumber: 20,
    date: '2024-10-02',
    startTime: '15:19',
    endTime: '15:54',
    duration: 35 * 60 + 23,
    maxDepth: 27.8,
    avgDepth: 14.2,
    diveType: 'Air',
    location: 'Semporna',
    site: 'BBB Fun Diver',
    buddy: 'Lacy',
    diveComputer: { model: 'Perdix 2', serial: 'AA6F51C3' },
    profile: generateDiveProfile(27.8, 35 * 60 + 23),
    gases: [{ name: 'Air', o2: 21, startPressure: 200, endPressure: 60 }],
    environment: {
      waterType: 'Salt',
      visibility: 18,
      current: 'Moderate',
      waterTemp: 27,
    },
    rating: 4,
  },
  {
    id: '3',
    diveNumber: 19,
    date: '2024-10-02',
    startTime: '13:00',
    endTime: '13:41',
    duration: 41 * 60 + 5,
    maxDepth: 25.1,
    avgDepth: 11.8,
    diveType: 'Air',
    location: 'Semporna',
    site: 'BBB Fun Diver',
    diveComputer: { model: 'Perdix 2', serial: 'AA6F51C3' },
    profile: generateDiveProfile(25.1, 41 * 60 + 5),
    gases: [{ name: 'Air', o2: 21, startPressure: 200, endPressure: 55 }],
    rating: 4,
  },
  {
    id: '4',
    diveNumber: 18,
    date: '2024-10-02',
    startTime: '10:40',
    endTime: '11:16',
    duration: 36 * 60 + 56,
    maxDepth: 18.0,
    avgDepth: 10.5,
    diveType: 'Air',
    location: 'Semporna',
    site: 'BBB Fun Diver',
    diveComputer: { model: 'Perdix 2', serial: 'AA6F51C3' },
    profile: generateDiveProfile(18.0, 36 * 60 + 56),
    rating: 3,
  },
  {
    id: '5',
    diveNumber: 17,
    date: '2024-10-01',
    startTime: '14:04',
    endTime: '14:51',
    duration: 47 * 60 + 35,
    maxDepth: 14.9,
    avgDepth: 9.2,
    diveType: 'Air',
    location: 'Semporna',
    site: 'BBB Fun Diver',
    diveComputer: { model: 'Perdix 2', serial: 'AA6F51C3' },
    profile: generateDiveProfile(14.9, 47 * 60 + 35),
    rating: 4,
  },
  {
    id: '6',
    diveNumber: 16,
    date: '2024-10-01',
    startTime: '12:24',
    endTime: '12:55',
    duration: 30 * 60 + 52,
    maxDepth: 25.4,
    avgDepth: 13.1,
    diveType: 'Air',
    location: 'Semporna',
    site: 'BBB Fun Diver',
    diveComputer: { model: 'Perdix 2', serial: 'AA6F51C3' },
    profile: generateDiveProfile(25.4, 30 * 60 + 52),
    rating: 4,
  },
  {
    id: '7',
    diveNumber: 15,
    date: '2024-10-01',
    startTime: '10:33',
    endTime: '11:05',
    duration: 31 * 60 + 37,
    maxDepth: 27.3,
    avgDepth: 14.5,
    diveType: 'Air',
    location: 'Semporna',
    site: 'BBB Fun Diver',
    diveComputer: { model: 'Perdix 2', serial: 'AA6F51C3' },
    profile: generateDiveProfile(27.3, 31 * 60 + 37),
    rating: 5,
  },
  {
    id: '8',
    diveNumber: 14,
    date: '2024-09-30',
    startTime: '14:21',
    endTime: '15:00',
    duration: 39 * 60 + 27,
    maxDepth: 20.3,
    avgDepth: 11.2,
    diveType: 'Air',
    location: 'Semporna',
    site: 'BBB Fun Diver',
    diveComputer: { model: 'Perdix 2', serial: 'AA6F51C3' },
    profile: generateDiveProfile(20.3, 39 * 60 + 27),
    rating: 4,
  },
  // 添加一些 Sipadan 的潜水
  {
    id: '9',
    diveNumber: 24,
    date: '2024-10-04',
    startTime: '9:55',
    endTime: '10:31',
    duration: 35 * 60 + 52,
    maxDepth: 25.6,
    avgDepth: 13.8,
    diveType: 'Air',
    location: 'Semporna',
    site: 'Sipadan',
    buddy: 'Lacy',
    diveComputer: { model: 'Perdix 2', serial: 'AA6F51C3' },
    profile: generateDiveProfile(25.6, 35 * 60 + 52),
    environment: {
      waterType: 'Salt',
      visibility: 30,
      current: 'Light',
      waterTemp: 28,
    },
    notes: 'Sipadan Barracuda Point - massive school of barracuda!',
    rating: 5,
    tags: ['barracuda', 'sipadan', 'amazing'],
  },
  {
    id: '10',
    diveNumber: 25,
    date: '2024-10-04',
    startTime: '11:28',
    endTime: '12:14',
    duration: 46 * 60 + 24,
    maxDepth: 26.4,
    avgDepth: 14.1,
    diveType: 'Air',
    location: 'Semporna',
    site: 'Sipadan',
    buddy: 'Lacy',
    diveComputer: { model: 'Perdix 2', serial: 'AA6F51C3' },
    profile: generateDiveProfile(26.4, 46 * 60 + 24),
    rating: 5,
  },
  {
    id: '11',
    diveNumber: 26,
    date: '2024-10-04',
    startTime: '14:02',
    endTime: '14:42',
    duration: 40 * 60 + 22,
    maxDepth: 19.6,
    avgDepth: 11.5,
    diveType: 'Air',
    location: 'Semporna',
    site: 'Sipadan',
    diveComputer: { model: 'Perdix 2', serial: 'AA6F51C3' },
    profile: generateDiveProfile(19.6, 40 * 60 + 22),
    rating: 4,
  },
  // 北京 HiDive 的 Gauge 潜水
  {
    id: '12',
    diveNumber: 27,
    date: '2025-11-22',
    startTime: '15:53',
    endTime: '16:07',
    duration: 14 * 60,
    maxDepth: 3.3,
    avgDepth: 2.1,
    diveType: 'Gauge',
    location: 'Beijing',
    site: 'HiDive',
    diveComputer: { model: 'Perdix 2', serial: 'AA6F51C3' },
    profile: generateDiveProfile(3.3, 14 * 60),
    notes: 'Pool training session',
    rating: 3,
  },
  {
    id: '13',
    diveNumber: 28,
    date: '2025-11-22',
    startTime: '16:25',
    endTime: '16:41',
    duration: 16 * 60,
    maxDepth: 3.3,
    avgDepth: 2.2,
    diveType: 'Gauge',
    location: 'Beijing',
    site: 'HiDive',
    diveComputer: { model: 'Perdix 2', serial: 'AA6F51C3' },
    profile: generateDiveProfile(3.3, 16 * 60),
    rating: 3,
  },
  {
    id: '14',
    diveNumber: 29,
    date: '2025-11-23',
    startTime: '10:25',
    endTime: '10:26',
    duration: 1 * 60 + 1,
    maxDepth: 4.6,
    avgDepth: 2.8,
    diveType: 'Gauge',
    location: 'Beijing',
    site: 'HiDive',
    diveComputer: { model: 'Perdix 2', serial: 'AA6F51C3' },
    profile: generateDiveProfile(4.6, 1 * 60 + 1),
    rating: 2,
  },
  {
    id: '15',
    diveNumber: 30,
    date: '2025-11-23',
    startTime: '10:37',
    endTime: '10:37',
    duration: 21,
    maxDepth: 2.9,
    avgDepth: 2.0,
    diveType: 'Gauge',
    location: 'Beijing',
    site: 'HiDive',
    diveComputer: { model: 'Perdix 2', serial: 'AA6F51C3' },
    profile: generateDiveProfile(2.9, 21),
    rating: 2,
  },
  {
    id: '16',
    diveNumber: 31,
    date: '2025-11-23',
    startTime: '10:39',
    endTime: '10:39',
    duration: 28,
    maxDepth: 2.9,
    avgDepth: 2.1,
    diveType: 'Gauge',
    location: 'Beijing',
    site: 'HiDive',
    diveComputer: { model: 'Perdix 2', serial: 'AA6F51C3' },
    profile: generateDiveProfile(2.9, 28),
    rating: 2,
  },
];

// 按日期和时间排序（最新的在前）
mockDives.sort((a, b) => {
  const dateCompare = b.date.localeCompare(a.date);
  if (dateCompare !== 0) return dateCompare;
  return b.startTime.localeCompare(a.startTime);
});
