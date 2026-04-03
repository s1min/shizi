# Unit Review Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a parent-facing learning unit center with library switching, four-state unit cards, unit-scoped review entry, wrong-answer reinforcement entry, and backend unit overview support.

**Architecture:** Extend the existing learning progress model instead of creating a second progress system. Add one backend aggregation endpoint for library-specific unit overviews, then reuse the existing frontend learn store and review page by introducing `mode=unit` with `scope=all|wrong`, plus a parent-facing unit list page built primarily with `wot-design-uni` components.

**Tech Stack:** Vue 3, uni-app, Pinia, TypeScript, wot-design-uni, NestJS, Mongoose

## Final Status

- Backend `GET /learning/unit-overview` implemented and build-verified
- Frontend `我的 > 家长中心 > 学习单元` entry implemented
- Unit list page implemented with navbar-inline tabs:
  - `单元复习`
  - `常错字强化`
- Review page supports:
  - `mode=unit&scope=all`
  - `mode=unit&scope=wrong`
- Wrong-answer reinforcement supports:
  - task-first ordering
  - pending/completed grouping
  - return feedback after completion
  - wrong-answer source and recent-time hints
- Homepage `今日复习` same-day scheduling bug fixed in store logic

## Notes

- `pnpm -C shizi-frontend type-check` now passes after replacing the direct `wot-design-uni/global.d.ts` dependency with project-local Wot global declarations
- Current wrong-answer aggregation still happens on the frontend store; a future backend aggregation endpoint remains optional follow-up work

---

## File Map

### Frontend
- Modify: `shizi-frontend/src/pages/me/index.vue`
  - Add the `学习单元` menu item in the parent-center section.
- Create: `shizi-frontend/src/subpkg-learning/unit-list/index.vue`
  - Render the parent-facing unit center page.
- Modify: `shizi-frontend/src/store/learn.ts`
  - Add library switching helper, unit overview builder, and unit review char resolver.
- Modify: `shizi-frontend/src/subpkg-learning/review/index.vue`
  - Support `mode=today` and `mode=unit`.
- Modify: `shizi-frontend/src/api/learning.ts`
  - Add unit overview API type and request function.

### Backend
- Modify: `shizi-backend/src/modules/learning/learning.controller.ts`
  - Expose `GET /learning/unit-overview`.
- Modify: `shizi-backend/src/modules/learning/learning.service.ts`
  - Build library-specific unit overview data and shared unit status resolution.
- Modify: `shizi-backend/src/modules/learning/dto/sync-progress.dto.ts`
  - Only if needed for type alignment while reusing unit progress flags.
- Modify: `shizi-backend/src/modules/library/library.service.ts`
  - Reuse existing library lookup to fetch a specific library for overview composition.

### Verification
- Run: frontend type check
- Run: frontend build if type check passes
- Run: backend tests or build-equivalent if lightweight command exists; otherwise validate by TypeScript compile/lint scope if available

---

### Task 1: Add Backend Unit Overview Aggregation

**Files:**
- Modify: `shizi-backend/src/modules/learning/learning.service.ts`
- Modify: `shizi-backend/src/modules/learning/learning.controller.ts`
- Modify: `shizi-backend/src/modules/library/library.service.ts`

- [ ] **Step 1: Inspect current learning and library services before editing**

Run:

```powershell
Get-Content -Path 'shizi-backend\src\modules\learning\learning.service.ts' -Raw
```

Run:

```powershell
Get-Content -Path 'shizi-backend\src\modules\learning\learning.controller.ts' -Raw
```

Run:

```powershell
Get-Content -Path 'shizi-backend\src\modules\library\library.service.ts' -Raw
```

Expected: Confirm `LearningService` can read progress records and `LibraryService` can fetch a library by id.

- [ ] **Step 2: Add a normalized unit-status resolver in `LearningService`**

Add this helper inside `LearningService`:

```ts
private resolveUnitTaskStatus(progress?: any): 'not_started' | 'learning' | 'ready_for_test' | 'tested' {
  const charIndex = progress?.charIndex || 0;
  const learnCompleted = progress?.learnCompleted ?? progress?.completed ?? false;
  const testCompleted = progress?.testCompleted ?? (((progress?.completed ?? false) && (progress?.stars || 0) > 0));

  if (testCompleted) {
    return 'tested';
  }
  if (learnCompleted) {
    return 'ready_for_test';
  }
  if (charIndex > 0) {
    return 'learning';
  }
  return 'not_started';
}
```

