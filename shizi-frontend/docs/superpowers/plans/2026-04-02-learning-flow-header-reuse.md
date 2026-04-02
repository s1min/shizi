# Learning Flow Header Reuse Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the learning detail page header into a shared flow component and use that shared skeleton to make the unit test page feel like step 4 of the same learning flow.

**Architecture:** Create a pure presentation `LearnFlowHeader` component that owns the shared progress header markup and styles from the learning detail page. Keep `TracingPractice.vue` as a tracing-specific business component, and update `index.vue` and `unit-test.vue` to consume the shared header while letting `unit-test.vue` keep its own quiz logic and result handling.

**Tech Stack:** Vue 3 `<script setup lang="ts">`, Pinia, uni-app, scoped SCSS, ESLint

---

## File Structure

- Create: `shizi-frontend/src/subpkg-learning/components/learn/LearnFlowHeader.vue`
  - Shared learning flow header presentation component.
  - Owns the progress header markup, step chips, progress bar, and back button event.
- Modify: `shizi-frontend/src/subpkg-learning/learn/index.vue`
  - Replace inline progress header markup with `LearnFlowHeader`.
  - Keep existing step state and navigation logic in-page.
- Modify: `shizi-frontend/src/subpkg-learning/learn/unit-test.vue`
  - Replace custom test header with `LearnFlowHeader`.
  - Add fixed four-step flow data so the page renders as “试一试”.
  - Keep quiz generation, answer feedback, and result logic local.
- Optional future work, not in this plan: `shizi-frontend/src/subpkg-learning/components/learn/LearnStageShell.vue`
  - Explicitly out of scope for this implementation pass to keep the change small and testable.

## Task 1: Add the shared learning flow header component

**Files:**
- Create: `shizi-frontend/src/subpkg-learning/components/learn/LearnFlowHeader.vue`
- Test: `shizi-frontend/src/subpkg-learning/learn/index.vue`

- [ ] **Step 1: Write the failing test surrogate by wiring the target API in the new component file**

```vue
<script lang="ts" setup>
type StepVisualState = 'current' | 'done' | 'available'

interface StepItem {
  key: string
  label: string
  state: StepVisualState
  clickable?: boolean
}

const props = withDefaults(defineProps<{
  title: string
  current: number
  total: number
  progressPercent: number
  stepItems: StepItem[]
  showBack?: boolean
}>(), {
  showBack: true,
})

const emit = defineEmits<{
  back: []
  stepClick: [key: string]
}>()
</script>
```

Expected: `index.vue` cannot import this component yet because the file does not exist.

- [ ] **Step 2: Create the minimal shared component with the exact header structure from the learning page**

```vue
<template>
  <div class="progress-header" :style="headerStyle">
    <div class="progress-topline">
      <button v-if="showBack" class="exit-entry" @click="emit('back')">
        <wd-icon name="arrow-left" size="22px" />
      </button>
      <div v-else class="exit-entry placeholder" />

      <div class="step-title-wrap">
        <div class="step-title">
          {{ title }}
        </div>
      </div>
    </div>

    <div class="progress-row">
      <div class="progress-track-wrap">
        <div class="progress-bg">
          <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
        </div>
        <div class="progress-text">
          {{ current }}/{{ total }}
        </div>
      </div>
    </div>

    <div class="step-flow">
      <template v-for="(item, index) in stepItems" :key="item.key">
        <button
          class="step-chip"
          :class="[`is-${item.state}`, { clickable: item.clickable }]"
          :disabled="!item.clickable"
          @click="emit('stepClick', item.key)"
        >
          <div class="step-chip-dot">
            <wd-icon v-if="item.state === 'done'" name="check" size="18px" />
            <span v-else>{{ index + 1 }}</span>
          </div>
          <div class="step-chip-label">
            {{ item.label }}
          </div>
        </button>
        <div v-if="index < stepItems.length - 1" class="step-segment" :class="{ done: stepItems[index].state === 'done' }" />
      </template>
    </div>
  </div>
</template>
```

