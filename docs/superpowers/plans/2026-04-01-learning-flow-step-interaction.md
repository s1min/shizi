# 学习流程步骤交互 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为学习页增加可点击的 4 步导航、回退重做规则和统一步骤按钮文案，让儿童学习流程更清晰且可控。

**Architecture:** 保持现有 4 个学习子组件和 `index.vue` 作为流程壳层。主要改造集中在 `index.vue`：把单一 `step` 升级为“当前步骤 + 已完成步骤 + 当前字是否已提交结果”的流程状态，并新增顶部步骤导航、可点击切换和结果去重控制；4 个步骤组件只做最小改动，统一主按钮文案并依赖现有 `watch(() => props.char._id)` 的重置机制配合重进重做。

**Tech Stack:** Vue 3 `<script setup>`、TypeScript、SCSS、uni-app、Pinia (`useLearnStore`)、现有 `speakText` 与学习组件

---

## File Structure

- Modify: `shizi-frontend/src/subpkg-learning/learn/index.vue`
  - 新增儿童化 4 步导航 UI
  - 将 `step` 迁移为 `currentStep` + `completedSteps`
  - 新增步骤状态计算、点击切换和自动推进逻辑
  - 控制 `quiz` 结果只记一次，避免回退重进时重复 `markCharLearned` / `recordWrong`
  - 在切换字符时重置当前字流程状态
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue`
  - 将底部按钮文案改为 `看好了，下一步`
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/SpeakPractice.vue`
  - 将底部按钮文案改为 `读好了，下一步`
  - 将跳过入口文案对齐步骤语义
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/TracingPractice.vue`
  - 将底部按钮文案改为 `写好了，下一步`
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/QuizCard.vue`
  - 将结果条主按钮文案改为 `完成小测`

> 说明：本仓库当前未发现与这些页面对应的单元测试文件，且学习组件主要依赖 uni-app 视图层。此计划采用“针对性静态检查 + 手动真机/模拟器验证”的最小验证路径，不额外引入测试框架。

### Task 1: 在学习页壳层定义步骤状态模型

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/learn/index.vue:77-205`

- [ ] **Step 1: 写一份失败前的状态目标草稿，明确要替换的状态模型**

```ts
// 目标：不再只用 step 表示全部流程
// 需要的状态：
// currentStep: 'origin' | 'speak' | 'trace' | 'quiz' | 'complete'
// completedSteps: LearnStep[]（不包含 complete）
// quizResultRecorded: boolean（当前字的小测结果是否已写入 store）
```

- [ ] **Step 2: 运行静态检查，确认当前文件还只有单一 step 状态**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/learn/index.vue')
text = p.read_text(encoding='utf-8')
checks = {
  'has single step ref': "const step = ref<LearnStep>('origin')" in text,
  'missing completed steps': 'completedSteps' not in text,
  'missing quiz recorded flag': 'quizResultRecorded' not in text,
}
for name, ok in checks.items():
    print(name, 'PASS' if ok else 'FAIL')
PY`
Expected: 三项全部 `PASS`，说明当前状态模型还没升级。

- [ ] **Step 3: 在脚本顶部替换学习步骤类型定义和基础状态**

将 `index.vue` 中的状态定义改为：

```ts
type LearnStep = 'origin' | 'speak' | 'trace' | 'quiz' | 'complete'
type NavigableStep = Exclude<LearnStep, 'complete'>

const stepOrder: NavigableStep[] = ['origin', 'speak', 'trace', 'quiz']
const currentStep = ref<LearnStep>('origin')
const completedSteps = ref<NavigableStep[]>([])
const quizResultRecorded = ref(false)
const charIndex = ref(0)
const unitId = ref('unit_1')
```

- [ ] **Step 4: 增加步骤文案、状态和帮助函数**

在 `index.vue` 中添加以下代码，替换当前 `stepLabelMap` / `stepLabel`：

