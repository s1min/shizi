# Unit List UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernize the unit list page UI with a fixed gradient navbar, simplified library summary, removed legend bar, redesigned unit cards, and two temporary visual themes for side-by-side UI evaluation before deleting the unselected theme.

**Architecture:** Keep one shared page structure and one shared component tree, then branch only the visual language through page-level theme classes and CSS variables. Update the page shell, summary card, section header, and task card in place so all requested UI changes land without changing business data flow in `useUnitListPage`.

**Tech Stack:** Vue 3 `<script setup>`, uni-app, Wot Design (`wd-navbar`, `wd-button`, `wd-card`, `wd-action-sheet`, `wd-icon`), SCSS, existing unit-list page view models.

---

## File map

### Modify
- `src/pages/unit-list/index.vue`
  - Remove `StatusLegendBar` from the page structure.
  - Add a fixed top shell around `wd-navbar`.
  - Add a temporary theme switch constant/class for cream vs modern comparison.
  - Rework page spacing/background variables to support the new fixed header and lighter background.
- `src/pages/unit-list/components/LibrarySummaryCard.vue`
  - Remove the eyebrow text.
  - Upgrade the switch-library action to a modern icon button with `wd-icon name="swap"`.
  - Simplify the summary area while preserving existing summary items.
  - Add theme-aware styling hooks.
- `src/pages/unit-list/components/UnitTaskCard.vue`
  - Replace the current `wd-tag` with an integrated top-right status badge.
  - Put stars and action buttons on the same bottom row.
  - Modernize primary/secondary actions.
  - Add theme-aware visual variants.
- `src/pages/unit-list/components/UnitStageSection.vue`
  - Refine spacing and title accent styling to match the redesign.
- `src/pages/unit-list/components/StatusLegendBar.vue`
  - Leave file untouched for now; only remove page usage so the change stays reversible until theme selection is finalized.

### Verify manually
- `src/pages/unit-list/useUnitListPage.ts`
  - Confirm no data-shape changes are required before editing templates.

---

### Task 1: Update the page shell and remove the legend bar

**Files:**
- Modify: `src/pages/unit-list/index.vue`
- Verify: `src/pages/unit-list/useUnitListPage.ts`

- [ ] **Step 1: Read the page data hook to confirm the existing API already provides everything needed for the redesign**

Read: `src/pages/unit-list/useUnitListPage.ts`

Confirm that these existing fields already cover the redesign so no business logic change is needed:

```ts
activeLibraryName
summaryItems
activeTab
unitStageSections
wrongPendingSections
wrongClearedSections
highlightUnitId
```

Expected: all required UI data already exists and only template/style work is needed.

- [ ] **Step 2: Remove the legend bar import and usage from the page template**

Modify `src/pages/unit-list/index.vue`:

```vue
<script lang="ts" setup>
import LibrarySummaryCard from './components/LibrarySummaryCard.vue'
import UnitPageTabs from './components/UnitPageTabs.vue'
import UnitStageSection from './components/UnitStageSection.vue'
import WrongSummaryCard from './components/WrongSummaryCard.vue'
import { useUnitListPage } from './useUnitListPage'
</script>
```

And remove this template block entirely:

```vue
<StatusLegendBar :mode="activeTab" />
```

- [ ] **Step 3: Wrap the navbar in a fixed top shell and add a temporary theme class on the page root**

Modify the top of `src/pages/unit-list/index.vue` template to this structure:

```vue
<template>
  <view class="unit-page" :class="pageThemeClass">
    <view class="page-top-shell">
      <wd-navbar
        :left-arrow="showBack"
        safe-area-inset-top
        custom-class="unit-page-navbar"
        @click-left="handleBack"
      >
        <template #title>
          <UnitPageTabs v-model="activeTab" />
        </template>
      </wd-navbar>
    </view>

    <view class="page-body">
      <LibrarySummaryCard
        :library-name="activeLibraryName"
        :mode="activeTab"
        :summary-items="summaryItems"
        @switch-library="openLibraryPicker"
      />
      <!-- keep the rest of the existing body flow unchanged -->
    </view>
  </view>
</template>
```

Add a temporary implementation constant in the same file:

```ts
const previewTheme = 'cream'
const pageThemeClass = `theme-${previewTheme}`
```

- [ ] **Step 4: Rework page-level styles for the fixed header, lighter background, and theme variables**

Replace the existing root/page layout styles in `src/pages/unit-list/index.vue` with this structure, keeping unrelated empty/loading/wrong-state blocks and adapting them to the new variables:

```scss
.unit-page {
  --page-bg: #fffdf9;
  --page-bg-accent: rgba(255, 214, 153, 0.14);
  --surface-card: rgba(255, 255, 255, 0.92);
  --surface-card-strong: #ffffff;
  --text-main: #463224;
  --text-sub: #8b7766;
  --text-muted: #b5a698;
  --line-soft: rgba(226, 214, 201, 0.72);
  --shadow-card: 0 12rpx 32rpx rgba(92, 66, 42, 0.08);
  --shadow-soft: 0 8rpx 20rpx rgba(92, 66, 42, 0.05);
  --brand-primary: #5b8def;
  --brand-primary-soft: rgba(91, 141, 239, 0.12);
  --tone-learning: #5b8def;
  --tone-ready: #f2a93b;
  --tone-tested: #5fbc8a;
  --tone-wrong: #ee7f5d;
  min-height: 100vh;
  background:
    radial-gradient(circle at 0% 0%, var(--page-bg-accent) 0%, rgba(255, 255, 255, 0) 32%),
    linear-gradient(180deg, #fffaf4 0%, var(--page-bg) 22%, #ffffff 100%);
}

.unit-page.theme-modern {
  --page-bg: #fbfcff;
  --page-bg-accent: rgba(91, 141, 239, 0.1);
  --surface-card: rgba(255, 255, 255, 0.96);
  --text-main: #24324a;
  --text-sub: #6e7b91;
  --text-muted: #96a1b3;
  --line-soft: rgba(214, 223, 236, 0.9);
  --shadow-card: 0 10rpx 28rpx rgba(41, 72, 126, 0.08);
  --shadow-soft: 0 6rpx 18rpx rgba(41, 72, 126, 0.05);
}

.page-top-shell {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  padding-bottom: 16rpx;
  background:
    linear-gradient(135deg, rgba(255, 248, 238, 0.96) 0%, rgba(255, 243, 228, 0.92) 48%, rgba(241, 247, 255, 0.96) 100%);
  backdrop-filter: blur(16rpx);
  box-shadow: 0 6rpx 18rpx rgba(110, 84, 55, 0.06);
}

.unit-page.theme-modern .page-top-shell {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(247, 250, 255, 0.94) 58%, rgba(240, 246, 255, 0.96) 100%);
  box-shadow: 0 6rpx 18rpx rgba(41, 72, 126, 0.05);
}

.page-body {
  padding: 176rpx 24rpx calc(40rpx + env(safe-area-inset-bottom));
}

:deep(.unit-page-navbar) {
  background: transparent !important;
  box-shadow: none !important;
}
```

Then update the existing `.inline-empty`, `.wrong-focus-banner`, `.group-title`, and `.group-count` colors to use the new shared variables.

- [ ] **Step 5: Run a targeted frontend type/style sanity check**

Run:

```bash
cd /d/MyDir/shizi/shizi-frontend && npm run lint src/pages/unit-list/index.vue
```

Expected: command succeeds, or reports that no dedicated lint target exists. If the command is unsupported, note it and instead run the project’s available validation command later in Task 5.

- [ ] **Step 6: Commit the page-shell changes**

```bash
git add src/pages/unit-list/index.vue
git commit -m "feat(unit-list): redesign page shell and remove legend bar"
```

---

### Task 2: Redesign the library summary card

**Files:**
- Modify: `src/pages/unit-list/components/LibrarySummaryCard.vue`

- [ ] **Step 1: Replace the current summary-card template with a simplified header and modern switch action**

Modify `src/pages/unit-list/components/LibrarySummaryCard.vue` template to:

```vue
<template>
  <view class="library-summary-card">
    <view class="card-head">
      <view class="card-copy">
        <view class="title">
          {{ libraryName }}
        </view>
        <view class="desc">
          {{ mode === 'unit'
            ? '查看全部单元学习情况，安排复习或测试'
            : '优先处理本字库内需要反复巩固的单元' }}
        </view>
      </view>

      <button class="switch-library-btn" hover-class="switch-library-btn--hover" @click="emit('switch-library')">
        <wd-icon name="swap" size="28rpx" />
        <text>切换字库</text>
      </button>
    </view>

    <view class="summary-row">
      <view
        v-for="item in summaryItems"
        :key="item.label"
        class="summary-item"
        :class="[`tone-${item.tone || 'default'}`]"
      >
        <text class="summary-label">{{ item.label }}</text>
        <text class="summary-value">{{ item.value }}</text>
      </view>
    </view>
  </view>
</template>
```

