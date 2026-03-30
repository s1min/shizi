# Onboarding Skip Strategy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a weak “稍后再选” exit to onboarding so first-time users can enter the product without blocking on explicit library selection while keeping setup as the primary path.

**Architecture:** Keep onboarding as a custom single-step setup page, add a weak top-right skip control, and route both the primary and skip paths through explicit library selection state. The primary path preserves the current save flow, while the skip path reuses the same default library value and goes straight to home without adding a new reminder system.

**Tech Stack:** Vue 3, uni-app, TypeScript, SCSS

---

## File Structure

### Existing files to modify
- `shizi-frontend/src/pages/onboarding/index.vue` — add the top-right “稍后再选” action, reuse the default library state, and implement the skip-to-home behavior.

### Existing files to reference
- `shizi-frontend/src/pages/login/index.vue` — confirms onboarding is entered after login and should not navigate backward like a normal secondary page.
- `shizi-frontend/docs/superpowers/specs/2026-03-30-onboarding-skip-strategy-design.md` — approved design source.

### Validation commands
- `cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec eslint src/pages/onboarding/index.vue`
- `cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec vue-tsc --noEmit`

---

### Task 1: Add a weak top-right skip entry to onboarding

**Files:**
- Modify: `shizi-frontend/src/pages/onboarding/index.vue`
- Test: `shizi-frontend/src/pages/onboarding/index.vue`

- [ ] **Step 1: Add the weak top-right “稍后再选” action to the onboarding template**

```vue
<template>
  <div class="onboarding-container">
    <div class="top-skip-entry" @click="handleSkip">
      稍后再选
    </div>

    <div class="header">
      <div class="step-badge">
        1/1
      </div>
      <div class="title">
        选择学习内容
      </div>
      <div class="subtitle">
        为宝宝选择一个字库开始学习吧
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Add the skip handler and keep the default library stable**

```ts
const selectedId = ref('lib_1a_upper')
const saving = ref(false)

function applySelectedLibrary(libraryId: string) {
  const learnStore = useLearnStore()
  learnStore.currentLibraryId = libraryId
}

function goHome() {
  uni.switchTab({ url: '/pages/home/index' })
}

function handleSkip() {
  applySelectedLibrary(selectedId.value)
  goHome()
}
```

Expected result:
- Skip path uses the current default library value.
- Skip path does not call `updateChild()`.
- Skip path goes straight to `/pages/home/index`.

- [ ] **Step 3: Refactor the confirm path to reuse the same local-library application helper**

```ts
async function handleConfirm() {
  if (!selectedId.value || saving.value)
    return
  saving.value = true
  try {
    await updateChild({ current_library: selectedId.value })
  }
  catch (e) {
    console.warn('保存字库选择失败', e)
  }
  applySelectedLibrary(selectedId.value)
  saving.value = false
  goHome()
}
```

- [ ] **Step 4: Add weak visual styling for the skip action without turning onboarding into a navbar page**

```scss
.onboarding-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff9e6 0%, #ffffff 50%, #fff3e0 100%);
  padding: calc(env(safe-area-inset-top) + 24rpx) 60rpx 80rpx;
  display: flex;
  flex-direction: column;
}

.top-skip-entry {
  align-self: flex-end;
  font-size: 24rpx;
  color: #b7aa96;
  padding: 8rpx 0;
  margin-bottom: 48rpx;
}

.header {
  text-align: center;
  margin-bottom: 80rpx;
}
```

- [ ] **Step 5: Lint the onboarding page**

Run: `cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec eslint src/pages/onboarding/index.vue`
Expected: exit code `0`

- [ ] **Step 6: Manually verify the primary path still works**

Run: launch onboarding, keep the default library selected, tap “开始学习”.
Expected:
- The selected library is applied.
- The page navigates to `/pages/home/index`.
- No new UI element competes visually with the main CTA.

- [ ] **Step 7: Manually verify the skip path**

Run: launch onboarding, tap “稍后再选”.
Expected:
- The page navigates directly to `/pages/home/index`.
- The app still has a usable library context because `lib_1a_upper` remains applied.
- No left-side back arrow or full navbar appears.

- [ ] **Step 8: Commit the onboarding skip behavior**

```bash
git add shizi-frontend/src/pages/onboarding/index.vue
git commit -m "feat: add onboarding skip entry"
```

### Task 2: Run final verification for the onboarding-only scope

**Files:**
- Modify: `shizi-frontend/src/pages/onboarding/index.vue`

- [ ] **Step 1: Run Vue type checking**

Run: `cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec vue-tsc --noEmit`
Expected: exit code `0`

- [ ] **Step 2: Re-check implementation against the approved scope**

Manual checklist:
- Onboarding gained a weak top-right “稍后再选” action only.
- No left-top return arrow was added.
- No standard navbar was introduced.
- The primary “开始学习” path still exists and remains dominant.
- Skip goes to home and still applies the default library.
- No reminder or follow-up system was added.

- [ ] **Step 3: Commit any final polish if verification required small fixes**

```bash
git add shizi-frontend/src/pages/onboarding/index.vue
git commit -m "fix: polish onboarding skip flow"
```

## Self-Review

### Spec coverage
- Weak top-right skip entry: covered by Task 1, Steps 1 and 4.
- No left back arrow / no navbar: covered by Task 1, Step 7 and Task 2, Step 2.
- Skip goes to home: covered by Task 1, Steps 2 and 7.
- Default library fallback (`lib_1a_upper`): covered by Task 1, Steps 2 and 7.
- No reminder system: covered by Task 2, Step 2.

### Placeholder scan
- No `TBD`, `TODO`, or deferred placeholders remain.
- All code-changing steps include concrete code.
- Validation steps include exact commands and explicit manual checks.

### Type consistency
- The helper names are consistently `applySelectedLibrary`, `goHome`, and `handleSkip`.
- The default library remains `lib_1a_upper` throughout the plan.
- The destination route remains `/pages/home/index`.