```ts
const stepLabelMap: Record<LearnStep, string> = {
  origin: '看一看',
  speak: '读一读',
  trace: '写一写',
  quiz: '试一试',
  complete: '本字完成',
}

const stepItems = computed(() =>
  stepOrder.map(stepKey => ({
    key: stepKey,
    label: stepLabelMap[stepKey],
    state: getStepState(stepKey),
  })),
)

const stepLabel = computed(() => stepLabelMap[currentStep.value])

function isStepCompleted(stepKey: NavigableStep) {
  return completedSteps.value.includes(stepKey)
}

function getStepState(stepKey: NavigableStep) {
  if (currentStep.value === stepKey)
    return 'current'
  if (isStepCompleted(stepKey))
    return 'done'
  return 'available'
}

function markStepCompleted(stepKey: NavigableStep) {
  if (!completedSteps.value.includes(stepKey))
    completedSteps.value = [...completedSteps.value, stepKey]
}

function resetCharFlow() {
  currentStep.value = 'origin'
  completedSteps.value = []
  quizResultRecorded.value = false
}
```

- [ ] **Step 5: 运行静态检查，确认新状态模型已存在**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/learn/index.vue')
text = p.read_text(encoding='utf-8')
checks = {
  'has currentStep': 'const currentStep = ref<LearnStep>(\'origin\')' in text,
  'has completedSteps': 'const completedSteps = ref<NavigableStep[]>([])' in text,
  'has quizResultRecorded': 'const quizResultRecorded = ref(false)' in text,
  'has resetCharFlow': 'function resetCharFlow()' in text,
}
for name, ok in checks.items():
    print(name, 'PASS' if ok else 'FAIL')
PY`
Expected: 全部 `PASS`。

- [ ] **Step 6: 提交状态模型改动**

```bash
git add shizi-frontend/src/subpkg-learning/learn/index.vue
git commit -m "feat: add learning flow step state model"
```

### Task 2: 渲染顶部 4 步导航并支持点击切换

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/learn/index.vue:1-75`
- Modify: `shizi-frontend/src/subpkg-learning/learn/index.vue:207-379`

- [ ] **Step 1: 写一个失败前的结构草稿，明确顶部需要新增的 DOM**

```vue
<!-- 目标结构 -->
<div class="progress-header">
  <div class="progress-topline">...</div>
  <div class="progress-row">...</div>
  <div class="step-flow">
    <button v-for="item in stepItems" :key="item.key">...</button>
  </div>
</div>
```

- [ ] **Step 2: 运行静态检查，确认当前顶部还没有 step-flow**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/learn/index.vue')
text = p.read_text(encoding='utf-8')
checks = {
  'missing step flow block': 'class="step-flow"' not in text,
  'missing step items render': 'v-for="item in stepItems"' not in text,
  'still title only header': '<div class="step-title">' in text,
}
for name, ok in checks.items():
    print(name, 'PASS' if ok else 'FAIL')
PY`
Expected: 三项全部 `PASS`。

- [ ] **Step 3: 把顶部模板改成进度层 + 步骤导航层**

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
  <div class="step-flow">
    <button
      v-for="(item, index) in stepItems"
      :key="item.key"
      class="step-chip"
      :class="[`is-${item.state}`, { 'is-last': index === stepItems.length - 1 }]"
      @click="handleStepClick(item.key)"
    >
      <div class="step-chip-dot">
        {{ item.state === 'done' ? '✓' : index + 1 }}
      </div>
      <div class="step-chip-label">
        {{ item.label }}
      </div>
    </button>
  </div>
</div>
```

- [ ] **Step 4: 添加步骤点击和切换函数**

在 `index.vue` 中新增下列函数，并删除旧的 `goToSpeak` / `goToTrace` / `goToQuiz`：

```ts
function moveToStep(stepKey: LearnStep) {
  currentStep.value = stepKey
}

function completeAndGoNext(stepKey: NavigableStep) {
  markStepCompleted(stepKey)
  const currentIndex = stepOrder.indexOf(stepKey)
  const nextStep = stepOrder[currentIndex + 1]
  if (nextStep)
    moveToStep(nextStep)
}

function handleStepClick(stepKey: NavigableStep) {
  if (currentStep.value === stepKey)
    return
  moveToStep(stepKey)
}
```

- [ ] **Step 5: 增加步骤导航样式，区分 current / done / available**

