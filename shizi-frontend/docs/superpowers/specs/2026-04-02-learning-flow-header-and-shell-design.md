# 学习流程头与内容壳组件化设计

## 背景
当前 `unit-test.vue` 想要和学习详情页保持同一条学习流程的视觉连续性，但现状是测试页单独实现了一套顶部结构和内容区布局，导致页面虽然颜色接近，骨架仍明显不同。详情页的流程感主要来自 [index.vue](shizi-frontend/src/subpkg-learning/learn/index.vue) 中稳定的 `progress-header` 骨架，而不是单个题目卡或某个学习业务组件。

同时，`TracingPractice.vue` 虽然在视觉上也处于学习详情页内容区里，但它的职责是“写一写”业务交互，不适合作为测试页的直接复用对象。测试页真正需要复用的是流程页的骨架和内容承载方式，而不是描红业务逻辑本身。

## 目标
1. 将学习详情页顶部 `progress-header` 抽成可复用组件，供学习页与单元测试页统一使用。
2. 补一个统一的内容区壳组件，复用详情页的内容舞台、留白、卡片节奏和底部操作区布局。
3. 让 `unit-test.vue` 在结构上成为学习流程第 4 步“试一试”的自然延续，而不是独立考试页。
4. 保持现有题目生成、答题反馈、测试结果逻辑不变，仅重构页面骨架与样式承载方式。

## 非目标
- 不复用 `TracingPractice.vue` 的业务实现。
- 不修改题型生成、得分、星级、错题记录、跳转逻辑。
- 不新增新的学习步骤或状态机。

## 方案对比

### 方案 A：抽 `LearnFlowHeader` + 抽 `LearnStageShell`（推荐）
- 将 `progress-header` 封装成纯展示组件。
- 将详情页内容区的统一舞台抽成壳组件，负责内容留白、主卡容器、底部操作槽位。
- `index.vue`、`unit-test.vue`、后续其他学习流程页统一接入这两个组件。

**优点**
- 复用的是稳定骨架，而不是业务组件，边界清晰。
- 最能解决“测试页不像详情页后续步骤”的问题。
- 后续 review / completion 等学习流程页也可以继续复用。

**缺点**
- 需要调整 `index.vue` 与 `unit-test.vue` 结构接入方式。

### 方案 B：只抽 `LearnFlowHeader`
- 顶部统一，内容区仍各页自己实现。

**优点**
- 改动较小。

**缺点**
- 只能解决顶部不统一，主内容区仍容易风格漂移。
- 测试页仍可能像独立页面，只是顶上长得像详情页。

### 方案 C：直接让测试页复用 `TracingPractice.vue`
- 通过 props / slots 改造 `TracingPractice.vue` 以适配测试页。

**优点**
- 表面上代码复用更多。

**缺点**
- 会把描红业务组件污染成通用容器。
- 组件语义错误，维护成本高。
- 一旦测试页与描红页继续分化，组件复杂度会快速失控。

**结论**
选择方案 A。`progress-header` 适合抽组件；`TracingPractice.vue` 不应直接作为测试页主内容区复用对象。

## 组件设计

### 1. `LearnFlowHeader.vue`

#### 职责
- 渲染学习流程头部。
- 显示返回按钮、标题、进度条、步骤流。
- 通过 props 接收展示数据，通过 event 向页面抛出返回操作。

#### 输入
- `title: string`：当前步骤标题，如“看一看”“试一试”。
- `current: number`：当前进度序号显示值。
- `total: number`：总数显示值。
- `progressPercent: number`：进度条百分比。
- `stepItems: Array<{ key: string; label: string; state: 'current' | 'done' | 'available'; clickable?: boolean }>`
- `showBack?: boolean`：是否显示返回按钮，默认显示。

#### 输出事件
- `back`：点击左上角返回按钮时触发。
- 可选 `step-click`：如果后续仍需要学习页点击步骤跳转，保持扩展位，但单元测试页默认不启用。

