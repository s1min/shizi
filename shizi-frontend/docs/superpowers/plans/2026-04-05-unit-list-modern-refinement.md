# Unit List Modern Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finalize the unit-list page by removing the temporary cream theme and refining the modern theme’s navbar, summary card, unit cards, buttons, and list rhythm into a stable production-ready UI.

**Architecture:** Keep the existing component structure and business data flow intact, but collapse the temporary theme-preview system into a single permanent modern theme. Refine visual hierarchy in place inside `index.vue`, `LibrarySummaryCard.vue`, `UnitTaskCard.vue`, and `UnitStageSection.vue` by tightening spacing, reducing visual noise, and rebalancing typography, surfaces, and button emphasis.

**Tech Stack:** Vue 3 `<script setup>`, uni-app, Wot Design components, SCSS, existing unit-list page view-models.

---

## File map

### Modify
- `src/pages/unit-list/index.vue`
  - Remove `previewTheme` and `pageThemeClass`.
  - Remove cream-theme defaults and `.theme-modern` overrides.
  - Promote modern variables to the default page theme.
  - Refine the fixed top shell background, page background, and section spacing.
- `src/pages/unit-list/components/LibrarySummaryCard.vue`
  - Remove cream-vs-modern branching selectors.
  - Tighten card height and spacing.
  - Reduce switch-library button visual weight.
  - Lighten the stats blocks.
- `src/pages/unit-list/components/UnitTaskCard.vue`
  - Reduce badge weight and integrate it more tightly with the card head.
  - Lighten progress strips and overall card treatment.
  - Tighten footer spacing.
  - Make secondary and primary buttons more product-like and less promotional.
- `src/pages/unit-list/components/UnitStageSection.vue`
  - Tighten section spacing and remove theme-specific accent branching.

### Verify manually
- `src/pages/unit-list/useUnitListPage.ts`
  - No change expected; keep only if visual edits appear to require new data.

---

### Task 1: Collapse the page to a single modern theme

**Files:**
- Modify: `src/pages/unit-list/index.vue`

- [ ] **Step 1: Remove the temporary theme-preview state from the page script**

In `src/pages/unit-list/index.vue`, delete these lines:

```ts
const previewTheme = 'modern'
const pageThemeClass = `theme-${previewTheme}`
```

And change the root template node from:

```vue
<view class="unit-page" :class="pageThemeClass">
```

to:

```vue
<view class="unit-page">
```

- [ ] **Step 2: Promote the modern theme variables to the default page variables**

Replace the top of the style block in `src/pages/unit-list/index.vue` with:

```scss
.unit-page {
  --page-bg: #fbfcff;
  --page-bg-accent: rgba(91, 141, 239, 0.08);
  --surface-card: rgba(255, 255, 255, 0.96);
  --surface-card-strong: #ffffff;
  --text-main: #24324a;
  --text-sub: #6e7b91;
  --text-muted: #96a1b3;
  --line-soft: rgba(214, 223, 236, 0.88);
  --shadow-card: 0 10rpx 24rpx rgba(41, 72, 126, 0.06);
  --shadow-soft: 0 6rpx 16rpx rgba(41, 72, 126, 0.04);
  --brand-primary: #5b84e8;
  --brand-primary-soft: rgba(91, 132, 232, 0.1);
  --tone-learning: #5b84e8;
  --tone-ready: #f0a63a;
  --tone-tested: #58b782;
  --tone-wrong: #ea7a59;
  min-height: 100vh;
  background:
    radial-gradient(circle at 0% 0%, var(--page-bg-accent) 0%, rgba(255, 255, 255, 0) 28%),
    linear-gradient(180deg, #f9fbff 0%, var(--page-bg) 22%, #ffffff 100%);
}
```

Then delete the entire old override block:

```scss
.unit-page.theme-modern {
  ...
}
```

- [ ] **Step 3: Refine the top shell to look cleaner and more layered**

Still in `src/pages/unit-list/index.vue`, replace the top shell styles with:

```scss
.page-top-shell {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  padding-bottom: 12rpx;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(248, 251, 255, 0.96) 62%,
    rgba(244, 248, 255, 0.94) 100%
  );
  backdrop-filter: blur(16rpx);
  box-shadow: 0 4rpx 12rpx rgba(36, 50, 74, 0.04);
}

.page-top-shell::after {
  content: '';
  position: absolute;
  left: 24rpx;
  right: 24rpx;
  bottom: 0;
  height: 2rpx;
  background: rgba(214, 223, 236, 0.7);
  border-radius: 999rpx;
}

.page-body {
  padding: 168rpx 24rpx calc(40rpx + env(safe-area-inset-bottom));
}
```

