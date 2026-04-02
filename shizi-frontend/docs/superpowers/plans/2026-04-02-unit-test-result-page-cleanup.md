# Unit Test Result Page Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean up the unit-test result page so it behaves like a dedicated summary state: no leftover question feedback dock, unified typography/colors, pinyin above wrong-review characters, and `wd-icon` stars.

**Architecture:** Keep all changes inside `src/subpkg-learning/learn/unit-test.vue`. Separate answering-state UI from result-state UI by gating the feedback dock off during `testDone`, then tighten the result-page template and scoped styles so the summary card, wrong-review card, and action area read as one coherent completion screen.

**Tech Stack:** Vue 3 SFC (`<script setup lang="ts">`), TypeScript, Uni App, Wot Design Uni (`wd-icon`), ESLint

---

## File Structure

- Modify: `src/subpkg-learning/learn/unit-test.vue`
  - Gate the feedback dock to the answering state only.
  - Replace text-star rendering with `wd-icon` stars.
  - Reorder wrong-review item content from `character -> pinyin` to `pinyin -> character`.
  - Normalize result-page text hierarchy, spacing, and color usage.
- Read during implementation: `docs/superpowers/specs/2026-04-02-unit-test-result-page-cleanup-design.md`
  - Confirm result-state behavior and visual rules.

### Task 1: Hide the feedback dock on the result page

**Files:**
- Modify: `src/subpkg-learning/learn/unit-test.vue:69-98`
- Test: `src/subpkg-learning/learn/unit-test.vue`

- [ ] **Step 1: Write the failing test**

Use the current template as the failing baseline. The result page bug exists because the feedback dock is rendered whenever `feedbackState !== 'hidden'`, even after the page enters `testDone`.

Current snippet to replace:

```vue
<div v-if="feedbackState !== 'hidden'" class="feedback-dock learning-quiz-feedback-dock">
```

Expected behavior after the fix: the dock must render only while answering questions, not on the finished result screen.

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd "/d/MyDir/shizi/shizi-frontend" && npx eslint "src/subpkg-learning/learn/unit-test.vue"
```

Expected: PASS before edits, confirming the file is stable before changing the gating condition.

- [ ] **Step 3: Write minimal implementation**

Change the feedback dock condition to this exact shape:

```vue
<div v-if="!testDone && feedbackState !== 'hidden'" class="feedback-dock learning-quiz-feedback-dock">
```

Do not change the answering-state feedback structure or its action buttons in this task.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
cd "/d/MyDir/shizi/shizi-frontend" && npx eslint "src/subpkg-learning/learn/unit-test.vue"
```

Expected: PASS with no template errors.

- [ ] **Step 5: Commit**

```bash
cd "/d/MyDir/shizi/shizi-frontend" && git add "src/subpkg-learning/learn/unit-test.vue" && git commit -m "$(cat <<'EOF'
feat: hide question feedback on test result page

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

### Task 2: Replace emoji stars with `wd-icon` stars

**Files:**
- Modify: `src/subpkg-learning/learn/unit-test.vue:105-108`
- Modify: `src/subpkg-learning/learn/unit-test.vue:698-711`
- Test: `src/subpkg-learning/learn/unit-test.vue`

- [ ] **Step 1: Write the failing test**

Use the existing star row as the failing baseline.

Current snippet to replace:

```vue
<div class="result-stars">
  <span v-for="i in 3" :key="i" class="star" :class="{ active: i <= resultStars }">
    {{ i <= resultStars ? '⭐' : '☆' }}
  </span>
</div>
```

Expected behavior after the fix: stars should render via `wd-icon` names `star-filled` and `star`.

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd "/d/MyDir/shizi/shizi-frontend" && npx eslint "src/subpkg-learning/learn/unit-test.vue"
```

Expected: PASS before edits, confirming the current file is valid before swapping the star implementation.

- [ ] **Step 3: Write minimal implementation**

Replace the star template with this exact structure:

```vue
<div class="result-stars">
  <wd-icon
    v-for="i in 3"
    :key="i"
    class="result-star"
    :class="{ active: i <= resultStars }"
    :name="i <= resultStars ? 'star-filled' : 'star'"
    size="36px"
  />
</div>
```

Replace the old `.star` style with this exact shape:

```scss
.result-stars {
  display: flex;
  gap: 20rpx;
  margin-top: 24rpx;
}

.result-star {
  color: rgba(196, 182, 164, 0.88);
}

.result-star.active {
  color: #f5a623;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
cd "/d/MyDir/shizi/shizi-frontend" && npx eslint "src/subpkg-learning/learn/unit-test.vue"
```

Expected: PASS with no template/style lint errors.

- [ ] **Step 5: Commit**

```bash
cd "/d/MyDir/shizi/shizi-frontend" && git add "src/subpkg-learning/learn/unit-test.vue" && git commit -m "$(cat <<'EOF'
feat: use wd-icon stars on unit test result page

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

### Task 3: Reorder wrong-review cards to `pinyin -> character`

**Files:**
- Modify: `src/subpkg-learning/learn/unit-test.vue:150-158`
- Modify: `src/subpkg-learning/learn/unit-test.vue:800-832`
- Test: `src/subpkg-learning/learn/unit-test.vue`

- [ ] **Step 1: Write the failing test**

Use the existing wrong-review markup as the failing baseline.

Current snippet to replace:

```vue
<div v-for="w in wrongList" :key="w.char" class="wrong-char-item">
  <div class="wrong-char">
    {{ w.char }}
  </div>
  <div class="wrong-pinyin">
    {{ w.pinyin }}
  </div>
</div>
```

Expected behavior after the fix: each review item should render pinyin first, then the character card.

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd "/d/MyDir/shizi/shizi-frontend" && npx eslint "src/subpkg-learning/learn/unit-test.vue"
```

Expected: PASS before edits, confirming the file is stable before reordering the review card content.

- [ ] **Step 3: Write minimal implementation**

Replace the wrong-review item markup with this exact structure:

```vue
<div v-for="w in wrongList" :key="w.char" class="wrong-char-item">
  <div class="wrong-pinyin">
    {{ w.pinyin }}
  </div>
  <div class="wrong-char">
    {{ w.char }}
  </div>
</div>
```

Update the supporting styles to this exact shape:

```scss
.wrong-char-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 8rpx;
}

.wrong-pinyin {
  font-size: 20rpx;
  line-height: 1.2;
  color: #9c8b79;
}

.wrong-char {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20rpx;
  border: 2rpx solid rgba(243, 178, 107, 0.48);
  background: rgba(255, 255, 255, 0.92);
  font-size: 44rpx;
  font-family: 'KaiTi', 'STKaiti', serif;
  font-weight: 700;
  color: #333;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
cd "/d/MyDir/shizi/shizi-frontend" && npx eslint "src/subpkg-learning/learn/unit-test.vue"
```

Expected: PASS with no template/style lint errors.

- [ ] **Step 5: Commit**

```bash
cd "/d/MyDir/shizi/shizi-frontend" && git add "src/subpkg-learning/learn/unit-test.vue" && git commit -m "$(cat <<'EOF'
feat: reorder wrong review cards on result page

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

### Task 4: Normalize result-page typography and colors

**Files:**
- Modify: `src/subpkg-learning/learn/unit-test.vue:676-856`
- Test: `src/subpkg-learning/learn/unit-test.vue`

- [ ] **Step 1: Write the failing test**

Use the current style section as the failing baseline. The result-page issue is not broken rendering, but inconsistent hierarchy across title, score, stats, summary text, next-step hint, and wrong-review block.

Key current selectors to tighten:

```scss
.result-title
.result-score
.result-stat-value
.result-stat-label
.result-summary-text
.result-next-hint
.wrong-title
.wrong-desc
```

Expected behavior after the fix: these selectors should use one consistent text hierarchy and color role system.

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd "/d/MyDir/shizi/shizi-frontend" && npx eslint "src/subpkg-learning/learn/unit-test.vue"
```

Expected: PASS before edits, confirming the file is ready for visual cleanup.

- [ ] **Step 3: Write minimal implementation**

Update the result-page styles in `src/subpkg-learning/learn/unit-test.vue` so the selectors below match this exact shape:

