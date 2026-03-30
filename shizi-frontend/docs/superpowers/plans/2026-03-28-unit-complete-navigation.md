# Unit Complete Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a lightweight top-left home exit to the `unit-complete` result page while keeping the existing celebration layout and bottom CTA actions primary.

**Architecture:** Keep `unit-complete` outside the standard navbar system and add a small page-local secondary exit control inside the safe area. Reuse the existing home destination used by the page’s bottom CTA, avoid history-based navigation entirely, and leave the result content, sharing flow, and next-unit logic unchanged.

**Tech Stack:** Vue 3, uni-app, TypeScript, SCSS

---

## File Structure

### Modified files
- `shizi-frontend/src/subpkg-learning/learn/unit-complete.vue` — add the lightweight top-left home exit, keep existing result-page layout, and preserve current CTA/share logic.
- `shizi-frontend/docs/superpowers/plans/2026-03-28-unit-complete-navigation.md` — this implementation plan.

### Unchanged but relevant files
- `shizi-frontend/src/pages/home/index.vue` — existing stable tab destination for returning home.
- `shizi-frontend/docs/superpowers/specs/2026-03-28-unit-complete-navigation-design.md` — approved product design for this page.

### Validation commands
- `cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec eslint src/subpkg-learning/learn/unit-complete.vue`
- `cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec vue-tsc --noEmit`

---

### Task 1: Add a lightweight home exit to the result page header area

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/learn/unit-complete.vue`
- Test: `shizi-frontend/src/subpkg-learning/learn/unit-complete.vue`

- [ ] **Step 1: Add the top-left auxiliary exit in the template**

```vue
<template>
  <div class="complete-container">
    <button class="top-home-entry" @click="goHome">
      <text class="top-home-icon">←</text>
      <text class="top-home-text">首页</text>
    </button>

    <div class="stars-area">
      <div
        v-for="i in 3"
        :key="i"
        class="star"
        :class="{ active: i <= stars }"
        :style="{ animationDelay: `${(i - 1) * 0.2}s` }"
      >
        {{ i <= stars ? '⭐' : '☆' }}
      </div>
    </div>

    <!-- existing result content stays unchanged -->
  </div>
</template>
```

- [ ] **Step 2: Add a dedicated home-navigation method that does not use history**

```ts
function goHome() {
  uni.switchTab({ url: '/pages/home/index' })
}

function goNext() {
  if (hasNextUnit.value) {
    const allUnits = learnStore.library.stages.flatMap((s: any) => s.units)
    const idx = allUnits.findIndex((u: any) => u.id === unitId.value)
    const nextUnit = allUnits[idx + 1]
    if (nextUnit) {
      uni.redirectTo({ url: `/subpkg-learning/learn/index?unitId=${nextUnit.id}` })
      return
    }
  }
  goHome()
}
```

- [ ] **Step 3: Add lightweight styling for the auxiliary exit without creating a full navbar**

```scss
.complete-container {
  min-height: 100vh;
  padding: calc(env(safe-area-inset-top) + 24rpx) 32rpx 48rpx;
  background: linear-gradient(180deg, #fff9e6 0%, #ffffff 45%, #fff3e0 100%);
}

.top-home-entry {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  margin-bottom: 32rpx;
  border: none;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.72);
  color: #8c6b1f;
}

.top-home-icon {
  font-size: 24rpx;
  line-height: 1;
}

.top-home-text {
  font-size: 24rpx;
  line-height: 1;
}
```

- [ ] **Step 4: Run lint to verify the page structure and style compile cleanly**

Run: `cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec eslint src/subpkg-learning/learn/unit-complete.vue`
Expected: exit code `0`

- [ ] **Step 5: Commit the page-local auxiliary exit**

```bash
git add shizi-frontend/src/subpkg-learning/learn/unit-complete.vue
git commit -m "feat: add home exit to unit complete page"
```

### Task 2: Verify the result-page behavior stays aligned with the approved design

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/learn/unit-complete.vue`
- Test: `shizi-frontend/src/subpkg-learning/learn/unit-complete.vue`

- [ ] **Step 1: Confirm the page still keeps bottom CTA actions primary**

Manual checklist against the rendered page:
- The top-left `首页` entry is visually lighter than the bottom primary CTA.
- The bottom `下一单元 / 返回首页` button remains the strongest visual action.
- The star area, stats card, char wall, and share actions remain in place.

Expected: the page still reads as a celebration/result screen, not a standard navbar page.

- [ ] **Step 2: Confirm the auxiliary exit always goes to the stable home destination**

Manual flow:
1. Finish a unit and enter `unit-complete`.
2. Tap the top-left `首页` entry.
3. Re-enter `unit-complete` and tap the bottom CTA when it says `返回首页`.

Expected:
- Both actions land on `/pages/home/index`.
- Neither action attempts `navigateBack`.
- No confirmation modal appears.

- [ ] **Step 3: Confirm next-unit flow remains unchanged when another unit exists**

Manual flow:
1. Open `unit-complete` for a unit that is not the last unit.
2. Tap the bottom primary CTA.

Expected:
- The CTA still opens `/subpkg-learning/learn/index?unitId=<nextUnitId>`.
- The new top-left entry does not interfere with the next-unit routing.

- [ ] **Step 4: Run type checking after manual verification**

Run: `cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec vue-tsc --noEmit`
Expected: exit code `0`

- [ ] **Step 5: Commit the verified final result-page behavior**

```bash
git add shizi-frontend/src/subpkg-learning/learn/unit-complete.vue
git commit -m "feat: refine unit complete result page navigation"
```

## Self-Review

### Spec coverage
- Result-page positioning preserved: covered by Task 2, Step 1.
- Bottom CTA remains primary: covered by Task 2, Step 1 and Step 3.
- Lightweight top-left auxiliary exit added: covered by Task 1, Steps 1–3.
- Auxiliary exit always returns home and does not use history: covered by Task 1, Step 2 and Task 2, Step 2.
- No full navbar and no confirmation modal: covered by Task 1, Step 3 and Task 2, Step 2.

### Placeholder scan
- No `TBD`, `TODO`, or deferred placeholders remain.
- Every implementation step includes concrete code or an exact verification procedure.
- Every validation step includes exact commands and expected results.

### Type consistency
- The new auxiliary exit method is consistently named `goHome`.
- Home destination stays `/pages/home/index` in both auxiliary and bottom-home flows.
- `goNext()` remains responsible only for choosing between next-unit routing and home routing.