- [ ] **Step 3: Add a unit overview builder in `LearningService`**

Add a public method with this shape:

```ts
async getUnitOverview(userId: string, libraryId: string, libraryService: { findById(id: string): Promise<any> }) {
  const [record, library] = await Promise.all([
    this.getProgress(userId),
    libraryService.findById(libraryId),
  ]);

  if (!library) {
    return null;
  }

  const unitProgressMap = record?.unitProgressMap || {};

  return {
    libraryId: library._id,
    libraryName: library.name,
    stages: (library.stages || []).map((stage: any) => ({
      id: stage.id,
      name: stage.name,
      units: (stage.units || []).map((unit: any) => {
        const raw = unitProgressMap[unit.id] || {};
        const charIndex = raw.charIndex || 0;
        const learnCompleted = raw.learnCompleted ?? raw.completed ?? false;
        const testCompleted = raw.testCompleted ?? (((raw.completed ?? false) && (raw.stars || 0) > 0));
        const stars = raw.stars || 0;
        const totalChars = Array.isArray(unit.chars) ? unit.chars.length : 0;

        return {
          id: unit.id,
          name: unit.name,
          lesson: unit.lesson,
          chars: unit.chars || [],
          totalChars,
          charIndex,
          learnCompleted,
          testCompleted,
          stars,
          status: this.resolveUnitTaskStatus(raw),
        };
      }),
    })),
  };
}
```

- [ ] **Step 4: Inject `LibraryService` into the controller and expose the new endpoint**

Update controller constructor and endpoint:

```ts
constructor(
  private readonly learningService: LearningService,
  private readonly libraryService: LibraryService,
) {}

@Get('unit-overview')
async getUnitOverview(@Req() req: any, @Query('libraryId') libraryId?: string) {
  const targetLibraryId = libraryId || 'lib_1a_upper';
  return this.learningService.getUnitOverview(
    req.user.userId,
    targetLibraryId,
    this.libraryService,
  );
}
```

Also add:

```ts
import { Query } from '@nestjs/common';
import { LibraryService } from '../library/library.service';
```

- [ ] **Step 5: Run a targeted backend sanity read**

Run:

```powershell
rg -n "unit-overview|resolveUnitTaskStatus|getUnitOverview" shizi-backend/src/modules/learning
```

Expected: One endpoint, one status resolver, one aggregation method.

- [ ] **Step 6: Commit**

```bash
git add shizi-backend/src/modules/learning/learning.service.ts shizi-backend/src/modules/learning/learning.controller.ts
git commit -m "feat: add learning unit overview endpoint"
```

---

### Task 2: Extend Frontend Learning API and Store

**Files:**
- Modify: `shizi-frontend/src/api/learning.ts`
- Modify: `shizi-frontend/src/store/learn.ts`

- [ ] **Step 1: Add frontend API types for unit overview**

Append to `shizi-frontend/src/api/learning.ts`:

```ts
export interface IUnitOverviewItem {
  id: string
  name: string
  lesson: string
  chars: string[]
  totalChars: number
  charIndex: number
  learnCompleted: boolean
  testCompleted: boolean
  stars: number
  status: 'not_started' | 'learning' | 'ready_for_test' | 'tested'
}

export interface IUnitOverviewStage {
  id: string
  name: string
  units: IUnitOverviewItem[]
}

export interface IUnitOverviewResponse {
  libraryId: string
  libraryName: string
  stages: IUnitOverviewStage[]
}

export function getUnitOverview(libraryId: string) {
  return http.get<IUnitOverviewResponse>(`/learning/unit-overview?libraryId=${libraryId}`)
}
```

- [ ] **Step 2: Add unit overview state to `learnStore`**

Inside `useLearnStore`, add:

```ts
const unitOverview = ref<Record<string, IUnitOverviewResponse>>({})
const loadingUnitOverview = ref(false)
```

Also add the import:

```ts
import { getProgress, getUnitOverview, syncProgress } from '@/api/learning'
import type { IUnitOverviewItem, IUnitOverviewResponse } from '@/api/learning'
```

- [ ] **Step 3: Add library switching helper**

Add this method:

```ts
async function setCurrentLibrary(libraryId: string) {
  currentLibraryId.value = libraryId
  currentStageIndex.value = 0

  await loadLibraryFromApi(libraryId)
  await loadCharsFromApi()

  const firstUnit = library.value?.stages?.[0]?.units?.[0]
  if (firstUnit?.id) {
    currentUnitId.value = firstUnit.id
  }
}
```

