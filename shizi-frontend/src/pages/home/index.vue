<template>
  <PaperPage class="home-page" safe-bottom>
    <view class="home-header">
      <view>
        <text class="home-eyebrow">小明的学习册</text>
        <text class="home-title">今天，认识几个字</text>
        <text class="home-meta">已掌握 {{ learnedCount }} 字 · 学习第 {{ streakDays }} 天</text>
      </view>
      <button class="parent-entry" aria-label="打开家长入口" @click="parentGateVisible = true">
        <UiIcon name="lock" :size="34" />
      </button>
    </view>

    <OfflineNotice v-if="isOffline" />

    <PaperCard class="today-card">
      <view class="bookmark">
        今日学习
      </view>
      <view class="today-card__body">
        <view class="today-card__copy">
          <text class="today-card__title">{{ taskTitle }}</text>
          <text class="today-card__summary">{{ taskSummary }}</text>
          <AudioPrompt
            v-if="uiMode.useVoicePrompt"
            class="today-card__audio"
            src=""
            label="播放任务说明"
            fallback-text="先复习，再学习新字"
          />
        </view>
        <view class="today-card__mark">
          <UiIcon :name="taskState === 'complete' ? 'check' : 'book'" :size="58" />
        </view>
      </view>
      <PaperButton variant="primary" :loading="starting" @click="startToday">
        {{ taskAction }}
      </PaperButton>
    </PaperCard>

    <view class="facts-row">
      <PaperCard class="fact-card">
        <text class="fact-value">{{ learnStore.todayReviewCount }}</text>
        <text class="fact-label">待复习</text>
        <button class="fact-action" :disabled="learnStore.todayReviewCount === 0" @click="goToReview">
          {{ learnStore.todayReviewCount > 0 ? '去复习' : '已完成' }}
          <UiIcon name="chevron-right" :size="28" />
        </button>
      </PaperCard>
      <PaperCard class="fact-card fact-card--soft">
        <text class="fact-value">{{ currentUnit?.name || '第一单元' }}</text>
        <text class="fact-label">当前学习单元</text>
        <button class="fact-action" @click="startUnit">
          {{ currentUnitActionText }}
          <UiIcon name="chevron-right" :size="28" />
        </button>
      </PaperCard>
    </view>

    <view class="home-progress">
      <view class="section-heading">
        <text>今天的学习进度</text>
        <text class="section-heading__value">{{ progressPercent }}%</text>
      </view>
      <PaperProgress :percent="progressPercent" />
      <text class="progress-hint">完成建议时长后，就可以把手机交还给家长啦</text>
    </view>

    <view v-if="parentGateVisible" class="gate-layer">
      <ParentGate reason="settings" @verified="handleParentVerified" @cancel="parentGateVisible = false" />
    </view>
  </PaperPage>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import AudioPrompt from '@/components/ui/AudioPrompt.vue'
import OfflineNotice from '@/components/ui/OfflineNotice.vue'
import PaperButton from '@/components/ui/PaperButton.vue'
import PaperCard from '@/components/ui/PaperCard.vue'
import PaperPage from '@/components/ui/PaperPage.vue'
import PaperProgress from '@/components/ui/PaperProgress.vue'
import ParentGate from '@/components/ui/ParentGate.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import { useLearnStore, useUiStore } from '@/store'
import { getTaskState, getUiMode } from '@/utils/ui-mode'

definePage({
  type: 'home',
  style: { navigationBarTitleText: '今日', navigationStyle: 'custom' },
})

const learnStore = useLearnStore()
const uiStore = useUiStore()
const uiMode = computed(() => getUiMode(uiStore.ageGroup))
const parentGateVisible = ref(false)
const starting = ref(false)
const isOffline = computed(() => learnStore.syncStatus === 'failed')

const currentUnit = computed(() => learnStore.currentUnit)
const learnedCount = computed(() => learnStore.learnedCount)
const streakDays = computed(() => learnStore.streakDays)
const currentProgress = computed(() => currentUnit.value ? learnStore.getUnitProgress(currentUnit.value.id) : null)
const progressPercent = computed(() => {
  const total = currentUnit.value?.chars.length || 0
  if (!total)
    return 0
  return Math.min(100, Math.round(((currentProgress.value?.charIndex || 0) / total) * 100))
})
const taskState = computed(() => getTaskState({
  hasResume: Boolean(currentProgress.value?.charIndex && !currentProgress.value?.learnCompleted),
  dueReviewCount: learnStore.todayReviewCount,
  availableNewCount: currentUnit.value && !currentProgress.value?.learnCompleted ? 1 : 0,
  isComplete: Boolean(currentProgress.value?.testCompleted),
}))
const taskTitle = computed(() => ({
  first: '打开今天的第一课',
  resume: '继续上次的学习',
  review: '先复习，再学新字',
  new: '开始今天的新字',
  complete: '今天完成啦',
  offline: '离线学习也可以继续',
}[taskState.value]))
const taskSummary = computed(() => {
  if (uiMode.value.ageGroup === 'early')
    return taskState.value === 'complete' ? '已经完成今天的学习' : '跟着声音和图片，一起学习吧'
  const review = learnStore.todayReviewCount
  const newCount = Math.max(0, learnStore.dailyCharCount || 3)
  return taskState.value === 'complete' ? '可以把手机交还给家长了' : `复习 ${review} 个字 · 新学 ${newCount} 个字`
})
const taskAction = computed(() => taskState.value === 'resume' ? '继续学习' : taskState.value === 'complete' ? '查看学习记录' : '开始今天的学习')
const currentUnitActionText = computed(() => {
  const status = currentUnit.value ? learnStore.getUnitTaskStatus(currentUnit.value.id) : 'not_started'
  return status === 'learning' ? '继续' : status === 'ready_for_test' ? '小测' : status === 'tested' ? '再看一遍' : '开始'
})

