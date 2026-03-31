# 学习详情页 UI 优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 优化学习详情页顶部导航与首屏认知区，让页面更适合学龄前儿童识字场景。

**Architecture:** 在现有学习流程不变的前提下，只修改学习页容器和首屏 `CharCard` 组件。`index.vue` 负责顶部导航结构与生字进度计算，`CharCard.vue` 负责移除解释卡并重绘常用组词区域，避免新增无关抽象层。

**Tech Stack:** Vue 3 `<script setup>`、TypeScript、SCSS、uni-app / wot-design 组件生态

---

## File Structure

- Modify: `shizi-frontend/src/subpkg-learning/learn/index.vue`
  - 调整顶部模板结构
  - 将进度逻辑从步骤进度改为生字进度
  - 将退出入口改为 `wd-icon` 图标按钮
  - 更新顶部 SCSS 布局
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue`
  - 删除“字源演变/字形拆解/字义理解”说明卡模板
  - 删除对应说明文案计算逻辑与动画状态
  - 重绘组词糖豆卡片样式
- Verify: `shizi-frontend/src/subpkg-learning/components/learn/SpeakPractice.vue`
  - 只读确认不需要联动修改顶部步骤文案来源
- Verify: `shizi-frontend/src/subpkg-learning/components/learn/TracingPractice.vue`
  - 只读确认不需要联动修改顶部步骤文案来源
- Verify: `shizi-frontend/src/subpkg-learning/components/learn/QuizCard.vue`
  - 只读确认不需要联动修改顶部步骤文案来源

### Task 1: 调整学习页顶部为生字进度导航

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/learn/index.vue`

- [ ] **Step 1: 写一个最小失败断言草稿，明确要替换的顶部结构**

```ts
// index.vue 目标状态（人工对照）
// 1. 不再出现 <div class="stage-chip">
// 2. 顶部中间显示 {{ stepLabel }}
// 3. 右侧数字显示 {{ currentCharIndex }}/{{ totalChars }}
// 4. progressPercent 基于 currentCharIndex / totalChars
// 5. 退出按钮内容改为 wd-icon arrow-left
```

- [ ] **Step 2: 人工验证当前实现与目标不符**

Run: `python - <<'PY'
from pathlib import Path
p = Path('/d/MyDir/shizi/shizi-frontend/src/subpkg-learning/learn/index.vue')
text = p.read_text(encoding='utf-8')
checks = ['stage-chip', '退出学习', 'currentStep', 'totalSteps']
for item in checks:
    print(item, 'FOUND' if item in text else 'MISSING')
PY`
Expected: `stage-chip`、`退出学习`、`currentStep`、`totalSteps` 都仍然存在，说明当前还没实现目标。

- [ ] **Step 3: 修改顶部模板与进度计算为生字进度**

将 `index.vue` 中顶部模板和进度计算改成下面的目标结构：

```vue
<div class="progress-header" :style="headerStyle">
  <div class="progress-topline">
    <button class="exit-entry" @click="handleClose">
      <wd-icon name="arrow-left" size="22px" />
    </button>
    <div class="step-title">
      {{ stepLabel }}
    </div>
    <div class="progress-text">
      {{ currentCharIndex }}/{{ totalChars }}
    </div>
  </div>
  <div class="progress-row">
    <div class="progress-bg">
      <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
    </div>
  </div>
  <div class="progress-caption">
    {{ charProgressLabel }}
  </div>
</div>
```

并将脚本中的进度计算替换为：

```ts
const totalChars = computed(() => unitChars.value.length)
const currentCharIndex = computed(() =>
  totalChars.value > 0 ? charIndex.value + 1 : 0,
)
const progressPercent = computed(() =>
  totalChars.value > 0 ? (currentCharIndex.value / totalChars.value) * 100 : 0,
)
const stepLabelMap: Record<LearnStep, string> = {
  origin: '字形认知',
  speak: '跟读练习',
  trace: '描红练习',
  quiz: '趣味小测',
  complete: '本字完成',
}
const stepLabel = computed(() => stepLabelMap[step.value])
const charProgressLabel = computed(() => {
  if (totalChars.value === 0)
    return '正在准备学习内容'
  return `当前生字 ${currentCharIndex.value}/${totalChars.value}`
})
```

- [ ] **Step 4: 更新顶部样式以匹配新结构**