- [ ] **Step 3: Copy the learning page header script helpers and styles into the new component**

```vue
<script lang="ts" setup>
import { computed } from 'vue'
import { getCustomNavBarMetrics } from '@/utils/navbar'

type StepVisualState = 'current' | 'done' | 'available'

interface StepItem {
  key: string
  label: string
  state: StepVisualState
  clickable?: boolean
}

const props = withDefaults(defineProps<{
  title: string
  current: number
  total: number
  progressPercent: number
  stepItems: StepItem[]
  showBack?: boolean
}>(), {
  showBack: true,
})

const emit = defineEmits<{
  back: []
  stepClick: [key: string]
}>()

const navMetrics = getCustomNavBarMetrics()
const headerStyle = computed(() => ({
  paddingTop: `${navMetrics.navBarPaddingTop}px`,
}))
</script>

<style lang="scss" scoped>
.progress-header {
  padding: 24rpx 32rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  background: linear-gradient(180deg, rgba(255, 251, 244, 0.98), rgba(255, 247, 235, 0.94));
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
  box-shadow:
    0 12rpx 24rpx rgba(226, 172, 70, 0.08),
    inset 0 -2rpx 0 rgba(255, 255, 255, 0.56);
}

.progress-topline {
  display: grid;
  grid-template-columns: 88rpx 1fr;
  align-items: center;
  gap: 16rpx;
}

.step-title-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding-right: 88rpx;
}

.step-title {
  text-align: center;
  font-size: 32rpx;
  font-weight: 700;
  color: #6a5034;
  letter-spacing: 2rpx;
}
</style>
```

- [ ] **Step 4: Add the remaining copied header styles so the component is visually complete**

```scss
.progress-row {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.progress-track-wrap {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.progress-bg {
  flex: 1;
  min-width: 0;
  height: 16rpx;
  background: linear-gradient(180deg, rgba(255, 243, 220, 0.9), rgba(255, 238, 205, 0.94));
  border-radius: 999rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd977 0%, #f9bf45 56%, #f1a62a 100%);
  border-radius: 999rpx;
  transition: width 0.3s ease;
}

.progress-text {
  flex-shrink: 0;
  min-width: 72rpx;
  text-align: right;
  font-size: 28rpx;
  font-weight: 700;
  color: #8b7357;
}

.step-flow {
  position: relative;
  display: grid;
  grid-template-columns:
    max-content minmax(24rpx, 1fr) max-content minmax(24rpx, 1fr) max-content minmax(24rpx, 1fr)
    max-content;
  justify-content: space-between;
  align-items: start;
}

.step-chip {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 8rpx;
  background: transparent;
  border: none;
}

.step-chip-dot {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rpx;
}

.step-chip-label {
  font-size: 24rpx;
  line-height: 1.2;
  font-weight: 700;
}

.step-segment {
  align-self: start;
  width: calc(100% + 20rpx);
  min-width: 24rpx;
  margin-top: 38rpx;
  margin-left: -10rpx;
  margin-right: -10rpx;
  height: 6rpx;
  border-radius: 999rpx;
}

.exit-entry {
  width: 80rpx;
  height: 80rpx;
  justify-self: start;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid rgba(247, 213, 153, 0.38);
  border-radius: 999rpx;
  background: linear-gradient(180deg, #fffaf1 0%, #ffefcf 100%);
}

.exit-entry.placeholder {
  visibility: hidden;
}
```

- [ ] **Step 5: Run lint to verify the new component is valid**

Run: `cd /d/MyDir/shizi/shizi-frontend && pnpm eslint src/subpkg-learning/components/learn/LearnFlowHeader.vue --fix`
Expected: command exits with no errors.

- [ ] **Step 6: Commit**

```bash
git add src/subpkg-learning/components/learn/LearnFlowHeader.vue
git commit -m "feat: add shared learning flow header"
```

