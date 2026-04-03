<template>
  <div class="progress-header" :style="headerStyle">
    <div class="progress-topline">
      <button v-if="showBack" class="exit-entry" @click="emit('back')">
        <wd-icon name="arrow-left" size="22px" />
      </button>
      <div v-else class="exit-entry placeholder" />

      <div class="step-title-wrap">
        <div class="step-title">
          {{ title }}
        </div>
      </div>
    </div>

    <div class="progress-row">
      <div class="progress-track-wrap">
        <div class="progress-bg">
          <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
        </div>
        <div class="progress-text">
          {{ current }}/{{ total }}
        </div>
      </div>
    </div>

    <div v-if="showSteps" class="step-flow">
      <template v-for="(item, index) in stepItems" :key="item.key">
        <button
          class="step-chip"
          :class="[`is-${item.state}`, { clickable: item.clickable }]"
          :disabled="!item.clickable"
          @click="handleStepClick(item)"
        >
          <div class="step-chip-dot">
            <wd-icon v-if="item.state === 'done'" name="check" size="18px" />
            <span v-else>{{ index + 1 }}</span>
          </div>
          <div class="step-chip-label">
            {{ item.label }}
          </div>
        </button>
        <div v-if="index < stepItems.length - 1" class="step-segment" :class="{ done: isConnectorDone(index) }" />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
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
const headerStyle = computed(() => ({
  paddingTop: `${navMetrics.navBarPaddingTop}px`,
}))

function handleStepClick(item: LearnFlowHeaderStepItem) {
  if (!item.clickable)
    return
  emit('stepClick', item.key)
}

function isConnectorDone(index: number) {
  return props.stepItems[index].state === 'done'
}
</script>

<style lang="scss" scoped>
.progress-header {
  padding: 24rpx 32rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  background: linear-gradient(180deg, rgba(255, 251, 244, 0.98), rgba(255, 247, 235, 0.94));
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
  box-shadow:
    0 12rpx 24rpx rgba(226, 172, 70, 0.08),
    inset 0 -2rpx 0 rgba(255, 255, 255, 0.56);
}

.progress-topline {
  display: grid;
  grid-template-columns: 88rpx 1fr;
  align-items: center;
  gap: 16rpx;
}

.step-title-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding-right: 88rpx;
}

.step-title {
  text-align: center;
  font-size: 32rpx;
  font-weight: 700;
  color: #6a5034;
  letter-spacing: 2rpx;
}

