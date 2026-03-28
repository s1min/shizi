# 二级页面返回入口设计

- 日期：2026-03-28
- 范围：`shizi-frontend` 二级页面导航体验
- 状态：已确认，待进入实现规划

## 背景

当前 `shizi-frontend` 中部分二级页面缺少明确的页面内返回入口，尤其是协议、隐私等长内容展示页。对于家长用户或低频用户，这会增加迷失感，削弱产品的可理解性与完成任务的确定感。

同时，项目中也存在学习流程类页面，例如 [src/subpkg-learning/learn/index.vue](../../../../shizi-frontend/src/subpkg-learning/learn/index.vue)，这类页面并不适合直接复用普通“返回”模式，而应基于任务流语义提供“关闭/退出”能力。

本设计的目标是在“一致性”和“场景适配”之间取得平衡：既让普通二级页具备稳定、专业的导航心智，也保留沉浸式学习流程所需要的个性化交互。

## 设计目标

1. 为用户建立稳定、易理解的二级页退出心智。
2. 优先保证家长用户和低频用户可以快速理解如何返回。
3. 避免将沉浸式流程页机械统一为普通导航栏，保留场景语义。
4. 确保所有返回行为具备兜底逻辑，不依赖历史栈一定存在。

## 非目标

1. 不在本次设计中重构所有页面视觉风格。
2. 不在本次设计中统一一级 tabbar 页面头部。
3. 不在本次设计中重做学习流程页面的信息架构。
4. 不在本次设计中引入复杂导航状态管理方案。

## 页面分型

### 1. 标准内容型二级页

特征：
- 以阅读、查看、说明为主。
- 用户随时可能需要离开页面。
- 页面语义是“查看信息”，不是“完成任务”。

导航策略：
- 统一使用顶部 navbar。
- 左侧提供明确返回按钮。
- 标题居中，右侧默认留空。

当前适用页面：
- [src/pages/agreement/index.vue](../../../../shizi-frontend/src/pages/agreement/index.vue)
- [src/pages/privacy/index.vue](../../../../shizi-frontend/src/pages/privacy/index.vue)

后续可归入本类的页面：
- 设置页
- 关于页
- 帮助页
- 反馈页
- FAQ/说明页
- 普通详情页

### 2. 标准功能型二级页

特征：
- 包含普通操作，但不属于连续任务流。
- 用户需要稳定理解“返回到哪里”。

导航策略：
- 默认沿用统一顶部 navbar。
- 返回按钮仍位于左侧。
- 保持与内容型页面一致的导航心智。

结论：
- 只要页面本质是“查看 / 设置 / 普通操作”，都进入统一 navbar 体系。

### 3. 沉浸式流程页

特征：
- 用户正在完成连续任务。
- 离开页面意味着中断流程，而不仅仅是回到上一页。
- 页面顶部更应该传达任务状态而非静态标题。

导航策略：
- 不强行使用标准 navbar。
- 使用个性化顶部结构。
- 退出控件应表达为“关闭 / 退出”，而不是普通“返回”。
- 如果流程有进度影响，应支持确认提示与进度保存说明。

当前适用页面：
- [src/subpkg-learning/learn/index.vue](../../../../shizi-frontend/src/subpkg-learning/learn/index.vue)

高优先级待复核页面：
- [src/subpkg-learning/learn/unit-test.vue](../../../../shizi-frontend/src/subpkg-learning/learn/unit-test.vue)
- [src/subpkg-learning/learn/unit-complete.vue](../../../../shizi-frontend/src/subpkg-learning/learn/unit-complete.vue)
- [src/subpkg-learning/review/index.vue](../../../../shizi-frontend/src/subpkg-learning/review/index.vue)

复核规则：
- 若页面仍属于连续任务流，则保持个性化顶部。
- 若页面已转为纯结果展示或普通说明，可改回统一 navbar。

## 当前页面策略

### 统一 navbar

以下页面应优先接入统一顶部 navbar：
- [src/pages/agreement/index.vue](../../../../shizi-frontend/src/pages/agreement/index.vue)
- [src/pages/privacy/index.vue](../../../../shizi-frontend/src/pages/privacy/index.vue)

