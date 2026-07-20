<template>
  <view class="offline-notice">
    <UiIcon name="info" :size="28" /><text>当前为本地学习模式，联网后会同步进度</text>
  </view>
</template>

<script lang="ts" setup>
import UiIcon from './UiIcon.vue'
</script>

<style lang="scss" scoped>
@use '../../style/tokens' as *;
.offline-notice {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 24rpx;
  padding: 16rpx 20rpx;
  border-radius: $radius-sm;
  color: $sky-dark;
  background: $sky-soft;
  font-size: $font-caption;
}
</style>
