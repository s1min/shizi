# 学习详情页样式二次调整 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 进一步优化学习详情页顶部布局、词组交互和底部按钮居中表现，让页面更贴近儿童学习场景且更符合真机观感。

**Architecture:** 本轮只修改 `index.vue` 和 `CharCard.vue`。`index.vue` 负责压缩顶部内部上边距，并把进度条与进度数字重组到同一行；`CharCard.vue` 负责给词组卡片增加多主题浅色渲染与整词发音点击交互，并修正底部主按钮的视觉居中。

**Tech Stack:** Vue 3 `<script setup>`、TypeScript、SCSS、uni-app、wot-design、现有 `speakText` 工具

---

## File Structure

- Modify: `shizi-frontend/src/subpkg-learning/learn/index.vue`
  - 压缩顶部卡片内部上边距
  - 把进度数字从标题行移到进度行
  - 让进度条和数字同排显示
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue`
  - 为词组卡片添加多主题浅色轮换
  - 点击词组时播放整个词组读音
  - 修正“我记住了，继续”按钮的视觉居中

### Task 1: 重组顶部为标题行 + 进度行

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/learn/index.vue`

- [ ] **Step 1: 写一个最小失败断言草稿，明确顶部目标结构**

```ts
// index.vue 顶部目标状态（人工对照）
// 1. 返回按钮与步骤名更贴近胶囊按钮一行
// 2. progress-text 不再在标题行
// 3. progress-row 内同时包含 progress-bg 和 progress-text
```

- [ ] **Step 2: 检查当前顶部结构仍未达成目标**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/learn/index.vue')
text = p.read_text(encoding='utf-8')
checks = {
  'progress text still in topline': '<div class="progress-topline">' in text and '{{ currentCharIndex }}/{{ totalChars }}' in text,
  'progress row only track': '<div class="progress-row">' in text and '<div class="progress-bg">' in text,
}
for name, ok in checks.items():
    print(name, 'FOUND' if ok else 'MISSING')
PY`
Expected: 这些旧结构仍存在，说明顶部还没改成目标形态。

- [ ] **Step 3: 调整顶部模板结构**

将 `index.vue` 顶部模板改为：

```vue
<div class="progress-header" :style="headerStyle">
  <div class="progress-topline">
    <button class="exit-entry" @click="handleClose">
      <wd-icon name="arrow-left" size="22px" />
    </button>
    <div class="step-title">
      {{ stepLabel }}
    </div>
  </div>
  <div class="progress-row">
    <div class="progress-bg">
      <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
    </div>
    <div class="progress-text">
      {{ currentCharIndex }}/{{ totalChars }}
    </div>
  </div>
</div>
```

- [ ] **Step 4: 调整顶部样式，让内容更靠上且数字与进度条同排**

在 `index.vue` 中将顶部相关样式替换为：

```scss
.progress-header {
  padding: 18rpx 32rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  background: linear-gradient(180deg, rgba(255, 252, 246, 0.98), rgba(255, 247, 234, 0.96));
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
  box-shadow:
    0 14rpx 28rpx rgba(226, 172, 70, 0.1),
    inset 0 -2rpx 0 rgba(255, 255, 255, 0.5);
}

.progress-topline {
  display: grid;
  grid-template-columns: 96rpx 1fr;
  align-items: center;
  gap: 12rpx;
}