在 `index.vue` 的 `<style lang="scss" scoped>` 中删除 `stage-chip` 样式，并新增/调整下面这些样式：

```scss
.progress-topline {
  display: grid;
  grid-template-columns: 88rpx 1fr auto;
  align-items: center;
  gap: 16rpx;
}

.step-title {
  text-align: center;
  font-size: 30rpx;
  font-weight: 700;
  color: #6b5237;
  letter-spacing: 2rpx;
}

.progress-row {
  display: flex;
  align-items: center;
}

.progress-text {
  min-width: 82rpx;
  text-align: right;
  font-size: 28rpx;
  font-weight: 700;
  color: #7d6850;
}

.exit-entry {
  width: 76rpx;
  height: 76rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid rgba(244, 198, 116, 0.42);
  border-radius: 999rpx;
  background: linear-gradient(180deg, #fffaf2 0%, #fff3db 100%);
  color: #c88717;
  box-shadow: 0 8rpx 18rpx rgba(228, 166, 49, 0.14);

  &::after {
    border: none;
  }

  &:active {
    transform: scale(0.96);
    background: linear-gradient(180deg, #fff3db 0%, #ffe9be 100%);
  }
}
```

- [ ] **Step 5: 运行针对性检查确认旧逻辑已移除**

Run: `python - <<'PY'
from pathlib import Path
p = Path('/d/MyDir/shizi/shizi-frontend/src/subpkg-learning/learn/index.vue')
text = p.read_text(encoding='utf-8')
checks = {
  'stage-chip removed': 'stage-chip' not in text,
  'old exit text removed': '退出学习' not in text,
  'step counters removed': 'currentStep' not in text and 'totalSteps' not in text,
  'new char counters added': 'currentCharIndex' in text and 'totalChars' in text,
  'wd-icon added': '<wd-icon' in text and 'arrow-left' in text,
}
for name, ok in checks.items():
    print(name, 'PASS' if ok else 'FAIL')
PY`
Expected: 全部 `PASS`。

- [ ] **Step 6: 提交顶部导航改动**

```bash
git add shizi-frontend/src/subpkg-learning/learn/index.vue
git commit -m "feat: update learning header progress ui"
```

### Task 2: 移除首屏字源说明卡并保留核心识字信息

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue`

- [ ] **Step 1: 写一个最小失败断言草稿，明确首屏需要删掉的内容**

```ts
// CharCard.vue 目标状态（人工对照）
// 1. 不再渲染 origin-desc 说明卡
// 2. 不再保留 getDescTitle / getDescContent / charTypeLabel
// 3. 动画只保留 showAnimation / showChar / showWords / showButton
```

- [ ] **Step 2: 人工验证当前文件仍包含说明卡逻辑**

Run: `python - <<'PY'
from pathlib import Path
p = Path('/d/MyDir/shizi/shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue')
text = p.read_text(encoding='utf-8')
checks = ['origin-desc', 'getDescTitle', 'getDescContent', 'charTypeLabel', 'showDesc']
for item in checks:
    print(item, 'FOUND' if item in text else 'MISSING')
PY`
Expected: 上述标识都存在，说明旧说明卡仍未移除。

- [ ] **Step 3: 删除说明卡模板与脚本逻辑**

将 `CharCard.vue` 中下面这些内容删除：

```vue
<div class="origin-desc" :class="{ 'fade-in': showDesc }">
  <div class="desc-title">
    <span class="char-type-tag">{{ charTypeLabel }}</span>
    <span class="desc-title-text">{{ getDescTitle() }}</span>
  </div>
  <div class="desc-divider" />
  <div class="desc-content">
    {{ getDescContent() }}
  </div>
</div>
```

并删除这些脚本内容：

```ts
const showDesc = ref(false)
const charTypeLabel = computed(() => props.char.char_type || '识字')

function getDescTitle() {
  const type = props.char.teaching?.animation_type
  if (type === 'origin')
    return '字源演变'
  if (type === 'decompose')
    return '字形拆解'
  return '字义理解'
}