## Task 2: Move the learning page to the shared header

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/learn/index.vue`
- Test: `shizi-frontend/src/subpkg-learning/components/learn/LearnFlowHeader.vue`

- [ ] **Step 1: Write the failing integration change by replacing the local header import list**

```ts
import CharCard from '../components/learn/CharCard.vue'
import LearnFlowHeader from '../components/learn/LearnFlowHeader.vue'
import QuizCard from '../components/learn/QuizCard.vue'
import SpeakPractice from '../components/learn/SpeakPractice.vue'
import TracingPractice from '../components/learn/TracingPractice.vue'
```

Expected: template still references inline header markup, so the new import is unused and lint should fail until the template is switched.

- [ ] **Step 2: Replace the inline header template with the shared component**

```vue
<LearnFlowHeader
  :title="stepLabel"
  :current="currentCharIndex"
  :total="totalChars"
  :progress-percent="progressPercent"
  :step-items="stepItems"
  @back="handleClose"
  @step-click="handleStepClick"
/>
```

- [ ] **Step 3: Delete the obsolete local navbar metric usage from the page script**

```ts
const learnStore = useLearnStore()
```

Delete these lines entirely because the shared component now owns them:

```ts
import { getCustomNavBarMetrics } from '@/utils/navbar'

const navMetrics = getCustomNavBarMetrics()
const headerStyle = computed(() => ({
  paddingTop: `${navMetrics.navBarPaddingTop}px`,
}))
```

- [ ] **Step 4: Remove the header-specific scoped styles that now belong to the component**

Delete these blocks from `index.vue` because they now live in `LearnFlowHeader.vue`:

```scss
.progress-header { ... }
.progress-topline { ... }
.step-title-wrap { ... }
.step-title { ... }
.progress-row { ... }
.progress-track-wrap { ... }
.progress-bg { ... }
.progress-fill { ... }
.progress-text { ... }
.step-flow { ... }
.step-segment { ... }
.step-segment.done { ... }
.step-chip { ... }
.step-chip-dot { ... }
.step-chip-label { ... }
.step-chip.is-current .step-chip-dot { ... }
.step-chip.is-current .step-chip-label { ... }
.step-chip.is-done .step-chip-dot { ... }
.step-chip.is-done .step-chip-label { ... }
.step-chip:not(.clickable) .step-chip-dot { ... }
.step-chip:not(.clickable) .step-chip-label { ... }
.exit-entry { ... }
```

Keep page-local layout styles like `.learn-container`, `.learn-content`, and complete-screen styles.

- [ ] **Step 5: Run lint on the learning page and shared component**

Run: `cd /d/MyDir/shizi/shizi-frontend && pnpm eslint src/subpkg-learning/learn/index.vue src/subpkg-learning/components/learn/LearnFlowHeader.vue --fix`
Expected: command exits with no errors.

- [ ] **Step 6: Manually verify learning page behavior in the browser or simulator**

Check:
- Back button still triggers `handleClose`
- Step click still moves among unlocked steps
- Progress text still shows `currentCharIndex/totalChars`

Expected: no behavior change from before the refactor.

- [ ] **Step 7: Commit**

```bash
git add src/subpkg-learning/learn/index.vue src/subpkg-learning/components/learn/LearnFlowHeader.vue
git commit -m "refactor: reuse shared header in learning flow"
```

## Task 3: Rebuild the unit test page around the shared flow header

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/learn/unit-test.vue`
- Test: `shizi-frontend/src/subpkg-learning/components/learn/LearnFlowHeader.vue`

- [ ] **Step 1: Write the failing integration change by importing the shared header**

```ts
import LearnFlowHeader from '../components/learn/LearnFlowHeader.vue'
```

Expected: lint reports the import is unused until the template is updated.

- [ ] **Step 2: Add fixed step-flow state for the test page**

