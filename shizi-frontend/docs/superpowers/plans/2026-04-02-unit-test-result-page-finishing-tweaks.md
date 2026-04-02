# Unit Test Result Page Finishing Tweaks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a final polish pass to the unit-test result page by clarifying module spacing, making wrong-review items feel more like preschool review cards, and softening the star row.

**Architecture:** Keep the page structure unchanged and limit edits to scoped styles in `src/subpkg-learning/learn/unit-test.vue`. Use a small finishing pass on spacing rhythm, wrong-review card density, and active/inactive star tone so the result page reads as a calmer, more supportive summary without changing behavior or content.

**Tech Stack:** Vue 3 SFC (`<script setup lang="ts">`), TypeScript, Uni App, Wot Design Uni (`wd-icon`), ESLint

---

## File Structure

- Modify: `src/subpkg-learning/learn/unit-test.vue`
  - Increase separation between summary, review, and action modules.
  - Tighten the wrong-review item rhythm so each item reads as a compact study card.
  - Soften active/inactive star colors while preserving clear state contrast.
- Read during implementation: `docs/superpowers/specs/2026-04-02-unit-test-result-page-finishing-tweaks-design.md`
  - Confirm the intended finishing scope.

### Task 1: Increase module spacing on the result page

**Files:**
- Modify: `src/subpkg-learning/learn/unit-test.vue:656-776`
- Test: `src/subpkg-learning/learn/unit-test.vue`

- [ ] **Step 1: Write the failing test**

Use the current result-page spacing as the failing baseline.

Current selectors to adjust:

```scss
.result-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 24rpx 24rpx 40rpx;
}
```

```scss
.result-actions {
  width: 100%;
  display: flex;
  gap: 16rpx;
  margin-top: auto;
}
```

Expected behavior after the fix: the summary card, wrong-review card, and action area should feel more clearly separated as distinct modules.

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd "/d/MyDir/shizi/shizi-frontend" && npx eslint "src/subpkg-learning/learn/unit-test.vue"
```

Expected: PASS before edits, confirming the current file is stable.

- [ ] **Step 3: Write minimal implementation**

Update the spacing styles to this exact shape:

```scss
.result-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  padding: 24rpx 24rpx 40rpx;
}
```

```scss
.result-actions {
  width: 100%;
  display: flex;
  gap: 16rpx;
  margin-top: 8rpx;
}
```

Do not add new wrappers or change the page structure in this task.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
cd "/d/MyDir/shizi/shizi-frontend" && npx eslint "src/subpkg-learning/learn/unit-test.vue"
```

Expected: PASS with no style errors.

- [ ] **Step 5: Commit**

```bash
cd "/d/MyDir/shizi/shizi-frontend" && git add "src/subpkg-learning/learn/unit-test.vue" && git commit -m "$(cat <<'EOF'
feat: increase unit test result module spacing

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

### Task 2: Make wrong-review items feel like compact study cards

**Files:**
- Modify: `src/subpkg-learning/learn/unit-test.vue:769-826`
- Test: `src/subpkg-learning/learn/unit-test.vue`

- [ ] **Step 1: Write the failing test**

Use the current wrong-review styles as the failing baseline.

Current selectors to refine:

```scss
.wrong-chars {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 20rpx;
}
```

```scss
.wrong-char-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 8rpx;
}
```

```scss
.wrong-char {
  width: 80rpx;
  height: 80rpx;
  ...
}
```

Expected behavior after the fix: wrong-review items should read more like tidy preschool review cards with steadier density and alignment.

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd "/d/MyDir/shizi/shizi-frontend" && npx eslint "src/subpkg-learning/learn/unit-test.vue"
```

Expected: PASS before edits, confirming the file is ready for refinement.

- [ ] **Step 3: Write minimal implementation**

Update the wrong-review styles to this exact shape:

```scss
.wrong-chars {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx 16rpx;
  margin-top: 24rpx;
}
```

```scss
.wrong-char-item {
  width: 88rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 8rpx;
}
```

```scss
.wrong-pinyin {
  font-size: 20rpx;
  line-height: 1.2;
  color: #9c8b79;
  text-align: center;
}
```

```scss
.wrong-char {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 24rpx;
  border: 2rpx solid rgba(243, 178, 107, 0.4);
  background: rgba(255, 255, 255, 0.96);
  font-size: 48rpx;
  font-family: 'KaiTi', 'STKaiti', serif;
  font-weight: 700;
  color: #333;
  box-shadow: 0 6rpx 12rpx rgba(226, 188, 112, 0.08);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
cd "/d/MyDir/shizi/shizi-frontend" && npx eslint "src/subpkg-learning/learn/unit-test.vue"
```

