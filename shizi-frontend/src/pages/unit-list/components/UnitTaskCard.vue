<template>
  <wd-card :custom-class="customClass">
    <template #title>
      <view class="unit-card-head">
        <view class="unit-name">
          {{ unit.name }}
        </view>
        <view class="unit-status-badge" :class="`unit-status-badge--${unit.cardTone}`">
          {{ tagText }}
        </view>
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

      <view class="unit-card-footer">
        <view v-if="mode === 'unit' && unit.status === 'tested'" class="stars">
          <text v-for="i in 3" :key="i" class="star">{{ i <= unit.stars ? '★' : '☆' }}</text>
        </view>
        <view v-else class="stars-placeholder" />

        <view class="unit-card-actions">
          <button
            v-if="unit.secondaryActionText"
            class="action-btn action-btn--secondary"
            hover-class="action-btn--hover"
            @click="emit('secondary', unit.id)"
          >
            {{ unit.secondaryActionText }}
          </button>
          <button
            class="action-btn action-btn--primary"
            hover-class="action-btn--hover"
            :disabled="unit.disabled"
            @click="emit('primary', unit.id)"
          >
            {{ unit.primaryActionText }}
          </button>
        </view>
      </view>
    </view>
  </wd-card>
</template>

<script lang="ts" setup>
import type { UnitCardViewModel, UnitPageTab } from '../types'
import { computed } from 'vue'

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
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.unit-name {
  min-width: 0;
  padding-top: 4rpx;
  font-size: 32rpx;
  line-height: 1.3;
  font-weight: 700;
  color: var(--text-main);
}

.unit-status-badge {
  flex-shrink: 0;
  padding: 10rpx 18rpx;
  border-radius: 0 24rpx 0 20rpx;
  font-size: 22rpx;
  line-height: 1;
  font-weight: 700;
  color: #ffffff;
}

.unit-status-badge--not_started {
  background: #c6ced9;
}

.unit-status-badge--learning {
  background: var(--tone-learning);
}

.unit-status-badge--ready {
  background: var(--tone-ready);
}

.unit-status-badge--tested,
.unit-status-badge--cleared {
  background: var(--tone-tested);
}

.unit-status-badge--wrong {
  background: var(--tone-wrong);
}

.unit-card-body {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
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
  line-height: 1.5;
  color: var(--text-sub);
}

.lesson {
  min-width: 0;
}

.chars {
  font-size: 32rpx;
  line-height: 1.45;
  font-weight: 700;
  color: var(--text-main);
}

.progress-strip {
  padding: 16rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  line-height: 1.45;
  background: rgba(255, 250, 244, 0.92);
  color: var(--text-sub);
}

.progress-strip--learning {
  background: rgba(91, 141, 239, 0.12);
  color: #416dbd;
}

.progress-strip--ready {
  background: rgba(242, 169, 59, 0.14);
  color: #b27a18;
}

.progress-strip--tested,
.progress-strip--cleared {
  background: rgba(95, 188, 138, 0.14);
  color: #44815f;
}

.progress-strip--wrong {
  background: rgba(238, 127, 93, 0.14);
  color: #b85f42;
}

.wrong-count-pill {
  flex-shrink: 0;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  line-height: 1;
  font-weight: 700;
  color: #b85f42;
  background: rgba(238, 127, 93, 0.12);
}

.wrong-badge {
  align-self: flex-start;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 600;
  color: #c7543f;
  background: rgba(238, 127, 93, 0.12);
}

.unit-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-top: 8rpx;
}

.stars,
.stars-placeholder {
  min-width: 120rpx;
}

.stars {
  display: flex;
  gap: 8rpx;
}

.star {
  font-size: 34rpx;
  line-height: 1;
  color: var(--tone-ready);
}

.unit-card-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16rpx;
  flex: 1;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 152rpx;
  height: 72rpx;
  padding: 0 24rpx;
  border: none;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 600;
}

.action-btn::after {
  border: none;
}

.action-btn--secondary {
  color: var(--brand-primary);
  background: rgba(91, 141, 239, 0.08);
  box-shadow: inset 0 0 0 2rpx rgba(91, 141, 239, 0.16);
}

.action-btn--primary {
  color: #ffffff;
  background: linear-gradient(135deg, #6d9dff 0%, #4d7ff0 100%);
  box-shadow: 0 10rpx 18rpx rgba(91, 141, 239, 0.22);
}

.action-btn[disabled] {
  opacity: 0.45;
}

.action-btn--hover {
  opacity: 0.92;
  transform: translateY(2rpx);
}

:deep(.unit-task-card) {
  overflow: hidden;
  border-radius: 28rpx;
  background: var(--surface-card-strong);
  box-shadow: var(--shadow-card);
}

:deep(.unit-task-card--not_started) {
  background: rgba(255, 255, 255, 0.94);
}

:deep(.unit-task-card--learning) {
  background: linear-gradient(180deg, rgba(91, 141, 239, 0.08) 0%, rgba(255, 255, 255, 0.98) 100%);
}

:deep(.unit-task-card--ready) {
  background: linear-gradient(180deg, rgba(242, 169, 59, 0.12) 0%, rgba(255, 255, 255, 0.98) 100%);
}

:deep(.unit-task-card--tested),
:deep(.unit-task-card--cleared) {
  background: linear-gradient(180deg, rgba(95, 188, 138, 0.12) 0%, rgba(255, 255, 255, 0.98) 100%);
}

:deep(.unit-task-card--wrong) {
  background: linear-gradient(180deg, rgba(238, 127, 93, 0.12) 0%, rgba(255, 255, 255, 0.98) 100%);
}

:deep(.unit-task-card.is-highlighted) {
  box-shadow: 0 14rpx 32rpx rgba(95, 188, 138, 0.2);
}

:global(.theme-modern) .action-btn--primary {
  background: linear-gradient(135deg, #5f8cf5 0%, #4d79dd 100%);
  box-shadow: 0 8rpx 16rpx rgba(77, 121, 221, 0.18);
}

:global(.theme-modern) :deep(.unit-task-card) {
  box-shadow: var(--shadow-soft);
}
</style>
