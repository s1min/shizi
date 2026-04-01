# Final Completion Step Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the single-character `complete` state into a calm in-page completion screen that keeps the learned character as the visual focus and advances naturally into the next character.

**Architecture:** Keep the change local to the learning flow page by replacing the existing `complete` template block and its scoped styles inside `shizi-frontend/src/subpkg-learning/learn/index.vue`. Reuse the existing `currentChar`, `nextChar()`, page shell, header, progress, and primary button system so the completion state feels like the final state of the current flow rather than a separate feature.

**Tech Stack:** Vue 3 `<script setup>`, TypeScript, uni-app, scoped SCSS

---

## File Structure

- Modify: `shizi-frontend/src/subpkg-learning/learn/index.vue`
  - Replace the current `complete` state template with the new lightweight completion layout.
  - Keep `handleQuizComplete()` and `nextChar()` behavior unchanged.
  - Update scoped SCSS for the completion state to match the approved spec and the repo spacing/UI rules.
- Do not create new components unless the implementation proves impossible to keep readable inside `index.vue`. This change is intentionally scoped to one page state.

---

### Task 1: Replace the complete-state template

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/learn/index.vue:60-73`
- Test: `shizi-frontend/src/subpkg-learning/learn/index.vue`

- [ ] **Step 1: Write the failing test**

This page does not have an existing automated component test harness in the repo context gathered so far, so the failing test for this task is a manual UI verification target.

Failing expectation before implementation:

```text
When currentStep === 'complete', the page still renders:
- a large celebratory emoji as the top visual
- no lightweight completion badge with a check-style symbol
- no secondary guidance line
- the older primary copy "太棒了！你已经学会了「{{ currentChar._id }}」"

This fails the approved spec because the complete screen is still closer to a reward card than a calm in-flow completion page.
```

- [ ] **Step 2: Run the check to verify it fails**

Run: visually inspect the existing `complete` block in `shizi-frontend/src/subpkg-learning/learn/index.vue`

Expected: FAIL because the template is currently:

```vue
<div v-else-if="currentStep === 'complete'" class="complete-screen">
  <div class="complete-icon">
    🎉
  </div>
  <div class="complete-char">
    {{ currentChar._id }}
  </div>
  <div class="complete-desc">
    太棒了！你已经学会了「{{ currentChar._id }}」
  </div>
  <button class="btn-next" @click="nextChar">
    继续学习
  </button>
</div>
```

- [ ] **Step 3: Write minimal implementation**

Replace the existing `complete` block with this template:

```vue
<div v-else-if="currentStep === 'complete'" class="complete-screen">
  <div class="complete-badge" aria-label="已完成">
    <wd-icon name="check" size="20px" />
  </div>
  <div class="complete-char">
    {{ currentChar._id }}
  </div>
  <div class="complete-title">
    你已经学会「{{ currentChar._id }}」啦
  </div>
  <div class="complete-subtitle">
    继续学习下一个字
  </div>
  <button class="btn-next" @click="nextChar">
    继续学习
  </button>
</div>
```

Implementation notes for this task:
- Keep the learned character as the strongest visual element.
- Use `wd-icon name="check"` instead of emoji.
- Keep exactly one primary action button.
- Do not add a secondary CTA.
- Do not change `nextChar()`.

- [ ] **Step 4: Run the check to verify it passes**

Run: re-read the `complete` block in `shizi-frontend/src/subpkg-learning/learn/index.vue`

Expected: PASS with all of the following present in the template:
- `.complete-badge`
- `.complete-char`
- `.complete-title`
- `.complete-subtitle`
- one `继续学习` button wired to `nextChar`
- no `🎉` emoji

- [ ] **Step 5: Commit**

```bash
git add shizi-frontend/src/subpkg-learning/learn/index.vue
git commit -m "feat: redesign final completion step layout"
```

---

### Task 2: Restyle the completion screen to match the approved visual hierarchy

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/learn/index.vue:570-643`
- Test: `shizi-frontend/src/subpkg-learning/learn/index.vue`

- [ ] **Step 1: Write the failing test**

Manual failing expectation before implementation:

```text
The complete-state styles currently make the screen feel too celebratory and not aligned with the approved completion-page spec because:
- the emoji is oversized and dominant
- the character uses the action gold instead of the deep-ink hero treatment
- there is no refined badge styling
- the text hierarchy does not separate primary and secondary messages
- the layout does not clearly read as a spacious in-page completion landing state
```

- [ ] **Step 2: Run the check to verify it fails**

Run: inspect the current completion-state SCSS in `shizi-frontend/src/subpkg-learning/learn/index.vue`

Expected: FAIL because the styles still include the old rules:

```scss
.complete-icon {
  font-size: 160rpx;
  margin-bottom: 24rpx;
}

.complete-char {
  font-size: 200rpx;
  font-weight: 700;
  color: #f5a623;
  font-family: 'KaiTi', 'STKaiti', serif;
  line-height: 1.1;
  margin: 16rpx 0 24rpx;
}

.complete-desc {
  font-size: 28rpx;
  color: #7a6a58;
  margin-bottom: 48rpx;
}
```

- [ ] **Step 3: Write minimal implementation**

Replace the old completion-state styles with this scoped SCSS block:

```scss
.complete-screen {
  min-height: calc(100vh - 320rpx);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48rpx 24rpx 32rpx;
}

.complete-badge {
  width: 72rpx;
  height: 72rpx;
  margin-bottom: 24rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5f7f38;
  background: radial-gradient(circle at 30% 28%, #f7ffe7 0%, #dff5b7 58%, #b8df77 100%);
  box-shadow:
    0 8rpx 16rpx rgba(143, 198, 71, 0.12),
    inset 0 2rpx 0 rgba(255, 255, 255, 0.82);
}

.complete-char {
  font-size: 200rpx;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 24rpx;
  color: #4c3624;
  font-family: 'KaiTi', 'STKaiti', serif;
  text-shadow: 0 8rpx 24rpx rgba(226, 161, 38, 0.12);
}

.complete-title {
  max-width: 520rpx;
  margin-bottom: 16rpx;
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1.4;
  color: #6a5034;
}

.complete-subtitle {
  margin-bottom: 56rpx;
  font-size: 28rpx;
  line-height: 1.4;
  color: #9a8368;
}

.btn-next {
  width: 100%;
  max-width: 420rpx;
  height: 104rpx;
  background: linear-gradient(135deg, #f5a623 0%, #eb9a1a 52%, #e28412 100%);
  border: none;
  border-radius: 56rpx;
  font-size: 38rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
  color: #fff;
  box-shadow: 0 14rpx 30rpx rgba(230, 145, 24, 0.36);
}

.btn-next::after {
  border: none;
}

.btn-next:active {
  transform: translateY(2rpx);
  box-shadow: 0 8rpx 18rpx rgba(230, 145, 24, 0.26);
}
```

Implementation notes for this task:
- Keep layout spacing on 4/8 multiples where it controls layout.
- Make the character the hero, not the badge.
- Keep the button in the existing primary-button family.
- Do not add a heavy card container around the completion state.

- [ ] **Step 4: Run the check to verify it passes**

Run: re-read the completion-state SCSS in `shizi-frontend/src/subpkg-learning/learn/index.vue`

Expected: PASS with all of the following true:
- `.complete-icon` rule removed
- `.complete-desc` rule removed
- `.complete-badge`, `.complete-title`, and `.complete-subtitle` rules present
- `.complete-char` uses deep ink `#4c3624` rather than action gold
- `.complete-screen` uses a spacious page-state layout rather than a celebratory card treatment

- [ ] **Step 5: Commit**

```bash
git add shizi-frontend/src/subpkg-learning/learn/index.vue
git commit -m "feat: restyle final completion screen"
```

---

### Task 3: Verify flow behavior and spec alignment without changing navigation logic

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/learn/index.vue:205-230` (no behavior change expected; verify only)
- Test: `shizi-frontend/src/subpkg-learning/learn/index.vue`

- [ ] **Step 1: Write the failing test**

Manual failing expectation before verification:

```text
If the redesign accidentally changes complete-step behavior, the screen could stop matching the approved interaction spec by:
- introducing a popup or overlay
- adding extra actions
- changing the next-step button away from nextChar()
- breaking the flow from quiz completion into complete state
```

- [ ] **Step 2: Run the check to verify it fails or needs review**

Run: inspect these existing functions in `shizi-frontend/src/subpkg-learning/learn/index.vue`
- `handleQuizComplete(correct: boolean, quizType?: string)`
- `nextChar()`

Expected: review required before closing the task, because the redesign must preserve this logic:

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

- [ ] **Step 3: Write minimal implementation**

Do not change the navigation logic if the code still matches the snippet above.

If the implementation work from Tasks 1-2 accidentally modified these functions, restore them to this exact behavior:

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

Implementation notes for this task:
- No modal, popup, toast, or overlay should be introduced.
- No additional CTA should be introduced.
- The only formal action remains the `继续学习` button.

- [ ] **Step 4: Run the check to verify it passes**

Run: manual in-app verification of the completion flow

Expected: PASS for both paths:
- path A: finish a quiz on a non-final character → enter the redesigned complete screen → tap `继续学习` → move to the next character and reset the flow
- path B: finish a quiz on the final character → enter the redesigned complete screen → tap `继续学习` → navigate to `/subpkg-learning/learn/unit-test?unitId=...`

Also verify:
- no popup appears on completion
- the character is visually dominant
- only one primary CTA is present

- [ ] **Step 5: Commit**

```bash
git add shizi-frontend/src/subpkg-learning/learn/index.vue
git commit -m "test: verify final completion step flow"
```

---

## Self-Review

### Spec coverage
- In-page completion screen, not popup/overlay: covered in Task 1 and Task 3.
- Visual hierarchy with badge → character → primary copy → secondary copy → button: covered in Task 1 and Task 2.
- Learned character remains the hero: covered in Task 1 and Task 2.
- Warm, calm, lightly complete visual language: covered in Task 2.
- Single `继续学习` CTA with existing flow behavior: covered in Task 1 and Task 3.
- Advance to next character or unit-level next experience: covered in Task 3.

### Placeholder scan
- No `TODO`, `TBD`, or “similar to previous task” placeholders remain.
- Every task includes concrete file paths, code blocks, and verification steps.
- Verification is manual because no existing automated test target for this page state was established in the repo context reviewed for this plan.

### Type consistency
- `currentStep === 'complete'`, `currentChar._id`, `handleQuizComplete(correct, quizType?)`, and `nextChar()` match the current file.
- Class names used in Task 1 align with the style rules defined in Task 2.

Plan complete and saved to `docs/superpowers/plans/2026-04-01-final-completion-step-implementation.md`. Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
