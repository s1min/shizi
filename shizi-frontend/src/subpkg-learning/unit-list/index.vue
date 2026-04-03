<template>
  <view class="unit-page">
    <wd-navbar left-arrow safe-area-inset-top @click-left="goBack">
      <template #title>
        <wd-tabs v-model="activeTab" animated swipeable class="nav-tabs">
          <wd-tab title="单元复习" name="unit" />
          <wd-tab title="常错字强化" name="wrong" />
        </wd-tabs>
      </template>
    </wd-navbar>

    <view class="page-body">
      <view class="library-card">
        <view class="library-copy">
          <view class="library-label">
            当前字库
          </view>
          <view class="library-name">
            {{ activeLibraryName }}
          </view>
          <view class="library-desc">
            {{ activeTab === 'unit' ? '切换字库后，可查看该字库全部单元学习情况' : '切换字库后，可查看该字库各单元的常错字强化任务' }}
          </view>
        </view>
        <wd-button size="small" plain @click="openLibraryPicker">
          切换字库
        </wd-button>
      </view>

      <view v-if="activeTab === 'unit'" class="stats-grid">
        <view v-for="item in statusStats" :key="item.key" class="stat-card" :class="item.key">
          <view class="stat-value">
            {{ item.count }}
          </view>
          <view class="stat-label">
            {{ item.label }}
          </view>
        </view>
      </view>

      <view v-else class="stats-grid wrong-stats-grid">
        <view class="stat-card wrong-highlight">
          <view class="stat-value">
            {{ wrongStats.unitCount }}
          </view>
          <view class="stat-label">
            有错字单元
          </view>
        </view>
        <view class="stat-card wrong-highlight-soft">
          <view class="stat-value">
            {{ wrongStats.charCount }}
          </view>
          <view class="stat-label">
            待强化错字
          </view>
        </view>
        <view class="stat-card wrong-recent">
          <view class="stat-value">
            {{ wrongStats.recentCharCount }}
          </view>
          <view class="stat-label">
            近24h新错
          </view>
        </view>
        <view class="stat-card wrong-type">
          <view class="stat-value stat-value--text">
            {{ wrongStats.primaryWeakness }}
          </view>
          <view class="stat-label">
            当前主要薄弱点
          </view>
        </view>
      </view>

      <view v-if="learnStore.loadingUnitOverview" class="loading-wrap">
        <wd-loading />
      </view>

      <view v-else-if="stageGroups.length === 0" class="inline-empty">
        <view class="inline-empty-title">
          当前字库暂无单元数据
        </view>
      </view>

      <view v-else class="stage-list">
        <template v-if="activeTab === 'unit'">
          <view v-for="stage in stageGroups" :key="stage.id" class="stage-section">
            <view class="stage-title">
              {{ stage.name }}
            </view>

            <view class="unit-card-list">
              <wd-card v-for="unit in stage.units" :key="unit.id" :custom-class="getUnitCardClass(unit)">
                <template #title>
                  <view class="unit-card-head">
                    <view class="unit-title">
                      {{ unit.name }}
                    </view>
                    <wd-tag round :type="cardTagType(unit)">
                      {{ cardTagText(unit) }}
                    </wd-tag>
                  </view>
                </template>

                <view class="unit-body">
                  <view class="unit-lesson">
                    {{ unit.lesson || '教材同步单元' }}
                  </view>
                  <view class="unit-chars">
                    {{ formatChars(unit.chars) }}
                  </view>
                  <view class="unit-progress">
                    {{ buildCardProgressText(unit) }}
                  </view>
                  <view v-if="unit.status === 'tested'" class="unit-stars">
                    <text v-for="i in 3" :key="i" class="star">{{ i <= unit.stars ? '⭐' : '☆' }}</text>
                  </view>
                </view>

                <view class="unit-actions">
                  <template v-if="activeTab === 'unit'">
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
                  </template>

                  <template v-else>
                    <wd-button
                      size="small"
                      :type="getWrongCount(unit.id) > 0 ? 'primary' : 'info'"
                      :disabled="getWrongCount(unit.id) === 0"
                      @click="goUnitWrongReview(unit.id)"
                    >
                      {{ getWrongCount(unit.id) > 0 ? '开始强化' : '暂无错字' }}
                    </wd-button>
                  </template>
                </view>
              </wd-card>
            </view>
          </view>
        </template>

        <template v-else>
          <view class="wrong-group">
            <view class="group-title-row">
              <view class="group-title">
                待强化
              </view>
              <view class="group-count">
                {{ wrongUnits.length }} 个单元
              </view>
            </view>

            <view v-if="wrongUnits.length === 0" class="inline-empty">
              <view class="inline-empty-title">
                当前没有待强化错字
              </view>
            </view>

            <view v-else class="unit-card-list">
              <wd-card v-for="unit in wrongUnits" :key="unit.id" :custom-class="getUnitCardClass(unit)">
                <template #title>
                  <view class="unit-card-head">
                    <view class="unit-title">
                      {{ unit.name }}
                    </view>
                    <wd-tag round :type="cardTagType(unit)">
                      {{ cardTagText(unit) }}
                    </wd-tag>
                  </view>
                </template>

                <view class="unit-body">
                  <view class="unit-lesson">
                    {{ unit.lesson || '教材同步单元' }}
                  </view>
                  <view class="unit-chars">
                    {{ formatChars(unit.chars) }}
                  </view>
                  <view class="unit-progress">
                    {{ buildCardProgressText(unit) }}
                  </view>
                  <view class="wrong-priority-badge">
                    {{ getWrongCount(unit.id) >= 3 ? '优先强化' : '建议强化' }}
                  </view>
                  <view class="unit-wrong-count">
                    共 {{ getWrongCount(unit.id) }} 个错字待强化
                  </view>
                </view>

                <view class="unit-actions">
                  <wd-button size="small" type="primary" @click="goUnitWrongReview(unit.id)">
                    开始强化
                  </wd-button>
                </view>
              </wd-card>
            </view>
          </view>

          <view v-if="clearedUnits.length > 0" class="wrong-group">
            <view class="group-title-row">
              <view class="group-title">
                已清空
              </view>
              <view class="group-count">
                {{ clearedUnits.length }} 个单元
              </view>
            </view>

            <wd-collapse v-model="showClearedUnits">
              <wd-collapse-item name="cleared-units" title="查看已清空单元">
                <view class="unit-card-list collapse-list">
                  <wd-card v-for="unit in clearedUnits" :key="unit.id" :custom-class="getUnitCardClass(unit)">
                    <template #title>
                      <view class="unit-card-head">
                        <view class="unit-title">
                          {{ unit.name }}
                        </view>
                        <wd-tag round :type="cardTagType(unit)">
                          {{ cardTagText(unit) }}
                        </wd-tag>
                      </view>
                    </template>

                    <view class="unit-body">
                      <view class="unit-lesson">
                        {{ unit.lesson || '教材同步单元' }}
                      </view>
                      <view class="unit-chars">
                        {{ formatChars(unit.chars) }}
                      </view>
                      <view class="unit-progress">
                        {{ buildCardProgressText(unit) }}
                      </view>
                    </view>

                    <view class="unit-actions">
                      <wd-button size="small" type="info" disabled>
                        暂无错字
                      </wd-button>
                    </view>
                  </wd-card>
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

