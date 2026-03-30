# Login Page Back Arrow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a weak top-left back arrow to the login page so users can leave intuitively without competing with the login conversion flow.

**Architecture:** Keep the current login page layout and reuse the existing `goBack()` logic instead of introducing a new navigation helper or another exit path. Add a single lightweight icon-only control in the top-left safe area, style it to stay visually secondary, and leave the bottom “暂不登录” action unchanged.

**Tech Stack:** Vue 3, uni-app, TypeScript, SCSS

---

## File Structure

### Existing files to modify
- `shizi-frontend/src/pages/login/index.vue` — add the top-left back arrow, keep `goBack()` as the single navigation handler, and add styles so the control stays weak in the visual hierarchy.

### Existing files to reference
- `shizi-frontend/docs/superpowers/specs/2026-03-30-login-back-entry-design.md` — approved design source.
- `shizi-frontend/src/pages/me/index.vue` — confirms login can be entered from secondary flows, so back-first behavior must remain intact.

### Validation commands
- `cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec eslint src/pages/login/index.vue`
- `cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec vue-tsc --noEmit`

---

### Task 1: Add a weak top-left back arrow to the login page

**Files:**
- Modify: `shizi-frontend/src/pages/login/index.vue`
- Test: `shizi-frontend/src/pages/login/index.vue`

- [ ] **Step 1: Add the icon-only back entry at the top of the login page**

```vue
<template>
  <div class="login-container">
    <button class="top-back-entry" @click="goBack">
      <text class="top-back-icon">←</text>
    </button>

    <div class="logo-area">
      <div class="logo-icon">
        趣
      </div>
      <div class="app-name">
        趣字宝
      </div>
      <div class="app-desc">
        让识字变得有趣
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Keep the navigation behavior unified through the existing `goBack()` function**

```ts
function handleSkip() {
  goBack()
}

function goBack() {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  }
  else {
    uni.switchTab({ url: '/pages/home/index' })
  }
}
```

Expected result:
- The new top-left arrow and the existing “暂不登录” action both use the same back-first behavior.
- No extra logic branch is introduced for the arrow.

- [ ] **Step 3: Add weak visual styling for the arrow without creating a navbar**

```scss
.login-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff9e6 0%, #ffffff 50%, #fff3e0 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: calc(env(safe-area-inset-top) + 24rpx) 60rpx 80rpx;
}

.top-back-entry {
  align-self: flex-start;
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 80rpx;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.06);
  color: #8a8174;
}

.top-back-icon {
  font-size: 32rpx;
  line-height: 1;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 120rpx;
}
```

- [ ] **Step 4: Lint the login page**

Run: `cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec eslint src/pages/login/index.vue`
Expected: exit code `0`

- [ ] **Step 5: Manually verify standard back behavior**

Run: launch the app, enter [src/pages/login/index.vue](../../src/pages/login/index.vue) from another page such as [src/pages/me/index.vue](../../src/pages/me/index.vue), then tap the new top-left arrow.
Expected: returns to the previous page instead of forcing a jump to home.

- [ ] **Step 6: Manually verify fallback behavior on direct entry**

Run: launch the login route directly without a previous page in the stack, then tap the new top-left arrow.
Expected: navigates to `/pages/home/index` instead of doing nothing.

- [ ] **Step 7: Manually verify conversion emphasis remains intact**

Manual checklist:
- The top-left arrow is visible but weaker than the main login CTA.
- The bottom “暂不登录” remains present.
- No full navbar/header is introduced.
- The logo area still reads as the main visual focus.

- [ ] **Step 8: Commit the login-page navigation enhancement**

```bash
git add shizi-frontend/src/pages/login/index.vue
git commit -m "feat: add login page back arrow"
```

### Task 2: Run final verification for the login-only scope

**Files:**
- Modify: `shizi-frontend/src/pages/login/index.vue`

- [ ] **Step 1: Run Vue type checking**

Run: `cd "/d/MyDir/shizi/shizi-frontend" && pnpm exec vue-tsc --noEmit`
Expected: exit code `0`

- [ ] **Step 2: Re-check implementation against the approved scope**

Manual checklist:
- The login page gained a weak top-left arrow only.
- The arrow has no text label.
- The bottom “暂不登录” still exists.
- `goBack()` remains the only navigation handler.
- No onboarding or post-login flow changed.

- [ ] **Step 3: Commit any final polish if verification required small fixes**

```bash
git add shizi-frontend/src/pages/login/index.vue
git commit -m "fix: polish login page back arrow"
```

## Self-Review

### Spec coverage
- Weak top-left arrow only: covered by Task 1, Steps 1 and 3.
- Reuse existing back-first behavior: covered by Task 1, Step 2.
- Keep “暂不登录”: covered by Task 1, Step 7 and Task 2, Step 2.
- Avoid navbar/flow rewrites: covered by Task 1, Step 7 and Task 2, Step 2.

### Placeholder scan
- No `TBD`, `TODO`, or deferred placeholders remain.
- All code-changing steps include concrete code.
- Validation steps include exact commands and explicit manual checks.

### Type consistency
- The handler name remains `goBack` throughout the plan.
- The new control class names are consistently `top-back-entry` and `top-back-icon`.
- The fallback route remains `/pages/home/index`.