在 `index.vue` 样式中增加：

```scss
.step-flow {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14rpx;
}

.step-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  padding: 14rpx 8rpx 8rpx;
  background: transparent;
  border: none;
  color: #8f7b62;
  transition: transform 0.18s ease, opacity 0.18s ease;

  &::after {
    border: none;
  }

  &:active {
    transform: scale(0.96);
  }

  &.is-current {
    color: #704f1f;
  }

  &.is-done {
    color: #567a2c;
  }
}

.step-chip-dot {
  width: 54rpx;
  height: 54rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 700;
  border: 2rpx solid rgba(221, 194, 145, 0.7);
  background: rgba(255, 250, 241, 0.96);
  box-shadow: inset 0 2rpx 0 rgba(255, 255, 255, 0.72);
}

.step-chip-label {
  font-size: 24rpx;
  line-height: 1.2;
  font-weight: 600;
}

.step-chip.is-current .step-chip-dot {
  width: 62rpx;
  height: 62rpx;
  background: linear-gradient(180deg, #ffe39d 0%, #f5be44 100%);
  border-color: rgba(237, 164, 28, 0.58);
  color: #7a4a00;
  box-shadow: 0 10rpx 18rpx rgba(245, 166, 35, 0.18);
}

.step-chip.is-done .step-chip-dot {
  background: linear-gradient(180deg, #f5fde8 0%, #dbf1b8 100%);
  border-color: rgba(171, 214, 120, 0.72);
  color: #567a2c;
}
```

- [ ] **Step 6: 运行静态检查，确认顶部 4 步导航和点击函数都已存在**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/learn/index.vue')
text = p.read_text(encoding='utf-8')
checks = {
  'renders stepItems': 'v-for="(item, index) in stepItems"' in text,
  'has handleStepClick': 'function handleStepClick(stepKey: NavigableStep)' in text,
  'has step-flow style': '.step-flow {' in text,
  'has current state style': '.step-chip.is-current .step-chip-dot {' in text,
}
for name, ok in checks.items():
    print(name, 'PASS' if ok else 'FAIL')
PY`
Expected: 全部 `PASS`。

- [ ] **Step 7: 提交顶部导航改动**

```bash
git add shizi-frontend/src/subpkg-learning/learn/index.vue
git commit -m "feat: add clickable learning step navigation"
```

### Task 3: 把 4 个步骤的推进改成统一的完成-前进机制

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/learn/index.vue:23-72`

- [ ] **Step 1: 写一份失败前的事件绑定草稿，明确组件应该如何接入新流程**

```vue
<CharCard @next="completeAndGoNext('origin')" />
<SpeakPractice @next="completeAndGoNext('speak')" />
<TracingPractice @next="completeAndGoNext('trace')" />
<QuizCard @next="handleQuizComplete" />
```

- [ ] **Step 2: 运行静态检查，确认当前模板仍绑定旧的 goToXxx 事件**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/learn/index.vue')
text = p.read_text(encoding='utf-8')
checks = {
  'char card still old next': '@next="goToSpeak"' in text,
  'speak still old next': '@next="goToTrace"' in text,
  'trace still old next': '@next="goToQuiz"' in text,
}
for name, ok in checks.items():
    print(name, 'PASS' if ok else 'FAIL')
PY`
Expected: 全部 `PASS`。

- [ ] **Step 3: 替换 3 个学习步骤组件的 next 绑定**

将 `index.vue` 模板中的 3 个组件改为：

```vue
<CharCard
  v-if="currentStep === 'origin'"
  :char="currentChar"
  @next="completeAndGoNext('origin')"
/>

<SpeakPractice
  v-else-if="currentStep === 'speak'"
  :char="currentChar"
  :all-chars="unitChars"
  @next="completeAndGoNext('speak')"
/>

<TracingPractice
  v-else-if="currentStep === 'trace'"
  :char="currentChar"
  @next="completeAndGoNext('trace')"
/>
```

并把 `QuizCard` 与完成页判断一并改成：

```vue
<QuizCard
  v-else-if="currentStep === 'quiz'"
  :char="currentChar"
  :all-chars="unitChars"
  @next="handleQuizComplete"
