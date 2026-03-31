# Secondary Page Navbar Precise Safe Area Adaptation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为共享二级页导航建立可复用的顶部安全区高度计算能力，并让协议页/隐私页的顶部返回箭头和标题在微信小程序中稳定可见。

**Architecture:** 新增一个专门返回顶部布局数据的工具函数，统一封装微信小程序状态栏与胶囊信息，以及非微信端的保守回退值。`SecondaryPageNavbar` 不再依赖 `wd-navbar` 的顶部布局，而是改为自绘一个轻量标准头部，直接消费共享高度数据，协议页和隐私页继续复用该组件，无需各自处理安全区。

**Tech Stack:** Vue 3 SFC、TypeScript、uni-app、微信小程序运行时 API、ESLint、vue-tsc

---

## File Structure

- Create: `src/utils/navbar.ts`
  - 统一返回自定义顶部导航所需的高度数据
  - 封装微信小程序与非微信端的差异
- Modify: `src/components/navigation/SecondaryPageNavbar.vue`
  - 改为使用共享高度数据
  - 用轻量自定义结构渲染返回按钮和标题
- Verify only: `src/pages/agreement/index.vue`
  - 保持复用共享 navbar
- Verify only: `src/pages/privacy/index.vue`
  - 保持复用共享 navbar

---

### Task 1: 新增统一顶部导航高度工具

**Files:**
- Create: `src/utils/navbar.ts`
- Verify: `src/utils/index.ts`（仅在项目已有统一导出要求时检查；若未使用则不改）

- [ ] **Step 1: 新建顶部导航高度工具文件**

创建文件：`src/utils/navbar.ts`

先写入下面这版完整实现：

```ts
export interface CustomNavBarMetrics {
  statusBarHeight: number
  navBarHeight: number
  navBarPaddingTop: number
  navBarContentHeight: number
}

const DEFAULT_STATUS_BAR_HEIGHT = 24
const DEFAULT_NAV_BAR_CONTENT_HEIGHT = 44
const DEFAULT_VERTICAL_GAP = 8

function getDefaultMetrics(): CustomNavBarMetrics {
  const statusBarHeight = DEFAULT_STATUS_BAR_HEIGHT
  const navBarContentHeight = DEFAULT_NAV_BAR_CONTENT_HEIGHT
  return {
    statusBarHeight,
    navBarPaddingTop: statusBarHeight,
    navBarContentHeight,
    navBarHeight: statusBarHeight + navBarContentHeight,
  }
}

export function getCustomNavBarMetrics(): CustomNavBarMetrics {
  const fallback = getDefaultMetrics()

  // #ifdef MP-WEIXIN
  try {
    const systemInfo = uni.getSystemInfoSync()
    const menuButton = uni.getMenuButtonBoundingClientRect()
    const statusBarHeight = systemInfo.statusBarHeight || fallback.statusBarHeight

    if (!menuButton || !menuButton.height || !menuButton.top) {
      return {
        statusBarHeight,
        navBarPaddingTop: statusBarHeight,
        navBarContentHeight: fallback.navBarContentHeight,
        navBarHeight: statusBarHeight + fallback.navBarContentHeight,
      }
    }

    const verticalGap = Math.max(menuButton.top - statusBarHeight, DEFAULT_VERTICAL_GAP)
    const navBarContentHeight = menuButton.height + verticalGap * 2

    return {
      statusBarHeight,
      navBarPaddingTop: statusBarHeight,
      navBarContentHeight,
      navBarHeight: statusBarHeight + navBarContentHeight,
    }
  }
  catch {
    return fallback
  }
  // #endif

  return fallback
}
```

- [ ] **Step 2: 检查工具输出是否满足组件布局所需字段**

确认这个工具最终只暴露：

```ts
interface CustomNavBarMetrics {
  statusBarHeight: number
  navBarHeight: number
  navBarPaddingTop: number
  navBarContentHeight: number
}
```

预期：
- 页面或组件不需要自己再计算胶囊位置
- 非微信端也能拿到可用默认值

- [ ] **Step 3: 运行定向 ESLint，确认新工具文件无问题**

