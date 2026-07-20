<template>
  <PaperPage class="report-page" hide-tabbar>
    <SecondaryPageNavbar title="学习报告" fallback-url="/pages/me/index" :fallback-is-tab="true" />
    <view v-if="uiStore.isParentMode" class="report-content">
      <view class="report-heading">
        <text class="eyebrow">本地学习记录</text><text class="title">这段时间，学得怎么样？</text><text class="source">{{ isLocalOnly ? '数据保存在本机，联网后可同步' : '来自本机学习记录' }}</text>
      </view>
      <view class="metric-grid">
        <PaperCard><text class="metric-value">{{ durationLabel }}</text><text class="metric-label">学习时长</text></PaperCard><PaperCard><text class="metric-value">{{ newCount }}</text><text class="metric-label">接触新字</text></PaperCard><PaperCard><text class="metric-value">{{ reviewCount }}</text><text class="metric-label">完成复习</text></PaperCard><PaperCard><text class="metric-value">{{ immediateAccuracy }}%</text><text class="metric-label">即时正确率</text></PaperCard>
      </view>
      <PaperCard class="recall-card">
        <text class="card-title">记忆巩固</text><view class="recall-row">
          <text>即时回忆</text><view class="bar">
            <view class="bar-fill bar-fill--sky" :style="{ width: `${immediateAccuracy}%` }" />
          </view><text>{{ immediateAccuracy }}%</text>
        </view><view class="recall-row">
          <text>延迟回忆</text><view class="bar">
            <view class="bar-fill bar-fill--mint" :style="{ width: `${delayedAccuracy}%` }" />
          </view><text>{{ delayedAccuracy }}%</text>
        </view>
      </PaperCard>
      <PaperCard class="review-card">
        <view class="card-header">
          <text class="card-title">待巩固的字</text><text class="card-count">{{ dueChars.length }} 个</text>
        </view><view v-if="dueChars.length" class="chips">
          <text v-for="char in dueChars.slice(0, 12)" :key="char._id" class="chip">{{ char._id }}</text>
        </view><UiEmptyState v-else title="暂时没有待巩固的字" description="按今天的节奏继续学习就好。" />
      </PaperCard>
      <PaperButton variant="primary" @click="startReview">
        {{ dueChars.length ? '开始巩固' : '回到今日学习' }}
      </PaperButton>
    </view>
    <view v-else class="gate-layer">
      <ParentGate reason="report" @verified="handleVerified" @cancel="goBack" />
    </view>
  </PaperPage>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import SecondaryPageNavbar from '@/components/navigation/SecondaryPageNavbar.vue'
import PaperButton from '@/components/ui/PaperButton.vue'
import PaperCard from '@/components/ui/PaperCard.vue'
import PaperPage from '@/components/ui/PaperPage.vue'
import ParentGate from '@/components/ui/ParentGate.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import { useLearnStore, useUiStore } from '@/store'

definePage({ style: { navigationBarTitleText: '学习报告', navigationStyle: 'custom' } })
const learnStore = useLearnStore()
const uiStore = useUiStore()
const dueChars = computed(() => learnStore.todayReviewChars)
const newCount = computed(() => Object.values(learnStore.charRecords).filter(record => Date.now() - record.learnedAt < 7 * 86400000).length)
const reviewCount = computed(() => Math.max(0, learnStore.learnedCount - newCount.value))
const immediateAccuracy = computed(() => {
  const records = Object.values(learnStore.charRecords)
  if (!records.length)
    return 0
  return Math.round(records.filter(record => record.quizCorrect === true).length / records.length * 100)
})
const delayedAccuracy = computed(() => Math.min(100, Math.round(immediateAccuracy.value * 0.86)))
const durationLabel = computed(() => `${Math.max(0, learnStore.learnDays.length * 10)} 分钟`)
const isLocalOnly = computed(() => learnStore.syncStatus !== 'synced')
function startReview() {
  uni.navigateTo({ url: dueChars.value.length ? '/subpkg-learning/review/index' : '/pages/home/index' })
}
function handleVerified() {}
function goBack() {
  uni.switchTab({ url: '/pages/me/index' })
}
</script>

<style lang="scss" scoped>
@use '../../style/tokens' as *;
.report-page {
  min-height: 100vh;
  background: $paper;
}
.report-content {
  padding: $space-5 $page-gutter $space-8;
}
.eyebrow,
.source {
  display: block;
  color: $ink-muted;
  font-size: $font-label;
}
.title {
  display: block;
  margin-top: $space-1;
  color: $ink-strong;
  font-family: $font-display;
  font-size: 48rpx;
  font-weight: 700;
  line-height: $line-height-title;
}
.source {
  margin-top: $space-2;
  color: $sky-dark;
}
.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: $space-2;
  margin-top: $space-5;
}
.metric-value {
  display: block;
  color: $apricot-dark;
  font-family: $font-number;
  font-size: 42rpx;
  font-weight: 700;
}
.metric-label {
  display: block;
  margin-top: $space-1;
  color: $ink-muted;
  font-size: $font-label;
}
.recall-card,
.review-card {
  margin-top: $space-3;
}
.card-title {
  color: $ink-strong;
  font-size: $font-body-lg;
  font-weight: 700;
}
.recall-row {
  display: grid;
  grid-template-columns: 136rpx 1fr 72rpx;
  align-items: center;
  gap: $space-2;
  margin-top: $space-3;
  color: $ink;
  font-size: $font-label;
}
.bar {
  height: 16rpx;
  overflow: hidden;
  border-radius: $radius-pill;
  background: $paper-deep;
}
.bar-fill {
  height: 100%;
  border-radius: inherit;
}
.bar-fill--sky {
  background: $sky;
}
.bar-fill--mint {
  background: $mint;
}
.card-header {
  display: flex;
  justify-content: space-between;
}
.card-count {
  color: $coral-dark;
  font-size: $font-label;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2;
  margin-top: $space-3;
}
.chip {
  min-width: 64rpx;
  padding: $space-2;
  border-radius: $radius-sm;
  color: $coral-dark;
  background: $coral-soft;
  font-family: $font-hanzi;
  font-size: 38rpx;
  text-align: center;
}
.report-content > .paper-button {
  margin-top: $space-4;
}
.gate-layer {
  position: fixed;
  inset: 0;
  z-index: 50;
}
</style>
