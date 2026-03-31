# Immersive Learning Exit Layout Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将沉浸式学习页、单元测试页、复习页的退出入口从右上角胶囊冲突区移出，改为顶部安全内容区内稳定可见的弱化文本入口。

**Architecture:** 保留三类沉浸式页面现有的进度条和主内容结构，只重构顶部进度区布局。统一把原来的右上角 `✕` 替换为进度条下方的弱化文本退出入口，退出逻辑和 fallback 跳转不变，因此只涉及模板和样式调整，不需要改动业务流程。

**Tech Stack:** Vue 3 SFC、TypeScript、uni-app、SCSS、ESLint、vue-tsc

---

## File Structure

- Modify: `src/subpkg-learning/learn/index.vue`
  - 学习流程页，调整顶部进度区布局，新增“退出学习”入口
- Modify: `src/subpkg-learning/learn/unit-test.vue`
  - 单元测试页，调整顶部进度区布局，新增“退出测试”入口
- Modify: `src/subpkg-learning/review/index.vue`
  - 复习页，调整顶部进度区布局，新增“退出复习”入口

---

### Task 1: 重构学习流程页顶部退出入口

**Files:**
- Modify: `src/subpkg-learning/learn/index.vue`

- [ ] **Step 1: 将学习页顶部模板改成“进度条 + 下方退出入口”结构**

把当前这段：

```vue
<div class="progress-bar">
  <div class="progress-bg">
    <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
  </div>
  <div class="progress-text">
    {{ currentStep }}/{{ totalSteps }}
  </div>
  <div class="close-btn" @click="handleClose">
    ✕
  </div>
</div>
```

替换为：

```vue
<div class="progress-header">
  <div class="progress-bar">
    <div class="progress-bg">
      <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
    </div>
    <div class="progress-text">
      {{ currentStep }}/{{ totalSteps }}
    </div>
  </div>
  <button class="exit-entry" @click="handleClose">
    退出学习
  </button>
</div>
```

- [ ] **Step 2: 将学习页顶部样式替换成新的 header 结构**

把原来的 `.progress-bar` 和 `.close-btn` 相关样式调整为：

```scss
.progress-header {
  padding: calc(env(safe-area-inset-top) + 24rpx) 32rpx 20rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  background: rgba(255, 255, 255, 0.9);
}

.progress-bar {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.progress-bg {
  flex: 1;
  height: 16rpx;
  background: #e0e0e0;
  border-radius: 8rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f5a623, #e8941a);
  border-radius: 8rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 24rpx;
  color: #666;
  min-width: 60rpx;
  text-align: right;
}

.exit-entry {
  align-self: flex-start;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 24rpx;
  color: #b7aa96;
  line-height: 1.4;
}
```

并删除：

```scss
.close-btn {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #999;
}
```

- [ ] **Step 3: 运行学习页定向 ESLint**

Run:
```bash
cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec eslint src/subpkg-learning/learn/index.vue
```

Expected:
```text
无报错；命令正常退出
```

- [ ] **Step 4: 提交学习页布局重构**

```bash
git add src/subpkg-learning/learn/index.vue
git commit -m "fix: move learning exit entry below progress"
```

---

### Task 2: 重构单元测试页顶部退出入口

**Files:**
- Modify: `src/subpkg-learning/learn/unit-test.vue`

- [ ] **Step 1: 将测试页顶部模板改成“进度条 + 下方退出入口”结构**

把当前这段：

```vue
<div class="test-header">
  <div class="close-btn" @click="handleClose">
    ✕
  </div>
  <div class="progress-bg">
    <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
  </div>
  <div class="progress-text">
    {{ currentIndex + 1 }}/{{ questions.length }}
  </div>
</div>
```

替换为：

```vue
<div class="test-header">
  <div class="test-progress-row">
    <div class="progress-bg">
      <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
    </div>
    <div class="progress-text">
      {{ currentIndex + 1 }}/{{ questions.length }}
    </div>
  </div>
  <button class="exit-entry" @click="handleClose">
    退出测试
  </button>
</div>
```

- [ ] **Step 2: 将测试页顶部样式调整为新的 header 结构**

在样式中确保 `test-header` 和新结构如下：

```scss
.test-header {
  padding: calc(env(safe-area-inset-top) + 24rpx) 32rpx 20rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  background: rgba(255, 255, 255, 0.92);
}

.test-progress-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.progress-bg {
  flex: 1;
  height: 16rpx;
  background: #e0e0e0;
  border-radius: 8rpx;
  overflow: hidden;
}

.progress-text {
  font-size: 24rpx;
  color: #666;
  min-width: 72rpx;
  text-align: right;
}

.exit-entry {
  align-self: flex-start;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 24rpx;
  color: #b7aa96;
  line-height: 1.4;
}
```

并删除当前 `.close-btn` 的视觉样式依赖。