Run:
```bash
cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec eslint src/utils/navbar.ts
```

Expected:
```text
无报错；命令正常退出
```

- [ ] **Step 4: 提交统一高度工具**

```bash
git add src/utils/navbar.ts
git commit -m "feat: add shared navbar metrics utility"
```

---

### Task 2: 将共享 navbar 改为自定义精确布局

**Files:**
- Modify: `src/components/navigation/SecondaryPageNavbar.vue`

- [ ] **Step 1: 将 `SecondaryPageNavbar.vue` 改成消费统一高度工具**

把组件脚本改成下面这样：

```vue
<script lang="ts" setup>
import { computed } from 'vue'
import { navigateBackOrTo } from '@/utils/navigation'
import { getCustomNavBarMetrics } from '@/utils/navbar'

const props = withDefaults(defineProps<{
  title: string
  fallbackUrl: string
  fallbackIsTab?: boolean
}>(), {
  fallbackIsTab: false,
})

const metrics = getCustomNavBarMetrics()

const navBarStyle = computed(() => ({
  height: `${metrics.navBarHeight}px`,
  paddingTop: `${metrics.navBarPaddingTop}px`,
}))

const navBarContentStyle = computed(() => ({
  height: `${metrics.navBarContentHeight}px`,
}))

function handleBack() {
  navigateBackOrTo(props.fallbackUrl, props.fallbackIsTab)
}
</script>
```

- [ ] **Step 2: 将组件模板改成轻量自定义头部结构，不再依赖 `wd-navbar`**

把模板改成下面这样：

```vue
<template>
  <view class="secondary-page-navbar" :style="navBarStyle">
    <view class="secondary-page-navbar__content" :style="navBarContentStyle">
      <button class="secondary-page-navbar__back" @click="handleBack">
        <text class="secondary-page-navbar__back-icon">←</text>
      </button>
      <view class="secondary-page-navbar__title">
        {{ title }}
      </view>
      <view class="secondary-page-navbar__placeholder" />
    </view>
  </view>
</template>
```

说明：
- 左侧按钮负责返回
- 中间标题居中
- 右侧占位保持视觉对称
- 不再使用 `wd-navbar`

- [ ] **Step 3: 将组件样式替换成下面这版**

```scss
.secondary-page-navbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
  box-sizing: border-box;
}

.secondary-page-navbar__content {
  display: grid;
  grid-template-columns: 72rpx 1fr 72rpx;
  align-items: center;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.secondary-page-navbar__back {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  color: #333;
}

.secondary-page-navbar__back-icon {
  font-size: 36rpx;
  line-height: 1;
}

.secondary-page-navbar__title {
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.secondary-page-navbar__placeholder {
  width: 72rpx;
  height: 72rpx;
}
```

- [ ] **Step 4: 保存后的完整组件应接近以下结果**

```vue
<template>
  <view class="secondary-page-navbar" :style="navBarStyle">
    <view class="secondary-page-navbar__content" :style="navBarContentStyle">
      <button class="secondary-page-navbar__back" @click="handleBack">
        <text class="secondary-page-navbar__back-icon">←</text>
      </button>
      <view class="secondary-page-navbar__title">
        {{ title }}
      </view>
      <view class="secondary-page-navbar__placeholder" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { navigateBackOrTo } from '@/utils/navigation'
import { getCustomNavBarMetrics } from '@/utils/navbar'

const props = withDefaults(defineProps<{
  title: string
  fallbackUrl: string
  fallbackIsTab?: boolean
}>(), {
  fallbackIsTab: false,
})

const metrics = getCustomNavBarMetrics()

const navBarStyle = computed(() => ({
  height: `${metrics.navBarHeight}px`,
  paddingTop: `${metrics.navBarPaddingTop}px`,
}))

const navBarContentStyle = computed(() => ({
  height: `${metrics.navBarContentHeight}px`,
}))

function handleBack() {
  navigateBackOrTo(props.fallbackUrl, props.fallbackIsTab)
}
</script>

<style lang="scss" scoped>
.secondary-page-navbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
  box-sizing: border-box;
}

.secondary-page-navbar__content {
  display: grid;
  grid-template-columns: 72rpx 1fr 72rpx;
  align-items: center;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.secondary-page-navbar__back {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  color: #333;
}

.secondary-page-navbar__back-icon {
  font-size: 36rpx;
  line-height: 1;
}

.secondary-page-navbar__title {
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.secondary-page-navbar__placeholder {
  width: 72rpx;
  height: 72rpx;
}
</style>
```

