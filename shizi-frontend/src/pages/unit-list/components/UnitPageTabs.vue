<template>
  <view class="unit-page-tabs">
    <view
      class="tab-item"
      :class="{ 'is-active': modelValue === 'unit' }"
      @click="emit('update:modelValue', 'unit')"
    >
      单元复习
    </view>
    <view
      class="tab-item"
      :class="{ 'is-active': modelValue === 'wrong' }"
      @click="emit('update:modelValue', 'wrong')"
    >
      常错字强化
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { UnitPageTab } from '../types'

defineProps<{
  modelValue: UnitPageTab
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: UnitPageTab): void
}>()
</script>

<style lang="scss" scoped>
.unit-page-tabs {
  display: flex;
  align-items: center;
  width: 420rpx;
  padding: 6rpx;
  border-radius: 999rpx;
  background: rgba(255, 248, 240, 0.92);
  box-shadow: inset 0 0 0 2rpx rgba(239, 231, 220, 0.95);
}

.tab-item {
  flex: 1;
  height: 56rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 600;
  line-height: 56rpx;
  text-align: center;
  color: var(--text-sub);
  transition: all 0.2s ease;
}

.tab-item.is-active {
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 8rpx 18rpx rgba(74, 55, 40, 0.08);
}
</style>
