# Learn Detail UI Style Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify the learn detail page UI so the header, main content stage, completion state, and four learning step components all follow the new frontend UI rules in `shizi-frontend/CLAUDE.md`.

**Architecture:** Keep the existing learn flow logic in place and constrain this work to style/layout convergence. Use `shizi-frontend/src/subpkg-learning/learn/index.vue` as the page-level shell, then tune each step component to reuse the same button language, card weight, spacing rhythm, and state semantics without introducing a new component architecture.

**Tech Stack:** Vue 3, TypeScript, scoped SCSS, uni-app, wd-icon

---

## File Structure

- `shizi-frontend/src/subpkg-learning/learn/index.vue`
  - Own the page shell: header, progress area, content stage container, complete state, and page-level spacing rhythm.
- `shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue`
  - Match the page shell with lighter grouping, consistent button sizing, and stable bottom CTA treatment.
- `shizi-frontend/src/subpkg-learning/components/learn/SpeakPractice.vue`
  - Preserve the existing child-friendly interaction while aligning cards, feedback, icon buttons, and bottom action row to the shared system.
- `shizi-frontend/src/subpkg-learning/components/learn/TracingPractice.vue`
  - Align tool buttons, status area, writing stage framing, and step action row with the same visual hierarchy.
- `shizi-frontend/src/subpkg-learning/components/learn/QuizCard.vue`
  - Reduce mismatch with the rest of the flow by restyling the quiz prompt, audio entry, option cards, and result action row.

No new files are required for implementation.

### Task 1: Unify the page shell in `index.vue`

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/learn/index.vue`
- Test: visual verification in the running learn detail page

- [ ] **Step 1: Write the failing test**

This page has no automated style test coverage today, so use a visual regression checklist as the failing test. Before changing code, load the learn detail page and confirm the following failures are visible:

```text
FAIL checklist:
- Header feels heavier than the main task area.
- Progress row and step flow do not read as a single light navigation block.
- Main content area does not feel like one consistent stage across steps.
- Complete state feels visually detached from the rest of the flow.
- Some layout dimensions still fall outside the 4/8 spacing rule.
```

- [ ] **Step 2: Run the failing test and capture the failure**

Run the frontend locally and open the learn detail page.

Run:
```bash
cd shizi-frontend && npm run dev:h5
```

Expected: The page renders, and the checklist above fails by inspection.

- [ ] **Step 3: Write the minimal implementation for the page shell**

Update `shizi-frontend/src/subpkg-learning/learn/index.vue` to do all of the following in one coherent pass:

```vue
<template>
  <div class="learn-container">
    <div class="progress-header" :style="headerStyle">
      <div class="progress-topline">
        <button class="exit-entry" @click="handleClose">
          <wd-icon name="arrow-left" size="22px" />
        </button>
        <div class="step-title-wrap">
          <div class="step-caption">当前任务</div>
          <div class="step-title">{{ stepLabel }}</div>
        </div>
      </div>

      <div class="progress-row">
        <div class="progress-meta">学习进度</div>
        <div class="progress-track-wrap">
          <div class="progress-bg">
            <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
          </div>
          <div class="progress-text">{{ currentCharIndex }}/{{ totalChars }}</div>
        </div>
      </div>

      <div class="step-flow">
        <!-- keep existing loop and click behavior -->
      </div>
    </div>

    <div class="learn-content">
      <div class="learn-stage">
        <!-- keep existing currentStep branches here -->
      </div>
    </div>
  </div>
</template>
```

```scss
.learn-container {
  min-height: 100vh;
  background:
    radial-gradient(circle at 12% 16%, rgba(251, 210, 128, 0.2) 0%, rgba(251, 210, 128, 0) 32%),
    radial-gradient(circle at 84% 28%, rgba(255, 230, 184, 0.28) 0%, rgba(255, 230, 184, 0) 36%),
    linear-gradient(180deg, #fffaf2 0%, #fffdf8 56%, #ffffff 100%);
  display: flex;
  flex-direction: column;
}

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

.step-caption {
  font-size: 20rpx;
  font-weight: 600;
  color: #b49a7a;
  line-height: 1;
}

.step-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #6a5034;
  letter-spacing: 2rpx;
}

