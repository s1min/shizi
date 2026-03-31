# Child-Focused Learning Flow Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将学习页、单元测试页、复习页、单元完成页重构为更适合学龄前儿童的学习流页面，统一顶部进度语义、弱化家长退出控制，并强化主任务与奖励反馈层级。

**Architecture:** 保留现有学习流程、答题逻辑、复习数据流和单元完成跳转逻辑，不改动 store 侧业务规则。本次改造聚焦四个页面的模板结构、视觉层级和样式语义：学习页、测试页、复习页统一为“进度条 + 左侧弱化退出入口 + 主任务区”的沉浸式任务页，单元完成页继续保持结果页语义但统一视觉语言。

**Tech Stack:** Vue 3 SFC、TypeScript、uni-app、SCSS、ESLint、vue-tsc

---

## File Structure

- Modify: `src/subpkg-learning/learn/index.vue`
  - 学习流程页；调整头部结构、内容区留白、单字完成态层级，使主按钮与学习内容更突出
- Modify: `src/subpkg-learning/learn/unit-test.vue`
  - 单元测试页；统一头部结构，优化题型标签、题干、选项和反馈条层级
- Modify: `src/subpkg-learning/review/index.vue`
  - 复习闪卡页；统一头部结构，优化闪卡尺寸、按钮配色与完成页信息层级
- Modify: `src/subpkg-learning/learn/unit-complete.vue`
  - 单元完成页；统一顶部回首页入口语义、奖励区、统计卡与主次按钮视觉语言

---

### Task 1: 重构学习页为儿童友好的沉浸式学习页

**Files:**
- Modify: `src/subpkg-learning/learn/index.vue`

- [ ] **Step 1: 将学习页顶部结构收敛为统一沉浸式头部**

把顶部模板替换为下列结构，保留现有 `handleClose`、`currentStep`、`totalSteps`、`progressPercent`：

```vue
<div class="progress-header">
  <div class="progress-row">
    <div class="progress-bg">
      <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
    </div>
    <div class="progress-text">
      {{ currentStep }}/{{ totalSteps }}
    </div>
  </div>
  <button class="exit-entry" @click="handleClose">
    ← 退出学习
  </button>
</div>
```

并保持下方学习内容区仍然渲染：
- `CharCard`
- `SpeakPractice`
- `TracingPractice`
- `QuizCard`
- `complete-screen`

- [ ] **Step 2: 调整学习页内容区容器，让主任务成为第一视觉焦点**

把内容区容器样式调整为以下结构，避免顶部信息挤压儿童主视觉区：

```scss
.learn-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24rpx 32rpx 32rpx;
}
```

把完成态样式调整为更偏奖励卡片语义：

```scss
.complete-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 32rpx;
  padding: 64rpx 40rpx;
  box-shadow: 0 12rpx 36rpx rgba(245, 166, 35, 0.12);
}

.complete-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.complete-title {
  font-size: 52rpx;
  font-weight: bold;
  color: #4a3728;
  margin-bottom: 24rpx;
}

.complete-char {
  font-size: 168rpx;
  font-weight: bold;
  color: #f5a623;
  font-family: 'KaiTi', 'STKaiti', serif;
  line-height: 1.1;
  margin: 24rpx 0 32rpx;
}

.complete-desc {
  font-size: 30rpx;
  color: #7a6a58;
  margin-bottom: 72rpx;
}

.btn-next {
  width: 100%;
  max-width: 420rpx;
  height: 96rpx;
  background: linear-gradient(135deg, #f5a623, #e8941a);
  border: none;
  border-radius: 48rpx;
  font-size: 34rpx;
  font-weight: bold;
  color: #fff;
  box-shadow: 0 12rpx 28rpx rgba(245, 166, 35, 0.28);
}
```

- [ ] **Step 3: 用统一学习头部样式替换现有 header 样式**

在样式中使用以下头部规范：

