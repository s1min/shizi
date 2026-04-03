<template>
  <view class="unit-stage-section">
    <view class="stage-title-row">
      <view class="stage-accent" />
      <view class="stage-title">
        {{ title }}
      </view>
    </view>

    <view class="unit-list">
      <UnitTaskCard
        v-for="unit in units"
        :key="unit.id"
        :unit="unit"
        :mode="mode"
        :highlighted="highlightUnitId === unit.id"
        @primary="emit('primary', $event)"
        @secondary="emit('secondary', $event)"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import UnitTaskCard from './UnitTaskCard.vue'
import type { UnitCardViewModel, UnitPageTab } from '../types'

defineProps<{
  title: string
  units: UnitCardViewModel[]
  mode: UnitPageTab
  highlightUnitId?: string
}>()

const emit = defineEmits<{
  (e: 'primary', unitId: string): void
  (e: 'secondary', unitId: string): void
}>()
</script>

<style lang="scss" scoped>
.unit-stage-section {
  margin-bottom: 24rpx;
}

.stage-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 8rpx 8rpx 18rpx;
}

.stage-accent {
  width: 8rpx;
  height: 28rpx;
  border-radius: 999rpx;
  background: linear-gradient(180deg, var(--status-learning) 0%, var(--status-ready) 100%);
}

.stage-title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--text-main);
}

.unit-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
</style>