.progress-row {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.progress-meta {
  font-size: 22rpx;
  font-weight: 600;
  color: #ad9372;
  line-height: 1.2;
}

.progress-track-wrap {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.learn-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24rpx 24rpx 32rpx;
}

.learn-stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 32rpx 24rpx;
  border-radius: 32rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 251, 244, 0.9) 100%);
  box-shadow:
    0 12rpx 28rpx rgba(226, 182, 92, 0.08),
    inset 0 0 0 2rpx rgba(255, 244, 220, 0.6);
}

.complete-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48rpx 24rpx;
  border-radius: 32rpx;
  background: linear-gradient(180deg, rgba(255, 252, 246, 0.96) 0%, rgba(255, 246, 232, 0.96) 100%);
  box-shadow:
    0 12rpx 28rpx rgba(245, 166, 35, 0.1),
    inset 0 0 0 4rpx rgba(245, 214, 154, 0.4);
}
```

Keep all existing page logic and event wiring intact. Only adjust markup needed for the new shell and restyle the header, content stage, and complete state.

- [ ] **Step 4: Run the page and verify the page shell passes**

Run:
```bash
cd shizi-frontend && npm run dev:h5
```

Expected:
```text
PASS checklist:
- Header reads as a lighter navigation block.
- Main content area reads as the only visual center.
- Complete state feels like part of the same page system.
- Updated layout dimensions use 4/8 multiples.
```

- [ ] **Step 5: Commit**

```bash
git add shizi-frontend/src/subpkg-learning/learn/index.vue
git commit -m "feat: unify learn detail page shell"
```

### Task 2: Align `CharCard.vue` with the shared stage system

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue`
- Test: visual verification in step 1 of the learn detail page

- [ ] **Step 1: Write the failing test**

Use this visual checklist as the failing test before editing step 1:

```text
FAIL checklist:
- Step 1 content does not fully match the new page shell spacing rhythm.
- The primary CTA looks similar to the old style but not identical to the shared action language.
- Word chips feel visually busier than the rest of the optimized flow.
```

- [ ] **Step 2: Run the failing test and confirm the mismatch**

Run:
```bash
cd shizi-frontend && npm run dev:h5
```

Expected: On the first learn step, the checklist above fails by inspection.

- [ ] **Step 3: Write the minimal implementation for step 1 styling**

Edit `shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue` so it follows the shared stage language:

```scss
.char-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  color: #4a3728;
}

.origin-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;
}

.char-display {
  text-align: center;
  opacity: 0;
  transform: translateY(32rpx);
  transition: all 0.5s ease-out;
  margin-top: 32rpx;
}

.words-section {
  width: 100%;
  margin-bottom: 32rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: linear-gradient(180deg, rgba(255, 252, 246, 0.9) 0%, rgba(255, 248, 238, 0.9) 100%);
  box-shadow: inset 0 0 0 4rpx rgba(244, 226, 193, 0.44);
}

.words-list {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.word-item {
  padding: 16rpx 24rpx;
  border-radius: 40rpx;
  border: 2rpx solid transparent;
  font-size: 28rpx;
  font-weight: 600;
}

.btn-continue {
  width: 100%;
  height: 104rpx;
  border-radius: 56rpx;
  font-size: 38rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
  background: linear-gradient(135deg, #f5a623 0%, #eb9a1a 52%, #e28412 100%);
  color: #fff;
  box-shadow: 0 14rpx 30rpx rgba(230, 145, 24, 0.36);
}
```

Do not change the animation order or the `speakChar` / `playWord` logic. Keep the word chip palette, but reduce container noise so the page shell remains dominant.