onMounted(() => {
  learnStore.loadLibraryFromApi()
  learnStore.loadCharsFromApi()
})

function startToday() {
  if (starting.value)
    return
  if (taskState.value === 'complete') {
    uni.navigateTo({ url: '/subpkg-learning/review/index' })
    return
  }
  starting.value = true
  if (taskState.value === 'review') {
    uni.navigateTo({ url: '/subpkg-learning/review/index' })
  }
  else {
    startUnit()
  }
  setTimeout(() => {
    starting.value = false
  }, 240)
}

function startUnit() {
  if (!currentUnit.value)
    return
  const status = learnStore.getUnitTaskStatus(currentUnit.value.id)
  const page = status === 'ready_for_test' || status === 'tested' ? 'unit-test' : 'index'
  uni.navigateTo({ url: `/subpkg-learning/learn/${page}?unitId=${currentUnit.value.id}` })
}

function goToReview() {
  if (learnStore.todayReviewCount > 0)
    uni.navigateTo({ url: '/subpkg-learning/review/index' })
}

function handleParentVerified() {
  parentGateVisible.value = false
  uni.navigateTo({ url: '/pages/me/index?parent=1' })
}
</script>

<style lang="scss" scoped>
@use '../../style/tokens' as *;

.home-page {
  padding-top: calc(env(safe-area-inset-top) + 32rpx);
}
.home-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 32rpx;
}
.home-eyebrow {
  display: block;
  color: $ink-muted;
  font-size: $font-body-size;
}
.home-title {
  display: block;
  margin-top: 8rpx;
  color: $ink-strong;
  font-family: $font-display;
  font-size: $font-display-md;
  font-weight: 700;
}
.home-meta {
  display: block;
  margin-top: 12rpx;
  color: $ink-muted;
  font-size: $font-label;
}
.parent-entry {
  width: $touch-target;
  height: $touch-target;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 2rpx solid $line;
  border-radius: 50%;
  color: $ink-muted;
  background: $surface;
}
.today-card {
  position: relative;
  margin-bottom: 24rpx;
  padding-top: 64rpx;
  overflow: hidden;
}
.bookmark {
  position: absolute;
  top: 0;
  left: 32rpx;
  padding: 12rpx 24rpx;
  color: $apricot-dark;
  background: $apricot-soft;
  font-size: $font-label;
  font-weight: 700;
}
.today-card__body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  margin-bottom: 32rpx;
}
.today-card__title {
  display: block;
  color: $ink-strong;
  font-family: $font-display;
  font-size: $font-display-md;
  font-weight: 700;
}
.today-card__summary {
  display: block;
  margin-top: 12rpx;
  color: $ink-muted;
  font-size: $font-body-size;
  line-height: 1.5;
}
.today-card__audio {
  margin-top: 20rpx;
}
.today-card__mark {
  width: 112rpx;
  height: 112rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  border-radius: 32rpx;
  color: $apricot-dark;
  background: $apricot-soft;
}
.facts-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20rpx;
}
.fact-card {
  min-height: 188rpx;
  padding: 24rpx;
}
.fact-card--soft {
  background: $surface-soft;
}
.fact-value {
  display: block;
  overflow: hidden;
  color: $ink-strong;
  font-family: $font-number;
  font-size: 42rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.fact-label {
  display: block;
  margin-top: 8rpx;
  color: $ink-muted;
  font-size: $font-label;
}
.fact-action {
  display: inline-flex;
  align-items: center;
  gap: 4rpx;
  min-height: 64rpx;
  margin-top: 16rpx;
  padding: 0;
  border: 0;
  color: $sky-dark;
  background: transparent;
  font-size: $font-label;
}
.fact-action[disabled] {
  color: $disabled;
}
.home-progress {
  margin-top: 40rpx;
  padding: 0 8rpx;
}
.section-heading {
  display: flex;
  justify-content: space-between;
  color: $ink-strong;
  font-size: $font-body-size;
  font-weight: 700;
}
.section-heading__value {
  color: $apricot-dark;
  font-family: $font-number;
}
.progress-hint {
  display: block;
  margin-top: 16rpx;
  color: $ink-muted;
  font-size: $font-caption;
}
.gate-layer :deep(.parent-gate) {
  z-index: 1100;
}
</style>
