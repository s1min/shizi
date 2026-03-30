---
name: secondary-page-navbar-precise-safe-area-adaptation
description: Add a shared top safe-area calculation utility and use it in the secondary-page navbar so protocol/privacy headers remain visible in WeChat Mini Program
type: project
---

# 二级页统一导航精确安全区适配设计

## 背景
前一轮已尝试通过 `env(safe-area-inset-top)` 为共享导航组件补顶部安全区占位，但用户在微信小程序实际运行中验证后，协议页和隐私页的返回箭头仍然会被顶部状态栏 / 胶囊区域遮挡。

这说明当前问题不能靠 CSS 安全区变量简单兜住。本质原因是：页面使用了 `navigationStyle: 'custom'`，顶部栏属于自定义导航场景，而微信小程序不同设备上的状态栏高度、胶囊位置和导航内容可用区并不完全等价于 `env(safe-area-inset-top)`。

## 目标
- 为自定义顶部导航建立统一、可复用的安全区高度计算能力
- 修复协议页、隐私页共享 navbar 在微信小程序中的顶部遮挡问题
- 让共享导航组件不再依赖模糊推测的安全区，而是使用更精确的顶部高度数据
- 保持改动范围收敛，当前只修统一 navbar 链路

## 方案选择
本次采用“统一计算，局部接入”的方式：
- 统一：新增一层可复用的顶部安全区计算能力
- 局部：当前仅让 `SecondaryPageNavbar` 接入这套能力

不采用“每个页面单独判断”的方式，因为会造成重复实现和后续维护成本扩散；也不采用“先改所有个性化页面”的方式，因为当前已经确认暴露问题的是共享 navbar 链路。

## 设计方案
### 1. 新增顶部安全区计算工具
新增一个共享工具（可放在 `src/utils/` 下），职责是根据当前运行端返回适合自定义顶部导航使用的布局数据。

输出应至少包含：
- `statusBarHeight`
- `navBarHeight`
- `navBarPaddingTop`
- `navBarContentHeight`

计算策略：
- 微信小程序端：优先使用 `uni.getSystemInfoSync()` 获取 `statusBarHeight`
- 微信小程序端：优先使用 `uni.getMenuButtonBoundingClientRect()` 获取胶囊的 top / height
- 通过状态栏高度与胶囊位置关系，计算出适合自定义标题栏的总高度和内容高度
- 非微信端或获取失败时，回退到保守默认值，保证组件仍可渲染

工具输出必须是“可直接用于布局的值”，而不是把底层原始数据继续抛给页面自己计算。

### 2. `SecondaryPageNavbar` 接入统一高度数据
共享导航组件改为直接消费上面的统一高度数据，而不是继续依赖：
- `env(safe-area-inset-top)`
- `wd-navbar` 的 `safe-area-inset-top`

组件应自己负责：
- 顶部总高度
- 内容区垂直对齐
- 左侧返回按钮位置
- 标题水平与垂直居中
- 白底连续性与 sticky 表现

如果 `wd-navbar` 无法很好承接这类精确高度控制，本次允许在 `SecondaryPageNavbar` 中改为自定义轻量结构（左箭头 + 标题），但范围仅限共享标准导航组件，不扩散到个性化页面头部。

### 3. 保持页面接入方式稳定
协议页和隐私页继续保持现有接入形式：
- 引用 `SecondaryPageNavbar`
- 保持 `navigationStyle: 'custom'`
- 保持 fallback 返回逻辑

本次不要求协议页和隐私页自行处理顶部高度。

### 4. 为后续页面复用留出能力
虽然本次只修共享 navbar 链路，但新增的安全区计算工具应设计成可复用能力。

后续如果 login、loot、onboarding、unit-complete 等页面也需要更精确的顶部适配，应可以直接复用这套统一高度数据，而不是重新发明一套计算逻辑。

## 验收标准
- 协议页顶部返回箭头稳定可见
- 隐私页顶部返回箭头稳定可见
- 标题不被状态栏 / 胶囊遮挡
- 顶部白底区域连续，无裁切或错位
- sticky 行为保留
- 返回逻辑不变
- 顶部高度计算逻辑沉淀为共享能力，而不是散落在单页里

## 影响范围
- 新增：顶部安全区计算工具（`src/utils/` 下）
- 修改：`src/components/navigation/SecondaryPageNavbar.vue`
- 间接受影响页面：
  - `src/pages/agreement/index.vue`
  - `src/pages/privacy/index.vue`

## 不在本次范围内
以下页面不在本次整改范围内：
- `login`
- `loot`
- `onboarding`
- `unit-complete`
- 其他非共享 navbar 链路页面

## 测试建议
- 在微信开发者工具中进入协议页，确认顶部箭头与标题可见
- 在微信开发者工具中进入隐私页，确认顶部箭头与标题可见
- 切换不同机型配置，确认顶部不再被胶囊 / 状态栏遮挡
- 点击返回，确认仍遵循“优先返回，否则 fallback”的既有逻辑
- 在非微信端确认组件仍能正常渲染，不因胶囊信息缺失而报错