```scss
.progress-header {
  padding: calc(env(safe-area-inset-top) + 24rpx) 32rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  background: rgba(255, 255, 255, 0.92);
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.progress-bg {
  flex: 1;
  height: 16rpx;
  background: rgba(245, 166, 35, 0.18);
  border-radius: 999rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f7c65d, #f5a623);
  border-radius: 999rpx;
  transition: width 0.3s ease;
}

.progress-text {
  min-width: 76rpx;
  text-align: right;
  font-size: 24rpx;
  font-weight: 600;
  color: #8a7a68;
}

.exit-entry {
  align-self: flex-start;
  min-height: 56rpx;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 28rpx;
  color: #b7aa96;
  line-height: 56rpx;
}
```

并删除旧的 `.progress-bar` 头部结构依赖，避免类名混用。

- [ ] **Step 4: 运行学习页定向 ESLint**

Run:
```bash
cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec eslint src/subpkg-learning/learn/index.vue
```

Expected:
```text
无报错；命令正常退出
```

- [ ] **Step 5: 提交学习页重构**

```bash
git add src/subpkg-learning/learn/index.vue
git commit -m "feat: redesign learning page for child-friendly flow"
```

---

### Task 2: 重构单元测试页为更清晰的任务型答题页

**Files:**
- Modify: `src/subpkg-learning/learn/unit-test.vue`

- [ ] **Step 1: 统一测试页头部语义和退出入口位置**

将顶部结构调整为：

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
    ← 退出测试
  </button>
</div>
```

保留现有 `handleClose` 逻辑和测试流程状态变量，不修改答题数据流。

- [ ] **Step 2: 优化题型标签、题干区和选项区视觉层级**

将以下样式替换为更适合儿童任务推进的层级：

```scss
.question-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 24rpx;
}

.quiz-type-tag {
  align-self: center;
  font-size: 24rpx;
  color: #9a815f;
  background: #fff1cc;
  padding: 10rpx 28rpx;
  border-radius: 999rpx;
  margin-bottom: 40rpx;
}

.question-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 56rpx;
  padding: 0 24rpx;
}

.question-char {
  font-size: 176rpx;
  font-weight: bold;
  font-family: 'KaiTi', 'STKaiti', serif;
  color: #4a3728;
  line-height: 1;
  margin-bottom: 24rpx;
}

.question-emoji {
  font-size: 156rpx;
  margin-bottom: 24rpx;
}

.question-pinyin {
  font-size: 76rpx;
  font-weight: 700;
  color: #4a3728;
  margin-bottom: 24rpx;
}

.question-hint {
  font-size: 30rpx;
  color: #7a6a58;
  text-align: center;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  width: 100%;
}

.option-btn {
  min-height: 180rpx;
  background: #fff;
  border: 4rpx solid #f2e2c3;
  border-radius: 28rpx;
  padding: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  box-shadow: 0 8rpx 24rpx rgba(245, 166, 35, 0.08);
}
```

并保留现有 `.selected`、`.correct`、`.wrong` 三种状态类，只把视觉色值收敛为暖色 / 正向绿 / 柔和错误红：

```scss
.option-btn {
  &.selected {
    border-color: #f5a623;
    background: #fff8e8;
  }

  &.correct {
    border-color: #82c785;
    background: #eef8ef;
    transform: scale(1.03);
  }

  &.wrong {
    border-color: #f3a6a6;
    background: #fff4f4;
    opacity: 0.82;
  }
}
```

- [ ] **Step 3: 弱化测试页警示感，强化反馈条的“继续下一步”语义**

调整反馈条和结果页样式如下：

```scss
.feedback-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 40rpx;
  padding-bottom: calc(28rpx + env(safe-area-inset-bottom));
  z-index: 100;
  animation: slide-up 0.3s ease-out;

  &.correct {
    background: #eef8ef;
    border-top: 4rpx solid #82c785;
  }

  &.wrong {
    background: #fff5f0;
    border-top: 4rpx solid #f3b26b;
  }
}

.feedback-text {
  font-size: 30rpx;
  font-weight: bold;
  color: #4a3728;
}

.btn-feedback-next {
  padding: 18rpx 52rpx;
  border-radius: 999rpx;
  border: none;
  font-size: 30rpx;
  font-weight: bold;
  color: #fff;
  background: linear-gradient(135deg, #f5a623, #e8941a);
}

.result-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 48rpx;
}

