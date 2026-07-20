<template>
  <view class="paper-card" :class="interactive ? 'paper-card--interactive' : ''" @click="interactive && emit('click', $event)">
    <slot />
  </view>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{ interactive?: boolean }>(), { interactive: false })
const emit = defineEmits<{ click: [event: Event] }>()
</script>

<style lang="scss" scoped>
@use '../../style/tokens' as *;
.paper-card {
  box-sizing: border-box;
  padding: $space-4;
  border: 2rpx solid rgba(234, 219, 203, 0.76);
  border-radius: $radius-card;
  color: $ink;
  background: $surface;
  box-shadow: $shadow-card;
}
.paper-card--interactive {
  touch-action: manipulation;
  transition:
    transform $motion-fast $ease-standard,
    box-shadow $motion-fast $ease-standard;
}
.paper-card--interactive:active {
  transform: scale(0.98);
  box-shadow: $shadow-press;
}
</style>