function getDescContent() {
  const t = props.char.teaching
  if (!t)
    return '通过图像、读音和组词一起记住这个字。'
  if (t.animation_type === 'origin')
    return t.origin_desc || '这个字来源于生活中的常见形象。'
  if (t.animation_type === 'decompose') {
    const parts = t.decompose_parts?.join(' + ') || ''
    return parts ? `${parts}\n${t.decompose_desc || ''}` : t.decompose_desc || ''
  }
  return t.scene_desc || '把这个字放进熟悉的场景里，更容易记住。'
}
```

同时把 `playAnimation()` 调整为：

```ts
function playAnimation() {
  showAnimation.value = false
  showChar.value = false
  showWords.value = false
  showButton.value = false

  setTimeout(() => {
    showAnimation.value = true
  }, 100)
  setTimeout(() => {
    showChar.value = true
  }, 620)
  setTimeout(() => {
    showWords.value = true
  }, 1180)
  setTimeout(() => {
    showButton.value = true
  }, 1680)
}
```

- [ ] **Step 4: 删除对应说明卡样式块**

从 `<style>` 中删除以下样式块：

```scss
.origin-desc { ... }
.desc-title { ... }
.desc-title-text { ... }
.char-type-tag { ... }
.desc-divider { ... }
.desc-content { ... }
```

并将 `origin-display` 与 `words-section` 的间距改为：

```scss
.origin-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 46rpx;
}

.words-section {
  width: 100%;
  margin-bottom: 34rpx;
  opacity: 0;
  transform: translateY(16rpx);
  transition: all 0.4s ease-out;

  &.fade-in {
    opacity: 1;
    transform: translateY(0);
  }
}
```

- [ ] **Step 5: 运行针对性检查确认说明卡已移除**

Run: `python - <<'PY'
from pathlib import Path
p = Path('/d/MyDir/shizi/shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue')
text = p.read_text(encoding='utf-8')
checks = {
  'origin-desc removed': 'origin-desc' not in text,
  'showDesc removed': 'showDesc' not in text,
  'getDescTitle removed': 'getDescTitle' not in text,
  'getDescContent removed': 'getDescContent' not in text,
  'charTypeLabel removed': 'charTypeLabel' not in text,
}
for name, ok in checks.items():
    print(name, 'PASS' if ok else 'FAIL')
PY`
Expected: 全部 `PASS`。

- [ ] **Step 6: 提交首屏内容精简改动**

```bash
git add shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue
git commit -m "feat: simplify learning character intro card"
```

### Task 3: 将常用组词改成糖豆卡片风格

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue`

- [ ] **Step 1: 写一个最小失败断言草稿，明确组词区目标样式**

```ts
// words-section 目标状态（人工对照）
// 1. words-title 更像分区标题而不是弱提示文案
// 2. word-item 使用浅暖色底、圆润边角、饱满 padding
// 3. 空状态与整体语言统一
```

- [ ] **Step 2: 人工验证当前组词卡片仍偏朴素**

Run: `python - <<'PY'
from pathlib import Path
p = Path('/d/MyDir/shizi/shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue')
text = p.read_text(encoding='utf-8')
checks = ['background: rgba(255, 255, 255, 0.94);', 'padding: 14rpx 30rpx;', 'font-size: 28rpx;']
for item in checks:
    print(item, 'FOUND' if item in text else 'MISSING')
PY`
Expected: 这些旧样式仍存在，说明组词区还没变成糖豆卡片风。

- [ ] **Step 3: 重写组词区样式为糖豆卡片风**

将 `CharCard.vue` 中组词相关样式替换为：

```scss
.words-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #8c6a3d;
  margin-bottom: 20rpx;
  padding-left: 6rpx;
}

.words-list {
  display: flex;
  gap: 18rpx;
  flex-wrap: wrap;
}

.word-item {
  padding: 18rpx 34rpx;
  border-radius: 999rpx;
  background: linear-gradient(180deg, #fff8ec 0%, #ffefcf 100%);
  border: 2rpx solid rgba(240, 199, 120, 0.72);
  font-size: 34rpx;
  font-weight: 600;
  color: #6a4a24;
  box-shadow:
    0 8rpx 16rpx rgba(214, 153, 41, 0.12),
    inset 0 2rpx 0 rgba(255, 255, 255, 0.6);
}

.word-item-empty {
  background: linear-gradient(180deg, rgba(255, 250, 240, 0.96), rgba(255, 242, 214, 0.96));
  border: 2rpx dashed rgba(222, 182, 108, 0.7);
  border-radius: 28rpx;
  font-size: 28rpx;
  color: #8f724f;
  line-height: 1.6;
  padding: 24rpx 28rpx;
}
```

