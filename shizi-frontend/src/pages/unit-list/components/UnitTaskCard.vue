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
  gap: 12rpx;
}

.unit-name {
  min-width: 0;
  padding-top: 2rpx;
  font-size: 32rpx;
  line-height: 1.3;
  font-weight: 700;
  color: var(--text-main);
}

.unit-status-badge {
  flex-shrink: 0;
  padding: 8rpx 16rpx;
  border-radius: 0 20rpx 0 18rpx;
  font-size: 20rpx;
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
  font-size: 22rpx;
  line-height: 1.5;
  color: var(--text-sub);
}

.lesson {
  min-width: 0;
}

.chars {
  font-size: 32rpx;
  line-height: 1.4;
  font-weight: 700;
  color: var(--text-main);
}

.progress-strip {
  padding: 14rpx 18rpx;
  border-radius: 18rpx;
  font-size: 22rpx;
  line-height: 1.45;
  background: rgba(247, 250, 255, 0.96);
  color: var(--text-sub);
}

.progress-strip--learning {
  background: rgba(91, 132, 232, 0.09);
  color: #4a73ca;
}

.progress-strip--ready {
  background: rgba(240, 166, 58, 0.1);
  color: #b27a18;
}

.progress-strip--tested,
.progress-strip--cleared {
  background: rgba(88, 183, 130, 0.1);
  color: #478164;
}

.progress-strip--wrong {
  background: rgba(234, 122, 89, 0.1);
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
  gap: 12rpx;
  margin-top: 4rpx;
}

.stars,
.stars-placeholder {
  min-width: 104rpx;
}

.stars {
  display: flex;
  gap: 6rpx;
}

.star {
  font-size: 32rpx;
  line-height: 1;
  color: var(--tone-ready);
}

.unit-card-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12rpx;
  flex: 1;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 144rpx;
  height: 64rpx;
  padding: 0 20rpx;
  border: none;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 600;
}

.action-btn::after {
  border: none;
}

.action-btn--secondary {
  color: var(--brand-primary);
  background: rgba(91, 132, 232, 0.06);
  box-shadow: inset 0 0 0 2rpx rgba(91, 132, 232, 0.12);
}

.action-btn--primary {
  color: #ffffff;
  background: linear-gradient(135deg, #5d86ea 0%, #4f79dc 100%);
  box-shadow: 0 6rpx 14rpx rgba(79, 121, 220, 0.16);
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
  border-radius: 24rpx;
  background: var(--surface-card-strong);
  box-shadow: var(--shadow-card);
}

:deep(.unit-task-card--not_started) {
  background: rgba(255, 255, 255, 0.96);
}

:deep(.unit-task-card--learning) {
  background: linear-gradient(180deg, rgba(91, 132, 232, 0.06) 0%, rgba(255, 255, 255, 0.98) 100%);
}

:deep(.unit-task-card--ready) {
  background: linear-gradient(180deg, rgba(240, 166, 58, 0.08) 0%, rgba(255, 255, 255, 0.98) 100%);
}

:deep(.unit-task-card--tested),
:deep(.unit-task-card--cleared) {
  background: linear-gradient(180deg, rgba(88, 183, 130, 0.08) 0%, rgba(255, 255, 255, 0.98) 100%);
}

:deep(.unit-task-card--wrong) {
  background: linear-gradient(180deg, rgba(234, 122, 89, 0.08) 0%, rgba(255, 255, 255, 0.98) 100%);
}

:deep(.unit-task-card.is-highlighted) {
  box-shadow: 0 12rpx 24rpx rgba(88, 183, 130, 0.16);
}
</style>