.result-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #4a3728;
  margin-bottom: 16rpx;
}
```

- [ ] **Step 4: 用统一顶部安全区样式替换测试页头部样式**

```scss
.test-header {
  padding: calc(env(safe-area-inset-top) + 24rpx) 32rpx 24rpx;
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
  background: rgba(245, 166, 35, 0.18);
  border-radius: 999rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f7c65d, #f5a623);
  border-radius: 999rpx;
  transition: width 0.3s;
}

.progress-text {
  min-width: 76rpx;
  text-align: right;
  font-size: 24rpx;
  font-weight: 600;
  color: #8a7a68;
}

.exit-entry {
  align-self: flex-start;
  min-height: 56rpx;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 28rpx;
  color: #b7aa96;
  line-height: 56rpx;
}
```

- [ ] **Step 5: 运行测试页定向 ESLint**

Run:
```bash
cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec eslint src/subpkg-learning/learn/unit-test.vue
```

Expected:
```text
无报错；命令正常退出
```

- [ ] **Step 6: 提交测试页重构**

```bash
git add src/subpkg-learning/learn/unit-test.vue
git commit -m "feat: redesign unit test page for child-friendly flow"
```

---

### Task 3: 重构复习页为低干扰闪卡复习页

**Files:**
- Modify: `src/subpkg-learning/review/index.vue`

- [ ] **Step 1: 统一复习页头部结构和退出入口文案**

保留 `handleClose` 逻辑，把顶部模板替换为：

```vue
<div class="progress-header">
  <div class="progress-row">
    <div class="progress-bg">
      <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
    </div>
    <div class="progress-text">
      {{ charIndex + 1 }}/{{ reviewChars.length }}
    </div>
  </div>
  <button class="exit-entry" @click="handleClose">
    ← 退出复习
  </button>
</div>
```

- [ ] **Step 2: 调整闪卡区域与按钮区层级，减少压迫感**

将闪卡相关样式替换为：

```scss
.flashcard-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32rpx 40rpx 40rpx;
}

.flashcard {
  width: 100%;
  max-width: 580rpx;
  min-height: 680rpx;
  perspective: 1000px;
  cursor: pointer;
  margin-bottom: 64rpx;
}

.card-front,
.card-back {
  width: 100%;
  min-height: 680rpx;
  background: #fff;
  border-radius: 36rpx;
  box-shadow: 0 12rpx 36rpx rgba(93, 173, 226, 0.14);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 72rpx 40rpx;
  backface-visibility: hidden;
  transition: transform 0.5s ease;
}

.card-char {
  font-size: 248rpx;
  font-weight: bold;
  font-family: 'KaiTi', 'STKaiti', serif;
  color: #4a3728;
  line-height: 1.15;
}

.card-hint {
  font-size: 28rpx;
  color: #8da3b5;
  margin-top: 40rpx;
}

.card-char-back {
  font-size: 168rpx;
  font-weight: bold;
  font-family: 'KaiTi', 'STKaiti', serif;
  color: #4a3728;
  line-height: 1.2;
}

.card-pinyin {
  font-size: 52rpx;
  color: #5dade2;
  margin: 20rpx 0 44rpx;
  font-weight: bold;
}
```

- [ ] **Step 3: 优化复习页双按钮配色和完成态统计区**

把底部双按钮和完成页统计样式调整为：

```scss
.action-buttons {
  display: flex;
  gap: 28rpx;
  width: 100%;
  max-width: 580rpx;
  animation: fade-in 0.3s ease;
}

.btn-action {
  flex: 1;
  height: 100rpx;
  border: none;
  border-radius: 50rpx;
  font-size: 34rpx;
  font-weight: bold;
  color: #fff;
}

.btn-dont-know {
  background: linear-gradient(135deg, #8fb6d9, #769fc5);
  box-shadow: 0 10rpx 24rpx rgba(118, 159, 197, 0.28);
}

.btn-know {
  background: linear-gradient(135deg, #82c785, #6ab06d);
  box-shadow: 0 10rpx 24rpx rgba(130, 199, 133, 0.28);
}

.finish-screen,
.empty-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx;
  text-align: center;
}

.finish-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
  width: 100%;
  margin-bottom: 40rpx;
}

