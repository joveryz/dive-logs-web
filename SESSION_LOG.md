# Dive Log Website Clone - Session Log

## 项目概述
创建一个类似 Subsurface/Shearwater 潜水应用的潜水日志网站克隆。

## 技术栈
- **React 18** + **TypeScript**
- **Vite 6.0.3** - 构建工具
- **Tailwind CSS 3.4.17** - 深色主题样式
- **Recharts 2.13.3** - 图表库
- **Zustand 5.0.2** - 状态管理

## 项目路径
`d:\Workspace\repos\online-dive-logs`

---

## 完成的功能

### 1. 基础架构
- [x] React + TypeScript + Vite 项目初始化
- [x] Tailwind CSS 深色主题配置
- [x] Zustand 状态管理

### 2. UI 组件
- [x] **DiveList** - 左侧潜水记录列表
- [x] **DiveDetail** - 右侧详情面板（图表 + 标签页）
- [x] **DiveChart** - 交互式深度图表
- [x] **ResizablePanels** - 可调整大小的面板（水平 + 垂直方向）

### 3. 详情标签页
- [x] Gear（装备）
- [x] Environment（环境）
- [x] Gases（气体）
- [x] Problems（问题记录）
- [x] Computer（潜水电脑数据）

### 4. 图表功能

#### 数据系列（约15条线）
| 系列 | 颜色 | 类型 | 单位 |
|------|------|------|------|
| Depth | 白色 #ffffff | Line | m |
| Deco | #ef4444 | Line | min |
| TTS | #f97316 | Line | min |
| NDL | #ec4899 | Line | min |
| Ascent | 绿/红 | Area | m/s |
| CNS | #f59e0b | Line | % |
| Gas Density | #14b8a6 | Line | g/L |
| GF99 | #f43f5e | Line | % |
| ppO2 | #10b981 | Line | bar |
| ppHe | #9ca3af | Line | bar |
| ppN2 | #eab308 | Line | bar |
| Tank 1 | #a855f7 | Line | bar |
| Tank 2 | #8b5cf6 | Line | bar |
| SAC | #d946ef | Line | L/min |
| Temp | #06b6d4 | Line | °C |

#### 图表交互
- [x] 鼠标悬停高亮单条线（其他变淡 15% 透明度）
- [x] 点击图例切换线条显示/隐藏
- [x] 动态右侧 Y 轴（显示悬停系列的刻度和标签）
- [x] 透明 hitbox 增大悬停区域（12-15px）
- [x] Ascent 颜色：绿色=上升（负值），红色=下降（正值）
- [x] Ascent 以 0 为中心分界

#### 图表样式优化
- [x] Y 轴刻度等分（6 个刻度）
- [x] 字体大小 12px，颜色 #d1d5db
- [x] 图表居中（对称 margin，Y 轴宽度 60px）
- [x] Y 轴标签垂直居中
- [x] 左右 Y 轴标签方向一致（-90°）
- [x] Depth 线在最上层，白色 3px 粗
- [x] 移除悬停加粗功能
- [x] Tooltip 4 列布局，无滚动条
- [x] 悬停竖线无圆点

#### 动态 Scale
- [x] 根据实际数据动态计算每个系列的范围
- [x] 添加 padding 避免数据紧贴边界
- [x] Ascent 对称范围（以 0 为中心）
- [x] 特殊处理：Tank Pressure 取整到 50，Temperature 取整到 5

### 5. 可调整面板
- [x] 左右水平分割（潜水列表 | 详情）
- [x] 上下垂直分割（图表 | 标签页）
- [x] ResizeObserver 动态响应图表尺寸变化
- [x] X 轴填满整个时间范围

### 6. Mock 数据
- [x] 完整的潜水剖面数据生成
- [x] 包含：下潜、底部巡游、上升、安全停留阶段
- [x] 所有参数：温度、CNS、气体密度、ppO2/ppN2/ppHe、气瓶压力、SAC 等
- [x] Ascent Rate 单位改为 m/s

---

## 关键代码文件

### 组件
- `src/components/DiveChart/DiveChart.tsx` - 主图表组件（~600行）
- `src/components/DiveList/DiveList.tsx` - 潜水列表
- `src/components/DiveDetail/DiveDetail.tsx` - 详情面板
- `src/components/ResizablePanels/ResizablePanels.tsx` - 可调整面板

### 数据
- `src/data/mockDives.ts` - Mock 数据生成
- `src/types/index.ts` - TypeScript 类型定义
- `src/store/diveStore.ts` - Zustand 状态管理

### 配置
- `tailwind.config.js` - Tailwind 配置
- `vite.config.ts` - Vite 配置
- `tsconfig.json` - TypeScript 配置

---

## 运行项目

```bash
cd d:\Workspace\repos\online-dive-logs
npm install
npm run dev
```

默认端口：http://localhost:5173（如被占用会自动选择 5174-5176）

---

## 问题修复记录

### 2024年12月30日 - 搜索功能崩溃修复

**问题描述**: 在搜索框中输入内容后，整个 Web 界面会消失/崩溃。

**根本原因**:
1. Zustand store 中使用了无效的 ES6 getter 语法 (`get filteredDives()`)，这在 Zustand 中不起作用
2. 选择器函数内部进行数组过滤操作，每次渲染都返回新的数组引用，导致 React 无限循环渲染