definePage({
  style: {
    navigationBarTitleText: '学习单元',
    navigationStyle: 'custom',
  },
})

const learnStore = useLearnStore()
const showLibrarySheet = ref(false)
const activeTab = ref<'unit' | 'wrong'>('unit')
const showClearedUnits = ref(false)
const highlightUnitId = ref('')

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
  const stages = learnStore.unitOverview[learnStore.currentLibraryId]?.stages || []

  if (activeTab.value !== 'wrong') {
    return stages
  }

  return stages.map((stage) => {
    const units = [...stage.units].sort((a, b) => {
      const wrongDiff = getWrongCount(b.id) - getWrongCount(a.id)
      if (wrongDiff !== 0) {
        return wrongDiff
      }

      const statusOrder = {
        ready_for_test: 0,
        tested: 1,
        learning: 2,
        not_started: 3,
      } as const

      return statusOrder[a.status] - statusOrder[b.status]
    })

    return {
      ...stage,
      units,
    }
  })
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

const wrongStats = computed(() => {
  const units = stageGroups.value.flatMap(stage => stage.units)
  const counts = units.map(unit => getWrongCount(unit.id))
  const pendingRecords = learnStore.wrongRecords.filter(item => !item.retried)
  const recentCharIds = new Set(
    pendingRecords
      .filter(item => Date.now() - item.wrongAt <= 24 * 60 * 60 * 1000)
      .map(item => item.charId),
  )

  const typeCountMap = pendingRecords.reduce<Record<string, number>>((acc, item) => {
    acc[item.quizType] = (acc[item.quizType] || 0) + 1
    return acc
  }, {})

  const primaryType = Object.entries(typeCountMap).sort((a, b) => b[1] - a[1])[0]?.[0]

  return {
    unitCount: counts.filter(count => count > 0).length,
    charCount: counts.reduce((sum, count) => sum + count, 0),
    recentCharCount: recentCharIds.size,
    primaryWeakness: getWrongTypeLabel(primaryType),
  }
})