- [ ] **Step 3: 运行测试页定向 ESLint**

Run:
```bash
cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec eslint src/subpkg-learning/learn/unit-test.vue
```

Expected:
```text
无报错；命令正常退出
```

- [ ] **Step 4: 提交测试页布局重构**

```bash
git add src/subpkg-learning/learn/unit-test.vue
git commit -m "fix: move unit test exit entry below progress"
```

---

### Task 3: 重构复习页顶部退出入口

**Files:**
- Modify: `src/subpkg-learning/review/index.vue`

- [ ] **Step 1: 将复习页顶部模板改成“进度条 + 下方退出入口”结构**

把当前这段：

```vue
<div class="progress-bar">
  <div class="progress-bg">
    <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
  </div>
  <div class="progress-text">
    {{ charIndex + 1 }}/{{ reviewChars.length }}
  </div>
  <div class="close-btn" @click="handleClose">
    ✕
  </div>
</div>
```

替换为：

```vue
<div class="progress-header">
  <div class="progress-bar">
    <div class="progress-bg">
      <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
    </div>
    <div class="progress-text">
      {{ charIndex + 1 }}/{{ reviewChars.length }}
    </div>
  </div>
  <button class="exit-entry" @click="handleClose">
    退出复习
  </button>
</div>
```

- [ ] **Step 2: 将复习页顶部样式替换成新的 header 结构**

把原来的顶部样式改成：

```scss
.progress-header {
  padding: calc(env(safe-area-inset-top) + 24rpx) 32rpx 20rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  background: rgba(255, 255, 255, 0.9);
}

.progress-bar {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.progress-bg {
  flex: 1;
  height: 16rpx;
  background: #e0e0e0;
  border-radius: 8rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #5dade2, #4a9bd9);
  border-radius: 8rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 24rpx;
  color: #666;
  min-width: 72rpx;
  text-align: right;
}

.exit-entry {
  align-self: flex-start;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 24rpx;
  color: #9bb2c6;
  line-height: 1.4;
}
```

并删除 `.close-btn` 相关样式。

- [ ] **Step 3: 运行复习页定向 ESLint**

Run:
```bash
cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec eslint src/subpkg-learning/review/index.vue
```

Expected:
```text
无报错；命令正常退出
```

- [ ] **Step 4: 提交复习页布局重构**

```bash
git add src/subpkg-learning/review/index.vue
git commit -m "fix: move review exit entry below progress"
```

---

### Task 4: 统一验证沉浸式页面退出入口改造

**Files:**
- Verify only: `src/subpkg-learning/learn/index.vue`
- Verify only: `src/subpkg-learning/learn/unit-test.vue`
- Verify only: `src/subpkg-learning/review/index.vue`

- [ ] **Step 1: 运行类型检查**

Run:
```bash
cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec vue-tsc --noEmit
```

Expected:
```text
无 TypeScript / Vue SFC 类型错误
```

- [ ] **Step 2: 运行三页联合 ESLint**

Run:
```bash
cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec eslint src/subpkg-learning/learn/index.vue src/subpkg-learning/learn/unit-test.vue src/subpkg-learning/review/index.vue
```

Expected:
```text
无报错；命令正常退出
```

- [ ] **Step 3: 在微信开发者工具中手动验证三页布局和退出逻辑**

手动检查：
- 学习页可看到“退出学习”入口，且不在右上胶囊区域
- 单元测试页可看到“退出测试”入口，且不在右上胶囊区域
- 复习页可看到“退出复习”入口，且不在右上胶囊区域
- 顶部进度条和步数布局清晰
- 点击退出入口后，确认弹窗内容与原逻辑一致
- 确认退出后的返回 / fallback 行为不变

Expected:
```text
三页退出入口都稳定可见，布局合理，交互逻辑未回归
```

- [ ] **Step 4: 如本任务没有新增代码改动，则不要重复提交；以三个页面的代码提交作为最终实现提交**

Run:
```bash
git status --short
```

Expected:
```text
除计划文件外，无额外待提交代码变更
```

---

## Self-Review

### Spec coverage
- “三个沉浸式页面统一调整退出入口布局” → Task 1-3
- “退出入口移入顶部安全内容区” → Task 1-3 的模板和样式
- “保持沉浸式页面语义” → Task 1-3 均只改顶部布局，不改主内容结构
- “交互逻辑不变” → Task 4 手动验证
- “弱化文本型入口” → Task 1-3 分别使用退出学习 / 退出测试 / 退出复习

### Placeholder scan
- 无 TBD / TODO / later
- 所有代码片段、命令、预期输出都已写明
- 所有文件路径明确

### Type consistency
- 学习页统一使用 `progress-header` + `exit-entry`
- 测试页统一使用 `test-header` + `test-progress-row` + `exit-entry`
- 复习页统一使用 `progress-header` + `exit-entry`
- 三页都继续调用已有的 `handleClose`
