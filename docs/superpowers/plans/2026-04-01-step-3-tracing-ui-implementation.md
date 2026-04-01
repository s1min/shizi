# Step 3 Tracing UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign Step 3 `写一写` so the tracing canvas is the single visual center and the surrounding controls/readouts align with the calmer, more focused learning-flow UI used in Steps 1 and 2.

**Architecture:** Keep all behavior inside `TracingPractice.vue` and only adjust the local template, status copy, and styling needed to express the approved design. Reuse the existing learning-flow shell from `learn/index.vue`; do not refactor parent flow logic. Preserve current H5 and MP-WEIXIN tracing implementations, but reframe their surrounding UI so the screen reads as a writing exercise rather than a utility panel.

**Tech Stack:** Vue 3 `<script setup>`, TypeScript, scoped SCSS, uni-app, HanziWriter (H5), Canvas 2D (MP-WEIXIN)

---

## File map

- Modify: `shizi-frontend/src/subpkg-learning/components/learn/TracingPractice.vue`
  - Keep tracing logic in place
  - Rework Step 3 layout hierarchy, copy, action-bar emphasis, practice feedback, and state expression
- Verify: `shizi-frontend/src/subpkg-learning/learn/index.vue`
  - Confirm the redesigned Step 3 still fits the existing shell and bottom action rhythm
- Reference: `docs/superpowers/specs/2026-04-01-step-3-tracing-ui-design.md`
  - Approved product/design spec for this implementation

## Task 1: Reframe the top-of-screen hierarchy around the writing task

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/TracingPractice.vue:1-120`
- Verify: `shizi-frontend/src/subpkg-learning/learn/index.vue:42-58`
- Reference: `docs/superpowers/specs/2026-04-01-step-3-tracing-ui-design.md:49-104`

- [ ] **Step 1: Write the failing test/verification note**

Create a temporary verification note in your working scratchpad (not a repo file) with these expected UI outcomes:

```text
Step 3 header should read as a light exercise title, not a standalone card.
The tracing board should remain the largest and calmest block.
Status text should become short task-first copy.
```

Expected current failure before implementation:

```text
Current Step 3 still presents the top area as a more separated utility header and uses longer explanatory status copy.
```

- [ ] **Step 2: Read the exact current template section before editing**

Read this file section and verify the current structure still contains:

```vue
<div class="char-header">
  <div class="char-preview">{{ char._id }}</div>
  <div class="char-info">
    <div class="pinyin">{{ char.pinyin }}</div>
    <div class="stroke-count">{{ char.strokes }} 画</div>
  </div>
</div>

<div class="status-bar" :class="{ idle: !quizMode && !isAnimating }">
```

Expected: the current file matches or is close enough to this structure to update in place.

- [ ] **Step 3: Implement the minimal header and status-copy rewrite**

Update the template so the header remains compact and the status copy becomes task-first. Keep platform-specific logic, but replace the long explanatory wording.

Use this template shape:

```vue
<div class="char-header">
  <div class="char-preview">
    {{ char._id }}
  </div>
  <div class="char-info">
    <div class="pinyin">
      {{ char.pinyin }}
    </div>
    <div class="stroke-count">
      {{ char.strokes }} 画
    </div>
  </div>
</div>

<div class="status-bar" :class="statusBarClass">
  <!-- #ifdef MP-WEIXIN -->
  <text v-if="quizMode" class="status-quiz">跟着笔顺写一写</text>
  <text v-else-if="isAnimating" class="status-anim">正在看笔顺</text>
  <text v-else-if="practiceCount >= 1" class="status-ready">这一遍完成，可以继续了</text>
  <text v-else class="status-idle">先看示范，再开始写</text>
  <!-- #endif -->
  <!-- #ifdef H5 -->
  <text v-if="quizMode" class="status-quiz">跟着笔顺写一写</text>
  <text v-else-if="isAnimating" class="status-anim">正在看笔顺</text>
  <text v-else-if="practiceCount >= 1" class="status-ready">这一遍完成，可以继续了</text>
  <text v-else class="status-idle">先看示范，再开始写</text>
  <!-- #endif -->
</div>
```

Add the computed class in script setup:

```ts
const statusBarClass = computed(() => ({
  idle: !quizMode.value && !isAnimating.value && practiceCount.value < 1,
  ready: !quizMode.value && !isAnimating.value && practiceCount.value >= 1,
}))
```

Update imports accordingly:

```ts
import { computed, getCurrentInstance, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
```

- [ ] **Step 4: Update the header and status styles to match the new hierarchy**

Adjust the SCSS so the header feels like a light exercise title and the status bar feels like a slim task prompt.

Use this style block as the target shape:

```scss
.char-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.char-preview {
  font-size: 160rpx;
  line-height: 1;
  font-weight: 700;
  font-family: 'KaiTi', 'STKaiti', serif;
  color: #2f2a24;
}

.char-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8rpx;
}

.pinyin {
  font-size: 56rpx;
  font-weight: 600;
  color: #625344;
}