**修复方案** (`src/store/diveStore.ts`):
- 移除无效的 ES6 getter 语法
- 使用 `useMemo` 配合分开的状态选择器
- 确保只有当 `dives` 或 `filterText` 实际变化时才重新计算过滤结果

**修改后的代码结构**:
```typescript
import { create } from 'zustand';
import { useMemo } from 'react';

// Store 只包含原始状态和操作
export const useDiveStore = create<DiveStore>((set) => ({
  dives: mockDives,
  selectedDiveId: mockDives[0]?.id || null,
  filterText: '',
  setSelectedDiveId: (id) => set({ selectedDiveId: id }),
  setFilterText: (text) => set({ filterText: text }),
}));

// 使用 useMemo 的选择器 hooks
export const useFilteredDives = () => {
  const dives = useDiveStore((state) => state.dives);
  const filterText = useDiveStore((state) => state.filterText);
  
  return useMemo(() => {
    // 过滤逻辑
  }, [dives, filterText]);
};
```

---

### 2024年12月30日 - 项目重构与优化

**重构内容**:

1. **修复项目配置**
   - `package.json` 名称从 `online-dive-logs` 改为 `dive-logs`
   - 版本升级到 `0.1.0`
   - `vite.config.ts` base 路径修复为 `/dive-logs/`

2. **添加 SEO 优化**
   - `index.html` 添加 meta description、keywords
   - 添加 Open Graph 标签
   - 添加 theme-color

3. **添加代码质量工具**
   - 添加 `.prettierrc` 配置文件
   - 添加 `.gitignore` 文件

4. **新增组件**
   - `ErrorBoundary` - 错误边界组件，防止整个应用崩溃
   - `Loading` - 加载指示器组件
   - `Skeleton` - 骨架屏组件
   - `ListSkeleton` / `ChartSkeleton` - 特定场景骨架屏

5. **可访问性改进**
   - App 组件添加语义化标签 (`role="banner"`, `role="main"`, `role="contentinfo"`)
   - DiveList 添加键盘导航支持 (Enter/Space 选择)
   - 表格添加 ARIA 属性 (`aria-selected`, `scope`)
   - SearchInput 添加 `<label>` 和 `aria-label`
   - 图标添加 `aria-hidden="true"`

6. **其他优化**
   - Footer 年份动态显示 (`new Date().getFullYear()`)
   - 移除未使用的 `EmptyState` 组件（修复构建错误）

---

### 2024年12月30日 - 项目结构重构

**新项目结构**:

```
src/
├── components/
│   ├── common/              # 通用组件
│   │   ├── ui/              # 基础 UI (SearchInput, Tabs)
│   │   └── feedback/        # 反馈组件 (ErrorBoundary, Loading)
│   ├── layout/              # 布局组件
│   │   ├── AppLayout/       # 应用布局
│   │   ├── Header/          # 头部
│   │   ├── Footer/          # 底部
│   │   └── ResizablePanels/ # 可调整面板
│   └── features/            # 功能模块
│       └── dive/            # 潜水功能
│           ├── DiveList/
│           ├── DiveDetail/
│           └── DiveChart/
├── hooks/                   # 自定义 Hooks
│   ├── useFilteredDives.ts
│   ├── useSelectedDive.ts
│   ├── useDebounce.ts
│   └── useLocalStorage.ts
├── constants/               # 常量配置
│   ├── app.ts               # 应用配置
│   └── chart.ts             # 图表配置
├── services/                # 服务层（API）
│   ├── api.ts               # API 基础封装
│   └── diveService.ts       # 潜水数据服务
├── store/                   # 状态管理
├── types/                   # 类型定义
├── utils/                   # 工具函数
└── data/                    # Mock 数据
```

**重构改进**:

1. **按功能组织组件**
   - `common/` - 可复用的通用组件
   - `layout/` - 布局相关组件
   - `features/` - 按业务功能划分

2. **提取 Hooks**
   - 从 store 中分离出 `useFilteredDives`、`useSelectedDive`
   - 添加通用 hooks: `useDebounce`、`useLocalStorage`

3. **添加 Constants**
   - 图表配置常量提取到 `chart.ts`
   - 应用配置提取到 `app.ts`

4. **添加 Services 层**
   - `api.ts` - 基础 HTTP 客户端封装
   - `diveService.ts` - 潜水数据服务（为未来 API 集成准备）

5. **路径别名优化**
   - 更新 `tsconfig.json` 和 `vite.config.ts`
   - 支持 `@/components`、`@/hooks`、`@/store` 等别名

---

## 待办事项 / 未来改进

- [x] 重命名项目文件夹：`online-dive-logs` → `dive-logs`
- [x] 添加错误边界和加载状态组件
- [x] 改进可访问性 (a11y)
- [x] 重构项目结构（按功能组织）
- [x] 提取自定义 Hooks
- [x] 添加 Services 层
- [ ] 真实潜水数据导入（Subsurface XML、UDDF 格式）
- [ ] 数据库持久化
- [ ] 用户认证
- [ ] 潜水记录编辑功能
- [ ] 导出功能（PDF、图片）
- [ ] 更多图表类型（气体消耗分析、潜水统计等）
- [ ] 移动端响应式适配
- [ ] 多语言支持
- [ ] 代码分割优化（当前 bundle > 500KB）

---

## Session 日期
2024年12月30日