/>

<div v-else-if="currentStep === 'complete'" class="complete-screen">
```

- [ ] **Step 4: 运行静态检查，确认模板已全面切到 currentStep 和 completeAndGoNext**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/learn/index.vue')
text = p.read_text(encoding='utf-8')
checks = {
  'char card new binding': '@next="completeAndGoNext(\'origin\')"' in text,
  'speak new binding': '@next="completeAndGoNext(\'speak\')"' in text,
  'trace new binding': '@next="completeAndGoNext(\'trace\')"' in text,
  'uses currentStep quiz': "v-else-if=\"currentStep === 'quiz'\"" in text,
}
for name, ok in checks.items():
    print(name, 'PASS' if ok else 'FAIL')
PY`
Expected: 全部 `PASS`。

- [ ] **Step 5: 提交步骤推进改动**

```bash
git add shizi-frontend/src/subpkg-learning/learn/index.vue
git commit -m "feat: unify learning step progression"
```

### Task 4: 控制小测结果只记录一次，并在切字时重置流程

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/learn/index.vue:144-204`
- Reference: `shizi-frontend/src/store/learn.ts:124-170`

- [ ] **Step 1: 写一份失败前的结果记录草稿，明确本轮去重目标**

```ts
// 目标：同一个字在当前轮学习中，quiz 多次重进不会重复写 store
// handleQuizComplete 只应在 quizResultRecorded === false 时：
// 1. markCharLearned(...)
// 2. recordWrong(...)（如果答错）
// 然后置 quizResultRecorded = true
```

- [ ] **Step 2: 运行静态检查，确认当前 handleQuizComplete 每次都会直接写 store**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/learn/index.vue')
text = p.read_text(encoding='utf-8')
checks = {
  'direct markCharLearned': 'learnStore.markCharLearned(currentChar.value._id, correct)' in text,
  'direct recordWrong': 'learnStore.recordWrong(currentChar.value._id, quizType || \'unknown\', unitId.value)' in text,
  'missing recorded guard': 'if (!quizResultRecorded.value)' not in text,
}
for name, ok in checks.items():
    print(name, 'PASS' if ok else 'FAIL')
PY`
Expected: 全部 `PASS`。

- [ ] **Step 3: 改写 handleQuizComplete，先标记 quiz 完成，再做一次性结果写入**

将 `handleQuizComplete` 替换为：

```ts
function handleQuizComplete(correct: boolean, quizType?: string) {
  markStepCompleted('quiz')

  if (!quizResultRecorded.value) {
    learnStore.markCharLearned(currentChar.value._id, correct)
    if (!correct) {
      learnStore.recordWrong(currentChar.value._id, quizType || 'unknown', unitId.value)
    }
    quizResultRecorded.value = true
  }

  moveToStep('complete')
}
```

- [ ] **Step 4: 在 nextChar 和初始化恢复逻辑中重置当前字流程状态**

把 `nextChar` 和 `onMounted` 中对应代码改为：

```ts
function nextChar() {
  if (charIndex.value < unitChars.value.length - 1) {
    charIndex.value++
    resetCharFlow()
    learnStore.updateUnitProgress(unitId.value, charIndex.value)
  }
  else {
    learnStore.updateUnitProgress(unitId.value, unitChars.value.length)
    uni.redirectTo({ url: `/subpkg-learning/learn/unit-test?unitId=${unitId.value}` })
  }
}
```

```ts
if (progress.charIndex > 0 && !progress.completed) {
  charIndex.value = progress.charIndex
}
resetCharFlow()
```

- [ ] **Step 5: 增加字符切换监听，保证手动改字序时流程也重置**

在 `index.vue` 的 `vue` 导入中加入 `watch`，并添加：

```ts
watch(charIndex, () => {
  resetCharFlow()
})
```

> 注意：若你在 Step 4 已经在 `nextChar()` 内调用 `resetCharFlow()`，这里依然保留 `watch(charIndex, ...)` 作为兜底，避免后续从别的入口切换字符时漏掉重置。