Expected: PASS with no style errors.

- [ ] **Step 5: Commit**

```bash
cd "/d/MyDir/shizi/shizi-frontend" && git add "src/subpkg-learning/learn/unit-test.vue" && git commit -m "$(cat <<'EOF'
feat: refine wrong review card density on result page

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

### Task 3: Soften the star row without reducing clarity

**Files:**
- Modify: `src/subpkg-learning/learn/unit-test.vue:686-698`
- Test: `src/subpkg-learning/learn/unit-test.vue`

- [ ] **Step 1: Write the failing test**

Use the current star colors as the failing baseline.

Current selectors to soften:

```scss
.result-star {
  color: rgba(196, 182, 164, 0.88);
}

.result-star.active {
  color: #f5a623;
}
```

Expected behavior after the fix: inactive stars should be quieter and active stars should remain warm while feeling less sharp.

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd "/d/MyDir/shizi/shizi-frontend" && npx eslint "src/subpkg-learning/learn/unit-test.vue"
```

Expected: PASS before edits, confirming the file is stable before softening the star tone.

- [ ] **Step 3: Write minimal implementation**

Update the star styles to this exact shape:

```scss
.result-star {
  color: rgba(208, 198, 184, 0.68);
}

.result-star.active {
  color: #efb347;
}
```

Do not change icon size, count, or position in this task.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
cd "/d/MyDir/shizi/shizi-frontend" && npx eslint "src/subpkg-learning/learn/unit-test.vue"
```

Expected: PASS with no style errors.

- [ ] **Step 5: Commit**

```bash
cd "/d/MyDir/shizi/shizi-frontend" && git add "src/subpkg-learning/learn/unit-test.vue" && git commit -m "$(cat <<'EOF'
feat: soften unit test result stars

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

### Task 4: Verify the finishing pass end to end

**Files:**
- Modify: `src/subpkg-learning/learn/unit-test.vue` (only if verification exposes an issue)
- Test: `src/subpkg-learning/learn/unit-test.vue`
- Read: `docs/superpowers/specs/2026-04-02-unit-test-result-page-finishing-tweaks-design.md`

- [ ] **Step 1: Write the failing test**

Use this manual verification checklist derived directly from the spec:

```md
- summary card remains the clear visual center
- spacing between summary, review, and actions is more explicit
- wrong-review items feel like compact review cards, not loose tags
- pinyin and characters remain easy to scan
- 0-star and 1-star outcomes look softer than before
- result actions still work and no structure regresses
```

- [ ] **Step 2: Run test to verify it fails**

Launch the app and navigate to the result page:

```bash
cd "/d/MyDir/shizi/shizi-frontend" && pnpm dev:mp-weixin
```

Expected before fix completion: if the result-page modules still feel visually collapsed or the star row still feels too harsh, the check FAILS and implementation must continue.

- [ ] **Step 3: Write minimal implementation**

If manual verification exposes a mismatch, keep the final styles aligned with these exact targets:

```scss
.result-page {
  gap: 32rpx;
}
```

```scss
.wrong-char-item {
  width: 88rpx;
}
```

```scss
.wrong-char {
  width: 88rpx;
  height: 88rpx;
  border-radius: 24rpx;
}
```

```scss
.result-star.active {
  color: #efb347;
}
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
- clearer module separation
- calmer star row
- tidier wrong-review cards
- result-page behavior unchanged

- [ ] **Step 5: Commit**

```bash
cd "/d/MyDir/shizi/shizi-frontend" && git add "src/subpkg-learning/learn/unit-test.vue" && git commit -m "$(cat <<'EOF'
test: verify unit test result finishing pass

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

## Self-Review

### Spec coverage
- Strengthen spacing rhythm → Task 1
- Make wrong-review items feel more card-like → Task 2
- Soften star tone → Task 3
- Preserve structure, copy, and behavior → Task 4 verification
- ESLint passes → included in every task verification

### Placeholder scan
- Removed placeholders like TBD/TODO.
- Every task includes exact file paths, code targets, commands, and expected outcomes.

### Type consistency
- Spacing targets are consistent between Task 1 and Task 4.
- Wrong-review width and size targets are consistent between Task 2 and Task 4.
- Star color targets are consistent between Task 3 and Task 4.
