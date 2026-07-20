<template>
  <view class="secondary-page-navbar" :style="navBarStyle">
    <view class="secondary-page-navbar__content" :style="navBarContentStyle">
      <button class="secondary-page-navbar__back" aria-label="返回" @click="handleBack">
        <UiIcon name="arrow-left" :size="40" label="返回" />
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
import UiIcon from '@/components/ui/UiIcon.vue'
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
@use '../../style/tokens' as *;

.secondary-page-navbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: $paper;
  border-bottom: 1rpx solid $line;
  box-sizing: border-box;
}

.secondary-page-navbar__content {
  display: grid;
  grid-template-columns: $touch-target 1fr $touch-target;
  align-items: center;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.secondary-page-navbar__back {
  width: $touch-target;
  height: $touch-target;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  color: $ink;
  border-radius: $radius-sm;

  &:active {
    background: $paper-deep;
  }
}

.secondary-page-navbar__title {
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  color: $ink-strong;
  font-family: $font-body;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.secondary-page-navbar__placeholder {
  width: $touch-target;
  height: $touch-target;
}
</style>
