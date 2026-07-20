<template>
  <view class="paper-progress" :style="{ '--paper-progress': `${Math.max(0, Math.min(100, percent))}%`, '--paper-progress-color': color }" />
</template>

<script lang="ts" setup>
withDefaults(defineProps<{ percent: number, color?: string }>(), { color: '#F5A623' })
</script>

<style lang="scss" scoped>
@use '../../style/tokens' as *;
.paper-progress {
  width: 100%;
  height: 16rpx;
  overflow: hidden;
  border-radius: $radius-pill;
  background: $paper-deep;
}
.paper-progress::before {
  display: block;
  width: var(--paper-progress);
  height: 100%;
  border-radius: inherit;
  background: var(--paper-progress-color);
  transition: width $motion-base $ease-standard;
  content: '';
}
</style>