- [ ] **Step 4: Tighten remaining page-level spacing to match the refined list rhythm**

Update these blocks in `src/pages/unit-list/index.vue`:

```scss
.inline-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80rpx 32rpx;
  border-radius: 24rpx;
  background: var(--surface-card);
  box-shadow: var(--shadow-soft);
  text-align: center;
}

.wrong-group {
  margin-bottom: 24rpx;
}

.wrong-focus-banner {
  padding: 20rpx 24rpx;
  margin-bottom: 20rpx;
  border-radius: 20rpx;
  background: rgba(255, 243, 239, 0.92);
  box-shadow: inset 0 0 0 2rpx rgba(255, 229, 223, 0.84);
}

.group-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4rpx 8rpx 16rpx;
}
```

- [ ] **Step 5: Run a focused lint check for the page file**

Run:

```bash
pnpm --dir "/d/MyDir/shizi/shizi-frontend" exec eslint src/pages/unit-list/index.vue
```

Expected: no lint errors.

- [ ] **Step 6: Commit the single-theme page cleanup**

```bash
git add shizi-frontend/src/pages/unit-list/index.vue
git commit -m "feat(unit-list): finalize modern page theme"
```

---

### Task 2: Tighten the library summary card

**Files:**
- Modify: `src/pages/unit-list/components/LibrarySummaryCard.vue`

- [ ] **Step 1: Remove theme-branch selectors and use a single modern card treatment**

In `src/pages/unit-list/components/LibrarySummaryCard.vue`, delete this selector block entirely:

```scss
:deep(.theme-modern) .library-summary-card,
:global(.theme-modern) .library-summary-card {
  ...
}
```

- [ ] **Step 2: Replace the card styles with a tighter modern summary card**

Replace the style block in `LibrarySummaryCard.vue` with:

```scss
.library-summary-card {
  padding: 28rpx;
  margin-bottom: 20rpx;
  border-radius: 28rpx;
  background:
    radial-gradient(circle at 100% 0%, rgba(91, 141, 239, 0.07) 0%, rgba(91, 141, 239, 0) 34%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(251, 253, 255, 0.98) 100%);
  box-shadow: var(--shadow-card);
  border: 2rpx solid rgba(225, 233, 245, 0.88);
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.card-copy {
  flex: 1;
  min-width: 0;
}

.title {
  font-size: 40rpx;
  line-height: 1.2;
  font-weight: 700;
  color: var(--text-main);
}

.desc {
  margin-top: 8rpx;
  max-width: 440rpx;
  font-size: 22rpx;
  line-height: 1.5;
  color: var(--text-sub);
}

.switch-library-btn {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  height: 64rpx;
  padding: 0 20rpx;
  border: none;
  border-radius: 999rpx;
  background: rgba(91, 132, 232, 0.08);
  color: var(--brand-primary);
  font-size: 22rpx;
  font-weight: 600;
  box-shadow: inset 0 0 0 2rpx rgba(91, 132, 232, 0.1);
}

.switch-library-btn::after {
  border: none;
}

.switch-library-btn--hover {
  opacity: 0.92;
}

.summary-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12rpx;
  margin-top: 20rpx;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  padding: 18rpx 20rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.74);
}

.summary-label {
  font-size: 22rpx;
  color: var(--text-sub);
}

.summary-value {
  font-size: 32rpx;
  line-height: 1;
  font-weight: 700;
  color: var(--text-main);
}

.tone-default {
  background: rgba(249, 251, 255, 0.92);
}

.tone-primary {
  background: rgba(91, 132, 232, 0.08);
}

.tone-warning {
  background: rgba(240, 166, 58, 0.1);
}

.tone-success {
  background: rgba(88, 183, 130, 0.1);
}

.tone-danger {
  background: rgba(234, 122, 89, 0.1);
}
```

- [ ] **Step 3: Run a focused lint check for the summary card**

Run:

```bash
pnpm --dir "/d/MyDir/shizi/shizi-frontend" exec eslint src/pages/unit-list/components/LibrarySummaryCard.vue
```

Expected: no lint errors.

- [ ] **Step 4: Commit the summary-card refinement**