- [ ] **Step 4: Add unit overview loader and local fallback builder**

Add methods:

```ts
async function loadUnitOverview(libraryId?: string) {
  const id = libraryId || currentLibraryId.value
  try {
    loadingUnitOverview.value = true
    const data = await getUnitOverview(id)
    if (data) {
      unitOverview.value[id] = data
      return data
    }
  }
  catch (e) {
    console.warn('加载单元总览失败，回退到本地拼装', e)
  }
  finally {
    loadingUnitOverview.value = false
  }

  const fallback = buildLocalUnitOverview()
  unitOverview.value[id] = fallback
  return fallback
}

function buildLocalUnitOverview(): IUnitOverviewResponse {
  return {
    libraryId: currentLibraryId.value,
    libraryName: library.value?.name || '',
    stages: (library.value?.stages || []).map((stage: any) => ({
      id: stage.id,
      name: stage.name,
      units: (stage.units || []).map((unit: any) => {
        const progress = getUnitProgress(unit.id)
        return {
          id: unit.id,
          name: unit.name,
          lesson: unit.lesson,
          chars: unit.chars || [],
          totalChars: Array.isArray(unit.chars) ? unit.chars.length : 0,
          charIndex: progress.charIndex,
          learnCompleted: progress.learnCompleted,
          testCompleted: progress.testCompleted,
          stars: progress.stars,
          status: getUnitTaskStatus(unit.id),
        }
      }),
    })),
  }
}
```

- [ ] **Step 5: Add unit review char resolver**

Add:

```ts
function getUnitReviewChars(unitId: string): Character[] {
  const unit = library.value?.stages
    ?.flatMap((s: any) => s.units)
    ?.find((u: any) => u.id === unitId)

  if (!unit) {
    return []
  }

  return (unit.chars || [])
    .map((id: string) => charMap.value.get(id))
    .filter(Boolean) as Character[]
}
```

Also add a reserved helper without wiring UI:

```ts
function getUnitWrongChars(unitId: string): Character[] {
  const wrongIds = new Set(
    wrongRecords.value
      .filter(item => item.unitId === unitId && !item.retried)
      .map(item => item.charId),
  )

  return Array.from(wrongIds)
    .map(id => charMap.value.get(id))
    .filter(Boolean) as Character[]
}
```

- [ ] **Step 6: Export the new store API**

Return these from the store:

```ts
unitOverview,
loadingUnitOverview,
setCurrentLibrary,
loadUnitOverview,
getUnitReviewChars,
getUnitWrongChars,
```

- [ ] **Step 7: Run targeted type grep**

Run:

```powershell
rg -n "unitOverview|loadUnitOverview|setCurrentLibrary|getUnitReviewChars|getUnitWrongChars" shizi-frontend/src/store shizi-frontend/src/api
```

Expected: New methods and API types are present exactly once each.

- [ ] **Step 8: Commit**

```bash
git add shizi-frontend/src/api/learning.ts shizi-frontend/src/store/learn.ts
git commit -m "feat: add unit overview data flow"
```

---

### Task 3: Build the Parent-Facing Unit List Page

**Files:**
- Create: `shizi-frontend/src/subpkg-learning/unit-list/index.vue`

- [ ] **Step 1: Create the page shell with Wot components**

Start the file with this scaffold:

```vue
<template>
  <view class="unit-page">
    <wd-navbar left-arrow title="学习单元" safe-area-inset-top @click-left="goBack" />

    <view class="page-body">
      <view class="library-card">
        <view class="library-copy">
          <view class="library-label">当前字库</view>
          <view class="library-name">{{ activeLibraryName }}</view>
          <view class="library-desc">切换字库后，可查看该字库全部单元学习情况</view>
        </view>
        <wd-button size="small" plain @click="openLibraryPicker">
          切换字库
        </wd-button>
      </view>

      <view class="stats-grid">
        <view v-for="item in statusStats" :key="item.key" class="stat-card" :class="item.key">
          <view class="stat-value">{{ item.count }}</view>
          <view class="stat-label">{{ item.label }}</view>
        </view>
      </view>

      <wd-loading v-if="learnStore.loadingUnitOverview" />

      <wd-empty v-else-if="stageGroups.length === 0" description="当前字库暂无单元数据" />

      <view v-else class="stage-list">
        <view v-for="stage in stageGroups" :key="stage.id" class="stage-section">
          <view class="stage-title">{{ stage.name }}</view>

          <view class="unit-card-list">
            <wd-card v-for="unit in stage.units" :key="unit.id" custom-class="unit-card">
              <template #title>
                <view class="unit-card-head">
                  <view class="unit-title">{{ unit.name }}</view>
                  <wd-tag round :type="statusTagTypeMap[unit.status]">
                    {{ statusTextMap[unit.status] }}
                  </wd-tag>
                </view>
              </template>

              <view class="unit-body">
                <view class="unit-lesson">{{ unit.lesson || '教材同步单元' }}</view>
                <view class="unit-chars">{{ formatChars(unit.chars) }}</view>
                <view class="unit-progress">{{ buildProgressText(unit) }}</view>
                <view v-if="unit.status === 'tested'" class="unit-stars">
                  <text v-for="i in 3" :key="i" class="star">{{ i <= unit.stars ? '⭐' : '☆' }}</text>
                </view>
              </view>

              <view class="unit-actions">
                <wd-button
                  v-if="hasReviewAction(unit.status)"
                  size="small"
                  plain
                  @click="goUnitReview(unit.id)"
                >
                  复习
                </wd-button>
                <wd-button size="small" type="primary" @click="handlePrimaryAction(unit)">
                  {{ primaryActionText(unit.status) }}
                </wd-button>
              </view>
            </wd-card>
          </view>
        </view>
      </view>
    </view>

    <wd-action-sheet
      v-model="showLibrarySheet"
      :actions="libraryActions"
      title="选择字库"
      @select="handleLibrarySelect"
    />
  </view>
</template>
```

- [ ] **Step 2: Add the script with state mapping and navigation**

Use this script shape:

```ts
<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useLearnStore } from '@/store'
import { navigateBackOrTo } from '@/utils/navigation'

definePage({
  style: {
    navigationBarTitleText: '学习单元',
    navigationStyle: 'custom',
  },
})

const learnStore = useLearnStore()
const showLibrarySheet = ref(false)

const libraryOptions = [
  { id: 'lib_1a_upper', name: '一年级上册', disabled: false },
  { id: 'lib_1a_lower', name: '一年级下册', disabled: true },
  { id: 'lib_2a_upper', name: '二年级上册', disabled: true },
  { id: 'lib_2a_lower', name: '二年级下册', disabled: true },
]

const statusTextMap = {
  not_started: '未学习',
  learning: '学习中',
  ready_for_test: '待测试',
  tested: '已测试',
} as const

const statusTagTypeMap = {
  not_started: 'default',
  learning: 'primary',
  ready_for_test: 'warning',
  tested: 'success',
} as const

const activeLibraryName = computed(() => {
  return learnStore.unitOverview[learnStore.currentLibraryId]?.libraryName
    || libraryOptions.find(item => item.id === learnStore.currentLibraryId)?.name
    || '当前字库'
})

const stageGroups = computed(() => {
  return learnStore.unitOverview[learnStore.currentLibraryId]?.stages || []
})

const statusStats = computed(() => {
  const units = stageGroups.value.flatMap(stage => stage.units)
  return [
    { key: 'not_started', label: '未学习', count: units.filter(item => item.status === 'not_started').length },
    { key: 'learning', label: '学习中', count: units.filter(item => item.status === 'learning').length },
    { key: 'ready_for_test', label: '待测试', count: units.filter(item => item.status === 'ready_for_test').length },
    { key: 'tested', label: '已测试', count: units.filter(item => item.status === 'tested').length },
  ]
})

const libraryActions = computed(() => {
  return libraryOptions.map(item => ({
    name: item.name,
    disabled: item.disabled,
    value: item.id,
  }))
})

onMounted(async () => {
  await learnStore.loadLibraryFromApi()
  await learnStore.loadCharsFromApi()
  await learnStore.loadUnitOverview()
})

function goBack() {
  navigateBackOrTo('/pages/me/index', true)
}

function openLibraryPicker() {
  showLibrarySheet.value = true
}

async function handleLibrarySelect({ item }: any) {
  if (!item?.value || item.disabled) {
    return
  }
  await learnStore.setCurrentLibrary(item.value)
  await learnStore.loadUnitOverview(item.value)
}

function formatChars(chars: string[]) {
  if (!Array.isArray(chars) || chars.length === 0) {
    return '暂无汉字'
  }
  const visible = chars.slice(0, 6).join('、')
  return chars.length > 6 ? `${visible} +${chars.length - 6}` : visible
}

function buildProgressText(unit: any) {
  switch (unit.status) {
    case 'not_started':
      return '尚未开始'
    case 'learning':
      return `已学 ${unit.charIndex}/${unit.totalChars} 字`
    case 'ready_for_test':
      return '已学完，待测试'
    case 'tested':
      return '已完成测试'
    default:
      return ''
  }
}

function hasReviewAction(status: string) {
  return status === 'ready_for_test' || status === 'tested'
}

function primaryActionText(status: string) {
  switch (status) {
    case 'not_started':
      return '开始学习'
    case 'learning':
      return '继续学习'
    case 'ready_for_test':
      return '开始测试'
    case 'tested':
      return '重新测试'
    default:
      return '开始学习'
  }
}

function handlePrimaryAction(unit: any) {
  if (unit.status === 'not_started' || unit.status === 'learning') {
    uni.navigateTo({ url: `/subpkg-learning/learn/index?unitId=${unit.id}` })
    return
  }

  uni.navigateTo({ url: `/subpkg-learning/learn/unit-test?unitId=${unit.id}` })
}

function goUnitReview(unitId: string) {
  uni.navigateTo({ url: `/subpkg-learning/review/index?mode=unit&unitId=${unitId}` })
}
</script>
```

