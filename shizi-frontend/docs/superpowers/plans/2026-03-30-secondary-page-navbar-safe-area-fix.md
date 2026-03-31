# Secondary Page Navbar Safe Area Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复统一二级页 navbar 在微信小程序中的顶部安全区问题，确保协议页和隐私页的返回箭头与标题稳定可见。

**Architecture:** 保持协议页和隐私页继续复用 `SecondaryPageNavbar`，只调整共享组件自身的安全区实现。由共享组件外层显式承担顶部安全区占位与白底连续性，`wd-navbar` 只负责导航主体内容与交互，从而降低其内建 safe-area 在不同端上的不确定性。

**Tech Stack:** Vue 3 SFC、TypeScript、uni-app、wot-design-uni、ESLint、vue-tsc

---

## File Structure

- Modify: `src/components/navigation/SecondaryPageNavbar.vue`
  - 共享二级页顶部导航组件
  - 本次在这里补齐顶部安全区占位、白底连续性和稳定的 sticky 容器
- Verify only: `src/pages/agreement/index.vue`
  - 保持继续使用共享 navbar，不应需要额外改动
- Verify only: `src/pages/privacy/index.vue`
  - 保持继续使用共享 navbar，不应需要额外改动

---

### Task 1: 调整共享 navbar 的安全区结构

**Files:**
- Modify: `src/components/navigation/SecondaryPageNavbar.vue`

- [ ] **Step 1: 先阅读当前组件，确认现状只依赖 `wd-navbar` 的安全区处理**

当前代码应类似：

```vue
<template>
  <view class="secondary-page-navbar">
    <wd-navbar
      :title="title"
      left-arrow
      safe-area-inset-top
      @click-left="handleBack"
    />
  </view>
</template>
```

预期确认点：
- 只有一个外层 `.secondary-page-navbar`
- 仅通过 `safe-area-inset-top` 处理顶部安全区
- 没有显式的顶部占位层

- [ ] **Step 2: 改造模板，为外层增加显式安全区占位层**

将模板改成下面这样：

```vue
<template>
  <view class="secondary-page-navbar">
    <view class="safe-area-spacer" />
    <wd-navbar
      :title="title"
      left-arrow
      @click-left="handleBack"
    />
  </view>
</template>
```

说明：
- 删除 `safe-area-inset-top`
- 新增 `<view class="safe-area-spacer" />`
- 不改变 `title`、`left-arrow`、`@click-left` 这些导航语义

- [ ] **Step 3: 为安全区占位层和 sticky 白底容器补齐样式**

将样式改成下面这样：

```scss
.secondary-page-navbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
}

.safe-area-spacer {
  height: env(safe-area-inset-top);
  background: #fff;
}
```

说明：
- `.secondary-page-navbar` 继续负责 sticky 和白底连续性
- `.safe-area-spacer` 负责显式预留顶部安全区
- 协议页、隐私页的正文 padding 不需要改动

- [ ] **Step 4: 保存后的完整组件应接近以下结果**

```vue
<template>
  <view class="secondary-page-navbar">
    <view class="safe-area-spacer" />
    <wd-navbar
      :title="title"
      left-arrow
      @click-left="handleBack"
    />
  </view>
</template>

<script lang="ts" setup>
import { navigateBackOrTo } from '@/utils/navigation'

const props = withDefaults(defineProps<{
  title: string
  fallbackUrl: string
  fallbackIsTab?: boolean
}>(), {
  fallbackIsTab: false,
})

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
}

.safe-area-spacer {
  height: env(safe-area-inset-top);
  background: #fff;
}
</style>
```

- [ ] **Step 5: 运行 ESLint，确认组件改动无格式或语法问题**

Run:
```bash
cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec eslint src/components/navigation/SecondaryPageNavbar.vue
```

Expected:
```text
无报错；命令正常退出
```

- [ ] **Step 6: 提交共享组件修复**

```bash
git add src/components/navigation/SecondaryPageNavbar.vue
git commit -m "fix: adjust secondary navbar safe area"
```

---

### Task 2: 验证协议页与隐私页在共享组件修复后表现正常

**Files:**
- Verify only: `src/pages/agreement/index.vue`
- Verify only: `src/pages/privacy/index.vue`
- Modify only if absolutely required: `src/pages/agreement/index.vue`
- Modify only if absolutely required: `src/pages/privacy/index.vue`

- [ ] **Step 1: 确认协议页仍继续使用共享 navbar 组件**

应保持类似：

```vue
<SecondaryPageNavbar
  title="用户协议"
  fallback-url="/pages/me/index"
  :fallback-is-tab="true"
/>
```

预期：
- 不需要新增页面内自定义返回栏
- 不需要改动 `definePage({ navigationStyle: 'custom' })`

- [ ] **Step 2: 确认隐私页仍继续使用共享 navbar 组件**

应保持类似：

```vue
<SecondaryPageNavbar
  title="隐私政策"
  fallback-url="/pages/me/index"
  :fallback-is-tab="true"
/>
```

预期：
- 不需要新增页面内自定义返回栏
- 不需要改动 `definePage({ navigationStyle: 'custom' })`

- [ ] **Step 3: 运行类型检查，确认共享组件调整未引入连带问题**

Run:
```bash
cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec vue-tsc --noEmit
```

Expected:
```text
无 TypeScript / Vue SFC 类型错误
```

- [ ] **Step 4: 运行定向 ESLint，确认协议页、隐私页及组件链路无 lint 问题**

Run:
```bash
cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec eslint src/components/navigation/SecondaryPageNavbar.vue src/pages/agreement/index.vue src/pages/privacy/index.vue
```

Expected:
```text
无报错；命令正常退出
```

- [ ] **Step 5: 在微信开发者工具中进行手动验证**

手动检查：
- 进入协议页，确认顶部左返回箭头可见
- 进入协议页，确认标题完整可见
- 进入隐私页，确认顶部左返回箭头可见
- 进入隐私页，确认标题完整可见
- 确认顶部白底连续，没有被状态栏 / 胶囊切断
- 点击返回时，若有上一页则返回；若无上一页则 fallback 到 `/pages/me/index`

Expected:
```text
协议页和隐私页顶部导航均可见且可用，未再被安全区遮挡
```

- [ ] **Step 6: 如协议页和隐私页无需额外改动，则仅提交验证后的最终修复状态**

```bash
git add src/components/navigation/SecondaryPageNavbar.vue
git commit -m "fix: ensure shared navbar is visible in mini program"
```

如果 Task 1 已经提交过且本任务没有新增代码改动，则不要重复提交。

---

## Self-Review

### Spec coverage
- “修复统一 navbar 组件链路的顶部安全区问题” → Task 1
- “保证协议页、隐私页中的返回箭头和标题稳定可见” → Task 2 手动验证
- “保留现有统一封装与 sticky 行为” → Task 1 样式与结构保持复用组件
- “不扩大修改范围” → File Structure 与 Task 2 明确限制为共享组件链路

### Placeholder scan
- 已移除 TBD / TODO / later 等占位项
- 所有命令、代码片段、验证目标均已具体给出

### Type consistency
- 统一使用 `SecondaryPageNavbar.vue`
- 统一使用 `.secondary-page-navbar` 与 `.safe-area-spacer`
- 页面侧继续使用 `fallback-url` 与 `:fallback-is-tab="true"`