- [ ] **Step 6: 运行静态检查，确认结果去重和字符重置逻辑已存在**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/learn/index.vue')
text = p.read_text(encoding='utf-8')
checks = {
  'has recorded guard': 'if (!quizResultRecorded.value) {' in text,
  'sets quizResultRecorded true': 'quizResultRecorded.value = true' in text,
  'resets flow in nextChar': 'resetCharFlow()' in text,
  'watches charIndex': 'watch(charIndex, () => {' in text,
}
for name, ok in checks.items():
    print(name, 'PASS' if ok else 'FAIL')
PY`
Expected: 全部 `PASS`。

- [ ] **Step 7: 提交小测去重与流程重置改动**

```bash
git add shizi-frontend/src/subpkg-learning/learn/index.vue
git commit -m "fix: dedupe quiz results in learning flow"
```

### Task 5: 统一 4 个步骤组件的主按钮文案

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue`
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/SpeakPractice.vue`
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/TracingPractice.vue`
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/QuizCard.vue`

- [ ] **Step 1: 写一份失败前的文案目标草稿**

```ts
// 目标按钮文案：
// CharCard.vue -> 看好了，下一步
// SpeakPractice.vue -> 读好了，下一步
// TracingPractice.vue -> 写好了，下一步
// QuizCard.vue -> 完成小测
```

- [ ] **Step 2: 运行静态检查，确认当前按钮文案仍是旧版**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
files = {
  'CharCard': 'd:/MyDir/shizi/shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue',
  'SpeakPractice': 'd:/MyDir/shizi/shizi-frontend/src/subpkg-learning/components/learn/SpeakPractice.vue',
  'TracingPractice': 'd:/MyDir/shizi/shizi-frontend/src/subpkg-learning/components/learn/TracingPractice.vue',
  'QuizCard': 'd:/MyDir/shizi/shizi-frontend/src/subpkg-learning/components/learn/QuizCard.vue',
}
checks = {
  'CharCard old label': '我记住了，继续',
  'SpeakPractice old label': '继续下一步',
  'TracingPractice old label': '继续下一步',
  'QuizCard old label': '继续',
}
for name, path in files.items():
  text = Path(path).read_text(encoding='utf-8')
  for label, needle in checks.items():
    if label.startswith(name):
      print(label, 'PASS' if needle in text else 'FAIL')
PY`
Expected: 全部 `PASS`。

- [ ] **Step 3: 修改 4 个组件模板中的按钮文案**

在对应文件中把按钮文本替换为：

```vue
<!-- CharCard.vue -->
<button class="btn-continue" @click="handleNext">
  看好了，下一步
</button>
```

```vue
<!-- SpeakPractice.vue -->
<button
  v-if="canProceed"
  class="btn-continue"
  @click="handleNext"
>
  读好了，下一步
</button>
```

```vue
<!-- TracingPractice.vue -->
<button
  v-if="practiceCount >= 1"
  class="btn-continue"
  @click="handleNext"
>
  {{ practiceCount >= 2 ? '写好了，下一步' : '写好了，下一步' }}
</button>
```

```vue
<!-- QuizCard.vue -->
<button class="btn-next" @click="handleNext">
  完成小测
</button>
```

- [ ] **Step 4: 把 SpeakPractice 的跳过文案改为更贴近步骤语义**

将 `SpeakPractice.vue` 中：

```vue
<div v-if="!canProceed && !answered" class="skip-link" @click="handleSkip">
  跳过此步骤
</div>
```

改为：

```vue
<div v-if="!canProceed && !answered" class="skip-link" @click="handleSkip">
  先去下一步
</div>
```

- [ ] **Step 5: 运行静态检查，确认新文案已写入**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
checks = {
  'd:/MyDir/shizi/shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue': '看好了，下一步',
  'd:/MyDir/shizi/shizi-frontend/src/subpkg-learning/components/learn/SpeakPractice.vue': '读好了，下一步',
  'd:/MyDir/shizi/shizi-frontend/src/subpkg-learning/components/learn/TracingPractice.vue': '写好了，下一步',
  'd:/MyDir/shizi/shizi-frontend/src/subpkg-learning/components/learn/QuizCard.vue': '完成小测',
}
for path, needle in checks.items():
  text = Path(path).read_text(encoding='utf-8')
  print(Path(path).name, 'PASS' if needle in text else 'FAIL')