.step-title {
  text-align: center;
  font-size: 32rpx;
  font-weight: 700;
  color: #6a5034;
  letter-spacing: 2rpx;
  padding-right: 96rpx;
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.progress-text {
  flex-shrink: 0;
  min-width: 78rpx;
  text-align: right;
  font-size: 30rpx;
  font-weight: 700;
  color: #8b7357;
}
```

- [ ] **Step 5: 运行针对性检查确认顶部结构已重组**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/learn/index.vue')
text = p.read_text(encoding='utf-8')
checks = {
  'topline now has two columns': 'grid-template-columns: 96rpx 1fr;' in text,
  'step title right padding exists': 'padding-right: 96rpx;' in text,
  'progress row gap exists': 'gap: 16rpx;' in text,
  'progress text in progress row': '<div class="progress-row">' in text and '<div class="progress-text">' in text,
}
for name, ok in checks.items():
    print(name, 'PASS' if ok else 'FAIL')
PY`
Expected: 全部 `PASS`。

- [ ] **Step 6: 提交顶部重组改动**

```bash
git add shizi-frontend/src/subpkg-learning/learn/index.vue
git commit -m "feat: reorganize learning header layout"
```

### Task 2: 给词组卡片添加多主题浅色和整词发音

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue`

- [ ] **Step 1: 写一个最小失败断言草稿，明确词组区目标行为**

```ts
// CharCard.vue 词组区目标状态（人工对照）
// 1. word-item 具有多组浅色主题轮换
// 2. 点击词组会播放整个词组读音
// 3. 词组卡片有可点击反馈
```

- [ ] **Step 2: 检查当前词组区还没有点击发音和多主题**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue')
text = p.read_text(encoding='utf-8')
checks = ['@click="playWord(word)"', 'wordThemes', ':style="getWordStyle(index)"']
for item in checks:
    print(item, 'FOUND' if item in text else 'MISSING')
PY`
Expected: 这些目标标识都还不存在，说明词组卡片尚未升级。

- [ ] **Step 3: 为词组卡片增加点击播放与主题样式绑定**

将 `CharCard.vue` 词组列表模板改为：

```vue
<div v-if="displayWords.length" class="words-list">
  <button
    v-for="(word, index) in displayWords"
    :key="word"
    class="word-item"
    :style="getWordStyle(index)"
    @click="playWord(word)"
  >
    {{ word }}
  </button>
</div>
```

并在 `<script setup>` 中新增：

```ts
const wordThemes = [
  { bg: 'linear-gradient(180deg, #fff7ef 0%, #ffefd8 100%)', border: 'rgba(242, 197, 119, 0.72)', color: '#8c5b2d' },
  { bg: 'linear-gradient(180deg, #f5fbff 0%, #e6f4ff 100%)', border: 'rgba(150, 199, 242, 0.72)', color: '#426b93' },
  { bg: 'linear-gradient(180deg, #f7fff2 0%, #e9f8dc 100%)', border: 'rgba(171, 214, 120, 0.72)', color: '#567a2c' },
  { bg: 'linear-gradient(180deg, #fff5fb 0%, #ffe5f3 100%)', border: 'rgba(239, 171, 207, 0.72)', color: '#9b4d7a' },
  { bg: 'linear-gradient(180deg, #fffaf0 0%, #fff1c9 100%)', border: 'rgba(241, 205, 123, 0.72)', color: '#8b6727' },
  { bg: 'linear-gradient(180deg, #f4fbfb 0%, #dff5f1 100%)', border: 'rgba(133, 214, 201, 0.72)', color: '#3f7f75' },
  { bg: 'linear-gradient(180deg, #f8f6ff 0%, #ece8ff 100%)', border: 'rgba(182, 170, 241, 0.72)', color: '#6556a6' },
  { bg: 'linear-gradient(180deg, #fff8f2 0%, #ffe9dc 100%)', border: 'rgba(244, 183, 149, 0.72)', color: '#9a6138' },
]

function getWordStyle(index: number) {
  const theme = wordThemes[index % wordThemes.length]
  return {
    background: theme.bg,
    borderColor: theme.border,
    color: theme.color,
  }
}

function playWord(word: string) {
  speakText(word, word)
}
```

- [ ] **Step 4: 调整词组卡片样式为可点击状态**

在 `CharCard.vue` 中将 `.word-item` 替换为：

```scss
.word-item {
  padding: 18rpx 34rpx;
  border-radius: 999rpx;
  border: 2rpx solid transparent;
  font-size: 34rpx;
  font-weight: 600;
  box-shadow:
    0 8rpx 16rpx rgba(214, 153, 41, 0.08),
    inset 0 2rpx 0 rgba(255, 255, 255, 0.6);
  transition: transform 0.18s ease, box-shadow 0.18s ease;

  &::after {
    border: none;
  }

  &:active {
    transform: scale(0.96);
    box-shadow: 0 4rpx 10rpx rgba(214, 153, 41, 0.08);
  }
}
```

- [ ] **Step 5: 运行针对性检查确认词组功能已加入**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue')
text = p.read_text(encoding='utf-8')
checks = {
  'word click handler added': '@click="playWord(word)"' in text,
  'theme list added': 'const wordThemes = [' in text,
  'style binding added': ':style="getWordStyle(index)"' in text,
  'whole word speech added': "speakText(word, word)" in text,
}
for name, ok in checks.items():
    print(name, 'PASS' if ok else 'FAIL')
PY`
Expected: 全部 `PASS`。

- [ ] **Step 6: 提交词组交互改动**

```bash
git add shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue
git commit -m "feat: add colorful interactive word chips"
```

### Task 3: 修正底部按钮视觉居中

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue`

- [ ] **Step 1: 写一个最小失败断言草稿，明确按钮居中目标**

```ts
// btn-continue 目标状态（人工对照）
// 1. 按钮视觉中心落在内容区中间
// 2. 不只依赖 width: 100%
// 3. 保持现有业务行为不变
```

- [ ] **Step 2: 检查当前按钮仍依赖满宽显示**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue')
text = p.read_text(encoding='utf-8')
checks = ['width: 100%;', 'margin-top: auto;']
for item in checks:
    print(item, 'FOUND' if item in text else 'MISSING')
PY`
Expected: 这些旧布局仍存在，说明按钮居中还没有被显式修正。

- [ ] **Step 3: 调整按钮布局使其显式居中**

将 `CharCard.vue` 中按钮区域模板改为：

```vue
<div class="btn-continue-wrap" :class="{ show: showButton }">
  <button class="btn-continue" @click="handleNext">
    我记住了，继续
  </button>
</div>
```

并将样式替换为：

```scss
.btn-continue-wrap {
  margin-top: auto;
  width: 100%;
  display: flex;
  justify-content: center;
  opacity: 0;
  transform: translateY(16rpx);
  transition: all 0.4s ease-out;

  &.show {
    opacity: 1;
    transform: translateY(0);
  }
}

.btn-continue {
  width: 100%;
  max-width: 100%;
  height: 106rpx;
  background: linear-gradient(135deg, #f5a623 0%, #eb9a1a 52%, #e28412 100%);
  border: none;
  border-radius: 56rpx;
  font-size: 42rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
  color: #fff;
  box-shadow: 0 14rpx 30rpx rgba(230, 145, 24, 0.36);

  &::after {
    border: none;
  }

  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 8rpx 18rpx rgba(230, 145, 24, 0.26);
  }
}
```

- [ ] **Step 4: 运行针对性检查确认按钮居中容器已加入**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue')
text = p.read_text(encoding='utf-8')
checks = {
  'wrap added': 'class="btn-continue-wrap"' in text,
  'wrap centers content': 'justify-content: center;' in text,
  'button still full width': 'width: 100%;' in text,
  'show class moved to wrap': ':class="{ show: showButton }"' in text,
}
for name, ok in checks.items():
    print(name, 'PASS' if ok else 'FAIL')
PY`
Expected: 全部 `PASS`。

- [ ] **Step 5: 提交按钮居中修正改动**

```bash
git add shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue
git commit -m "fix: center learning continue button visually"
```

### Task 4: 验证学习页行为未受影响

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/learn/index.vue`
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue`

- [ ] **Step 1: 检查顶部和按钮结构仍符合预期**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p1 = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/learn/index.vue').read_text(encoding='utf-8')
p2 = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue').read_text(encoding='utf-8')
checks = {
  'progress text moved to row': '<div class="progress-row">' in p1 and '<div class="progress-text">' in p1,
  'step title still present': '<div class="step-title">' in p1,
  'word emit still present': "emit('next')" in p2,
  'continue button still triggers next': '@click="handleNext"' in p2,
}
for name, ok in checks.items():
    print(name, 'PASS' if ok else 'FAIL')
PY`
Expected: 全部 `PASS`。

- [ ] **Step 2: 运行 lint 检查两个改动文件**

Run: `cd /d/MyDir/shizi/shizi-frontend && npx eslint src/subpkg-learning/learn/index.vue src/subpkg-learning/components/learn/CharCard.vue`
Expected: 退出码为 `0`，允许出现 editor 环境提示，但不能有 lint error。

- [ ] **Step 3: 按 spec 做人工验收**

```text
1. 顶部返回按钮和步骤名更贴近微信胶囊按钮所在高度。
2. 进度条和 3/7 这类数字在同一行显示。
3. 词组卡片同屏展示多种淡彩主题，不显杂乱。
4. 点击任意词组卡片，会播放整个词组读音。
5. “我记住了，继续”按钮视觉上居中。
6. 点击继续后，仍正常进入下一步学习。
```

- [ ] **Step 4: 提交最终二次样式调整改动**

```bash
git add shizi-frontend/src/subpkg-learning/learn/index.vue shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue
git commit -m "feat: refine learning page layout and word chips"
```

## Self-Review

- Spec coverage: 已覆盖顶部上移、数字与进度条同排、多主题词组卡片、整词发音、底部按钮居中这几项要求。
- Placeholder scan: 计划中没有 TBD/TODO 或“类似前一任务”这类占位内容，代码片段和命令都已写全。
- Type consistency: `playWord`、`getWordStyle`、`btn-continue-wrap`、`progress-row`、`progress-text` 等命名在任务内外保持一致，没有前后漂移。