- [ ] **Step 5: 运行组件定向 ESLint**

Run:
```bash
cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec eslint src/components/navigation/SecondaryPageNavbar.vue src/utils/navbar.ts
```

Expected:
```text
无报错；命令正常退出
```

- [ ] **Step 6: 提交共享 navbar 精确适配实现**

```bash
git add src/components/navigation/SecondaryPageNavbar.vue src/utils/navbar.ts
git commit -m "fix: adapt shared navbar to precise safe area"
```

---

### Task 3: 验证协议页与隐私页接入结果

**Files:**
- Verify only: `src/pages/agreement/index.vue`
- Verify only: `src/pages/privacy/index.vue`

- [ ] **Step 1: 确认协议页继续保持当前接入方式**

协议页应保持类似：

```vue
<SecondaryPageNavbar
  title="用户协议"
  fallback-url="/pages/me/index"
  :fallback-is-tab="true"
/>
```

并继续保留：

```ts
definePage({
  style: {
    navigationBarTitleText: '用户协议',
    navigationStyle: 'custom',
  },
})
```

- [ ] **Step 2: 确认隐私页继续保持当前接入方式**

隐私页应保持类似：

```vue
<SecondaryPageNavbar
  title="隐私政策"
  fallback-url="/pages/me/index"
  :fallback-is-tab="true"
/>
```

并继续保留：

```ts
definePage({
  style: {
    navigationBarTitleText: '隐私政策',
    navigationStyle: 'custom',
  },
})
```

- [ ] **Step 3: 运行类型检查**

Run:
```bash
cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec vue-tsc --noEmit
```

Expected:
```text
无 TypeScript / Vue SFC 类型错误
```

- [ ] **Step 4: 运行定向 ESLint，覆盖工具、组件和协议页链路**

Run:
```bash
cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec eslint src/utils/navbar.ts src/components/navigation/SecondaryPageNavbar.vue src/pages/agreement/index.vue src/pages/privacy/index.vue
```

Expected:
```text
无报错；命令正常退出
```

- [ ] **Step 5: 在微信开发者工具中做手动验证**

手动检查：
- 协议页顶部左返回箭头可见
- 协议页标题完整可见
- 隐私页顶部左返回箭头可见
- 隐私页标题完整可见
- 顶部白底连续，没有错位或裁切
- 点击返回仍符合“优先返回，否则 fallback 到 `/pages/me/index`”

Expected:
```text
协议页和隐私页顶部导航在微信端稳定可见，不再被状态栏 / 胶囊遮挡
```

- [ ] **Step 6: 若本任务没有新增代码改动，则不重复提交；保留上一个代码提交作为最终实现提交**

```bash
git status --short
```

Expected:
```text
除计划/文档外，无额外代码变更
```

---

## Self-Review

### Spec coverage
- “新增可复用的顶部安全区高度计算能力” → Task 1
- “`SecondaryPageNavbar` 接入统一高度数据” → Task 2
- “协议页 / 隐私页继续保持当前接入方式” → Task 3 Step 1-2
- “微信端与非微信端均可渲染” → Task 1 fallback + Task 3 检查
- “不扩大到个性化页面” → File Structure 仅包含共享 navbar 链路

### Placeholder scan
- 无 TBD / TODO / later
- 所有代码、命令、预期结果均已写明
- 所有文件路径明确

### Type consistency
- 统一使用 `getCustomNavBarMetrics`
- 统一使用 `CustomNavBarMetrics`
- 统一使用 `navBarHeight`、`navBarPaddingTop`、`navBarContentHeight`
- `SecondaryPageNavbar` 继续保留 `title`、`fallbackUrl`、`fallbackIsTab` 接口