设计要求：
- 使用 wot-ui navbar。
- 返回按钮位于顶部左侧。
- 标题居中。
- 右侧不增加无关操作。
- 页面主体继续保留现有正文结构。

### 保留个性化顶部

以下页面应保留或延续个性化顶部交互：
- [src/subpkg-learning/learn/index.vue](../../../../shizi-frontend/src/subpkg-learning/learn/index.vue)
- `unit-test`（预期为测试流）
- `review`（若为连续复习流）
- `unit-complete`（需根据最终页面语义判断）

设计要求：
- 顶部优先展示任务信息，例如进度。
- 退出入口应表达为“关闭 / 退出学习 / 退出测试”等任务语义。
- 若有中断成本，应提示当前进度是否自动保存。

### 特殊处理页面

以下页面不纳入本次统一 navbar 规则，应独立判断：
- [src/pages/login/index.vue](../../../../shizi-frontend/src/pages/login/index.vue)
- [src/pages/onboarding/index.vue](../../../../shizi-frontend/src/pages/onboarding/index.vue)

原因：
- 它们更像流程入口页，而非普通二级页。
- 更适合通过“跳过 / 关闭 / 稍后再说 / 继续”表达交互，而不是默认左上角返回。

### 不处理页面

以下一级主页面不属于本次“二级页补返回”范围：
- [src/pages/home/index.vue](../../../../shizi-frontend/src/pages/home/index.vue)
- [src/pages/me/index.vue](../../../../shizi-frontend/src/pages/me/index.vue)

原因：
- 这类页面本身是应用主入口，不应强调返回。

## 交互规范

### 标准 navbar 页面

返回行为优先级：
1. 优先返回上一页。
2. 若当前页不存在可回退历史，则跳转到稳定入口页。
3. 不允许出现点击返回无反应或回到无意义空页面的情况。

交互要求：
- 返回按钮必须具备足够点击热区。
- 视觉上保持轻量、稳定、低学习成本。
- 长内容页中顶部导航需要持续可见。

### 沉浸式流程页

退出行为优先级：
1. 先判断当前流程是否存在中断成本。
2. 若已有自动保存机制，应在退出提示中明确说明。
3. 用户确认后退出当前流程。
4. 退出后回到明确的任务入口页，而非随机历史页。

交互要求：
- 不使用误导性的普通“返回”语义。
- 在需要时展示确认弹窗。
- 明确传达“进度已保存”或“退出将结束当前流程”。

## 兜底策略

### 协议 / 隐私页面

若页面不是从正常导航链路进入，例如冷启动、重定向或分享进入：
- 返回按钮不能只依赖历史栈。
- 应设置稳定兜底页。

兜底建议：
- 若主要入口来自“我的”页，则兜底回“我的”页。
- 若主要入口来自登录流程，则兜底回登录相关入口页。

原则：
- 兜底页必须符合用户预期，避免随意跳回首页。

### 学习 / 测试流程页面

若关闭时无法可靠回到上一页：
- 应兜底到课程入口、单元页或学习主页。
- 不应直接兜底到 tabbar 首页，以免语义跳跃。

## 实施建议

### 第一阶段

优先完成以下页面：
- [src/pages/agreement/index.vue](../../../../shizi-frontend/src/pages/agreement/index.vue)
- [src/pages/privacy/index.vue](../../../../shizi-frontend/src/pages/privacy/index.vue)

原因：
- 页面类型明确。
- 用户收益高。
- 改动风险低。
- 可直接验证统一 navbar 模式。

### 第二阶段

补齐后续普通二级页的统一规则：
- 设置页
- 帮助页
- 说明页
- 普通详情页

目标：
- 建立统一的标准二级页头部规范。

### 第三阶段

复核学习子包页面分型：
- `unit-test`
- `unit-complete`
- `review`

目标：
- 明确哪些页面延续沉浸式顶部，哪些页面回归标准 navbar。

## 最终结论

1. 并非所有二级页都应采用同一种返回设计。
2. 展示型与普通功能型二级页统一使用顶部 navbar。
3. 学习、测试、复习等流程页使用个性化“关闭 / 退出”设计。
4. 所有返回行为必须具备兜底逻辑，不能假设历史栈一定存在。
5. 当前项目中，协议页与隐私页应作为统一 navbar 的首批落地页面。