const wrongUnits = computed(() => {
  return stageGroups.value
    .flatMap(stage => stage.units)
    .filter(unit => getWrongCount(unit.id) > 0)
})

const clearedUnits = computed(() => {
  return stageGroups.value
    .flatMap(stage => stage.units)
    .filter(unit => getWrongCount(unit.id) === 0)
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
    showClearedUnits.value = true
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

function formatChars(chars: string[]) {
  if (!Array.isArray(chars) || chars.length === 0) {
    return '暂无汉字'
  }
  const visible = chars.slice(0, 6).join('、')
  return chars.length > 6 ? `${visible} +${chars.length - 6}` : visible
}

function getWrongCount(unitId: string) {
  return learnStore.getUnitWrongChars(unitId).length
}

function getWrongTypeLabel(type?: string) {
  const labelMap: Record<string, string> = {
    review: '复习识记',
    'char-to-image': '看字选图',
    'image-to-char': '看图认字',
    'audio-to-char': '听音认字',
    'pinyin-to-char': '拼音认字',
    unknown: '综合识字',
  }

  return labelMap[type || 'unknown'] || '综合识字'
}

function getUnitWrongRecords(unitId: string) {
  return learnStore.wrongRecords
    .filter((item) => {
      if (item.retried) {
        return false
      }
      const normalizedUnitId = item.unitId || learnStore.library.stages
        .flatMap((stage: any) => stage.units || [])
        .find((unit: any) => Array.isArray(unit.chars) && unit.chars.includes(item.charId))?.id || ''
      return normalizedUnitId === unitId
    })
}

function formatRelativeWrongTime(timestamp: number) {
  const diff = Date.now() - timestamp
  const hour = 60 * 60 * 1000
  const day = 24 * hour

  if (diff < hour) {
    return '刚刚错过'
  }
  if (diff < day) {
    return `${Math.max(1, Math.floor(diff / hour))}小时前错过`
  }
  if (diff < 2 * day) {
    return '昨天错过'
  }
  return `${Math.max(2, Math.floor(diff / day))}天前错过`
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

function isWrongFocusUnit(unitId: string) {
  return activeTab.value === 'wrong' && getWrongCount(unitId) > 0
}

function getUnitCardClass(unit: any) {
  if (highlightUnitId.value === unit.id) {
    return 'unit-card unit-card--just-finished'
  }

  if (isWrongFocusUnit(unit.id)) {
    return 'unit-card unit-card--wrong-active'
  }

  if (activeTab.value === 'wrong') {
    return 'unit-card unit-card--wrong-idle'
  }

  return 'unit-card'
}

function buildUnitProgressText(unit: any) {
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

function buildWrongProgressText(unit: any) {
  const wrongCount = getWrongCount(unit.id)
  if (wrongCount > 0) {
    return wrongCount >= 3 ? '建议优先强化，本单元错字较多' : '建议优先强化本单元易错字'
  }

  if (unit.status === 'not_started') {
    return '尚未学习，暂无强化内容'
  }

  return '当前没有待强化错字'
}

function buildCardProgressText(unit: any) {
  return activeTab.value === 'unit'
    ? buildUnitProgressText(unit)
    : buildWrongProgressText(unit)
}

function cardTagText(unit: any) {
  if (activeTab.value === 'unit') {
    return statusTextMap[unit.status]
  }

  return getWrongCount(unit.id) > 0 ? '待强化' : '已清空'
}

function cardTagType(unit: any) {
  if (activeTab.value === 'unit') {
    return statusTagTypeMap[unit.status]
  }

  return getWrongCount(unit.id) > 0 ? 'danger' : 'success'
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
  min-height: 100vh;
  background: #f7f8fa;
}

.page-body {
  padding: 24rpx;
}

.nav-tabs {
  width: 420rpx;
  margin: 0 auto;
}

:deep(.nav-tabs .wd-tabs) {
  background: transparent;
}

:deep(.nav-tabs .wd-tabs__nav) {
  background: transparent;
}

:deep(.nav-tabs .wd-tabs__nav-item-text) {
  font-size: 28rpx;
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

.library-copy {
  flex: 1;
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

.wrong-stats-grid {
  grid-template-columns: repeat(2, 1fr);
}

.stat-card {
  background: #fff;
  padding: 24rpx;
}

.stat-card.not_started {
  border-left: 8rpx solid #c8ccd6;
}

.stat-card.learning {
  border-left: 8rpx solid #4d8dff;
}

.stat-card.ready_for_test {
  border-left: 8rpx solid #f5a623;
}

.stat-card.tested {
  border-left: 8rpx solid #2bb673;
}

.wrong-highlight {
  border-left: 8rpx solid #ef6c57;
}

.wrong-highlight-soft {
  border-left: 8rpx solid #f5a623;
}

.wrong-recent {
  border-left: 8rpx solid #5dade2;
}

.wrong-type {
  border-left: 8rpx solid #7d6cf2;
}

.stat-value {
  font-size: 40rpx;
  font-weight: 700;
  color: #2f3440;
}

.stat-value--text {
  font-size: 28rpx;
  line-height: 1.35;
}

.stat-label {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #8c92a4;
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 80rpx 0;
}

.inline-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 72rpx 32rpx;
  background: #fff;
  border-radius: 24rpx;
  color: #8c92a4;
  text-align: center;
}

.inline-empty-title {
  font-size: 26rpx;
  line-height: 1.5;
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

.wrong-group {
  margin-bottom: 24rpx;
}

.group-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4rpx 8rpx 20rpx;
}

.group-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2f3440;
}

.group-count {
  font-size: 22rpx;
  color: #8c92a4;
}

.unit-card-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.collapse-list {
  padding-top: 16rpx;
}

:deep(.unit-card) {
  border-radius: 24rpx;
}

:deep(.unit-card--wrong-active) {
  border: 2rpx solid #ef6c57;
  box-shadow: 0 16rpx 36rpx rgba(239, 108, 87, 0.14);
  background: linear-gradient(180deg, #fffaf6 0%, #ffffff 100%);
}

:deep(.unit-card--just-finished) {
  border: 2rpx solid #2bb673;
  box-shadow: 0 16rpx 36rpx rgba(43, 182, 115, 0.16);
  background: linear-gradient(180deg, #f3fff9 0%, #ffffff 100%);
}

:deep(.unit-card--wrong-idle) {
  opacity: 0.9;
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
.unit-progress,
.unit-wrong-count,
.unit-wrong-meta {
  font-size: 24rpx;
  color: #6b7280;
}

.unit-wrong-meta {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: #9b6a56;
}

.unit-chars {
  font-size: 28rpx;
  color: #2f3440;
}

.unit-stars {
  display: flex;
  gap: 8rpx;
}

.wrong-priority-badge {
  align-self: flex-start;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 600;
  color: #c7543f;
  background: #fff1eb;
}

.star {
  font-size: 28rpx;
  line-height: 1;
}

.unit-actions {
  margin-top: 20rpx;
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
}
</style>