.stat-item {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 24rpx;
  padding: 24rpx 16rpx;
}
```

并把返回按钮统一为：

```scss
.btn-back {
  width: 100%;
  max-width: 420rpx;
  height: 92rpx;
  background: linear-gradient(135deg, #5dade2, #4a9bd9);
  border: none;
  border-radius: 46rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  box-shadow: 0 10rpx 24rpx rgba(93, 173, 226, 0.28);
}
```

- [ ] **Step 4: 用统一复习页头部样式替换现有样式**

```scss
.progress-header {
  padding: calc(env(safe-area-inset-top) + 24rpx) 32rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  background: rgba(255, 255, 255, 0.92);
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.progress-bg {
  flex: 1;
  height: 16rpx;
  background: rgba(93, 173, 226, 0.18);
  border-radius: 999rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #7ec3ea, #5dade2);
  border-radius: 999rpx;
  transition: width 0.3s ease;
}

.progress-text {
  min-width: 76rpx;
  text-align: right;
  font-size: 24rpx;
  font-weight: 600;
  color: #7c91a6;
}

.exit-entry {
  align-self: flex-start;
  min-height: 56rpx;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 28rpx;
  color: #9bb2c6;
  line-height: 56rpx;
}
```

- [ ] **Step 5: 运行复习页定向 ESLint**

Run:
```bash
cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec eslint src/subpkg-learning/review/index.vue
```

Expected:
```text
无报错；命令正常退出
```

- [ ] **Step 6: 提交复习页重构**

```bash
git add src/subpkg-learning/review/index.vue
git commit -m "feat: redesign review page for child-friendly flow"
```

---

### Task 4: 统一单元完成页的奖励感和下一步导向

**Files:**
- Modify: `src/subpkg-learning/learn/unit-complete.vue`

- [ ] **Step 1: 将顶部入口文案和结构统一为弱化家长控制入口**

在 `unit-complete.vue` 中，保留现有回首页逻辑，把顶部入口文案统一为：

```vue
<button class="top-home-entry" @click="goHome">
  <text class="top-home-icon">←</text>
  <text class="top-home-text">回首页</text>
</button>
```

如果当前文案仍是“首页”或其他简写，统一改为“回首页”。

- [ ] **Step 2: 强化奖励区、统计区和汉字墙的结果页层级**

将结果页主容器和奖励区样式调整为：

```scss
.complete-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff9e8 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  padding: calc(env(safe-area-inset-top) + 24rpx) 32rpx 40rpx;
  box-sizing: border-box;
}

.top-home-entry {
  align-self: flex-start;
  min-height: 56rpx;
  padding: 0;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.top-home-text {
  font-size: 28rpx;
  color: #b7aa96;
}

.hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-top: 32rpx;
  margin-bottom: 40rpx;
}

.result-stars {
  margin-bottom: 24rpx;
}

.result-title {
  font-size: 56rpx;
  font-weight: bold;
  color: #4a3728;
  margin-bottom: 16rpx;
}

.result-subtitle {
  font-size: 32rpx;
  color: #7a6a58;
}
```

并将统计卡区域统一为圆角卡片组而不是分散数字：

```scss
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 32rpx;
}

.stat-card {
  background: rgba(255, 255, 255, 0.94);
  border-radius: 24rpx;
  padding: 28rpx 20rpx;
  text-align: center;
  box-shadow: 0 8rpx 24rpx rgba(245, 166, 35, 0.08);
}
```

- [ ] **Step 3: 把底部操作明确为主次按钮，不让分享操作盖过下一步**

调整底部操作区域，确保“下一单元”或“返回首页”是最清晰的主行动点，“生成海报 / 分享好友”保留为次级动作。样式目标：

```scss
.share-actions {
  display: flex;
  gap: 20rpx;
  margin-bottom: 32rpx;
}

