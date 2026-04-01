# Learning Detail Page UI Style Optimization Design

## Goal
在现有学习详情页基础上，按 `shizi-frontend/CLAUDE.md` 中最新确定的 Frontend UI rules 统一整页视觉秩序，让顶部进度区、内容承载区、四个学习步骤、完成态形成同一套儿童学习流程界面语言。此次工作以 UI 样式优化为主，不扩大为交互重构或组件架构重写。

## Scope
本次优化聚焦学习详情页整页统一提质，优先处理页面骨架与跨步骤的一致性。

包含：
- 学习详情页顶部进度区样式统一
- 学习详情页内容承载区样式统一
- 完成态样式统一
- 四个步骤组件的按钮、卡片、间距、状态表达统一
- 布局尺寸全面对齐 4/8 spacing rule

不包含：
- 重写学习流程逻辑
- 新增步骤或改变步骤顺序
- 重构为新的组件架构
- 扩展到学习详情页之外的其他页面

## Current State
当前学习详情页的主入口在 [shizi-frontend/src/subpkg-learning/learn/index.vue](../../shizi-frontend/src/subpkg-learning/learn/index.vue)。它已经具备：
- 顶部退出按钮、步骤标题、整体学习进度条、步骤流
- 中部基于 `currentStep` 切换四个步骤组件
- 单字学习完成后的 `complete` 结果态

当前主要问题：
1. 顶部区、内容区、完成态之间的视觉层级仍不够统一
2. 四个步骤组件各自形成了较强的局部风格，整页连续感不足
3. 同类按钮、卡片、反馈区在不同步骤中存在重量和节奏差异
4. 不是所有布局尺寸都已统一到 4/8 体系
5. `complete-screen` 更像独立结果页，而不是学习流程中的自然收束态

## Design Principles
本次优化严格遵循 `CLAUDE.md` 中的 Frontend UI rules：

1. 页面只保留一个主视觉中心，中部主任务区承担这个角色
2. 顶部区是流程导航，不与主任务区争夺视觉重心
3. 同类按钮、同类卡片、同类状态表达必须统一
4. 反馈保持短、轻、明确，不高于主任务区权重
5. 布局尺寸使用 4 或 8 的倍数；边框、阴影等视觉细节可例外
6. 优先做样式收敛，不引入新的结构复杂度

## Proposed Design

### 1. Page Structure
学习详情页统一为三层结构：

#### Top navigation-progress layer
顶部区负责表达“学到哪里了”，而不是承担主任务展示。
- 保留退出按钮
- 保留当前步骤标题
- 保留整体学习进度条
- 保留四步骤流
- 视觉目标是轻、稳、清晰

#### Main task layer
中部内容区成为整页唯一主视觉中心。
- 四个步骤组件都落入同一套内容承载节奏中
- 步骤组件可保留自身内容差异，但需共享统一的外部呼吸感和底部操作区逻辑
- 主内容优先聚焦，辅助内容降噪

#### Bottom action layer
所有推进/返回/完成动作统一到底部操作体系。
- 主按钮、次按钮同高、同圆角、同排布逻辑
- 按钮区在不同步骤中的位置尽量稳定
- 完成态按钮也复用同一套语义和视觉语言

### 2. Header Design
顶部区基于现有结构做收敛，不改变信息功能。

#### Exit entry
- 保留左上退出按钮
- 保持易点击，但权重从“装饰性高亮按钮”收敛为“明确但克制的工具按钮”
- 与中部主任务区拉开视觉层级

#### Step title
- `step-title` 继续作为当前任务标签
- 标题负责告诉用户“现在在做什么”
- 避免过度强调装饰感，优先强调任务语义

#### Overall progress row
- 进度条负责表达单元中的整体进度
- `currentCharIndex / totalChars` 继续保留
- 进度条本身更细、更稳、更像辅助信息

#### Step flow
- 步骤流继续维持 `current / done / available` 三态
- 当前态靠颜色和清晰度表达，不靠放大
- 已完成态与连线高亮统一
- 未完成态弱化，但保持结构可见
- 连线与步骤点状态完全同步，保证同一语义同一颜色

