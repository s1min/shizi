<template>
  <view class="error-state">
    <view class="error-state__icon">
      <UiIcon name="error" :size="46" />
    </view>
    <text class="error-state__title">{{ title }}</text>
    <text class="error-state__description">{{ description }}</text>
    <PaperButton v-if="actionText" variant="secondary" @click="emit('action')">
      {{ actionText }}
    </PaperButton>
  </view>
</template>

<script lang="ts" setup>
import PaperButton from './PaperButton.vue'
import UiIcon from './UiIcon.vue'

defineProps<{ title: string, description: string, actionText?: string }>()
const emit = defineEmits<{ action: [] }>()
</script>

<style lang="scss" scoped>
@use '../../style/tokens' as *;

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $space-8 $space-4;
  text-align: center;
}

.error-state__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  color: $coral-dark;
  background: $coral-soft;
}

.error-state__title {
  margin-top: $space-3;
  color: $ink-strong;
  font-size: $font-title;
  font-weight: 700;
}

.error-state__description {
  margin-top: $space-2;
  color: $ink-muted;
  font-size: $font-body-size;
  line-height: $line-height-body;
}

.error-state .paper-button {
  margin-top: $space-4;
}
</style>
