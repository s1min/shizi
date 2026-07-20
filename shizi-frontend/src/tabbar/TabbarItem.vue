<script setup lang="ts">
import type { CustomTabBarItem } from './types'
import { computed } from 'vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import { tabbarStore } from './store'

const props = defineProps<{
  item: CustomTabBarItem
  index: number
  isBulge?: boolean
}>()

const isActive = computed(() => tabbarStore.curIdx === props.index)
const iconName = computed(() => {
  if (props.item.icon === 'i-carbon-book') {
    return 'book' as const
  }
  if (props.item.icon === 'i-carbon-user') {
    return 'user' as const
  }
  return 'home' as const
})

function getImageByIndex(index: number, item: CustomTabBarItem) {
  if (!item.iconActive) {
    console.warn('image 模式下，需要配置 iconActive (高亮时的图片），否则无法切换高亮图片')
    return item.icon
  }
  return tabbarStore.curIdx === index ? item.iconActive : item.icon
}
</script>

<template>
  <view
    class="tabbar-item"
    :class="{ 'tabbar-item--active': isActive, 'tabbar-item--bulge': isBulge }"
    :aria-label="item.text"
  >
    <UiIcon v-if="item.iconType !== 'image'" :name="iconName" :size="44" :label="item.text" />
    <template v-if="item.iconType === 'image'">
      <image :src="getImageByIndex(index, item)" mode="scaleToFill" :class="isBulge ? 'h-80px w-80px' : 'h-24px w-24px'" />
    </template>
    <view class="tabbar-item__label">
      {{ item.text }}
    </view>
    <view v-if="isActive" class="tabbar-item__bookmark" aria-hidden="true" />
    <view v-if="item.badge" class="tabbar-item__badge">
      <template v-if="item.badge === 'dot'">
        <view class="tabbar-item__badge-dot" />
      </template>
      <template v-else>
        <view class="tabbar-item__badge-count">
          {{ item.badge > 99 ? '99+' : item.badge }}
        </view>
      </template>
    </view>
  </view>
</template>

<style scoped lang="scss">
@use '../style/tokens' as *;

.tabbar-item {
  position: relative;
  display: flex;
  min-height: $touch-target;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  box-sizing: border-box;
  color: $ink-muted;
  touch-action: manipulation;
  transition:
    color $motion-fast $ease-standard,
    transform $motion-fast $ease-standard;
}

.tabbar-item:active {
  transform: scale(0.97);
}

.tabbar-item--active {
  color: $apricot;
}

.tabbar-item__label {
  font-family: $font-body;
  font-size: $font-caption;
  font-weight: 600;
  line-height: 1.2;
}

.tabbar-item__bookmark {
  position: absolute;
  right: 50%;
  bottom: -1rpx;
  width: 48rpx;
  height: 16rpx;
  transform: translateX(50%);
  border-radius: 8rpx 8rpx 0 0;
  background: $apricot;
}

.tabbar-item__badge {
  position: absolute;
  top: 6rpx;
  right: 24rpx;
}

.tabbar-item__badge-dot {
  display: block;
  width: 16rpx;
  height: 16rpx;
  border: 3rpx solid $paper;
  border-radius: 50%;
  background: $coral;
}

.tabbar-item__badge-count {
  min-width: 30rpx;
  padding: 2rpx 8rpx;
  border: 3rpx solid $paper;
  border-radius: $radius-pill;
  color: $surface;
  background: $coral;
  font-size: $font-caption;
  line-height: 1.2;
  text-align: center;
}
</style>