#### 实现原则
- 直接复用 [index.vue](shizi-frontend/src/subpkg-learning/learn/index.vue) 现有 `progress-header` 结构和样式语义。
- 不承载任何学习业务逻辑。
- 不关心页面类型，只负责展示。

### 2. `LearnStageShell.vue`

#### 职责
- 提供学习流程页面的统一内容承载壳。
- 统一内容区的外层留白、垂直节奏、主任务卡容器和底部操作区域。
- 通过 slot 让不同步骤填充自己的业务内容。

#### 建议插槽
- `default`：主内容区。
- `footer`：底部操作区。
- 可选 `aux`：辅助信息区，用于像“常用组词”“提示信息”之类的二级模块。

#### 设计原则
- 壳组件只负责布局和节奏，不负责题目、描红、语音或结果逻辑。
- 样式语言对齐详情页的 `learn-content` 及其内容舞台。
- 模块间距大于模块内间距，遵守项目 4/8 倍数布局规则。

## 页面接入方式

### `index.vue`
- 用 `LearnFlowHeader` 替换当前内联的 `progress-header`。
- 保留 `currentStep`、`stepItems`、`progressPercent`、`stepLabel` 等现有计算逻辑，将其作为 props 传入。
- `CharCard`、`SpeakPractice`、`TracingPractice`、`QuizCard` 继续保留各自业务职责。
- 若后续需要，再逐步让这些步骤组件接入 `LearnStageShell`，但本次不强制把所有组件都重写一遍。

### `unit-test.vue`
- 顶部改为 `LearnFlowHeader`。
- 标题固定显示“试一试”。
- 步骤流固定为四步：
  - 看一看：done
  - 读一读：done
  - 写一写：done
  - 试一试：current
- 进度条右侧继续显示题目进度 `currentIndex + 1 / questions.length`。
- 主内容区接入 `LearnStageShell` 或至少对齐其布局语义。
- 测试题卡、选项区、反馈条、结果区继续由 `unit-test.vue` 自己维护，不复用 `TracingPractice.vue`。

### `TracingPractice.vue`
- 保持为“写一写”业务组件。
- 不承担测试页容器职责。
- 如后续需要统一布局，只让它嵌入 `LearnStageShell`，而不是反过来被其他页面复用为通用壳。

## 单元测试页视觉要求
1. 页面顶部与详情页保持同一骨架：返回按钮、标题居中、进度条、step-flow。
2. 页面背景、header 圆角、阴影、padding 节奏对齐详情页。
3. 主内容区只有一个主视觉中心：答题时是题面主卡，结果时是结果摘要卡。
4. 选项卡继续保留 2x2 布局，但表达为学习流程里的互动轻卡片，而不是考试宫格。
5. 反馈条权重低于主任务区和选项区，错误反馈偏引导而非惩罚。

## 风险与边界

### 风险 1：组件抽象过度
如果把 header 组件做成包含页面逻辑的“超级头部”，会降低可维护性。

**约束**
`LearnFlowHeader` 必须保持纯展示组件，只接收数据和发出事件。

### 风险 2：把内容壳做成万能组件
如果 `LearnStageShell` 试图容纳太多业务判断，也会演变成新的复杂组件。

**约束**
它只负责布局，不负责题型、步骤逻辑、状态判断。

### 风险 3：误用 `TracingPractice.vue`
如果为了复用视觉样式而继续扩展 `TracingPractice.vue` 的 props / slot，会污染职责边界。

**约束**
`TracingPractice.vue` 仅服务描红业务，不直接供测试页复用。

## 验证标准
1. `unit-test.vue` 顶部在结构和视觉上明显与 [index.vue](shizi-frontend/src/subpkg-learning/learn/index.vue) 保持一致。
2. 从学习页进入测试页时，用户主观感受应是“进入第 4 步试一试”，而不是进入新页面体系。
3. `LearnFlowHeader` 不包含业务逻辑，只做展示与事件分发。
4. `unit-test.vue` 未依赖 `TracingPractice.vue` 的业务实现。
5. 修改后 lint 通过，并至少检查学习页与测试页两个页面在样式上的连续性。
