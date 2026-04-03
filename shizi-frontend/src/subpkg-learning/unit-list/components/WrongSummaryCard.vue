<template>
  <view class="wrong-summary-card">
    <view class="summary-grid">
      <view class="summary-cell">
        <view class="summary-value">
          {{ unitCount }}
        </view>
        <view class="summary-label">
          待强化单元
        </view>
      </view>
      <view class="summary-cell">
        <view class="summary-value">
          {{ charCount }}
        </view>
        <view class="summary-label">
          待强化错字
        </view>
      </view>
      <view class="summary-cell">
        <view class="summary-value">
          {{ recentCharCount }}
        </view>
        <view class="summary-label">
          近24h新错
        </view>
      </view>
      <view class="summary-cell">
        <view class="summary-value summary-value--text">
          {{ primaryWeakness }}
        </view>
        <view class="summary-label">
          主要薄弱点
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
defineProps<{
  unitCount: number
  charCount: number
  recentCharCount: number
  primaryWeakness: string
}>()
</script>

<style lang="scss" scoped>
.wrong-summary-card {
  padding: 24rpx;
  margin-bottom: 24rpx;
  border-radius: 24rpx;
  background:
    radial-gradient(circle at 100% 0%, rgba(255, 214, 199, 0.35) 0%, rgba(255, 214, 199, 0) 36%),
    linear-gradient(180deg, #fff7f3 0%, #ffffff 100%);
  box-shadow: var(--shadow-card);
  border: 2rpx solid rgba(239, 125, 87, 0.18);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.summary-cell {
  min-width: 0;
  padding: 20rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: inset 0 0 0 2rpx rgba(255, 240, 235, 0.82);
}

.summary-value {
  font-size: 40rpx;
  font-weight: 700;
  color: var(--text-main);
}

.summary-value--text {
  font-size: 26rpx;
  line-height: 1.4;
}

.summary-label {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: var(--text-sub);
}
</style>
