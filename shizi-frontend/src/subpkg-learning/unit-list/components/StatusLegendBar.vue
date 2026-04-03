<template>
  <view class="status-legend-bar">
    <template v-if="mode === 'unit'">
      <view class="legend-item">
        <view class="dot dot-not-started" />
        <text>未学习</text>
      </view>
      <view class="legend-item">
        <view class="dot dot-learning" />
        <text>学习中</text>
      </view>
      <view class="legend-item">
        <view class="dot dot-ready" />
        <text>待测试</text>
      </view>
      <view class="legend-item">
        <view class="dot dot-tested" />
        <text>已测试</text>
      </view>
    </template>

    <template v-else>
      <view class="legend-item">
        <view class="dot dot-wrong" />
        <text>待强化</text>
      </view>
      <view class="legend-item">
        <view class="dot dot-cleared" />
        <text>已清空</text>
      </view>
    </template>
  </view>
</template>

<script lang="ts" setup>
import type { UnitPageTab } from '../types'

defineProps<{
  mode: UnitPageTab
}>()
</script>

<style lang="scss" scoped>
.status-legend-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16rpx 20rpx;
  padding: 0 6rpx 20rpx;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  font-size: 22rpx;
  color: var(--text-sub);
}

.dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
}

.dot-not-started {
  background: var(--status-not-started);
}

.dot-learning {
  background: var(--status-learning);
}

.dot-ready {
  background: var(--status-ready);
}

.dot-tested {
  background: var(--status-tested);
}

.dot-wrong {
  background: var(--status-wrong);
}

.dot-cleared {
  background: var(--status-tested);
}
</style>