- [ ] **Step 3: Add focused styles**

Use styles with restrained parent-facing UI:

```scss
<style lang="scss" scoped>
.unit-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.page-body {
  padding: 24rpx;
}

.library-card,
.stat-card,
.stage-section {
  border-radius: 24rpx;
}

.library-card {
  background: #fff;
  padding: 28rpx;
  margin-bottom: 24rpx;
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  align-items: center;
}

.library-label {
  font-size: 22rpx;
  color: #999;
}

.library-name {
  margin-top: 8rpx;
  font-size: 34rpx;
  font-weight: 600;
  color: #2f3440;
}

.library-desc {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #8c92a4;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.stat-card {
  background: #fff;
  padding: 24rpx;
}

.stat-value {
  font-size: 40rpx;
  font-weight: 700;
}

.stat-label {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #8c92a4;
}

.stage-section {
  margin-bottom: 24rpx;
}

.stage-title {
  padding: 4rpx 8rpx 20rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #2f3440;
}

.unit-card-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

:deep(.unit-card) {
  border-radius: 24rpx;
}

.unit-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
}

.unit-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #2f3440;
}

.unit-body {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.unit-lesson,
.unit-progress {
  font-size: 24rpx;
  color: #6b7280;
}

.unit-chars {
  font-size: 28rpx;
  color: #2f3440;
}

.unit-stars {
  display: flex;
  gap: 8rpx;
}

.unit-actions {
  margin-top: 20rpx;
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
}
</style>
```

- [ ] **Step 4: Run a file presence check**

Run:

```powershell
Get-Content -Path 'shizi-frontend\src\subpkg-learning\unit-list\index.vue' -Raw
```

Expected: The page contains `wd-navbar`, `wd-card`, `wd-button`, `wd-tag`, and `wd-action-sheet`.

- [ ] **Step 5: Commit**

```bash
git add shizi-frontend/src/subpkg-learning/unit-list/index.vue
git commit -m "feat: add parent unit review center page"
```

---

### Task 4: Wire the Entry from the Me Page

**Files:**
- Modify: `shizi-frontend/src/pages/me/index.vue`

- [ ] **Step 1: Add the new menu item under parent center**

Insert this block above the current `学习日报` item:

```vue
<div class="menu-item" @click="goToUnitCenter">
  <div class="menu-left">
    <div class="menu-icon report">
      📚
    </div>
    <text>学习单元</text>
  </div>
  <text class="arrow">></text>
</div>
```

- [ ] **Step 2: Add the navigation handler**

Add:

```ts
function goToUnitCenter() {
  uni.navigateTo({ url: '/subpkg-learning/unit-list/index' })
}
```

- [ ] **Step 3: Verify grep result**

Run:

```powershell
rg -n "学习单元|goToUnitCenter" shizi-frontend/src/pages/me/index.vue
```

Expected: One new menu item and one handler.

- [ ] **Step 4: Commit**

```bash
git add shizi-frontend/src/pages/me/index.vue
git commit -m "feat: add unit center entry in profile"
```

---