.btn-share {
  flex: 1;
  height: 84rpx;
  background: #fff;
  border: 2rpx solid #f0d9b5;
  border-radius: 42rpx;
  font-size: 28rpx;
  color: #9a815f;
}

.primary-actions {
  display: flex;
  gap: 20rpx;
}

.btn-secondary,
.btn-primary {
  flex: 1;
  height: 96rpx;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.btn-secondary {
  background: #fff;
  border: 4rpx solid #f5d49c;
  color: #c48b22;
}

.btn-primary {
  background: linear-gradient(135deg, #f5a623, #e8941a);
  border: none;
  color: #fff;
  box-shadow: 0 12rpx 28rpx rgba(245, 166, 35, 0.28);
}
```

- [ ] **Step 4: 运行单元完成页定向 ESLint**

Run:
```bash
cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec eslint src/subpkg-learning/learn/unit-complete.vue
```

Expected:
```text
无报错；命令正常退出
```

- [ ] **Step 5: 提交单元完成页重构**

```bash
git add src/subpkg-learning/learn/unit-complete.vue
git commit -m "feat: redesign unit complete page for child-friendly flow"
```

---

### Task 5: 联合验证四个学习流页面改造

**Files:**
- Verify only: `src/subpkg-learning/learn/index.vue`
- Verify only: `src/subpkg-learning/learn/unit-test.vue`
- Verify only: `src/subpkg-learning/review/index.vue`
- Verify only: `src/subpkg-learning/learn/unit-complete.vue`

- [ ] **Step 1: 运行四页联合 ESLint**

Run:
```bash
cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec eslint src/subpkg-learning/learn/index.vue src/subpkg-learning/learn/unit-test.vue src/subpkg-learning/review/index.vue src/subpkg-learning/learn/unit-complete.vue
```

Expected:
```text
无报错；命令正常退出
```

- [ ] **Step 2: 运行类型检查**

Run:
```bash
cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec vue-tsc --noEmit
```

Expected:
```text
无 TypeScript / Vue SFC 类型错误
```

- [ ] **Step 3: 在微信开发者工具中手动验证学习流四页视觉与交互**

手动检查：
- 学习页顶部第一眼看到的是进度而不是退出
- 学习页主内容区和“继续学习”按钮明显高于退出入口
- 测试页题型标签、题干、选项、反馈条层级清晰
- 复习页闪卡翻转后，“认识 / 不认识”按钮足够醒目且不具威胁感
- 单元完成页以星级、标题、统计和下一步按钮为视觉中心
- 四页退出/返回入口均不与微信胶囊冲突
- 退出弹窗与原逻辑一致，学习/测试/复习原有流程和跳转未回归

Expected:
```text
四页视觉语义统一，儿童主任务突出，家长辅助退出稳定可见，业务流程无回归
```

- [ ] **Step 4: 确认无额外未计划代码改动**

Run:
```bash
git status --short
```

Expected:
```text
除计划文件外，仅存在四个目标页面的预期代码改动
```

---

## Self-Review

### Spec coverage
- “学习页、测试页、复习页统一沉浸式头部” → Task 1、Task 2、Task 3
- “退出入口弱化但稳定可见” → Task 1-4 的顶部入口改造
- “主按钮永远是第一行动点” → Task 1 完成态、Task 2 反馈与结果页、Task 3 双按钮、Task 4 主次按钮
- “完成页突出奖励和下一步” → Task 4
- “统一视觉语言与层级” → Task 1-4 全部样式改造，Task 5 联合验证

### Placeholder scan
- 无 TBD / TODO / later
- 每个任务都包含精确文件、代码片段、命令与预期输出
- 没有使用“类似前面任务”之类的省略描述

### Type consistency
- 学习页头部类名统一为 `progress-header` + `progress-row` + `exit-entry`
- 测试页头部类名统一为 `test-header` + `test-progress-row` + `exit-entry`
- 复习页头部类名统一为 `progress-header` + `progress-row` + `exit-entry`
- 所有任务均保留现有业务函数：`handleClose`、`goHome`、`goBack`、`goToComplete`
