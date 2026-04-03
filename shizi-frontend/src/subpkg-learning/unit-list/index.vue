<template>
  <view class="unit-page">
    <wd-navbar left-arrow safe-area-inset-top @click-left="goBack">
      <template #title>
        <UnitPageTabs v-model="activeTab" />
      </template>
    </wd-navbar>

    <view class="page-body">
      <LibrarySummaryCard
        :library-name="activeLibraryName"
        :mode="activeTab"
        :summary-items="summaryItems"
        @switch-library="openLibraryPicker"
      />

      <StatusLegendBar :mode="activeTab" />

      <WrongSummaryCard
        v-if="activeTab === 'wrong'"
        :unit-count="wrongStats.unitCount"
        :char-count="wrongStats.charCount"
        :recent-char-count="wrongStats.recentCharCount"
        :primary-weakness="wrongStats.primaryWeakness"
      />

      <view v-if="activeTab === 'wrong' && wrongPendingSections.length > 0" class="wrong-focus-banner">
        <view class="wrong-focus-title">
          优先处理待强化单元
        </view>
        <view class="wrong-focus-desc">
          先完成这些问题单元，再查看已清空内容
        </view>
      </view>

      <view v-if="learnStore.loadingUnitOverview" class="loading-wrap">
        <wd-loading />
      </view>

      <view v-else-if="activeTab === 'unit' && unitStageSections.length === 0" class="inline-empty">
        <view class="inline-empty-title">
          当前字库暂无单元数据
        </view>
      </view>

      <view v-else-if="activeTab === 'wrong' && wrongPendingSections.length === 0 && wrongClearedSections.length === 0" class="inline-empty">
        <view class="inline-empty-title">
          当前没有待强化错字
        </view>
      </view>

      <view v-else class="stage-list">
        <template v-if="activeTab === 'unit'">
          <UnitStageSection
            v-for="stage in unitStageSections"
            :key="stage.id"
            :title="stage.name"
            :units="stage.units"
            mode="unit"
            :highlight-unit-id="highlightUnitId"
            @primary="handleUnitPrimary"
            @secondary="handleUnitSecondary"
          />
        </template>

        <template v-else>
          <UnitStageSection
            v-for="stage in wrongPendingSections"
            :key="stage.id"
            :title="stage.name"
            :units="stage.units"
            mode="wrong"
            :highlight-unit-id="highlightUnitId"
            @primary="handleWrongPrimary"
          />

          <view v-if="wrongClearedSections.length > 0" class="wrong-group">
            <view class="group-title-row">
              <view class="group-title">
                已清空
              </view>
              <view class="group-count">
                {{ clearedUnitCount }} 个单元
              </view>
            </view>

            <wd-collapse v-model="showClearedUnits">
              <wd-collapse-item name="cleared-units" title="查看已清空单元">
                <view class="collapse-list">
                  <UnitStageSection
                    v-for="stage in wrongClearedSections"
                    :key="stage.id"
                    :title="stage.name"
                    :units="stage.units"
                    mode="wrong"
                    :highlight-unit-id="highlightUnitId"
                    @primary="handleWrongPrimary"
                  />
                </view>
              </wd-collapse-item>
            </wd-collapse>
          </view>
        </template>
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

<script lang="ts" setup>
import { onShow } from '@dcloudio/uni-app'
import { computed, onMounted, ref } from 'vue'
import { useLearnStore } from '@/store'
import { navigateBackOrTo } from '@/utils/navigation'
import LibrarySummaryCard from './components/LibrarySummaryCard.vue'
import StatusLegendBar from './components/StatusLegendBar.vue'
import UnitPageTabs from './components/UnitPageTabs.vue'
import UnitStageSection from './components/UnitStageSection.vue'
import WrongSummaryCard from './components/WrongSummaryCard.vue'
import type { SummaryItem, UnitPageTab, UnitStageViewModel } from './types'
import {
  buildSummaryItems,
  compareUnitPriority,
  createUnitCardViewModel,
  createWrongUnitCardViewModel,
  formatRelativeWrongTime,
  getWrongTypeLabel,
} from './view-model'

definePage({
  style: {
    navigationBarTitleText: '学习单元',
    navigationStyle: 'custom',
  },
})

const learnStore = useLearnStore()
const showLibrarySheet = ref(false)
const activeTab = ref<UnitPageTab>('unit')
const showClearedUnits = ref<string[]>([])
const highlightUnitId = ref('')

const libraryOptions = [
  { id: 'lib_1a_upper', name: '一年级上册', disabled: false },
  { id: 'lib_1a_lower', name: '一年级下册', disabled: true },
  { id: 'lib_2a_upper', name: '二年级上册', disabled: true },
  { id: 'lib_2a_lower', name: '二年级下册', disabled: true },
]

