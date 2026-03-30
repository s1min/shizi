# Secondary Page Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add consistent in-page back navigation for standard secondary pages and keep task-specific close behavior for immersive learning flows.

**Architecture:** Introduce one reusable secondary-page navbar component for content-style pages, wire it into the agreement and privacy pages first, and add a small navigation helper so back actions gracefully fall back when no history stack is available. For immersive pages, keep custom headers and only align close/exit behavior where the current flow already uses task-specific controls.

**Tech Stack:** Vue 3, uni-app, TypeScript, SCSS, wot-design-uni

---

## File Structure

### New files
- `shizi-frontend/src/components/navigation/SecondaryPageNavbar.vue` — reusable top navbar wrapper for standard secondary pages using wot-ui.
- `shizi-frontend/src/utils/navigation.ts` — shared helper for safe back navigation with fallback routing.
- `shizi-frontend/docs/superpowers/plans/2026-03-28-secondary-page-navigation.md` — this implementation plan.

### Modified files
- `shizi-frontend/src/pages/agreement/index.vue` — replace bare content page top with reusable navbar and safe back action.
- `shizi-frontend/src/pages/privacy/index.vue` — same as agreement page.
- `shizi-frontend/src/subpkg-learning/learn/unit-complete.vue` — verify this remains a result page and leave current next/home CTA structure unchanged unless a close affordance is needed during review.
- `shizi-frontend/src/subpkg-learning/learn/unit-test.vue` — keep custom task header, verify close action uses task-specific exit behavior and stable destination.
- `shizi-frontend/src/subpkg-learning/review/index.vue` — keep custom task header, verify close action remains task-specific and stable.

### Validation commands
- `cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec eslint src/pages/agreement/index.vue src/pages/privacy/index.vue src/components/navigation/SecondaryPageNavbar.vue src/utils/navigation.ts`
- `cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec vue-tsc --noEmit`

---

### Task 1: Add a shared safe-back navigation helper

**Files:**
- Create: `shizi-frontend/src/utils/navigation.ts`
- Test: `shizi-frontend/src/pages/agreement/index.vue`

- [ ] **Step 1: Write the helper file with explicit fallback behavior**

```ts
export function canNavigateBack() {
  const pages = getCurrentPages()
  return pages.length > 1
}

export function navigateBackOrTo(url: string, isTab = false) {
  if (canNavigateBack()) {
    uni.navigateBack()
    return
  }

  if (isTab) {
    uni.switchTab({ url })
    return
  }

  uni.redirectTo({ url })
}
```

- [ ] **Step 2: Verify the helper matches existing uni-app navigation APIs used in this repo**

Run: `cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec eslint src/utils/navigation.ts`
Expected: exit code `0`

- [ ] **Step 3: Commit the helper**

```bash
git add shizi-frontend/src/utils/navigation.ts
git commit -m "feat: add safe secondary page navigation helper"
```

### Task 2: Create a reusable standard secondary-page navbar

**Files:**
- Create: `shizi-frontend/src/components/navigation/SecondaryPageNavbar.vue`
- Modify: `shizi-frontend/src/utils/navigation.ts`
- Test: `shizi-frontend/src/components/navigation/SecondaryPageNavbar.vue`

- [ ] **Step 1: Create the reusable navbar component**

```vue
<template>
  <view class="secondary-page-navbar">
    <wd-navbar
      :title="title"
      left-arrow
      safe-area-inset-top
      @click-left="handleBack"
    />
  </view>
</template>

<script lang="ts" setup>
import { navigateBackOrTo } from '@/utils/navigation'

const props = withDefaults(defineProps<{
  title: string
  fallbackUrl: string
  fallbackIsTab?: boolean
}>(), {
  fallbackIsTab: false,
})

function handleBack() {
  navigateBackOrTo(props.fallbackUrl, props.fallbackIsTab)
}
</script>

<style lang="scss" scoped>
.secondary-page-navbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
}
</style>
```

- [ ] **Step 2: Lint the new component**

Run: `cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec eslint src/components/navigation/SecondaryPageNavbar.vue src/utils/navigation.ts`
Expected: exit code `0`

- [ ] **Step 3: Commit the component**

```bash
git add shizi-frontend/src/components/navigation/SecondaryPageNavbar.vue shizi-frontend/src/utils/navigation.ts
git commit -m "feat: add reusable secondary page navbar"
```

### Task 3: Apply the standard navbar to the agreement page

**Files:**
- Modify: `shizi-frontend/src/pages/agreement/index.vue`
- Create: `shizi-frontend/src/components/navigation/SecondaryPageNavbar.vue`
- Test: `shizi-frontend/src/pages/agreement/index.vue`