```bash
git add shizi-frontend/src/pages/unit-list/components/LibrarySummaryCard.vue
git commit -m "style(unit-list): refine modern summary card"
```

---

### Task 3: Refine unit-card hierarchy and button weight

**Files:**
- Modify: `src/pages/unit-list/components/UnitTaskCard.vue`

- [ ] **Step 1: Reduce badge size and tighten the card head/body spacing**

In `src/pages/unit-list/components/UnitTaskCard.vue`, replace the corresponding styles with:

```scss
.unit-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12rpx;
}

.unit-name {
  min-width: 0;
  padding-top: 2rpx;
  font-size: 32rpx;
  line-height: 1.3;
  font-weight: 700;
  color: var(--text-main);
}

.unit-status-badge {
  flex-shrink: 0;
  padding: 8rpx 16rpx;
  border-radius: 0 20rpx 0 18rpx;
  font-size: 20rpx;
  line-height: 1;
  font-weight: 700;
  color: #ffffff;
}

.unit-card-body {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
```

- [ ] **Step 2: Lighten progress strips and tighten supporting text spacing**

Still in `UnitTaskCard.vue`, replace these blocks with:

```scss
.lesson,
.wrong-hint,
.wrong-meta {
  font-size: 22rpx;
  line-height: 1.5;
  color: var(--text-sub);
}

.chars {
  font-size: 32rpx;
  line-height: 1.4;
  font-weight: 700;
  color: var(--text-main);
}

.progress-strip {
  padding: 14rpx 18rpx;
  border-radius: 18rpx;
  font-size: 22rpx;
  line-height: 1.45;
  background: rgba(247, 250, 255, 0.96);
  color: var(--text-sub);
}

.progress-strip--learning {
  background: rgba(91, 132, 232, 0.09);
  color: #4a73ca;
}

.progress-strip--ready {
  background: rgba(240, 166, 58, 0.1);
  color: #b27a18;
}

.progress-strip--tested,
.progress-strip--cleared {
  background: rgba(88, 183, 130, 0.1);
  color: #478164;
}

.progress-strip--wrong {
  background: rgba(234, 122, 89, 0.1);
  color: #b85f42;
}
```

- [ ] **Step 3: Make the footer and buttons more refined and less heavy**

Replace the footer/button styles in `UnitTaskCard.vue` with:

```scss
.unit-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  margin-top: 4rpx;
}

.stars,
.stars-placeholder {
  min-width: 104rpx;
}

.stars {
  display: flex;
  gap: 6rpx;
}

.star {
  font-size: 32rpx;
  line-height: 1;
  color: var(--tone-ready);
}

.unit-card-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12rpx;
  flex: 1;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 144rpx;
  height: 64rpx;
  padding: 0 20rpx;
  border: none;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 600;
}

.action-btn::after {
  border: none;
}

.action-btn--secondary {
  color: var(--brand-primary);
  background: rgba(91, 132, 232, 0.06);
  box-shadow: inset 0 0 0 2rpx rgba(91, 132, 232, 0.12);
}

.action-btn--primary {
  color: #ffffff;
  background: linear-gradient(135deg, #5d86ea 0%, #4f79dc 100%);
  box-shadow: 0 6rpx 14rpx rgba(79, 121, 220, 0.16);
}

.action-btn[disabled] {
  opacity: 0.45;
}
```

- [ ] **Step 4: Reduce overall card decoration and remove the old modern-only override block**

Replace the lower card styling in `UnitTaskCard.vue` with:

```scss
:deep(.unit-task-card) {
  overflow: hidden;
  border-radius: 24rpx;
  background: var(--surface-card-strong);
  box-shadow: var(--shadow-card);
}

:deep(.unit-task-card--not_started) {
  background: rgba(255, 255, 255, 0.96);
}

:deep(.unit-task-card--learning) {
  background: linear-gradient(180deg, rgba(91, 132, 232, 0.06) 0%, rgba(255, 255, 255, 0.98) 100%);
}

:deep(.unit-task-card--ready) {
  background: linear-gradient(180deg, rgba(240, 166, 58, 0.08) 0%, rgba(255, 255, 255, 0.98) 100%);
}

:deep(.unit-task-card--tested),
:deep(.unit-task-card--cleared) {
  background: linear-gradient(180deg, rgba(88, 183, 130, 0.08) 0%, rgba(255, 255, 255, 0.98) 100%);
}

:deep(.unit-task-card--wrong) {
  background: linear-gradient(180deg, rgba(234, 122, 89, 0.08) 0%, rgba(255, 255, 255, 0.98) 100%);
}

:deep(.unit-task-card.is-highlighted) {
  box-shadow: 0 12rpx 24rpx rgba(88, 183, 130, 0.16);
}
```