.progress-row {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.progress-track-wrap {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.progress-bg {
  flex: 1;
  min-width: 0;
  height: 16rpx;
  background: linear-gradient(180deg, rgba(255, 243, 220, 0.9), rgba(255, 238, 205, 0.94));
  border-radius: 999rpx;
  overflow: hidden;
  box-shadow:
    inset 0 2rpx 4rpx rgba(214, 170, 88, 0.07),
    inset 0 -2rpx 0 rgba(255, 255, 255, 0.44);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd977 0%, #f9bf45 56%, #f1a62a 100%);
  border-radius: 999rpx;
  box-shadow:
    inset 0 2rpx 0 rgba(255, 248, 220, 0.45),
    0 4rpx 8rpx rgba(240, 168, 46, 0.12);
  transition: width 0.3s ease;
}

.progress-text {
  flex-shrink: 0;
  min-width: 72rpx;
  text-align: right;
  font-size: 28rpx;
  font-weight: 700;
  color: #8b7357;
}

.step-flow {
  position: relative;
  display: grid;
  grid-template-columns:
    max-content minmax(24rpx, 1fr) max-content minmax(24rpx, 1fr) max-content minmax(24rpx, 1fr)
    max-content;
  justify-content: space-between;
  align-items: start;
  column-gap: 0;
  row-gap: 0;
}

.step-segment {
  align-self: start;
  width: calc(100% + 20rpx);
  min-width: 24rpx;
  margin-top: 38rpx;
  margin-left: -10rpx;
  margin-right: -10rpx;
  height: 6rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, rgba(220, 210, 190, 0.8), rgba(232, 224, 210, 0.8));
  box-shadow: inset 0 1rpx 1rpx rgba(255, 255, 255, 0.48);
}

.step-segment.done {
  background: linear-gradient(90deg, rgba(190, 224, 128, 0.92), rgba(143, 198, 71, 0.92));
  box-shadow:
    0 0 6rpx rgba(173, 219, 96, 0.14),
    inset 0 1rpx 0 rgba(245, 255, 232, 0.64);
}

.step-chip {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 6rpx 10rpx;
  background: transparent;
  border: none;
  color: #a38b6b;
  transition:
    transform 0.18s ease,
    opacity 0.18s ease,
    filter 0.18s ease;

  &[disabled]:not(.clickable) {
    background: transparent;
  }

  &::after {
    border: none;
  }

  &:active {
    transform: scale(0.96);
  }

  &.clickable {
    cursor: pointer;
  }

  &:disabled {
    opacity: 1;
  }

  &:not(.clickable) {
    filter: saturate(0.7);
    cursor: default;
  }

  &.is-current {
    color: #704f1f;
  }

  &.is-done {
    color: #567a2c;
  }
}

.step-chip-dot {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 700;
  border: 2rpx solid rgba(226, 198, 151, 0.78);
  background: radial-gradient(
    circle at 30% 28%,
    rgba(255, 255, 255, 0.96),
    rgba(255, 250, 241, 0.92) 58%,
    rgba(255, 242, 214, 0.9) 100%
  );
  box-shadow:
    0 10rpx 18rpx rgba(223, 186, 113, 0.14),
    inset 0 2rpx 0 rgba(255, 255, 255, 0.82);
  transition: all 0.2s ease;
}

.step-chip-label {
  font-size: 24rpx;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: 1rpx;
  transition:
    color 0.2s ease,
    opacity 0.2s ease;
}

.step-chip.is-current .step-chip-dot {
  background: radial-gradient(circle at 34% 30%, #fff3bf 0%, #ffd86f 55%, #f5b42b 100%);
  border-color: rgba(237, 164, 28, 0.66);
  color: #7a4a00;
  box-shadow:
    0 8rpx 14rpx rgba(245, 166, 35, 0.12),
    0 0 0 2rpx rgba(255, 233, 170, 0.12),
    inset 0 2rpx 0 rgba(255, 250, 228, 0.88);
}

.step-chip.is-current .step-chip-label {
  color: #704f1f;
}

.step-chip.is-done .step-chip-dot {
  background: radial-gradient(circle at 30% 28%, #f7ffe7 0%, #dff5b7 58%, #b8df77 100%);
  border-color: rgba(163, 210, 96, 0.72);
  color: #567a2c;
  box-shadow:
    0 8rpx 14rpx rgba(143, 198, 71, 0.12),
    0 0 0 2rpx rgba(214, 239, 165, 0.12),
    inset 0 2rpx 0 rgba(255, 255, 255, 0.82);
}

.step-chip.is-done .step-chip-label {
  color: #5f7f38;
}

.step-chip:not(.clickable) .step-chip-dot {
  background: transparent;
  border-color: rgba(224, 208, 181, 0.74);
  color: #b79f82;
  box-shadow: none;
}

.step-chip:not(.clickable) .step-chip-label {
  color: #c2b39f;
}

.exit-entry {
  width: 80rpx;
  height: 80rpx;
  justify-self: start;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid rgba(247, 213, 153, 0.38);
  border-radius: 999rpx;
  background: linear-gradient(180deg, #fffaf1 0%, #ffefcf 100%);
  color: #d08a16;
  box-shadow:
    0 8rpx 16rpx rgba(232, 177, 68, 0.12),
    inset 0 2rpx 0 rgba(255, 255, 255, 0.72);
  transition: all 0.2s ease;

  &::after {
    border: none;
  }

  &:active {
    transform: scale(0.97);
    background: linear-gradient(180deg, #fff1d9 0%, #ffe8bf 100%);
    box-shadow: 0 4rpx 10rpx rgba(232, 177, 68, 0.1);
  }
}

.exit-entry.placeholder {
  visibility: hidden;
}
</style>
