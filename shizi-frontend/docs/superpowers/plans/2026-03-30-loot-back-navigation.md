# Loot Page Back Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a lightweight back entry to the loot page hero so users can leave the page reliably without losing the existing visual style.

**Architecture:** Reuse the existing safe-back navigation helper instead of introducing a second navigation pattern. Keep the loot page hero layout, add a small top-left back control inside the hero, and wire it to "back if possible, otherwise go to Me" so the page behaves like a standard secondary functional page while preserving its custom look.

**Tech Stack:** Vue 3, uni-app, TypeScript, SCSS

---

## File Structure

### Existing files to modify
- `shizi-frontend/src/pages/loot/index.vue` — add the hero back control, import the safe-back helper, and style the control inside the hero area.
- `shizi-frontend/src/utils/navigation.ts` — reuse as-is unless a tiny helper refinement is required during implementation.

### Existing files to reference
- `shizi-frontend/src/pages/me/index.vue` — confirms the loot page's primary source entry.
- `shizi-frontend/docs/superpowers/specs/2026-03-30-loot-navigation-review-design.md` — approved design source.

### Validation commands
- `cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec eslint src/pages/loot/index.vue src/utils/navigation.ts`
- `cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec vue-tsc --noEmit`

---

### Task 1: Add a hero-level back control to the loot page

**Files:**
- Modify: `shizi-frontend/src/pages/loot/index.vue`
- Reference: `shizi-frontend/src/utils/navigation.ts`
- Test: `shizi-frontend/src/pages/loot/index.vue`

- [ ] **Step 1: Add the back entry to the top of the hero block**

```vue
<template>
  <div class="page-container">
    <div class="hero">
      <button class="hero-back" @click="handleBack">
        <text class="hero-back-icon">←</text>
        <text class="hero-back-text">返回</text>
      </button>

      <div class="hero-title">
        汉字图鉴
      </div>
      <div class="hero-stats">
        已收集 {{ learnedChars.length }} / {{ totalCharCount }} 个汉字
      </div>
      <div class="hero-progress">
        <div class="hero-progress-bg">
          <div class="hero-progress-fill" :style="{ width: `${collectionPercent}%` }" />
        </div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Wire the new control to the existing safe-back helper**

```ts
<script lang="ts" setup>
import type { Character } from '@/types/character'
import { computed, ref } from 'vue'
import { useLearnStore } from '@/store'
import { navigateBackOrTo } from '@/utils/navigation'

definePage({
  style: {
    navigationBarTitleText: '图鉴',
    navigationStyle: 'custom',
  },
})

function handleBack() {
  navigateBackOrTo('/pages/me/index', true)
}
</script>
```

- [ ] **Step 3: Style the back control inside the hero without turning it into a full navbar**

```scss
.hero {
  background: linear-gradient(135deg, #f5a623, #e8941a);
  padding: calc(env(safe-area-inset-top) + 24rpx) 40rpx 60rpx;
  color: #fff;
}

.hero-back {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  margin-bottom: 28rpx;
  border: none;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.hero-back-icon {
  font-size: 24rpx;
  line-height: 1;
}

.hero-back-text {
  font-size: 24rpx;
  line-height: 1;
}
```

- [ ] **Step 4: Lint the loot page**

Run: `cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec eslint src/pages/loot/index.vue src/utils/navigation.ts`
Expected: exit code `0`

- [ ] **Step 5: Manually verify normal back behavior from the Me page**

Run: launch the app, open [src/pages/me/index.vue](../../src/pages/me/index.vue), tap into the loot page, then tap the new hero back entry.
Expected: returns to the previous page (`/pages/me/index`) instead of staying on loot.

- [ ] **Step 6: Manually verify fallback behavior on direct entry**

Run: launch the loot route directly without a prior page in the stack, then tap the new hero back entry.
Expected: navigates to `/pages/me/index` via fallback instead of failing silently.

- [ ] **Step 7: Commit the loot navigation change**

```bash
git add shizi-frontend/src/pages/loot/index.vue
git commit -m "feat: add hero back entry to loot page"
```

### Task 2: Run final verification for the approved loot-only scope

**Files:**
- Modify: `shizi-frontend/src/pages/loot/index.vue`
- Reference: `shizi-frontend/src/utils/navigation.ts`

- [ ] **Step 1: Run full type checking**

Run: `cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec vue-tsc --noEmit`
Expected: exit code `0`

- [ ] **Step 2: Re-check the approved scope against the implementation**

Manual checklist:
- The loot page still keeps its hero visual style.
- The new control is inside the hero, not a separate standard navbar.
- The control uses back semantics, not close/exit semantics.
- The action is `back if possible, else Me page`.
- No login or onboarding behavior changed.

- [ ] **Step 3: Commit any final polish if verification required small code fixes**

```bash
git add shizi-frontend/src/pages/loot/index.vue shizi-frontend/src/utils/navigation.ts
git commit -m "fix: polish loot back navigation"
```

## Self-Review

### Spec coverage
- Highest-priority remaining navigation gap (`loot`) is covered by Task 1.
- Hero-preserving design is covered by Task 1, Steps 1 and 3.
- `back if possible, else Me page` behavior is covered by Task 1, Step 2.
- Explicitly avoiding login/onboarding scope creep is covered by Task 2, Step 2.

### Placeholder scan
- No `TBD`, `TODO`, or deferred implementation placeholders remain.
- All code-changing steps include concrete code.
- All verification steps include exact commands or explicit manual checks.

### Type consistency
- The helper name is consistently `navigateBackOrTo`.
- The loot page click handler is consistently `handleBack`.
- The fallback route is consistently `/pages/me/index`.