### Task 5: Extend the Review Page to Support Unit Mode

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/review/index.vue`

- [ ] **Step 1: Inspect current review page loading logic**

Run:

```powershell
Get-Content -Path 'shizi-frontend\src\subpkg-learning\review\index.vue' -Raw
```

Expected: Confirm it currently initializes `reviewChars` from `learnStore.todayReviewChars`.

- [ ] **Step 2: Add mode parsing and title mapping**

Add refs/computed:

```ts
const reviewMode = ref<'today' | 'unit'>('today')
const reviewTitle = computed(() => reviewMode.value === 'unit' ? '单元复习' : '复习')
const reviewUnitId = ref('')
```

Replace `definePage` title text only if static title is still needed, but prefer in-page title copy where already present.

- [ ] **Step 3: Replace initial review char loading with mode-aware logic**

Add:

```ts
function loadReviewCharsByMode() {
  const currentPage = getCurrentPages().pop()
  const mode = currentPage?.options?.mode
  const unitId = currentPage?.options?.unitId

  if (mode === 'unit' && unitId) {
    reviewMode.value = 'unit'
    reviewUnitId.value = unitId
    reviewChars.value = learnStore.getUnitReviewChars(unitId)
    return
  }

  reviewMode.value = 'today'
  reviewUnitId.value = ''
  reviewChars.value = [...learnStore.todayReviewChars]
}
```

Then replace the old initialization call with:

```ts
loadReviewCharsByMode()
```

- [ ] **Step 4: Update page copy to differentiate unit mode**

Where the page shows empty-state or completion copy, branch like this:

```vue
<div class="page-title">
  {{ reviewMode === 'unit' ? '单元复习' : '今日复习' }}
</div>
```

For empty state:

```vue
<div class="empty-title">
  {{ reviewMode === 'unit' ? '本单元暂无可复习内容' : '暂无待复习的字' }}
</div>
```

- [ ] **Step 5: Verify unit-mode references**

Run:

```powershell
rg -n "reviewMode|getUnitReviewChars|单元复习|loadReviewCharsByMode" shizi-frontend/src/subpkg-learning/review/index.vue
```

Expected: Unit-mode logic is wired and no direct hard-coded dependency remains for initial loading.

- [ ] **Step 6: Commit**

```bash
git add shizi-frontend/src/subpkg-learning/review/index.vue
git commit -m "feat: support unit-scoped review mode"
```

---

### Task 6: Verify Frontend Integration

**Files:**
- Modify: none
- Test: `shizi-frontend` type/build commands

- [ ] **Step 1: Run frontend type check**

Run:

```powershell
pnpm -C shizi-frontend type-check
```

Expected: PASS

- [ ] **Step 2: If type check passes, run frontend build**

Run:

```powershell
pnpm -C shizi-frontend build:h5
```

Expected: PASS

- [ ] **Step 3: Sanity grep for new entry flow**

Run:

```powershell
rg -n "unit-list/index|mode=unit&unitId|学习单元" shizi-frontend/src
```

Expected: The new page, entry, and review routing are all connected.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: verify unit review center integration"
```

---

### Task 7: Verify Backend Build Surface

**Files:**
- Modify: none

- [ ] **Step 1: Check backend scripts before running**

Run:

```powershell
Get-Content -Path 'shizi-backend\package.json' -Raw
```

Expected: Identify an available lightweight verification command.

- [ ] **Step 2: Run the lightest relevant backend validation**

If a type-check or build script exists, run the exact available one, for example:

```powershell
pnpm -C shizi-backend build
```

Expected: PASS

If no such script exists, run:

```powershell
rg -n "unit-overview|getUnitOverview|resolveUnitTaskStatus" shizi-backend/src
```

Expected: Confirm endpoint and service method are present and connected.

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "chore: validate backend unit overview changes"
```

---

## Self-Review

### Spec coverage
- Entry in `我的 > 家长中心`: Task 4
- New `学习单元` page: Task 3
- Library switching: Task 2 + Task 3
- Four-state unit cards: Task 1 + Task 3
- Button mapping by status: Task 3
- Star display for tested units: Task 3
- Unit-scoped review defaulting to all unit chars: Task 2 + Task 5
- Future wrong-char reinforcement extensibility: Task 2 reserve helper + spec-level mode design
- Backend aggregation endpoint: Task 1

### Placeholder scan
- No `TODO` or `TBD` placeholders remain in task steps
- Commands, code snippets, and files are concrete

### Type consistency
- Backend status strings are consistent: `not_started | learning | ready_for_test | tested`
- Frontend overview types use the same status union
- Review routing consistently uses `mode=unit&unitId=...`