.stroke-count {
  min-width: 72rpx;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: #9a8368;
  background: linear-gradient(180deg, #f4f1ea 0%, #ece6da 100%);
}

.status-bar {
  min-height: 56rpx;
  margin-top: 16rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.status-idle,
.status-anim,
.status-quiz,
.status-ready {
  font-size: 26rpx;
  line-height: 1.4;
  font-weight: 600;
}

.status-idle {
  color: #9a8368;
}

.status-anim,
.status-quiz {
  color: #8c6a3d;
}

.status-ready {
  color: #5f7f38;
}
```

- [ ] **Step 5: Verify the top hierarchy after the change**

Run:

```bash
pnpm --dir "d:/MyDir/shizi/shizi-frontend" type-check
```

Expected:

```text
No TypeScript errors from TracingPractice.vue after adding computed statusBarClass.
```

Then visually verify in app/H5 that:
- the canvas is still visually larger than the header and status
- the status line reads as a task prompt, not a long instruction paragraph
- the header no longer feels like a separate heavy module

- [ ] **Step 6: Commit Task 1**

```bash
git add shizi-frontend/src/subpkg-learning/components/learn/TracingPractice.vue
git commit -m "feat: refocus tracing step header and status copy"
```

## Task 2: Reduce utility-page feeling and make the canvas the single dominant board

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/TracingPractice.vue:18-90, 260-520`
- Reference: `docs/superpowers/specs/2026-04-01-step-3-tracing-ui-design.md:76-125, 194-220`

- [ ] **Step 1: Write the failing test/verification note**

Record the desired outcome in scratchpad form:

```text
The tracing board should be the screen's strongest block.
The action row should feel like a light tool strip.
Practice feedback should be present but visually quiet.
```

Expected current failure before implementation:

```text
Current action buttons and surrounding sections still read too much like a utility control panel.
```

- [ ] **Step 2: Read the current action row and practice feedback block before editing**

Confirm the current template still contains:

```vue
<div class="action-bar">
  <button class="btn-action btn-clear" @click="clearCanvas">
  <button class="btn-action btn-demo" :disabled="isAnimating" @click="playStrokeDemo">
  <button v-if="!quizMode" class="btn-action btn-quiz" @click="startQuizMode">
  <button v-if="quizMode" class="btn-action btn-next-stroke" @click="confirmStroke">
</div>

<div class="practice-hint">
  已练习 {{ practiceCount }} 次
</div>
```

Expected: action row exists and can be updated in place.

- [ ] **Step 3: Replace emoji/text tool buttons with a unified tool-button structure**

Update the action row template so all tools share the same visual language and use `wd-icon` instead of emoji.

Use this template target:

```vue
<div class="action-bar">
  <button class="btn-action btn-clear" @click="clearCanvas">
    <wd-icon name="delete" size="20px" />
    <text>清除</text>
  </button>
  <button class="btn-action btn-demo" :class="{ active: isAnimating }" :disabled="isAnimating" @click="playStrokeDemo">
    <wd-icon name="video" size="20px" />
    <text>{{ isAnimating ? '播放中' : '示范' }}</text>
  </button>
  <button v-if="!quizMode" class="btn-action btn-quiz" @click="startQuizMode">
    <wd-icon name="edit" size="20px" />
    <text>测试</text>
  </button>
  <button v-else class="btn-action btn-next-stroke" @click="confirmStroke">
    <wd-icon name="check" size="20px" />
    <text>下一笔</text>
  </button>
</div>

<div class="practice-hint" :class="{ done: practiceCount >= 1 }">
  <text>{{ practiceCount >= 1 ? '已完成本字练习' : `今天已练习 ${practiceCount} 次` }}</text>
</div>
```

If a listed icon name is unavailable in `wd-icon`, replace it with the nearest existing Wot icon while preserving the same semantic roles.

- [ ] **Step 4: Restyle the board, tools, and practice feedback so the canvas dominates**

Update the SCSS so the tracing board becomes calmer and the tools lighter.

Use this style target as the implementation shape:

```scss
.tracing-area {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 0;
  padding: 24rpx;
  border-radius: 28rpx;
  background: linear-gradient(180deg, rgba(255, 252, 246, 0.98) 0%, rgba(255, 248, 239, 0.95) 100%);
  box-shadow:
    0 8rpx 18rpx rgba(229, 180, 83, 0.04),
    inset 0 0 0 4rpx rgba(244, 226, 193, 0.42);
}

.grid-container {
  position: relative;
  width: 100%;
  max-width: 520rpx;
  aspect-ratio: 1;
  border-radius: 20rpx;
  overflow: hidden;
  background: rgba(255, 250, 242, 0.96);
  box-shadow: inset 0 0 0 4rpx rgba(225, 205, 168, 0.55);
}

.action-bar {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.btn-action {
  min-height: 88rpx;
  padding: 16rpx 12rpx;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  font-size: 24rpx;
  font-weight: 700;
  border: none;
}

.btn-clear {
  background: linear-gradient(180deg, #f3f2ef 0%, #ebe8e2 100%);
  color: #8b8377;
}

.btn-demo {
  background: linear-gradient(180deg, #edf6ff 0%, #dcecff 100%);
  color: #2f86d8;
}

.btn-demo.active {
  background: linear-gradient(180deg, #e8f2ff 0%, #d1e5ff 100%);
}

.btn-quiz,
.btn-next-stroke {
  background: linear-gradient(180deg, #fff7ea 0%, #ffefcf 100%);
  color: #d67b16;
}

.practice-hint {
  min-height: 40rpx;
  margin-bottom: 24rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 600;
  color: #9a8368;
}

.practice-hint.done {
  color: #5f7f38;
}
```

- [ ] **Step 5: Verify the visual balance after the change**

Run:

```bash
pnpm --dir "d:/MyDir/shizi/shizi-frontend" type-check
```

Expected:

```text
No TypeScript errors from TracingPractice.vue after template/style changes.
```

Then visually verify:
- the square board is the first thing the eye lands on
- the tool row reads as helper controls, not the main content
- the practice feedback no longer floats as a separate loud module

- [ ] **Step 6: Commit Task 2**

```bash
git add shizi-frontend/src/subpkg-learning/components/learn/TracingPractice.vue
git commit -m "feat: unify tracing board and tool visuals"
```

## Task 3: Tighten mode-state behavior so Step 3 feels like a guided exercise

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/TracingPractice.vue:130-240`
- Reference: `docs/superpowers/specs/2026-04-01-step-3-tracing-ui-design.md:148-193`

- [ ] **Step 1: Write the failing test/verification note**

Write the expected state behavior in scratchpad form:

```text
Demo mode should feel like a watch state.
Quiz mode should feel like a write state.
Wrong-answer and completion feedback should not rely on loud popup-style interruption.
```

Expected current failure before implementation:

```text
Current Step 3 still uses a success toast in one completion path and does not fully express quieter in-page state transitions.
```

- [ ] **Step 2: Read the existing H5 and MP logic entry points before editing**

Confirm the current functions still exist:

```ts
function playStrokeDemo()
function startQuizMode()
function clearCanvas()
function handleNext()
```

Expected: these functions are available to update in place without changing parent component contracts.

- [ ] **Step 3: Implement minimal state-behavior adjustments without refactoring tracing engines**

Apply these behavior rules in `TracingPractice.vue`:

1. Remove celebratory popup behavior from Step 3 completion paths.
2. Keep completion confirmation local to the status prompt and practice feedback.
3. When demo starts, ensure quiz-writing state is not simultaneously presented.
4. When clearing, return the UI to a calm non-quiz state.

Use this code shape where relevant:

```ts
function playStrokeDemo() {
  if (!writer || isAnimating.value)
    return

  quizMode.value = false
  isAnimating.value = true

  writer.animateCharacter({
    onComplete: () => {
      isAnimating.value = false
      practiceCount.value++
    },
  })
}

function startQuizMode() {
  if (!writer || isAnimating.value)
    return

  quizMode.value = true
  writer.quiz({
    onMistake: () => {},
    onCorrectStroke: () => {},
    onComplete: () => {
      quizMode.value = false
      practiceCount.value++
    },
  })
}

function clearCanvas() {
  if (!writer)
    return

  writer.cancelQuiz()
  quizMode.value = false
  isAnimating.value = false
  initHanziWriter()
}
```

For MP-WEIXIN logic, make the equivalent state cleanup changes without changing the drawing engine architecture.

- [ ] **Step 4: Verify the guided-state behavior**

Run:

```bash
pnpm --dir "d:/MyDir/shizi/shizi-frontend" type-check
```

Expected:

```text
No TypeScript regressions after behavior-state updates.
```

Then manually verify:
- demo no longer coexists visually with quiz-writing state
- quiz completion no longer relies on a success toast to feel complete
- a single valid practice still unlocks 下一步

- [ ] **Step 5: Commit Task 3**

```bash
git add shizi-frontend/src/subpkg-learning/components/learn/TracingPractice.vue
git commit -m "feat: streamline tracing state transitions"
```

## Self-review checklist

### Spec coverage
- Task 1 covers the light character header and task-first status prompt
- Task 2 covers the canvas-first visual hierarchy, lighter tool row, and quieter practice feedback
- Task 3 covers guided mode transitions, reduced popup-style interruption, and completion semantics
- No approved spec section is left without an implementation task

### Placeholder scan
- No `TBD`, `TODO`, or “implement later” placeholders remain
- Commands, file paths, and target code shapes are concrete
- Verification expectations are explicit

### Type consistency
- `TracingPractice.vue` remains the implementation unit throughout the plan
- `statusBarClass`, `playStrokeDemo`, `startQuizMode`, and `clearCanvas` naming is consistent across tasks
- No plan step introduces a new external contract with `learn/index.vue`
