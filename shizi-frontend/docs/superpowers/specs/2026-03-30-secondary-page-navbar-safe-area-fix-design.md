---
name: secondary-page-navbar-safe-area-fix
description: Fix safe-area handling for the shared secondary-page navbar so protocol/privacy back buttons remain visible in WeChat Mini Program
type: project
---

# 二级页统一导航安全区修正设计

## 背景
当前协议页、隐私页已经接入统一的 `SecondaryPageNavbar`，代码层面也已渲染 `wd-navbar`。但在微信小程序实际运行时，顶部返回箭头与标题被状态栏 / 胶囊区域遮挡，导致用户看起来像“没有返回按钮”。

从运行现象判断，问题不在于页面未接入导航，而在于统一 navbar 组件对顶部安全区的处理不够稳妥。当前实现仅依赖 `wd-navbar` 的 `safe-area-inset-top`，而没有在外层容器显式提供顶部安全区占位，因此在特定端上存在被覆盖风险。

## 目标
- 修复统一 navbar 组件链路的顶部安全区问题
- 保证协议页、隐私页中的返回箭头和标题在微信小程序中稳定可见
- 保留现有统一封装与 sticky 行为
- 不扩大修改范围，不改动 login、loot、onboarding、unit-complete 等个性化顶部入口页面

## 方案选择
本次采用收敛范围最小的修复方案：仅调整共享组件 `SecondaryPageNavbar` 的安全区实现。

不采用页面内分别重写 navbar 的方式，因为那会破坏已有复用；也不把所有顶部入口页面一起纳入整改，因为当前已确认暴露问题的是统一 navbar 组件链路。

## 设计方案
### 1. 调整 `SecondaryPageNavbar` 的安全区职责
由共享组件外层显式承担顶部安全区占位职责，而不是完全依赖 `wd-navbar` 的内建安全区处理。

组件结构调整为两层：
- 外层 sticky 白底容器，负责吸顶与背景连续性
- 顶部安全区占位层，负责在状态栏区域预留空间
- 下面承载 `wd-navbar` 主体内容

### 2. 保持统一视觉与交互语义
协议页、隐私页仍然继续使用统一 navbar：
- 左侧箭头返回
- 中间标题
- 白底顶部栏
- 保持当前 fallback 返回逻辑

本次不改变导航语义，只修复“可见性”和“安全区占位”。

### 3. 兼容目标
重点保证以下场景：
- 微信小程序开发者工具
- 常见全面屏设备
- 顶部存在状态栏 / 胶囊区域时，标题和左返回入口不被压住

## 验收标准
- 协议页顶部返回箭头可见
- 隐私页顶部返回箭头可见
- 标题完整显示，不被状态栏 / 胶囊遮挡
- 顶部区域白底连续，无裁切断层
- sticky 行为仍然保留
- 不影响现有返回 fallback 逻辑

## 影响范围
- `src/components/navigation/SecondaryPageNavbar.vue`
- 间接受影响页面：
  - `src/pages/agreement/index.vue`
  - `src/pages/privacy/index.vue`

## 不在本次范围内
以下页面不在本次修复范围内：
- `login`
- `loot`
- `onboarding`
- `unit-complete`
- 其他非统一 navbar 链路页面

## 测试建议
- 在微信开发者工具中进入协议页、隐私页，确认顶部返回箭头与标题可见
- 切换不同机型安全区配置，确认不会再次被遮挡
- 点击左返回，确认仍遵循“优先返回，否则 fallback”的既有逻辑
