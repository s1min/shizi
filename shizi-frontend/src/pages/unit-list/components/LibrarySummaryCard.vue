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
</style>
