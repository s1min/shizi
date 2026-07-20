<template>
  <view class="flow-header" :style="headerStyle">
    <view class="flow-header__top">
      <button v-if="showBack" class="flow-header__close" aria-label="退出学习" @click="emit('back')">
        <UiIcon name="close" :size="40" />
      </button>
      <view v-else class="flow-header__close" />
      <view class="flow-header__title">
        {{ title }}
      </view>
      <view class="flow-header__count">
        第 {{ current }}/{{ total }} 个字
      </view>
    </view>

    <view class="flow-header__progress" :aria-label="`学习进度 ${Math.round(safeProgress)}%`">
      <view class="flow-header__progress-fill" :style="{ width: `${safeProgress}%` }" />
    </view>

    <view v-if="showSteps" class="flow-steps">
      <template v-for="(item, index) in stepItems" :key="item.key">
        <button
          class="flow-step"
          :class="`flow-step--${item.state}`"
          :disabled="!item.clickable"
          @click="handleStepClick(item)"
        >
          <view class="flow-step__mark">
            <UiIcon v-if="item.state === 'done'" name="check" :size="28" />
            <view v-else-if="item.state === 'available'" class="flow-step__lock" aria-hidden="true" />
            <text v-else>{{ index + 1 }}</text>
          </view>
          <text class="flow-step__label">{{ item.label }}</text>
          <text class="flow-step__state">{{ stateLabel(item.state) }}</text>
        </button>
        <view v-if="index < stepItems.length - 1" class="flow-steps__line" :class="{ 'flow-steps__line--done': isConnectorDone(index) }" />
      </template>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import { getCustomNavBarMetrics } from '@/utils/navbar'

type StepVisualState = 'current' | 'done' | 'available'

export interface LearnFlowHeaderStepItem {
  key: string
  label: string
  state: StepVisualState
  clickable?: boolean
}

const props = withDefaults(defineProps<{
  title: string
  current: number
  total: number
  progressPercent: number
  stepItems?: LearnFlowHeaderStepItem[]
  showBack?: boolean
  showSteps?: boolean
}>(), {
  stepItems: () => [],
  showBack: true,
  showSteps: true,
})

const emit = defineEmits<{
  back: []
  stepClick: [key: string]
}>()

const navMetrics = getCustomNavBarMetrics()
const headerStyle = computed(() => ({ paddingTop: `${navMetrics.navBarPaddingTop}px` }))
const safeProgress = computed(() => Math.min(100, Math.max(0, props.progressPercent)))

function handleStepClick(item: LearnFlowHeaderStepItem) {
  if (item.clickable)
    emit('stepClick', item.key)
}

function isConnectorDone(index: number) {
  return props.stepItems[index]?.state === 'done'
}

function stateLabel(state: StepVisualState) {
  return state === 'done' ? '完成' : state === 'current' ? '现在' : '稍后'
}
</script>

<style lang="scss" scoped>
@use '../../../style/tokens' as *;

.flow-header {
  box-sizing: border-box;
  padding: $space-2 $page-gutter $space-3;
  border-bottom: 2rpx solid $line;
  background: rgba(255, 248, 240, 0.96);
}

.flow-header__top {
  display: grid;
  grid-template-columns: 88rpx minmax(0, 1fr) 140rpx;
  align-items: center;
  min-height: 88rpx;
}

.flow-header__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88rpx;
  height: 88rpx;
  margin: 0;
  padding: 0;
  border: 0;
  color: $ink;
  background: transparent;
  touch-action: manipulation;
}

.flow-header__close::after {
  border: 0;
}
.flow-header__close:active {
  transform: scale(0.96);
}

.flow-header__title {
  overflow: hidden;
  color: $ink;
  font-size: $font-title;
  font-weight: 800;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.flow-header__count {
  color: $ink-muted;
  font-size: $font-label;
  font-weight: 700;
  text-align: right;
}

.flow-header__progress {
  height: 14rpx;
  overflow: hidden;
  border-radius: $radius-pill;
  background: $paper-deep;
}

.flow-header__progress-fill {
  height: 100%;
  border-radius: inherit;
  background: $apricot;
  transition: width $motion-base $ease-standard;
}

.flow-steps {
  display: grid;
  grid-template-columns: max-content 1fr max-content 1fr max-content 1fr max-content;
  align-items: start;
  margin-top: $space-3;
}

.flow-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 96rpx;
  min-height: 104rpx;
  margin: 0;
  padding: 0;
  border: 0;
  color: $ink-muted;
  background: transparent;
  touch-action: manipulation;
}

.flow-step::after {
  border: 0;
}
.flow-step:active {
  transform: scale(0.97);
}

.flow-step__mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  border: 2rpx solid $line-strong;
  border-radius: 50%;
  color: $ink-muted;
  background: $surface;
  font-size: $font-label;
  font-weight: 800;
}

.flow-step--current .flow-step__mark {
  border-color: $apricot;
  color: $apricot-dark;
  background: $apricot-soft;
}

.flow-step--done .flow-step__mark {
  border-color: $mint;
  color: $mint-dark;
  background: $mint-soft;
}

.flow-step__lock {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: $ink-light;
}

.flow-step__label {
  margin-top: 8rpx;
  font-size: 22rpx;
  font-weight: 700;
}
.flow-step__state {
  margin-top: 2rpx;
  font-size: 18rpx;
}
.flow-step--current .flow-step__label {
  color: $apricot-dark;
}
.flow-step--done .flow-step__label {
  color: $mint-dark;
}

.flow-steps__line {
  height: 4rpx;
  margin: 24rpx -12rpx 0;
  border-radius: $radius-pill;
  background: $line;
}

.flow-steps__line--done {
  background: $mint;
}

@media (prefers-reduced-motion: reduce) {
  .flow-header__progress-fill {
    transition-duration: 1ms;
  }
}
</style>