- [ ] **Step 2: Keep the existing script contract and add the `wd-icon` dependency through template-only usage**

Keep the current props and emits unchanged:

```ts
defineProps<{
  libraryName: string
  mode: UnitPageTab
  summaryItems: SummaryItem[]
}>()

const emit = defineEmits<{
  (e: 'switch-library'): void
}>()
```

Expected: no behavior change outside of the visual redesign.

- [ ] **Step 3: Replace the component styles with a lighter, theme-aware summary card**

Replace the current `<style lang="scss" scoped>` block in `LibrarySummaryCard.vue` with:

```scss
.library-summary-card {
  padding: 32rpx;
  margin-bottom: 24rpx;
  border-radius: 32rpx;
  background:
    radial-gradient(circle at 100% 0%, rgba(255, 232, 204, 0.4) 0%, rgba(255, 232, 204, 0) 32%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 251, 246, 0.96) 100%);
  box-shadow: var(--shadow-card);
  border: 2rpx solid rgba(245, 235, 224, 0.9);
}

:global(.theme-modern) .library-summary-card {
  background:
    radial-gradient(circle at 100% 0%, rgba(91, 141, 239, 0.08) 0%, rgba(91, 141, 239, 0) 36%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 252, 255, 0.98) 100%);
  border-color: rgba(225, 233, 245, 0.96);
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
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
  margin-top: 12rpx;
  max-width: 480rpx;
  font-size: 24rpx;
  line-height: 1.5;
  color: var(--text-sub);
}

.switch-library-btn {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  height: 72rpx;
  padding: 0 24rpx;
  border: none;
  border-radius: 999rpx;
  background: rgba(91, 141, 239, 0.12);
  color: var(--brand-primary);
  font-size: 24rpx;
  font-weight: 600;
  box-shadow: inset 0 0 0 2rpx rgba(91, 141, 239, 0.1);
}

.switch-library-btn::after {
  border: none;
}

.switch-library-btn--hover {
  opacity: 0.92;
  transform: translateY(2rpx);
}

.summary-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 24rpx;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 20rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.72);
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
  background: rgba(255, 251, 245, 0.9);
}

.tone-primary {
  background: rgba(91, 141, 239, 0.1);
}

.tone-warning {
  background: rgba(242, 169, 59, 0.12);
}

.tone-success {
  background: rgba(95, 188, 138, 0.12);
}

.tone-danger {
  background: rgba(238, 127, 93, 0.12);
}
```

- [ ] **Step 4: Run a focused check for template compile issues in the component**

Run:

```bash
cd /d/MyDir/shizi/shizi-frontend && npm run lint src/pages/unit-list/components/LibrarySummaryCard.vue
```

Expected: success, or the same fallback note as Task 1 if that lint target is unsupported.

- [ ] **Step 5: Commit the summary-card redesign**

```bash
git add src/pages/unit-list/components/LibrarySummaryCard.vue
git commit -m "feat(unit-list): redesign library summary card"
```

---

### Task 3: Redesign the unit cards and bottom action row

**Files:**
- Modify: `src/pages/unit-list/components/UnitTaskCard.vue`

- [ ] **Step 1: Replace the title slot markup with an integrated card head and custom status badge**

Modify the top part of `src/pages/unit-list/components/UnitTaskCard.vue` template to:

```vue
<wd-card :custom-class="customClass">
  <template #title>
    <view class="unit-card-head">
      <view class="unit-name">{{ unit.name }}</view>
      <view class="unit-status-badge" :class="`unit-status-badge--${unit.cardTone}`">
        {{ tagText }}
      </view>
    </view>
  </template>
```

This keeps the existing `tagText` computed value but stops using `wd-tag`.

- [ ] **Step 2: Replace the lower body/actions structure so stars and buttons share one row**

Replace the action area in the same template with:

```vue
    <view class="unit-card-body">
      <view class="lesson-row">
        <view class="lesson">{{ unit.lesson || '教材同步单元' }}</view>
        <view v-if="mode === 'wrong' && unit.wrongCount > 0" class="wrong-count-pill">
          {{ unit.wrongCount }} 个错字
        </view>
      </view>

      <view class="chars">{{ unit.charsPreview }}</view>
      <view class="progress-strip" :class="`progress-strip--${unit.cardTone}`">
        {{ unit.progressText }}
      </view>

      <template v-if="mode === 'wrong'">
        <view class="wrong-hint">{{ unit.wrongHintText }}</view>
        <view v-if="unit.wrongUpdatedText" class="wrong-meta">{{ unit.wrongUpdatedText }}</view>
        <view v-if="unit.primaryWeaknessText" class="wrong-badge">{{ unit.primaryWeaknessText }}</view>
      </template>

      <view class="unit-card-footer">
        <view v-if="mode === 'unit' && unit.status === 'tested'" class="stars">
          <text v-for="i in 3" :key="i" class="star">{{ i <= unit.stars ? '★' : '☆' }}</text>
        </view>
        <view v-else class="stars-placeholder" />

        <view class="unit-card-actions">
          <button
            v-if="unit.secondaryActionText"
            class="action-btn action-btn--secondary"
            hover-class="action-btn--hover"
            @click="emit('secondary', unit.id)"
          >
            {{ unit.secondaryActionText }}
          </button>
          <button
            class="action-btn action-btn--primary"
            hover-class="action-btn--hover"
            :disabled="unit.disabled"
            @click="emit('primary', unit.id)"
          >
            {{ unit.primaryActionText }}
          </button>
        </view>
      </view>
    </view>
  </wd-card>
```

- [ ] **Step 3: Remove the obsolete tag-type computed state and keep only the label mapping logic**

Delete the `tagType` computed entirely and keep `tagText` as:

```ts
const tagText = computed(() => {
  if (props.mode === 'wrong') {
    return props.unit.wrongCount > 0 ? '待强化' : '已清空'
  }

  const labelMap = {
    not_started: '未学习',
    learning: '学习中',
    ready_for_test: '待测试',
    tested: '已测试',
  } as const

  return labelMap[props.unit.status]
})
```

Expected: no stale `wd-tag` support code remains.

- [ ] **Step 4: Replace the component styles with the redesigned badge, footer, stars, and theme-aware card treatment**

Replace the current styles in `UnitTaskCard.vue` with:

```scss
.unit-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.unit-name {
  min-width: 0;
  padding-top: 4rpx;
  font-size: 32rpx;
  line-height: 1.3;
  font-weight: 700;
  color: var(--text-main);
}

.unit-status-badge {
  flex-shrink: 0;
  padding: 10rpx 18rpx;
  border-radius: 0 24rpx 0 20rpx;
  font-size: 22rpx;
  line-height: 1;
  font-weight: 700;
  color: #ffffff;
}

.unit-status-badge--not_started {
  background: #c6ced9;
}

.unit-status-badge--learning {
  background: var(--tone-learning);
}

.unit-status-badge--ready {
  background: var(--tone-ready);
}

.unit-status-badge--tested,
.unit-status-badge--cleared {
  background: var(--tone-tested);
}

.unit-status-badge--wrong {
  background: var(--tone-wrong);
}

.unit-card-body {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.lesson-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.lesson,
.wrong-hint,
.wrong-meta {
  font-size: 24rpx;
  line-height: 1.5;
  color: var(--text-sub);
}

.chars {
  font-size: 32rpx;
  line-height: 1.45;
  font-weight: 700;
  color: var(--text-main);
}

.progress-strip {
  padding: 16rpx 18rpx;
  border-radius: 18rpx;
  font-size: 24rpx;
  line-height: 1.45;
  background: rgba(255, 250, 244, 0.92);
  color: var(--text-sub);
}

.progress-strip--learning { background: rgba(91, 141, 239, 0.12); color: #416dbd; }
.progress-strip--ready { background: rgba(242, 169, 59, 0.14); color: #b27a18; }
.progress-strip--tested,
.progress-strip--cleared { background: rgba(95, 188, 138, 0.14); color: #44815f; }
.progress-strip--wrong { background: rgba(238, 127, 93, 0.14); color: #b85f42; }

.wrong-count-pill {
  flex-shrink: 0;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  line-height: 1;
  font-weight: 700;
  color: #b85f42;
  background: rgba(238, 127, 93, 0.12);
}

.wrong-badge {
  align-self: flex-start;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 600;
  color: #c7543f;
  background: rgba(238, 127, 93, 0.12);
}

.unit-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-top: 8rpx;
}

.stars,
.stars-placeholder {
  min-width: 120rpx;
}

.stars {
  display: flex;
  gap: 8rpx;
}

.star {
  font-size: 34rpx;
  line-height: 1;
  color: var(--tone-ready);
}

.unit-card-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16rpx;
  flex: 1;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 152rpx;
  height: 72rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  border: none;
  font-size: 24rpx;
  font-weight: 600;
}

.action-btn::after {
  border: none;
}

.action-btn--secondary {
  color: var(--brand-primary);
  background: rgba(91, 141, 239, 0.08);
  box-shadow: inset 0 0 0 2rpx rgba(91, 141, 239, 0.16);
}

.action-btn--primary {
  color: #ffffff;
  background: linear-gradient(135deg, #6d9dff 0%, #4d7ff0 100%);
  box-shadow: 0 10rpx 18rpx rgba(91, 141, 239, 0.22);
}

.action-btn[disabled] {
  opacity: 0.45;
}

.action-btn--hover {
  opacity: 0.92;
  transform: translateY(2rpx);
}

:deep(.unit-task-card) {
  overflow: hidden;
  border-radius: 28rpx;
  background: var(--surface-card-strong);
  box-shadow: var(--shadow-card);
}

:deep(.unit-task-card--not_started) {
  background: rgba(255, 255, 255, 0.94);
}

:deep(.unit-task-card--learning) {
  background: linear-gradient(180deg, rgba(91, 141, 239, 0.08) 0%, rgba(255, 255, 255, 0.98) 100%);
}

:deep(.unit-task-card--ready) {
  background: linear-gradient(180deg, rgba(242, 169, 59, 0.12) 0%, rgba(255, 255, 255, 0.98) 100%);
}

:deep(.unit-task-card--tested),
:deep(.unit-task-card--cleared) {
  background: linear-gradient(180deg, rgba(95, 188, 138, 0.12) 0%, rgba(255, 255, 255, 0.98) 100%);
}

:deep(.unit-task-card--wrong) {
  background: linear-gradient(180deg, rgba(238, 127, 93, 0.12) 0%, rgba(255, 255, 255, 0.98) 100%);
}

:deep(.unit-task-card.is-highlighted) {
  box-shadow: 0 14rpx 32rpx rgba(95, 188, 138, 0.2);
}

:global(.theme-modern) .action-btn--primary {
  background: linear-gradient(135deg, #5f8cf5 0%, #4d79dd 100%);
  box-shadow: 0 8rpx 16rpx rgba(77, 121, 221, 0.18);
}

:global(.theme-modern) :deep(.unit-task-card) {
  box-shadow: var(--shadow-soft);
}
```