PY`
Expected: 四项全部 `PASS`。

- [ ] **Step 6: 提交步骤文案改动**

```bash
git add shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue shizi-frontend/src/subpkg-learning/components/learn/SpeakPractice.vue shizi-frontend/src/subpkg-learning/components/learn/TracingPractice.vue shizi-frontend/src/subpkg-learning/components/learn/QuizCard.vue
git commit -m "feat: align learning step button copy"
```

### Task 6: 做一次完整静态验证和手动验收

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/learn/index.vue`
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue`
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/SpeakPractice.vue`
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/TracingPractice.vue`
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/QuizCard.vue`

- [ ] **Step 1: 运行一次综合静态检查，确认关键结构和文案都在位**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
index = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/learn/index.vue').read_text(encoding='utf-8')
checks = {
  'step flow render': 'class="step-flow"' in index,
  'step click handler': 'function handleStepClick(stepKey: NavigableStep)' in index,
  'completed steps state': 'const completedSteps = ref<NavigableStep[]>([])' in index,
  'quiz guard': 'if (!quizResultRecorded.value) {' in index,
  'origin next binding': '@next="completeAndGoNext(\'origin\')"' in index,
  'complete screen uses currentStep': "v-else-if=\"currentStep === 'complete'\"" in index,
}
for name, ok in checks.items():
  print(name, 'PASS' if ok else 'FAIL')
PY`
Expected: 全部 `PASS`。

- [ ] **Step 2: 手动跑一遍学习页并核对交互**

Run: `请在 uni-app 开发者工具或实际设备上打开学习页，按以下顺序验证：
1. 顶部是否显示 4 个步骤“看一看 / 读一读 / 写一写 / 试一试”。
2. 点击“读一读”或“写一写”能否直接切换，且不会弹退出框。
3. 完成任一步后，该步骤是否显示为已完成态。
4. 从“试一试”返回“看一看”后，再切回“试一试”时，题目是否重置为待答状态。
5. 完成小测一次后，重复回到“试一试”并再次提交，是否不会重复新增错题记录或重复写学习结果。
6. 点击左上角返回时，是否仍弹“确定退出吗？当前进度已自动保存”。`
Expected: 六项都符合 spec。

- [ ] **Step 3: 查看工作区差异，确认只改了计划内文件**

Run: `git diff -- shizi-frontend/src/subpkg-learning/learn/index.vue shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue shizi-frontend/src/subpkg-learning/components/learn/SpeakPractice.vue shizi-frontend/src/subpkg-learning/components/learn/TracingPractice.vue shizi-frontend/src/subpkg-learning/components/learn/QuizCard.vue`
Expected: diff 只包含步骤导航、流程状态、结果去重和按钮文案相关改动。

- [ ] **Step 4: 提交最终验证后的收尾改动**

```bash
git add shizi-frontend/src/subpkg-learning/learn/index.vue shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue shizi-frontend/src/subpkg-learning/components/learn/SpeakPractice.vue shizi-frontend/src/subpkg-learning/components/learn/TracingPractice.vue shizi-frontend/src/subpkg-learning/components/learn/QuizCard.vue
git commit -m "feat: refine learning flow step interactions"
```

## Self-Review

- **Spec coverage:**
  - 4 步全量可见 → Task 2
  - 推荐推进 + 自由跳转并存 → Task 2、Task 3
  - 页面退出与流程回退分离 → Task 2、Task 6
  - done 保留但重进重做 → Task 3、Task 4、Task 6
  - quiz 结果避免重复累计 → Task 4
  - 按钮文案统一 → Task 5
- **Placeholder scan:** 无 `TODO`、`TBD`、"类似 Task N" 这类占位表述。
- **Type consistency:** 计划统一使用 `LearnStep`、`NavigableStep`、`currentStep`、`completedSteps`、`quizResultRecorded`，前后命名一致。

Plan complete and saved to `docs/superpowers/plans/2026-04-01-learning-flow-step-interaction.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**