- [ ] **Step 1: Replace the top of the agreement page with the shared navbar**

```vue
<template>
  <div class="page-container">
    <SecondaryPageNavbar
      title="用户协议"
      fallback-url="/pages/me/index"
      :fallback-is-tab="true"
    />

    <div class="content">
      <div class="title">
        趣字宝用户协议
      </div>
      <div class="update-date">
        更新日期：2026年3月10日
      </div>
      <!-- existing sections stay unchanged -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import SecondaryPageNavbar from '@/components/navigation/SecondaryPageNavbar.vue'

definePage({
  style: {
    navigationBarTitleText: '用户协议',
    navigationStyle: 'custom',
  },
})
</script>
```

- [ ] **Step 2: Adjust page spacing so content sits correctly under the navbar**

```scss
.page-container {
  min-height: 100vh;
  background: #fff;
}

.content {
  padding: 24rpx 40rpx 40rpx;
}
```

- [ ] **Step 3: Lint the agreement page**

Run: `cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec eslint src/pages/agreement/index.vue`
Expected: exit code `0`

- [ ] **Step 4: Manually verify fallback behavior from direct entry and from the Me page**

Run: launch the app, open the agreement page from [src/pages/me/index.vue](../../src/pages/me/index.vue) if available, then separately open the agreement route directly.
Expected:
- From a normal navigation path, tapping back returns to the previous page.
- From a direct entry path with no stack, tapping back goes to `/pages/me/index`.

- [ ] **Step 5: Commit the agreement page update**

```bash
git add shizi-frontend/src/pages/agreement/index.vue
git commit -m "feat: add standard navbar to agreement page"
```

### Task 4: Apply the standard navbar to the privacy page

**Files:**
- Modify: `shizi-frontend/src/pages/privacy/index.vue`
- Test: `shizi-frontend/src/pages/privacy/index.vue`

- [ ] **Step 1: Replace the top of the privacy page with the shared navbar**

```vue
<template>
  <div class="page-container">
    <SecondaryPageNavbar
      title="隐私政策"
      fallback-url="/pages/me/index"
      :fallback-is-tab="true"
    />

    <div class="content">
      <div class="title">
        趣字宝隐私政策
      </div>
      <div class="update-date">
        更新日期：2026年3月10日
      </div>
      <!-- existing sections stay unchanged -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import SecondaryPageNavbar from '@/components/navigation/SecondaryPageNavbar.vue'

definePage({
  style: {
    navigationBarTitleText: '隐私政策',
    navigationStyle: 'custom',
  },
})
</script>
```

- [ ] **Step 2: Align the content spacing with the agreement page**

```scss
.page-container {
  min-height: 100vh;
  background: #fff;
}

.content {
  padding: 24rpx 40rpx 40rpx;
}
```

- [ ] **Step 3: Lint the privacy page**

Run: `cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec eslint src/pages/privacy/index.vue`
Expected: exit code `0`

- [ ] **Step 4: Manually verify fallback behavior from direct entry and from the Me page**

Run: launch the app, open the privacy page from [src/pages/me/index.vue](../../src/pages/me/index.vue) if available, then separately open the privacy route directly.
Expected:
- From a normal navigation path, tapping back returns to the previous page.
- From a direct entry path with no stack, tapping back goes to `/pages/me/index`.

- [ ] **Step 5: Commit the privacy page update**

```bash
git add shizi-frontend/src/pages/privacy/index.vue
git commit -m "feat: add standard navbar to privacy page"
```

### Task 5: Confirm immersive pages keep task-specific close behavior

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/learn/unit-test.vue`
- Modify: `shizi-frontend/src/subpkg-learning/review/index.vue`
- Modify: `shizi-frontend/src/subpkg-learning/learn/unit-complete.vue`
- Modify: `shizi-frontend/src/utils/navigation.ts`
- Test: `shizi-frontend/src/subpkg-learning/learn/unit-test.vue`
- Test: `shizi-frontend/src/subpkg-learning/review/index.vue`
- Test: `shizi-frontend/src/subpkg-learning/learn/unit-complete.vue`

- [ ] **Step 1: Update `unit-test` close behavior only if direct-entry fallback is missing**

```ts
function handleClose() {
  uni.showModal({
    title: '确定退出吗？',
    content: '当前测试进度不会保留，建议完成后再退出',
    success: (res) => {
      if (res.confirm) {
        navigateBackOrTo('/pages/home/index', true)
      }
    },
  })
}
```

- [ ] **Step 2: Keep `review` as an immersive page and leave its custom header intact**

```ts
function handleClose() {
  uni.showModal({
    title: '确定退出吗？',
    content: '已复习的进度已保存',
    success: (res) => {
      if (res.confirm) {
        goBack()
      }
    },
  })
}

