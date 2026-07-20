<template>
  <view class="empty-state">
    <view class="empty-state__icon">
      <UiIcon name="book" :size="46" />
    </view>
    <text class="empty-state__title">{{ title }}</text>
    <text class="empty-state__description">{{ description }}</text>
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
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $space-8 $space-4;
  text-align: center;
}
.empty-state__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  color: $sky-dark;
  background: $sky-soft;
}
.empty-state__title {
  margin-top: $space-3;
  color: $ink-strong;
  font-size: $font-title;
  font-weight: 700;
}
.empty-state__description {
  margin-top: $space-2;
  color: $ink-muted;
  font-size: $font-body-size;
  line-height: $line-height-body;
}
.empty-state .paper-button {
  margin-top: $space-4;
}
</style>