And delete this old block entirely:

```scss
:global(.theme-modern) .action-btn--primary {
  ...
}

:global(.theme-modern) :deep(.unit-task-card) {
  ...
}
```

- [ ] **Step 5: Run a focused lint check for the unit card**

Run:

```bash
pnpm --dir "/d/MyDir/shizi/shizi-frontend" exec eslint src/pages/unit-list/components/UnitTaskCard.vue
```

Expected: no lint errors.

- [ ] **Step 6: Commit the unit-card refinement**

```bash
git add shizi-frontend/src/pages/unit-list/components/UnitTaskCard.vue
git commit -m "style(unit-list): refine modern task card hierarchy"
```

---

### Task 4: Tighten section rhythm and verify the final modern pass

**Files:**
- Modify: `src/pages/unit-list/components/UnitStageSection.vue`
- Verify: `src/pages/unit-list/index.vue`
- Verify: `src/pages/unit-list/components/LibrarySummaryCard.vue`
- Verify: `src/pages/unit-list/components/UnitTaskCard.vue`

- [ ] **Step 1: Remove theme-specific branching from the stage section and tighten spacing**

Replace the style block in `src/pages/unit-list/components/UnitStageSection.vue` with:

```scss
.unit-stage-section {
  margin-bottom: 24rpx;
}

.stage-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 8rpx 8rpx 16rpx;
}

.stage-accent {
  width: 6rpx;
  height: 24rpx;
  border-radius: 6rpx;
  background: linear-gradient(180deg, var(--tone-learning) 0%, var(--tone-ready) 100%);
}

.stage-title {
  font-size: 30rpx;
  line-height: 1.2;
  font-weight: 700;
  color: var(--text-main);
}

.unit-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
```

Delete this old block entirely:

```scss
:global(.theme-modern) .stage-accent {
  ...
}
```

- [ ] **Step 2: Run a full lint pass on all modified unit-list files**

Run:

```bash
pnpm --dir "/d/MyDir/shizi/shizi-frontend" exec eslint src/pages/unit-list/index.vue src/pages/unit-list/components/LibrarySummaryCard.vue src/pages/unit-list/components/UnitTaskCard.vue src/pages/unit-list/components/UnitStageSection.vue
```

Expected: no lint errors.

- [ ] **Step 3: Run a production build to verify the refined modern UI compiles**

Run:

```bash
pnpm --dir "/d/MyDir/shizi/shizi-frontend" run build
```

Expected: build completes successfully.

- [ ] **Step 4: Commit the final modern refinement pass**

```bash
git add shizi-frontend/src/pages/unit-list/index.vue shizi-frontend/src/pages/unit-list/components/LibrarySummaryCard.vue shizi-frontend/src/pages/unit-list/components/UnitTaskCard.vue shizi-frontend/src/pages/unit-list/components/UnitStageSection.vue
git commit -m "style(unit-list): polish final modern theme"
```

- [ ] **Step 5: Report the outcome and ask whether to keep the branch or continue with integration**

Report using this structure:

```md
Modern 主题已定稿，cream 分支已删除。

本轮精修已完成：
- 顶部 fixed 区更干净
- 摘要卡更紧凑
- 单元卡状态与内容层级更平衡
- 按钮更克制
- 列表节奏更成熟

验证结果：
- eslint 通过
- build 通过
```

---

## Spec coverage check

- Remove cream theme and preview logic: covered by Task 1.
- Clean up top shell and final page background: covered by Task 1.
- Tighten summary card and weaken switch button: covered by Task 2.
- Refine badge, progress strip, card decoration, and footer buttons: covered by Task 3.
- Tighten section/list rhythm and final validation: covered by Task 4.

## Placeholder scan

- No `TODO`, `TBD`, or unresolved placeholders remain.
- Every file path is explicit.
- Every verification command is explicit.
- No steps rely on “similar to previous task” references.

## Type consistency check

- The page no longer depends on `previewTheme` or `pageThemeClass` after Task 1.
- The four edited files remain purely presentational; no new business props or view-model fields are introduced.
- All style changes continue to rely on the shared CSS variables defined in `index.vue`.