const activeOverview = computed(() => learnStore.unitOverview[learnStore.currentLibraryId])

const activeLibraryName = computed(() => {
  return activeOverview.value?.libraryName
    || libraryOptions.find(item => item.id === learnStore.currentLibraryId)?.name
    || '当前字库'
})

const rawStages = computed(() => activeOverview.value?.stages || [])

const flattenedUnits = computed(() => rawStages.value.flatMap(stage => stage.units))

const statusStats = computed(() => ({
  total: flattenedUnits.value.length,
  notStarted: flattenedUnits.value.filter(item => item.status === 'not_started').length,
  learning: flattenedUnits.value.filter(item => item.status === 'learning').length,
  ready: flattenedUnits.value.filter(item => item.status === 'ready_for_test').length,
  tested: flattenedUnits.value.filter(item => item.status === 'tested').length,
}))

const wrongStats = computed(() => {
  const pendingRecords = learnStore.wrongRecords.filter(item => !item.retried)
  const typeCountMap = pendingRecords.reduce<Record<string, number>>((acc, item) => {
    acc[item.quizType] = (acc[item.quizType] || 0) + 1
    return acc
  }, {})

  const primaryType = Object.entries(typeCountMap)
    .sort((a, b) => b[1] - a[1])[0]?.[0]

  const recentCharIds = new Set(
    pendingRecords
      .filter(item => Date.now() - item.wrongAt <= 24 * 60 * 60 * 1000)
      .map(item => item.charId),
  )

  const unitCount = flattenedUnits.value.filter(unit => getWrongCount(unit.id) > 0).length
  const charCount = flattenedUnits.value.reduce((sum, unit) => sum + getWrongCount(unit.id), 0)

  return {
    unitCount,
    charCount,
    recentCharCount: recentCharIds.size,
    primaryWeakness: getWrongTypeLabel(primaryType),
  }
})

const summaryItems = computed<SummaryItem[]>(() => {
  return buildSummaryItems(activeTab.value, statusStats.value, wrongStats.value)
})

const unitStageSections = computed<UnitStageViewModel[]>(() => {
  return rawStages.value.map((stage) => {
    const units = [...stage.units]
      .sort((a, b) => compareUnitPriority(a, b))
      .map(unit => createUnitCardViewModel(unit, {
        wrongCount: getWrongCount(unit.id),
        hasReviewAction: hasReviewAction(unit.status),
        primaryActionText: primaryActionText(unit.status),
      }))

    return {
      id: stage.id,
      name: stage.name,
      units,
    }
  })
})

const wrongPendingSections = computed<UnitStageViewModel[]>(() => {
  return rawStages.value
    .map((stage) => {
      const units = stage.units
        .filter(unit => getWrongCount(unit.id) > 0)
        .sort((a, b) => getWrongCount(b.id) - getWrongCount(a.id) || compareUnitPriority(a, b))
        .map(unit => createWrongUnitCardViewModel(unit, {
          wrongCount: getWrongCount(unit.id),
          cleared: false,
          latestWrongText: getLatestWrongText(unit.id),
          primaryWeaknessText: getPrimaryWrongTypeText(unit.id),
        }))

      return {
        id: stage.id,
        name: stage.name,
        units,
      }
    })
    .filter(stage => stage.units.length > 0)
})

const wrongClearedSections = computed<UnitStageViewModel[]>(() => {
  return rawStages.value
    .map((stage) => {
      const units = stage.units
        .filter(unit => getWrongCount(unit.id) === 0)
        .sort((a, b) => compareUnitPriority(a, b))
        .map(unit => createWrongUnitCardViewModel(unit, {
          wrongCount: 0,
          cleared: true,
        }))

      return {
        id: stage.id,
        name: stage.name,
        units,
      }
    })
    .filter(stage => stage.units.length > 0)
})

const clearedUnitCount = computed(() => wrongClearedSections.value.reduce((sum, stage) => sum + stage.units.length, 0))

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

