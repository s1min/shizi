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
  padding: 32rpx;
  margin-bottom: 24rpx;
  border-radius: 32rpx;
  background:
    radial-gradient(circle at 100% 0%, rgba(255, 232, 204, 0.4) 0%, rgba(255, 232, 204, 0) 32%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 251, 246, 0.96) 100%);
  box-shadow: var(--shadow-card);
  border: 2rpx solid rgba(245, 235, 224, 0.9);
}

:deep(.theme-modern) .library-summary-card,
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
</style>
