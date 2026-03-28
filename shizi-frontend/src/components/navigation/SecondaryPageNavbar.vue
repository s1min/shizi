<template>
  <view class="secondary-page-navbar">
    <wd-navbar
      :title="title"
      left-arrow
      safe-area-inset-top
      @click-left="handleBack"
    />
  </view>
</template>

<script lang="ts" setup>
import { navigateBackOrTo } from '@/utils/navigation'

const props = withDefaults(defineProps<{
  title: string
  fallbackUrl: string
  fallbackIsTab?: boolean
}>(), {
  fallbackIsTab: false,
})

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
}
</style>