- [ ] **Step 4: 运行针对性检查确认新样式已生效**

Run: `python - <<'PY'
from pathlib import Path
p = Path('/d/MyDir/shizi/shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue')
text = p.read_text(encoding='utf-8')
checks = {
  'new title style': 'font-weight: 700;' in text and 'color: #8c6a3d;' in text,
  'new chip gradient': 'background: linear-gradient(180deg, #fff8ec 0%, #ffefcf 100%);' in text,
  'new empty state': 'border: 2rpx dashed rgba(222, 182, 108, 0.7);' in text,
}
for name, ok in checks.items():
    print(name, 'PASS' if ok else 'FAIL')
PY`
Expected: 全部 `PASS`。

- [ ] **Step 5: 提交组词视觉优化改动**

```bash
git add shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue
git commit -m "feat: refresh learning word chips"
```

### Task 4: 验证页面流程未受影响

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/learn/index.vue`
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue`
- Verify: `shizi-frontend/src/subpkg-learning/components/learn/SpeakPractice.vue`
- Verify: `shizi-frontend/src/subpkg-learning/components/learn/TracingPractice.vue`
- Verify: `shizi-frontend/src/subpkg-learning/components/learn/QuizCard.vue`

- [ ] **Step 1: 检查顶部步骤文案仍覆盖全部状态**

Run: `python - <<'PY'
from pathlib import Path
p = Path('/d/MyDir/shizi/shizi-frontend/src/subpkg-learning/learn/index.vue')
text = p.read_text(encoding='utf-8')
required = ["origin: '字形认知'", "speak: '跟读练习'", "trace: '描红练习'", "quiz: '趣味小测'", "complete: '本字完成'"]
for item in required:
    print(item, 'PASS' if item in text else 'FAIL')
PY`
Expected: 全部 `PASS`。

- [ ] **Step 2: 检查关键事件流没有被改坏**

Run: `python - <<'PY'
from pathlib import Path
p1 = Path('/d/MyDir/shizi/shizi-frontend/src/subpkg-learning/learn/index.vue').read_text(encoding='utf-8')
p2 = Path('/d/MyDir/shizi/shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue').read_text(encoding='utf-8')
checks = {
  'goToSpeak wired': '@next="goToSpeak"' in p1,
  'goToTrace exists': 'function goToTrace()' in p1,
  'goToQuiz exists': 'function goToQuiz()' in p1,
  'quiz complete exists': 'function handleQuizComplete' in p1,
  'char card next emit': "emit('next')" in p2,
}
for name, ok in checks.items():
    print(name, 'PASS' if ok else 'FAIL')
PY`
Expected: 全部 `PASS`。

- [ ] **Step 3: 运行项目针对性检查命令**

Run: `cd /d/MyDir/shizi/shizi-frontend && npx eslint src/subpkg-learning/learn/index.vue src/subpkg-learning/components/learn/CharCard.vue`
Expected: `0 problems`。

- [ ] **Step 4: 如有本地预览环境，人工验收以下场景**

```text
1. 进入学习详情页，顶部左侧是 arrow-left 按钮。
2. 顶部中间展示步骤名，右侧展示当前字序/总字数。
3. 首屏不再展示字源演变说明卡。
4. 常用组词显示为更圆润、更饱满的糖豆卡片。
5. 点击“我记住了，继续”后仍能正常进入跟读。
6. 完成一个字后继续学习，下一个字的进度数字正确递增。
```

- [ ] **Step 5: 提交最终验证后的改动**

```bash
git add shizi-frontend/src/subpkg-learning/learn/index.vue shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue
git commit -m "feat: polish learning detail page ui"
```

## Self-Review

- Spec coverage: 已覆盖顶部返回按钮、顶部步骤名、生字进度条、删除字源说明卡、组词糖豆卡片、流程不变这几项要求。
- Placeholder scan: 计划中未使用 TBD/TODO/“自行处理”等占位语句，命令、代码片段、目标文件都已写明。
- Type consistency: `currentCharIndex`、`totalChars`、`progressPercent`、`stepLabel`、`handleClose`、`emit('next')` 等命名在任务间保持一致，没有前后漂移。
