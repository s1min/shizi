<template>
  <view class="child-instruction">
    <UiIcon :name="icon" :size="32" :color="iconColor" />
    <text class="child-instruction__text">{{ text }}</text>
    <AudioPrompt
      v-if="mode.useVoicePrompt && audioSrc"
      :src="audioSrc"
      :label="audioLabel"
      :fallback-text="text"
    />
  </view>
</template>

<script lang="ts" setup>
import type { UiIconName, UiMode } from '@/types/ui'
import AudioPrompt from '@/components/ui/AudioPrompt.vue'
import UiIcon from '@/components/ui/UiIcon.vue'

withDefaults(defineProps<{
  text: string
  mode: UiMode
  icon?: UiIconName
  iconColor?: string
  audioSrc?: string
  audioLabel?: string
}>(), {
  icon: 'info',
  iconColor: '#5dade2',
  audioSrc: '',
  audioLabel: '听一听提示',
})
</script>

<style lang="scss" scoped>
@use '../../../style/tokens' as *;
.child-instruction {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  min-height: $touch-target;
  color: $ink-muted;
  font-size: $font-body-size;
  line-height: $line-height-body;
  text-align: center;
}
.child-instruction__text {
  flex: 1;
}
.child-instruction :deep(.audio-prompt) {
  flex: 0 0 auto;
}
.child-instruction :deep(.audio-prompt__button) {
  min-width: 88rpx;
  padding: 0 $space-2;
}
.child-instruction :deep(.audio-prompt__button text) {
  display: none;
}
</style>