### 3. Main Content Container
`learn-content` 作为统一内容承载区，负责建立整页节奏，而不是让每个步骤组件各自定义页面感。

要求：
- 与顶部区保持稳定距离
- 与底部按钮区保持稳定距离
- 主内容在纵向上居中或稳定落位
- 保持适合儿童学习界面的清晰留白
- 避免出现某一步内容显著更拥挤、某一步显著更松散的断层

### 4. Complete State Design
`complete-screen` 从“独立完成页”调整为“学习流程结果态”。

保留三类核心信息：
1. 成功反馈
2. 当前完成的字
3. 继续学习按钮

优化方向：
- 延续整页的圆角、按钮、卡片、文字层级体系
- 降低“另起一页”的跳脱感
- 强化“这是当前学习流程自然收束节点”的感觉
- 成就感可以保留，但不通过额外堆砌装饰来实现

### 5. Cross-step Visual Unification
此次不会重写四个步骤的玩法逻辑，但会统一以下外观系统：

#### Button system
涉及文件：
- [shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue](../../shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue)
- [shizi-frontend/src/subpkg-learning/components/learn/SpeakPractice.vue](../../shizi-frontend/src/subpkg-learning/components/learn/SpeakPractice.vue)
- [shizi-frontend/src/subpkg-learning/components/learn/TracingPractice.vue](../../shizi-frontend/src/subpkg-learning/components/learn/TracingPractice.vue)
- [shizi-frontend/src/subpkg-learning/components/learn/QuizCard.vue](../../shizi-frontend/src/subpkg-learning/components/learn/QuizCard.vue)

统一内容：
- 主按钮视觉语言
- 次按钮视觉语言
- 图标按钮视觉语言
- 同类按钮尺寸、圆角、投影与状态反馈

#### Card/container system
统一内容：
- 只有需要表达分组的区域才使用卡片
- 题组卡、反馈卡、完成态卡片统一重量逻辑
- 避免某些步骤卡片层级过重、某些步骤几乎无承载感

#### Spacing rhythm
统一内容：
- 页面级间距 > 模块级间距 > 组件内间距
- 主内容块之间保持一致的垂直节奏
- 所有布局相关尺寸统一回到 4/8 倍数体系

#### State semantics
统一内容：
- selected / current / correct / wrong / disabled 的颜色和强弱关系一致
- 同一状态在不同组件中不出现冲突表达

## File Impact
预计修改以下文件：
- [shizi-frontend/src/subpkg-learning/learn/index.vue](../../shizi-frontend/src/subpkg-learning/learn/index.vue)
- [shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue](../../shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue)
- [shizi-frontend/src/subpkg-learning/components/learn/SpeakPractice.vue](../../shizi-frontend/src/subpkg-learning/components/learn/SpeakPractice.vue)
- [shizi-frontend/src/subpkg-learning/components/learn/TracingPractice.vue](../../shizi-frontend/src/subpkg-learning/components/learn/TracingPractice.vue)
- [shizi-frontend/src/subpkg-learning/components/learn/QuizCard.vue](../../shizi-frontend/src/subpkg-learning/components/learn/QuizCard.vue)

原则上不新增文件，优先在现有文件中完成样式统一。

## Testing Strategy
本次以视觉一致性回归检查为主：

1. Header consistency
- 顶部区在不同步骤切换时保持稳定
- 步骤标题、进度条、步骤流层级清晰

2. Main content consistency
- 四个步骤切换时内容承载区节奏一致
- 主任务区始终是视觉重心

3. Action consistency
- 底部主按钮、次按钮在不同步骤下风格一致
- 完成态按钮与学习流程中的主按钮语义一致

4. Complete state continuity
- 完成态看起来像流程收束态，而不是跳出式新页面

5. Spacing rule verification
- 布局尺寸符合 4/8 spacing rule
- 视觉细节例外项仅限边框、阴影、渐变停靠点等

## Success Criteria
完成后应达到：
- 学习详情页整页视觉秩序更统一
- 顶部区不再和主任务区争夺注意力
- 四个步骤虽内容不同，但一眼看出属于同一套页面系统
- 完成态自然融入同一学习流程
- 所有布局尺寸符合已约定的样式规则
