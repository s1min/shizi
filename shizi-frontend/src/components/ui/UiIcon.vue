<script lang="ts" setup>
import type { UiIconName } from '@/types/ui'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  name: UiIconName
  size?: number | string
  color?: string
  label?: string
}>(), {
  size: 40,
  color: 'currentColor',
  label: '',
})

const paths: Record<UiIconName, string[]> = {
  'arrow-left': ['M20 12H4', 'm10 18-6-6 6-6'],
  'book': ['M4 19.5A2.5 2.5 0 0 1 6.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z'],
  'check': ['m5 12 4 4L19 6'],
  'chevron-right': ['m9 18 6-6-6-6'],
  'close': ['M18 6 6 18', 'm6 6 12 12'],
  'error': ['M12 8v4', 'M12 16h.01', 'M10.3 3.4 2 17.5A2 2 0 0 0 3.7 20h16.6a2 2 0 0 0 1.7-2.5L13.7 3.4a2 2 0 0 0-3.4 0Z'],
  'home': ['m3 11 9-8 9 8', 'M5 10v10h14V10', 'M9 20v-6h6v6'],
  'info': ['M12 16v-4', 'M12 8h.01', 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z'],
  'lock': ['M7 11V7a5 5 0 0 1 10 0v4', 'M5 11h14v10H5z', 'M12 15v2'],
  'pause': ['M9 5v14', 'M15 5v14'],
  'play': ['m8 5 11 7-11 7Z'],
  'refresh': ['M20 6v5h-5', 'M4 18v-5h5', 'M18.5 9A7 7 0 0 0 6.2 6.2L4 11', 'M5.5 15A7 7 0 0 0 17.8 17.8L20 13'],
  'settings': ['M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z', 'M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 3.4-.2-.1a1.7 1.7 0 0 0-1.9-.2l-1 .6a1.7 1.7 0 0 0-.9 1.6v.2h-4v-.2a1.7 1.7 0 0 0-.9-1.6l-1-.6a1.7 1.7 0 0 0-1.9.2l-.2.1-2-3.4.1-.1A1.7 1.7 0 0 0 4.6 15l-.6-1a1.7 1.7 0 0 0-1.6-.9h-.2v-4h.2A1.7 1.7 0 0 0 4 8.2l.6-1a1.7 1.7 0 0 0-.3-1.9l-.1-.1 2-3.4.2.1a1.7 1.7 0 0 0 1.9.2l1-.6a1.7 1.7 0 0 0 .9-1.6v-.2h4v.2a1.7 1.7 0 0 0 .9 1.6l1 .6a1.7 1.7 0 0 0 1.9-.2l.2-.1 2 3.4-.1.1a1.7 1.7 0 0 0-.3 1.9l.6 1a1.7 1.7 0 0 0 1.6.9h.2v4H22a1.7 1.7 0 0 0-1.6.9Z'],
  'speaker': ['M11 5 6 9H2v6h4l5 4Z', 'M15.5 8.5a5 5 0 0 1 0 7', 'M18 6a8 8 0 0 1 0 12'],
  'user': ['M20 21a8 8 0 0 0-16 0', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'],
  'volume-off': ['M11 5 6 9H2v6h4l5 4Z', 'm22 9-6 6', 'm16 9 6 6'],
}

const normalizedSize = computed(() => typeof props.size === 'number' ? `${props.size}rpx` : props.size)
const iconPaths = computed(() => paths[props.name])
</script>

<template>
  <svg
    class="ui-icon"
    :style="{ width: normalizedSize, height: normalizedSize, color }"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :aria-label="label || undefined"
    :aria-hidden="label ? 'false' : 'true'"
    role="img"
  >
    <path
      v-for="(path, index) in iconPaths"
      :key="index"
      :d="path"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<style scoped>
.ui-icon {
  display: block;
  flex: 0 0 auto;
}
</style>