```ts
type TestFlowStep = 'origin' | 'speak' | 'trace' | 'quiz'

const testStepItems = computed(() => {
  const stepLabelMap: Record<TestFlowStep, string> = {
    origin: '看一看',
    speak: '读一读',
    trace: '写一写',
    quiz: '试一试',
  }

  return (['origin', 'speak', 'trace', 'quiz'] as TestFlowStep[]).map((key) => {
    return {
      key,
      label: stepLabelMap[key],
      state: key === 'quiz' ? 'current' : 'done',
      clickable: false,
    }
  })
})
```

- [ ] **Step 3: Replace the custom test header template with the shared header component**

```vue
<LearnFlowHeader
  title="试一试"
  :current="currentIndex + 1"
  :total="questions.length"
  :progress-percent="progressPercent"
  :step-items="testStepItems"
  @back="handleClose"
/>
```

Delete the old custom header block:

```vue
<div class="test-header" :style="headerStyle">
  <div class="test-topline">
    <div class="progress-meta">
      单元测试
    </div>
    <button class="exit-entry" @click="handleClose">
      <text class="exit-entry-text">退出</text>
    </button>
  </div>
  <div class="test-progress-row">
    <div class="progress-bg">
      <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
    </div>
    <div class="progress-text">
      {{ currentIndex + 1 }}/{{ questions.length }}
    </div>
  </div>
</div>
```

- [ ] **Step 4: Remove obsolete page-local navbar metric code**

Delete these lines from the script because `LearnFlowHeader` owns safe-area padding now:

```ts
import { getCustomNavBarMetrics } from '@/utils/navbar'

const navMetrics = getCustomNavBarMetrics()
const headerStyle = computed(() => ({
  paddingTop: `${navMetrics.navBarPaddingTop + navMetrics.navBarContentHeight + 16}px`,
}))
```

- [ ] **Step 5: Rewrite the page container and question area styles so the body rhythm matches the learning page**

Replace the top-level layout styles with this direction:

```scss
.test-container {
  min-height: 100vh;
  background:
    radial-gradient(circle at 12% 16%, rgba(251, 210, 128, 0.2) 0%, rgba(251, 210, 128, 0) 32%),
    radial-gradient(circle at 84% 28%, rgba(255, 230, 184, 0.28) 0%, rgba(255, 230, 184, 0) 36%),
    linear-gradient(180deg, #fffaf2 0%, #fffdf8 56%, #ffffff 100%);
  display: flex;
  flex-direction: column;
}

.question-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 24rpx 24rpx 176rpx;
}

.result-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 24rpx 24rpx 40rpx;
}
```

- [ ] **Step 6: Make the question card feel like a learning-stage card instead of an exam panel**

Update the question card styles to align with the learning page card language:

```scss
.question-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  padding: 32rpx 24rpx 40rpx;
  border-radius: 32rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 251, 244, 0.9) 100%);
  box-shadow:
    0 12rpx 28rpx rgba(226, 182, 92, 0.08),
    inset 0 0 0 2rpx rgba(255, 244, 220, 0.6);
}

.quiz-type-tag {
  padding: 8rpx 24rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: #b49a7a;
  background: rgba(255, 244, 220, 0.92);
}

.question-content {
  width: 100%;
  min-height: 280rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  text-align: center;
}

.question-hint {
  font-size: 28rpx;
  line-height: 1.5;
  color: #8d7a67;
  text-align: center;
}
```

- [ ] **Step 7: Keep the quiz logic intact while bringing option cards closer to the learning style**

Use styles in this direction without changing click logic:

```scss
.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.option-btn {
  min-height: 188rpx;
  padding: 32rpx 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 28rpx;
  border: 4rpx solid rgba(240, 222, 189, 0.88);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 252, 246, 0.98) 100%);
}

.option-btn.selected {
  border-color: rgba(245, 166, 35, 0.88);
  background: linear-gradient(180deg, #fffaf0 0%, #fff3db 100%);
}

.option-btn.correct {
  border-color: rgba(163, 210, 96, 0.88);
  background: linear-gradient(180deg, #f9fff0 0%, #eef8dd 100%);
}

.option-btn.wrong {
  border-color: rgba(241, 165, 142, 0.8);
  background: linear-gradient(180deg, #fffaf7 0%, #fff0ea 100%);
}
```