function goBack() {
  navigateBackOrTo('/pages/home/index', true)
}
```

- [ ] **Step 3: Review `unit-complete` and keep it in the task-result family unless product review says otherwise**

```ts
definePage({
  style: {
    navigationBarTitleText: '学习完成',
    navigationStyle: 'custom',
  },
})
```

Expected review result:
- `unit-complete` remains a completion/result screen with primary CTA buttons.
- No standard navbar is added in this task unless UX review reveals a missing escape route.

- [ ] **Step 4: Lint the immersive pages after any minimal edits**

Run: `cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec eslint src/subpkg-learning/learn/unit-test.vue src/subpkg-learning/review/index.vue src/subpkg-learning/learn/unit-complete.vue src/utils/navigation.ts`
Expected: exit code `0`

- [ ] **Step 5: Manually verify the immersive flows**

Run: launch the app and enter learning test, review, and unit-complete flows.
Expected:
- `unit-test` still presents task progress and a close-style exit, not a standard navbar.
- `review` still presents task progress and a close-style exit, not a standard navbar.
- `unit-complete` still uses result-page CTAs and does not regress navigation.

- [ ] **Step 6: Commit the immersive-page confirmation work**

```bash
git add shizi-frontend/src/subpkg-learning/learn/unit-test.vue shizi-frontend/src/subpkg-learning/review/index.vue shizi-frontend/src/subpkg-learning/learn/unit-complete.vue shizi-frontend/src/utils/navigation.ts
git commit -m "feat: preserve immersive navigation patterns"
```

### Task 6: Run final verification for the full navigation change

**Files:**
- Modify: `shizi-frontend/src/components/navigation/SecondaryPageNavbar.vue`
- Modify: `shizi-frontend/src/utils/navigation.ts`
- Modify: `shizi-frontend/src/pages/agreement/index.vue`
- Modify: `shizi-frontend/src/pages/privacy/index.vue`
- Modify: `shizi-frontend/src/subpkg-learning/learn/unit-test.vue`
- Modify: `shizi-frontend/src/subpkg-learning/review/index.vue`
- Modify: `shizi-frontend/src/subpkg-learning/learn/unit-complete.vue`

- [ ] **Step 1: Run lint on the full change set**

Run: `cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec eslint src/components/navigation/SecondaryPageNavbar.vue src/utils/navigation.ts src/pages/agreement/index.vue src/pages/privacy/index.vue src/subpkg-learning/learn/unit-test.vue src/subpkg-learning/review/index.vue src/subpkg-learning/learn/unit-complete.vue`
Expected: exit code `0`

- [ ] **Step 2: Run type checking**

Run: `cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec vue-tsc --noEmit`
Expected: exit code `0`

- [ ] **Step 3: Do final manual QA against the approved spec**

Manual checklist:
- Agreement page uses a standard top navbar and back action with fallback.
- Privacy page uses a standard top navbar and back action with fallback.
- Learning/test/review flows keep custom close/exit behavior instead of a generic navbar.
- No page returns to a blank screen when entered directly.

- [ ] **Step 4: Commit the verified end-to-end change**

```bash
git add shizi-frontend/src/components/navigation/SecondaryPageNavbar.vue shizi-frontend/src/utils/navigation.ts shizi-frontend/src/pages/agreement/index.vue shizi-frontend/src/pages/privacy/index.vue shizi-frontend/src/subpkg-learning/learn/unit-test.vue shizi-frontend/src/subpkg-learning/review/index.vue shizi-frontend/src/subpkg-learning/learn/unit-complete.vue
git commit -m "feat: improve secondary page navigation"
```

## Self-Review

### Spec coverage
- Standard secondary pages with top navbar: covered by Tasks 2, 3, and 4.
- Agreement and privacy as first rollout pages: covered by Tasks 3 and 4.
- Immersive learning/test/review pages keep task-specific exit behavior: covered by Task 5.
- Fallback behavior when no history stack exists: covered by Tasks 1, 2, 3, 4, and 5.

### Placeholder scan
- No `TBD`, `TODO`, or deferred implementation placeholders remain.
- Each code-changing task includes concrete code blocks.
- Each validation step includes exact commands and expected results.

### Type consistency
- Shared helper is consistently named `navigateBackOrTo`.
- Shared navbar props consistently use `title`, `fallbackUrl`, and `fallbackIsTab`.
- Immersive pages continue using `handleClose` and task-specific copy.
