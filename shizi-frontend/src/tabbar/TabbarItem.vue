<script setup lang="ts">
import type { CustomTabBarItem } from './types'
import { computed } from 'vue'
import { tabbarStore } from './store'

const props = defineProps<{
  item: CustomTabBarItem
  index: number
  isBulge?: boolean
}>()

const active = computed(() => tabbarStore.curIdx === props.index)
</script>

<template>
  <view class="flex flex-col items-center justify-center">
    <wd-icon
      :name="item.icon"
      :size="isBulge ? '40px' : '20px'"
      :color="active ? 'var(--wot-color-theme, #F5A623)' : '#666'"
    />
    <view v-if="!isBulge" class="mt-2px text-12px">
      {{ item.text }}
    </view>
    <view v-if="item.badge">
      <template v-if="item.badge === 'dot'">
        <view class="absolute right-0 top-0 h-2 w-2 rounded-full bg-#f56c6c" />
      </template>
      <template v-else>
        <view class="absolute top-0 box-border h-5 min-w-5 center rounded-full bg-#f56c6c px-1 text-center text-xs text-white -right-3">
          {{ item.badge > 99 ? '99+' : item.badge }}
        </view>
      </template>
    </view>
  </view>
</template>
