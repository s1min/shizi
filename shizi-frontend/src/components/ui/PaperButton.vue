<template>
  <button class="paper-button" :class="`paper-button--${variant}`" :disabled="disabled || loading" @click="$emit('click', $event)">
    <text v-if="loading">处理中...</text>
    <slot v-else />
  </button>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{ variant?: 'primary' | 'secondary' | 'review' | 'success' | 'danger' | 'ghost', loading?: boolean, disabled?: boolean }>(), { variant: 'primary', loading: false, disabled: false })
defineEmits<{ click: [event: Event] }>()
</script>

<style lang="scss" scoped>
@use '../../style/tokens' as *;
.paper-button {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: $touch-target;
  padding: $space-2 $space-4;
  border: 2rpx solid transparent;
  border-radius: $radius-pill;
  font-family: $font-body;
  font-size: $font-body-lg;
  font-weight: 700;
  line-height: $line-height-title;
  touch-action: manipulation;
  transition:
    transform $motion-fast $ease-standard,
    box-shadow $motion-fast $ease-standard,
    opacity $motion-fast $ease-standard;
}
.paper-button::after {
  border: 0;
}
.paper-button:active {
  transform: translateY(2rpx) scale(0.99);
  box-shadow: $shadow-press;
}
.paper-button:disabled {
  opacity: 0.45;
}
.paper-button--primary {
  color: $surface;
  background: $apricot;
  box-shadow: 0 10rpx 22rpx rgba(184, 110, 8, 0.22);
}
.paper-button--secondary {
  border-color: $line-strong;
  color: $apricot-dark;
  background: $surface;
}
.paper-button--review {
  border-color: rgba(93, 173, 226, 0.36);
  color: $sky-dark;
  background: $sky-soft;
}
.paper-button--success {
  color: $surface;
  background: $mint;
}
.paper-button--danger {
  color: $surface;
  background: $coral;
}
.paper-button--ghost {
  color: $ink-muted;
  background: transparent;
}
</style>