- [ ] **Step 5: Run a focused component validation command**

Run:

```bash
cd /d/MyDir/shizi/shizi-frontend && npm run lint src/pages/unit-list/components/UnitTaskCard.vue
```

Expected: success, or the same fallback note as earlier if per-file lint is unsupported.

- [ ] **Step 6: Commit the unit-card redesign**

```bash
git add src/pages/unit-list/components/UnitTaskCard.vue
git commit -m "feat(unit-list): redesign unit task cards"
```

---

### Task 4: Polish section headers and align spacing across the page

**Files:**
- Modify: `src/pages/unit-list/components/UnitStageSection.vue`
- Modify: `src/pages/unit-list/index.vue`

- [ ] **Step 1: Update the stage-section spacing and accent styling**

Replace the style block in `src/pages/unit-list/components/UnitStageSection.vue` with:

```scss
.unit-stage-section {
  margin-bottom: 32rpx;
}

.stage-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 8rpx 8rpx 20rpx;
}

.stage-accent {
  width: 8rpx;
  height: 28rpx;
  border-radius: 999rpx;
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
  gap: 24rpx;
}

:global(.theme-modern) .stage-accent {
  width: 6rpx;
  border-radius: 6rpx;
}
```

- [ ] **Step 2: Tighten remaining page spacing and secondary copy styles to match the new card rhythm**

In `src/pages/unit-list/index.vue`, update these blocks:

```scss
.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 96rpx 0;
}

.inline-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 88rpx 32rpx;
  border-radius: 28rpx;
  background: var(--surface-card);
  box-shadow: var(--shadow-soft);
  text-align: center;
}

.inline-empty-title {
  font-size: 26rpx;
  line-height: 1.5;
  color: var(--text-sub);
}

.wrong-group {
  margin-bottom: 32rpx;
}

.wrong-focus-banner {
  padding: 24rpx;
  margin-bottom: 24rpx;
  border-radius: 24rpx;
  background: rgba(255, 243, 238, 0.94);
  box-shadow: inset 0 0 0 2rpx rgba(255, 227, 219, 0.92);
}

.wrong-focus-title {
  font-size: 24rpx;
  line-height: 1.2;
  font-weight: 700;
  color: #b55f42;
}

.wrong-focus-desc {
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.5;
  color: var(--text-sub);
}

.group-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4rpx 8rpx 20rpx;
}

.group-title {
  font-size: 28rpx;
  line-height: 1.2;
  font-weight: 700;
  color: var(--text-main);
}

.group-count {
  font-size: 22rpx;
  color: var(--text-sub);
}

.collapse-list {
  padding-top: 16rpx;
}
```