- [ ] **Step 4: Run the page and verify step 1 passes**

Run:
```bash
cd shizi-frontend && npm run dev:h5
```

Expected:
```text
PASS checklist:
- Step 1 spacing matches the page shell rhythm.
- CTA sizing and weight match the shared button system.
- Word group feels like a light supporting card instead of a competing panel.
```

- [ ] **Step 5: Commit**

```bash
git add shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue
git commit -m "feat: align char card with learn detail shell"
```

### Task 3: Normalize `SpeakPractice.vue` and `TracingPractice.vue`

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/SpeakPractice.vue`
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/TracingPractice.vue`
- Test: visual verification in steps 2 and 3 of the learn detail page

- [ ] **Step 1: Write the failing test**

Use this checklist before editing:

```text
FAIL checklist:
- Step 2 and step 3 do not yet share the same card weight and action-row language.
- Tool/action buttons in tracing feel like a separate system.
- Status/feedback regions between step 2 and step 3 have inconsistent visual priority.
```

- [ ] **Step 2: Run the failing test and confirm the mismatch**

Run:
```bash
cd shizi-frontend && npm run dev:h5
```

Expected: On steps 2 and 3, the mismatch in action styles and card/state weight is still visible.

- [ ] **Step 3: Write the minimal implementation for steps 2 and 3**

In `shizi-frontend/src/subpkg-learning/components/learn/SpeakPractice.vue`, keep the current interaction structure and tune only the outer styling language:

```scss
.speak-practice {
  flex: 1;
  display: flex;
  flex-direction: column;
  color: var(--ink);
}

.answer-panel {
  padding: 24rpx;
  border-radius: 24rpx;
  background: linear-gradient(180deg, rgba(255, 252, 246, 0.96) 0%, rgba(255, 248, 239, 0.96) 100%);
  box-shadow:
    0 8rpx 16rpx rgba(229, 180, 83, 0.04),
    inset 0 0 0 4rpx rgba(244, 226, 193, 0.5);
}

.option-card {
  height: 120rpx;
  padding: 0 24rpx;
  border-radius: 24rpx;
}

.feedback-bar {
  margin-top: 16rpx;
  padding: 16rpx 24rpx;
  border-radius: 24rpx;
}

.step-actions {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24rpx;
  margin-top: auto;
  padding-top: 32rpx;
}
```

In `shizi-frontend/src/subpkg-learning/components/learn/TracingPractice.vue`, restyle the framing and actions so they match the shared system without touching canvas logic:

```scss
.tracing-practice {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  color: #4a3728;
}

.char-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.tracing-area {
  width: 100%;
  margin-bottom: 24rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: linear-gradient(180deg, rgba(255, 252, 246, 0.96) 0%, rgba(255, 248, 239, 0.94) 100%);
  box-shadow:
    0 8rpx 16rpx rgba(229, 180, 83, 0.04),
    inset 0 0 0 4rpx rgba(244, 226, 193, 0.5);
}

.action-bar {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.btn-action {
  min-height: 88rpx;
  padding: 16rpx 20rpx;
  border-radius: 24rpx;
  font-size: 28rpx;
  font-weight: 700;
}

.step-actions {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24rpx;
  margin-top: auto;
  padding-top: 32rpx;
}
```

Preserve all existing tracing and TTS behavior. Only update layout/card/action styling and any minimal wrapper markup needed to support it.

- [ ] **Step 4: Run the page and verify steps 2 and 3 pass**

Run:
```bash
cd shizi-frontend && npm run dev:h5
```

Expected:
```text
PASS checklist:
- Step 2 and step 3 now feel part of the same page system.
- Tracing tools no longer look like a separate button family.
- Feedback and status regions are supportive, not dominant.
```

- [ ] **Step 5: Commit**

```bash
git add shizi-frontend/src/subpkg-learning/components/learn/SpeakPractice.vue shizi-frontend/src/subpkg-learning/components/learn/TracingPractice.vue
git commit -m "feat: unify speak and trace step styling"
```

