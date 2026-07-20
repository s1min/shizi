<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useUiStore } from '@/store/ui'
import UiIcon from './UiIcon.vue'

type AudioState = 'idle' | 'loading' | 'playing' | 'failed'

const props = withDefaults(defineProps<{
  src: string
  label: string
  fallbackText: string
  autoPlay?: boolean
}>(), {
  autoPlay: false,
})

const emit = defineEmits<{
  ended: []
  error: []
}>()

const uiStore = useUiStore()
const state = ref<AudioState>('idle')
let audio: ReturnType<typeof uni.createInnerAudioContext> | null = null

const iconName = computed(() => {
  if (!uiStore.audioEnabled || state.value === 'failed')
    return 'volume-off' as const
  if (state.value === 'playing')
    return 'pause' as const
  return 'speaker' as const
})

const statusLabel = computed(() => {
  if (!uiStore.audioEnabled)
    return '声音已关闭'
  if (state.value === 'loading')
    return '声音准备中'
  if (state.value === 'playing')
    return '正在播放'
  if (state.value === 'failed')
    return '声音没有准备好'
  return props.label
})

function destroyAudio() {
  audio?.stop()
  audio?.destroy()
  audio = null
}

function prepareAudio() {
  destroyAudio()
  if (!props.src) {
    state.value = 'failed'
    return null
  }

  const context = uni.createInnerAudioContext()
  context.autoplay = false
  context.src = props.src
  context.onCanplay(() => {
    if (state.value === 'loading')
      state.value = 'playing'
  })
  context.onPlay(() => {
    state.value = 'playing'
  })
  context.onEnded(() => {
    state.value = 'idle'
    emit('ended')
  })
  context.onStop(() => {
    if (state.value !== 'failed')
      state.value = 'idle'
  })
  context.onError(() => {
    state.value = 'failed'
    emit('error')
    destroyAudio()
  })
  audio = context
  return context
}

function toggleAudio() {
  if (!uiStore.audioEnabled || state.value === 'failed')
    return

  if (state.value === 'playing') {
    audio?.pause()
    state.value = 'idle'
    return
  }

  state.value = 'loading'
  const context = audio ?? prepareAudio()
  context?.play()
}

function maybeAutoPlay() {
  if (props.autoPlay && uiStore.audioEnabled)
    toggleAudio()
}

watch(() => props.src, () => {
  destroyAudio()
  state.value = props.src ? 'idle' : 'failed'
  maybeAutoPlay()
})

watch(() => uiStore.audioEnabled, (enabled) => {
  if (!enabled) {
    destroyAudio()
    state.value = 'idle'
  }
})

onMounted(maybeAutoPlay)
onBeforeUnmount(destroyAudio)
</script>

<template>
  <view class="audio-prompt">
    <button
      class="audio-prompt__button"
      :class="{ 'audio-prompt__button--disabled': !uiStore.audioEnabled || state === 'failed' }"
      :disabled="!uiStore.audioEnabled || state === 'failed'"
      :aria-label="statusLabel"
      @click="toggleAudio"
    >
      <view v-if="state === 'loading'" class="audio-prompt__loader" aria-hidden="true" />
      <UiIcon v-else :name="iconName" :size="40" />
      <text>{{ statusLabel }}</text>
    </button>
    <text v-if="!uiStore.audioEnabled || state === 'failed'" class="audio-prompt__fallback">
      {{ fallbackText }}
    </text>
  </view>
</template>

<style lang="scss" scoped>
@use '../../style/tokens' as *;

.audio-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-2;
}

.audio-prompt__button {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  min-width: 240rpx;
  min-height: $touch-target;
  margin: 0;
  padding: $space-2 $space-4;
  border: 2rpx solid rgba(93, 173, 226, 0.34);
  border-radius: $radius-pill;
  color: $sky-dark;
  background: $sky-soft;
  font-family: $font-body;
  font-size: $font-body-size;
  font-weight: 700;
  cursor: pointer;
  touch-action: manipulation;
  transition:
    box-shadow $motion-fast $ease-standard,
    transform $motion-fast $ease-standard;
}

.audio-prompt__button::after {
  border: 0;
}

.audio-prompt__button:active {
  box-shadow: $shadow-press;
  transform: scale(0.98);
}

.audio-prompt__button--disabled {
  color: $ink-muted;
  background: $paper-deep;
  border-color: $line;
  opacity: 1;
}

.audio-prompt__loader {
  width: 32rpx;
  height: 32rpx;
  border: 4rpx solid rgba(38, 108, 152, 0.24);
  border-top-color: $sky-dark;
  border-radius: 50%;
  animation: audio-prompt-spin 0.8s linear infinite;
}

.audio-prompt__fallback {
  color: $ink-muted;
  font-size: $font-label;
  line-height: $line-height-label;
  text-align: center;
}

@keyframes audio-prompt-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .audio-prompt__button {
    transition-duration: 1ms;
  }

  .audio-prompt__loader {
    animation: none;
  }
}
</style>