- [ ] **Step 3: Run the project validation command for the unit-list page files**

Run the repository’s actual available check command from `shizi-frontend` (pick the existing script from `package.json`; if the project uses `npm run lint`, use that, otherwise use the closest available validation command).

Expected: the modified page and components compile/lint successfully.

- [ ] **Step 4: Commit the spacing/alignment polish**

```bash
git add src/pages/unit-list/components/UnitStageSection.vue src/pages/unit-list/index.vue
git commit -m "style(unit-list): polish section spacing and page rhythm"
```

---

### Task 5: Verify both temporary themes and prepare handoff for theme selection

**Files:**
- Modify: `src/pages/unit-list/index.vue`
- Verify: `src/pages/unit-list/components/LibrarySummaryCard.vue`
- Verify: `src/pages/unit-list/components/UnitTaskCard.vue`
- Verify: `src/pages/unit-list/components/UnitStageSection.vue`

- [ ] **Step 1: Add the second theme path so the preview constant can switch between both visual variants**

In `src/pages/unit-list/index.vue`, keep:

```ts
const previewTheme = 'cream'
const pageThemeClass = `theme-${previewTheme}`
```

Then ensure all shared page variables and component selectors include a matching `.theme-modern` override path so changing the constant to `'modern'` is enough to preview the second style.

Expected: no duplicated templates; the theme swap is class-only.

- [ ] **Step 2: Manually preview the page twice and compare against the spec**

Preview 1:
```ts
const previewTheme = 'cream'
```

Preview 2:
```ts
const previewTheme = 'modern'
```

For both previews, confirm:
- navbar stays fixed while the page scrolls;
- background is lighter than before;
- library card has no “当前字库” eyebrow;
- switch action includes the swap icon;
- legend bar is gone;
- status badge is integrated into the card top-right corner;
- stars and action buttons share one row;
- button language looks modern and consistent.

- [ ] **Step 3: Run the broad verification command for the frontend project**

Run from `shizi-frontend`:

```bash
npm run lint
```

If the project also has a dedicated type-check/build validation script, run it too:

```bash
npm run build
```

Expected: both commands pass, or you document the exact script availability and the exact result.

- [ ] **Step 4: Commit the final preview-ready implementation**

```bash
git add src/pages/unit-list/index.vue src/pages/unit-list/components/LibrarySummaryCard.vue src/pages/unit-list/components/UnitTaskCard.vue src/pages/unit-list/components/UnitStageSection.vue
git commit -m "feat(unit-list): add preview themes for ui comparison"
```

- [ ] **Step 5: Present the two-theme preview to the user for selection**

Report using this structure:

```md
已完成两套 UI 对比稿：
- `theme-cream`：奶油轻拟物
- `theme-modern`：精致现代

当前预览方式：修改 `src/pages/unit-list/index.vue` 中的 `previewTheme` 常量。

请先选定最终方案，我再执行最后一步清理：删除未选中的主题样式分支。
```

---

## Spec coverage check

- Fixed gradient navbar: covered by Task 1.
- Remove `当前字库`, modernize switch button, simplify summary: covered by Task 2.
- Remove `StatusLegendBar`: covered by Task 1.
- Modern integrated status badge, larger stars, same-row footer: covered by Task 3.
- Modern action buttons: covered by Task 3.
- Lighter background and cleaner section rhythm: covered by Tasks 1 and 4.
- Two temporary visual themes for comparison: covered by Task 5.

## Placeholder scan

- No `TODO`, `TBD`, or deferred implementation markers remain.
- Every code-edit step names exact files and includes the intended code shape.
- Verification commands are explicit; where script names may differ, the step explicitly requires using the real script from `package.json`.

## Type consistency check

- Theme switching uses `previewTheme` + `pageThemeClass` consistently across the plan.
- Existing page data fields stay unchanged; no new view-model properties are introduced.
- `tagText` remains the single status-label source after `wd-tag` removal.
