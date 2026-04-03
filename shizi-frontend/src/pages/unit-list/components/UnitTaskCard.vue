<template>
  <wd-card :custom-class="customClass">
    <template #title>
      <view class="unit-card-head">
        <view class="unit-name">
          {{ unit.name }}
        </view>
        <wd-tag round :type="tagType">
          {{ tagText }}
        </wd-tag>
      </view>
    </template>

    <view class="unit-card-body">
      <view class="lesson-row">
        <view class="lesson">
          {{ unit.lesson || '教材同步单元' }}
        </view>
        <view v-if="mode === 'wrong' && unit.wrongCount > 0" class="wrong-count-pill">
          {{ unit.wrongCount }} 个错字
        </view>
      </view>
      <view class="chars">
        {{ unit.charsPreview }}
      </view>
      <view class="progress-strip" :class="`progress-strip--${unit.cardTone}`">
        {{ unit.progressText }}
      </view>

      <view v-if="mode === 'unit' && unit.status === 'tested'" class="stars">
        <text v-for="i in 3" :key="i" class="star">{{ i <= unit.stars ? '★' : '☆' }}</text>
      </view>

      <template v-if="mode === 'wrong'">
        <view class="wrong-hint">
          {{ unit.wrongHintText }}
        </view>
        <view v-if="unit.wrongUpdatedText" class="wrong-meta">
          {{ unit.wrongUpdatedText }}
        </view>
        <view v-if="unit.primaryWeaknessText" class="wrong-badge">
          {{ unit.primaryWeaknessText }}
        </view>
      </template>
    </view>

    <view class="unit-card-actions">
      <wd-button
        v-if="unit.secondaryActionText"
        size="small"
        plain
        @click="emit('secondary', unit.id)"
      >
        {{ unit.secondaryActionText }}
      </wd-button>
      <wd-button
        size="small"
        type="primary"
        :disabled="unit.disabled"
        @click="emit('primary', unit.id)"
      >
        {{ unit.primaryActionText }}
      </wd-button>
    </view>
  </wd-card>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { UnitCardViewModel, UnitPageTab } from '../types'

const props = defineProps<{
  unit: UnitCardViewModel
  mode: UnitPageTab
  highlighted?: boolean
}>()

const emit = defineEmits<{
  (e: 'primary', unitId: string): void
  (e: 'secondary', unitId: string): void
}>()

const customClass = computed(() => {
  return [
    'unit-task-card',
    `unit-task-card--${props.unit.cardTone}`,
    props.highlighted ? 'is-highlighted' : '',
  ].filter(Boolean).join(' ')
})

const tagType = computed(() => {
  switch (props.unit.cardTone) {
    case 'learning':
      return 'primary'
    case 'ready':
      return 'warning'
    case 'tested':
    case 'cleared':
      return 'success'
    case 'wrong':
      return 'danger'
    default:
      return 'default'
  }
})

const tagText = computed(() => {
  if (props.mode === 'wrong') {
    return props.unit.wrongCount > 0 ? '待强化' : '已清空'
  }

  const labelMap = {
    not_started: '未学习',
    learning: '学习中',
    ready_for_test: '待测试',
    tested: '已测试',
  } as const

  return labelMap[props.unit.status]
})
</script>

<style lang="scss" scoped>
.unit-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
}

.unit-name {
  min-width: 0;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--text-main);
}

.unit-card-body {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.lesson-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.lesson,
.wrong-hint,
.wrong-meta {
  font-size: 24rpx;
  color: var(--text-sub);
}

.lesson {
  min-width: 0;
}

.chars {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-main);
  line-height: 1.45;
}

.progress-strip {
  padding: 12rpx 16rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
  line-height: 1.45;
  color: var(--text-sub);
  background: rgba(255, 248, 240, 0.88);
}

.progress-strip--learning {
  background: rgba(93, 173, 226, 0.12);
  color: #467fa5;
}

.progress-strip--ready {
  background: rgba(245, 166, 35, 0.14);
  color: #b57912;
}

.progress-strip--tested,
.progress-strip--cleared {
  background: rgba(104, 185, 132, 0.12);
  color: #53886a;
}

.progress-strip--wrong {
  background: rgba(239, 125, 87, 0.12);
  color: #b55f42;
}

.wrong-count-pill {
  flex-shrink: 0;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  font-weight: 600;
  color: #b55f42;
  background: rgba(239, 125, 87, 0.12);
}

.stars {
  display: flex;
  gap: 8rpx;
}

.star {
  font-size: 28rpx;
  line-height: 1;
  color: var(--status-ready);
}

.wrong-badge {
  align-self: flex-start;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 600;
  color: #c7543f;
  background: var(--bg-soft-red);
}

.unit-card-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 16rpx;
  margin-top: 20rpx;
}

.unit-card-actions :deep(.wd-button) {
  min-width: 144rpx;
}

:deep(.unit-task-card) {
  border-radius: 24rpx;
  background: var(--bg-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

:deep(.unit-task-card--not_started) {
  border: 2rpx solid rgba(201, 205, 214, 0.55);
}

:deep(.unit-task-card--learning) {
  border: 2rpx solid rgba(93, 173, 226, 0.24);
  background: linear-gradient(180deg, var(--bg-soft-blue) 0%, #ffffff 100%);
}

:deep(.unit-task-card--ready) {
  border: 2rpx solid rgba(245, 166, 35, 0.42);
  background: linear-gradient(180deg, rgba(255, 246, 232, 0.95) 0%, #ffffff 100%);
  box-shadow: 0 12rpx 28rpx rgba(245, 166, 35, 0.12);
}

:deep(.unit-task-card--tested),
:deep(.unit-task-card--cleared) {
  border: 2rpx solid rgba(104, 185, 132, 0.26);
  background: linear-gradient(180deg, var(--bg-soft-green) 0%, #ffffff 100%);
}

:deep(.unit-task-card--wrong) {
  border: 2rpx solid rgba(239, 125, 87, 0.38);
  background: linear-gradient(180deg, rgba(255, 241, 235, 0.98) 0%, #ffffff 100%);
  box-shadow: 0 12rpx 28rpx rgba(239, 125, 87, 0.1);
}

:deep(.unit-task-card.is-highlighted) {
  border-color: rgba(104, 185, 132, 0.62);
  box-shadow: 0 14rpx 32rpx rgba(104, 185, 132, 0.18);
}
</style>