- [ ] **Step 8: Preserve the current feedback and result logic, but ensure the result page reads as step completion**

Keep these script behaviors unchanged:

```ts
if (passed.value) {
  learnStore.completeUnit(unitId.value, resultStars.value)
}

const query = passed.value
  ? `unitId=${unitId.value}&accuracy=${accuracy.value}&time=${seconds}&stars=${resultStars.value}`
  : `unitId=${unitId.value}`
```

Only update result copy if needed so the page still reads like a warm learning flow outcome, not a detached exam settlement page.

- [ ] **Step 9: Run lint on the unit test page and shared header**

Run: `cd /d/MyDir/shizi/shizi-frontend && pnpm eslint src/subpkg-learning/learn/unit-test.vue src/subpkg-learning/components/learn/LearnFlowHeader.vue --fix`
Expected: command exits with no errors.

- [ ] **Step 10: Manually verify the full unit-test flow**

Check:
- Header looks like the learning page header
- Step flow shows 1-3 done and 4 current
- Back button still opens the exit modal
- Audio question still auto-plays and replay works
- Answer feedback still appears and “继续” advances
- Result page still records pass/fail correctly

Expected: structure feels like the fourth step of the same flow, with no regression in quiz logic.

- [ ] **Step 11: Commit**

```bash
git add src/subpkg-learning/learn/unit-test.vue src/subpkg-learning/components/learn/LearnFlowHeader.vue
git commit -m "feat: align unit test page with learning flow"
```

## Task 4: Final verification pass

**Files:**
- Modify if needed: `shizi-frontend/src/subpkg-learning/learn/index.vue`
- Modify if needed: `shizi-frontend/src/subpkg-learning/learn/unit-test.vue`
- Test: `shizi-frontend/src/subpkg-learning/components/learn/LearnFlowHeader.vue`

- [ ] **Step 1: Run the final lint command across all touched files**

Run: `cd /d/MyDir/shizi/shizi-frontend && pnpm eslint src/subpkg-learning/components/learn/LearnFlowHeader.vue src/subpkg-learning/learn/index.vue src/subpkg-learning/learn/unit-test.vue --fix`
Expected: command exits with no errors.

- [ ] **Step 2: Do a visual comparison against the spec requirements**

Confirm these exact points:
- `unit-test.vue` header matches learning flow skeleton
- `index.vue` still behaves the same after header extraction
- `TracingPractice.vue` remains tracing-specific and unchanged
- Unit test page feels like “试一试”, not a separate exam module

Expected: all four checks pass without needing any further component generalization.

- [ ] **Step 3: Commit the final polish if any changes were required**

```bash
git add src/subpkg-learning/components/learn/LearnFlowHeader.vue src/subpkg-learning/learn/index.vue src/subpkg-learning/learn/unit-test.vue
git commit -m "refactor: polish shared learning flow layout"
```

## Self-Review

### Spec coverage
- Shared header extraction: covered in Task 1.
- Learning page migration to shared header: covered in Task 2.
- Unit test page aligned as step 4 of the same flow: covered in Task 3.
- Keep `TracingPractice.vue` out of unit test reuse: enforced in Task 3 and Task 4 checks.
- Verification and lint: covered in Tasks 1-4.

### Placeholder scan
- No `TODO`, `TBD`, or “similar to task N” placeholders remain.
- Every code-changing step includes concrete code or exact code direction.
- Every verification step includes explicit commands and expected outcomes.

### Type consistency
- Shared header prop names are consistent: `title`, `current`, `total`, `progressPercent`, `stepItems`, `showBack`.
- Shared header emits are consistent: `back`, `stepClick`.
- Test page fixed steps use `origin`, `speak`, `trace`, `quiz`, matching learning page naming.
