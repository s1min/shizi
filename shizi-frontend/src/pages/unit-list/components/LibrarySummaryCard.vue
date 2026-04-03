<template>
  <view class="library-summary-card">
    <view class="card-head">
      <view class="card-copy">
        <view class="eyebrow">
          当前字库
        </view>
        <view class="title">
          {{ libraryName }}
        </view>
        <view class="desc">
          {{ mode === 'unit'
            ? '查看全部单元学习情况，安排复习或测试'
            : '优先处理本字库内需要反复巩固的单元' }}
        </view>
      </view>
      <view class="action-wrap">
        <wd-button size="small" plain @click="emit('switch-library')">
          切换字库
        </wd-button>
      </view>
    </view>

    <view class="summary-row">
      <view v-for="item in summaryItems" :key="item.label" class="summary-item" :class="`tone-${item.tone || 'default'}`">
        <text class="summary-label">{{ item.label }}</text>
        <text class="summary-value">{{ item.value }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { SummaryItem, UnitPageTab } from '../types'

defineProps<{
  libraryName: string
  mode: UnitPageTab
  summaryItems: SummaryItem[]
}>()

const emit = defineEmits<{
  (e: 'switch-library'): void
}>()
</script>

<style lang="scss" scoped>
.library-summary-card {
  padding: 28rpx;
  margin-bottom: 20rpx;
  background:
    radial-gradient(circle at 100% 0%, rgba(255, 235, 205, 0.42) 0%, rgba(255, 235, 205, 0) 34%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 250, 245, 0.98) 100%);
  border-radius: 24rpx;
  box-shadow: var(--shadow-card);
  border: 2rpx solid rgba(239, 231, 220, 0.72);
}

.card-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.card-copy {
  flex: 1;
  min-width: 0;
}

.action-wrap {
  flex-shrink: 0;
  padding-top: 2rpx;
  margin-left: auto;
}

.eyebrow {
  font-size: 22rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
  color: var(--text-muted);
}

.title {
  margin-top: 8rpx;
  font-size: 36rpx;
  font-weight: 700;
  color: var(--text-main);
}

.desc {
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.5;
  color: var(--text-sub);
  max-width: 460rpx;
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
  min-width: 0;
  padding: 16rpx 18rpx;
  border-radius: 18rpx;
  background: rgba(255, 248, 240, 0.92);
  box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.68);
  color: var(--text-sub);
}

.summary-value {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--text-main);
}

.summary-label {
  font-size: 22rpx;
  color: var(--text-sub);
}

.tone-primary {
  background: var(--bg-soft-blue);
}

.tone-warning {
  background: var(--bg-soft-orange);
}

.tone-success {
  background: var(--bg-soft-green);
}

.tone-danger {
  background: var(--bg-soft-red);
}
</style>