```scss
.result-title {
  margin-top: 24rpx;
  font-size: 48rpx;
  line-height: 1.3;
  font-weight: 700;
  color: #4a3728;
}

.result-score {
  margin-top: 16rpx;
  font-size: 36rpx;
  line-height: 1.4;
  font-weight: 700;
  color: #6f5b49;
}

.result-stat-value {
  font-size: 36rpx;
  line-height: 1.2;
  font-weight: 700;
  color: #4a3728;
}

.result-stat-label {
  font-size: 24rpx;
  line-height: 1.4;
  color: #9c8b79;
}

.result-summary-text {
  margin-top: 24rpx;
  font-size: 28rpx;
  line-height: 1.6;
  color: #7f6a56;
}

.result-next-hint {
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.5;
  color: #9c8b79;
}

.wrong-title {
  font-size: 28rpx;
  line-height: 1.4;
  font-weight: 700;
  color: #6f5b49;
}

.wrong-desc {
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 1.5;
  color: #9c8b79;
}
```

Do not change the result-page actions in this task.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
cd "/d/MyDir/shizi/shizi-frontend" && npx eslint "src/subpkg-learning/learn/unit-test.vue"
```

Expected: PASS with no style or unused-code issues.

- [ ] **Step 5: Commit**

```bash
cd "/d/MyDir/shizi/shizi-frontend" && git add "src/subpkg-learning/learn/unit-test.vue" && git commit -m "$(cat <<'EOF'
feat: unify unit test result page typography

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

### Task 5: Verify the cleaned result page end to end

**Files:**
- Modify: `src/subpkg-learning/learn/unit-test.vue` (only if verification exposes an issue)
- Test: `src/subpkg-learning/learn/unit-test.vue`
- Read: `docs/superpowers/specs/2026-04-02-unit-test-result-page-cleanup-design.md`

- [ ] **Step 1: Write the failing test**

Use this manual verification checklist derived directly from the spec:

```md
- result page does not show the question feedback dock
- summary card is the visual center of the page
- star icons render with wd-icon star / star-filled
- wrong-review items show pinyin above the character
- result actions still work for pass and fail states
- answering-state feedback still appears during the question flow
```

- [ ] **Step 2: Run test to verify it fails**

Launch the app and navigate through a unit test until the result page appears:

```bash
cd "/d/MyDir/shizi/shizi-frontend" && pnpm dev:mp-weixin
```

Expected before fix completion: if the feedback dock still appears on the result page, the check FAILS and implementation must continue.

- [ ] **Step 3: Write minimal implementation**

If manual verification exposes a mismatch, keep the final result page aligned with this exact structure:

```vue
<div v-if="!testDone && feedbackState !== 'hidden'" class="feedback-dock learning-quiz-feedback-dock">
```

```vue
<wd-icon
  v-for="i in 3"
  :key="i"
  class="result-star"
  :class="{ active: i <= resultStars }"
  :name="i <= resultStars ? 'star-filled' : 'star'"
  size="36px"
/>
```

```vue
<div class="wrong-pinyin">{{ w.pinyin }}</div>
<div class="wrong-char">{{ w.char }}</div>
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
cd "/d/MyDir/shizi/shizi-frontend" && npx eslint "src/subpkg-learning/learn/unit-test.vue"
```

Then verify in the app:

```bash
cd "/d/MyDir/shizi/shizi-frontend" && pnpm dev:mp-weixin
```

Expected:
- no feedback dock on result page
- feedback dock still works while answering
- stars render via `wd-icon`
- wrong-review order is `pinyin -> character`
- result-page actions and navigation still work

- [ ] **Step 5: Commit**

```bash
cd "/d/MyDir/shizi/shizi-frontend" && git add "src/subpkg-learning/learn/unit-test.vue" && git commit -m "$(cat <<'EOF'
test: verify cleaned unit test result page flow

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

## Self-Review

### Spec coverage
- Hide per-question feedback on result page → Task 1
- Use `wd-icon` stars → Task 2
- Move pinyin above wrong-review characters → Task 3
- Unify typography and colors → Task 4
- Preserve result actions and answering-state feedback → Task 5 verification
- ESLint passes → included in every task verification

### Placeholder scan
- Removed placeholders like TBD/TODO.
- Every task includes exact file paths, code targets, commands, and expected outcomes.

### Type consistency
- The final feedback-dock condition is used consistently in Task 1 and Task 5.
- The `wd-icon` star structure is consistent across Task 2 and Task 5.
- The wrong-review item order (`wrong-pinyin` then `wrong-char`) is consistent across Task 3 and Task 5.