onShow(() => {
  const returnState = uni.getStorageSync('unitReviewReturnState') as
    | { tab?: string, highlightUnitId?: string, timestamp?: number }
    | undefined

  if (!returnState?.timestamp || Date.now() - returnState.timestamp > 10 * 1000) {
    uni.removeStorageSync('unitReviewReturnState')
    return
  }

  if (returnState.tab === 'wrong') {
    activeTab.value = 'wrong'
  }

  if (returnState.highlightUnitId) {
    highlightUnitId.value = returnState.highlightUnitId
    showClearedUnits.value = ['cleared-units']
    uni.showToast({
      title: '该单元强化已完成',
      icon: 'none',
    })
    setTimeout(() => {
      highlightUnitId.value = ''
    }, 2200)
  }

  uni.removeStorageSync('unitReviewReturnState')
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

function handleUnitPrimary(unitId: string) {
  const unit = flattenedUnits.value.find(item => item.id === unitId)
  if (!unit) {
    return
  }

  if (unit.status === 'not_started' || unit.status === 'learning') {
    uni.navigateTo({ url: `/subpkg-learning/learn/index?unitId=${unit.id}` })
    return
  }

  uni.navigateTo({ url: `/subpkg-learning/learn/unit-test?unitId=${unit.id}` })
}

function handleUnitSecondary(unitId: string) {
  goUnitReview(unitId)
}

function handleWrongPrimary(unitId: string) {
  goUnitWrongReview(unitId)
}

function getWrongCount(unitId: string) {
  return learnStore.getUnitWrongChars(unitId).length
}

function getUnitWrongRecords(unitId: string) {
  return learnStore.wrongRecords.filter((item) => {
    if (item.retried) {
      return false
    }

    const normalizedUnitId = item.unitId || learnStore.library.stages
      .flatMap((stage: any) => stage.units || [])
      .find((unit: any) => Array.isArray(unit.chars) && unit.chars.includes(item.charId))?.id || ''

    return normalizedUnitId === unitId
  })
}

function getLatestWrongText(unitId: string) {
  const records = getUnitWrongRecords(unitId)
  if (records.length === 0) {
    return '当前没有错题'
  }

  const latest = [...records].sort((a, b) => b.wrongAt - a.wrongAt)[0]
  return formatRelativeWrongTime(latest.wrongAt)
}

function getPrimaryWrongTypeText(unitId: string) {
  const records = getUnitWrongRecords(unitId)
  if (records.length === 0) {
    return '暂无强化任务'
  }

  const typeCountMap = records.reduce<Record<string, number>>((acc, item) => {
    acc[item.quizType] = (acc[item.quizType] || 0) + 1
    return acc
  }, {})

  const primaryType = Object.entries(typeCountMap)
    .sort((a, b) => b[1] - a[1])[0]?.[0]

  const labelMap: Record<string, string> = {
    review: '复习识记薄弱',
    'char-to-image': '看字选图易错',
    'image-to-char': '看图认字易错',
    'audio-to-char': '听音认字易错',
    'pinyin-to-char': '拼音认字易错',
    unknown: '识字题型易错',
  }

  return labelMap[primaryType || 'unknown'] || '识字题型易错'
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

function goUnitReview(unitId: string) {
  uni.navigateTo({ url: `/subpkg-learning/review/index?mode=unit&unitId=${unitId}&scope=all` })
}

function goUnitWrongReview(unitId: string) {
  if (getWrongCount(unitId) === 0) {
    return
  }

  uni.navigateTo({ url: `/subpkg-learning/review/index?mode=unit&unitId=${unitId}&scope=wrong` })
}
</script>

<style lang="scss" scoped>
.unit-page {
  --bg-page: #fff9f2;
  --bg-card: #ffffff;
  --text-main: #4a3728;
  --text-sub: #8c7b6b;
  --text-muted: #b3a596;
  --line-soft: #efe7dc;
  --status-not-started: #c9cdd6;
  --status-learning: #5dade2;
  --status-ready: #f5a623;
  --status-tested: #68b984;
  --status-wrong: #ef7d57;
  --bg-soft-blue: #eef7fd;
  --bg-soft-orange: #fff6e8;
  --bg-soft-green: #eef9f1;
  --bg-soft-red: #fff1eb;
  --shadow-card: 0 10rpx 26rpx rgba(74, 55, 40, 0.06);
  min-height: 100vh;
  background:
    radial-gradient(circle at 12% 10%, rgba(255, 232, 200, 0.28) 0%, rgba(255, 232, 200, 0) 34%),
    linear-gradient(180deg, var(--bg-page) 0%, #ffffff 100%);
}

.page-body {
  padding: 24rpx 24rpx calc(40rpx + env(safe-area-inset-bottom));
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 96rpx 0;
}

.inline-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 84rpx 32rpx;
  background: rgba(255, 255, 255, 0.94);
  border-radius: 24rpx;
  box-shadow: var(--shadow-card);
  text-align: center;
}

.inline-empty-title {
  font-size: 26rpx;
  line-height: 1.5;
  color: var(--text-sub);
}

.wrong-group {
  margin-bottom: 24rpx;
}

.wrong-focus-banner {
  padding: 20rpx 24rpx;
  margin-bottom: 20rpx;
  border-radius: 20rpx;
  background: rgba(255, 244, 239, 0.92);
  box-shadow: inset 0 0 0 2rpx rgba(255, 227, 219, 0.88);
}

.wrong-focus-title {
  font-size: 24rpx;
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
  justify-content: space-between;
  align-items: center;
  padding: 4rpx 8rpx 18rpx;
}

.group-title {
  font-size: 28rpx;
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
</style>
