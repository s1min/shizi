<template>
  <view class="secondary-page-navbar" :style="navBarStyle">
    <view class="secondary-page-navbar__content" :style="navBarContentStyle">
      <button class="secondary-page-navbar__back" @click="handleBack">
        <text class="secondary-page-navbar__back-icon">←</text>
      </button>
      <view class="secondary-page-navbar__title">
        {{ title }}
      </view>
      <view class="secondary-page-navbar__placeholder" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { getCustomNavBarMetrics } from '@/utils/navbar'
import { navigateBackOrTo } from '@/utils/navigation'

const props = withDefaults(defineProps<{
  title: string
  fallbackUrl: string
  fallbackIsTab?: boolean
}>(), {
  fallbackIsTab: false,
})

const metrics = getCustomNavBarMetrics()

const navBarStyle = computed(() => ({
  height: `${metrics.navBarHeight}px`,
  paddingTop: `${metrics.navBarPaddingTop}px`,
}))

const navBarContentStyle = computed(() => ({
  height: `${metrics.navBarContentHeight}px`,
}))

function handleBack() {
  navigateBackOrTo(props.fallbackUrl, props.fallbackIsTab)
}
</script>

<style lang="scss" scoped>
.secondary-page-navbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
  box-sizing: border-box;
}

.secondary-page-navbar__content {
  display: grid;
  grid-template-columns: 72rpx 1fr 72rpx;
  align-items: center;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.secondary-page-navbar__back {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  color: #333;
}

.secondary-page-navbar__back-icon {
  font-size: 36rpx;
  line-height: 1;
}

.secondary-page-navbar__title {
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.secondary-page-navbar__placeholder {
  width: 72rpx;
  height: 72rpx;
}
</style>