### Task 4: Normalize `QuizCard.vue` and finish cross-step consistency verification

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/QuizCard.vue`
- Test: visual verification in step 4 and complete state of the learn detail page

- [ ] **Step 1: Write the failing test**

Use this checklist before editing step 4:

```text
FAIL checklist:
- Quiz screen still looks disconnected from the other three steps.
- Audio prompt button and option cards use a different visual system.
- Result action row is close to the shared system but not fully matched.
- Complete state and quiz result state still have a visible style jump.
```

- [ ] **Step 2: Run the failing test and confirm the mismatch**

Run:
```bash
cd shizi-frontend && npm run dev:h5
```

Expected: On the quiz step and complete state, the checklist above fails by inspection.

- [ ] **Step 3: Write the minimal implementation for step 4 styling**

Edit `shizi-frontend/src/subpkg-learning/components/learn/QuizCard.vue` to align the quiz with the shared stage system:

```scss
.quiz-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0;
  color: #4a3728;
}

.quiz-type {
  align-self: center;
  margin-bottom: 24rpx;
  padding: 8rpx 24rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: #9a8368;
  background: linear-gradient(180deg, #fffaf1 0%, #fff1db 100%);
}

.question-area {
  margin-bottom: 32rpx;
}

.btn-audio {
  min-width: 240rpx;
  min-height: 88rpx;
  padding: 24rpx 32rpx;
  border-radius: 48rpx;
  background: linear-gradient(180deg, #fffaf1 0%, #ffefcf 100%);
  color: #d08a16;
  box-shadow:
    0 8rpx 16rpx rgba(232, 177, 68, 0.14),
    inset 0 4rpx 0 rgba(255, 255, 255, 0.72);
}

.options-area {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24rpx;
  width: 100%;
  margin-bottom: 32rpx;
}

.option-item {
  min-height: 144rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: linear-gradient(180deg, #fffefd 0%, #fff8ef 100%);
  box-shadow:
    0 4rpx 12rpx rgba(223, 185, 108, 0.05),
    inset 0 0 0 4rpx rgba(240, 222, 190, 0.72);
}

.step-actions {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24rpx;
  margin-top: auto;
  padding-top: 32rpx;
}

.btn-secondary,
.btn-next {
  height: 104rpx;
  border-radius: 56rpx;
  font-size: 38rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
}
```

Keep the existing quiz-type branching and answer logic. Only restyle the quiz prompt area, audio entry, option cards, and action row so step 4 feels native to the same page.

- [ ] **Step 4: Run the page and verify step 4 plus complete state pass**

Run:
```bash
cd shizi-frontend && npm run dev:h5
```

Expected:
```text
PASS checklist:
- Step 4 visually matches the first three steps.
- Quiz option cards feel like the same family as earlier task cards.
- Result action row matches the shared button system.
- Transition from quiz to complete state no longer feels like a style jump.
```

- [ ] **Step 5: Commit**

```bash
git add shizi-frontend/src/subpkg-learning/components/learn/QuizCard.vue shizi-frontend/src/subpkg-learning/learn/index.vue
git commit -m "feat: unify quiz and completion styling"
```

## Self-Review Checklist

Spec coverage:
- Header lightening and progress-area unification are implemented in Task 1.
- Main content stage and complete-state continuity are implemented in Task 1 and verified again in Task 4.
- Cross-step button/card/state unification is implemented in Tasks 2, 3, and 4.
- 4/8 spacing rule verification is required in every task’s verification step.

Placeholder scan:
- No `TODO`, `TBD`, or deferred steps remain.
- Every task includes exact files, exact commands, and concrete code targets.
- No step says “similar to previous task”; each task restates its own implementation details.

Type consistency:
- The plan preserves existing component props, emits, and step routing.
- No new public functions, props, or types are introduced across tasks.
- All tasks explicitly keep business logic intact and constrain work to styles and minimal markup changes.
