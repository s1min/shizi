<script lang="ts" setup>
import type { ParentGateReason } from '@/types/ui'
import { computed, ref, watch } from 'vue'
import { useUiStore } from '@/store/ui'
import UiIcon from './UiIcon.vue'

const props = withDefaults(defineProps<{
  reason: ParentGateReason
  open?: boolean
}>(), {
  open: true,
})

const emit = defineEmits<{
  verified: []
  cancel: []
}>()

const uiStore = useUiStore()
const firstNumber = ref(1)
const secondNumber = ref(1)
const answer = ref('')
const errorMessage = ref('')

const reasonCopy: Record<ParentGateReason, string> = {
  settings: '进入学习设置',
  report: '查看学习报告',
  library: '切换学习字库',
  privacy: '管理隐私和数据',
  account: '管理账号',
}

const title = computed(() => reasonCopy[props.reason])
const question = computed(() => `${firstNumber.value} + ${secondNumber.value} = ?`)

function createQuestion() {
  firstNumber.value = Math.floor(Math.random() * 9) + 1
  secondNumber.value = Math.floor(Math.random() * 9) + 1
  answer.value = ''
  errorMessage.value = ''
}

function handleInput(event: { detail: { value: string | number } }) {
  answer.value = String(event.detail.value).replace(/\D/g, '').slice(0, 2)
}

function verify() {
  if (Number(answer.value) !== firstNumber.value + secondNumber.value) {
    errorMessage.value = '答案不对，请再试一次。'
    answer.value = ''
    createQuestion()
    errorMessage.value = '答案不对，已经换了一道题。'
    return
  }

  uiStore.enterParentMode()
  emit('verified')
}

function cancel() {
  emit('cancel')
}

watch(() => props.open, (open) => {
  if (open)
    createQuestion()
}, { immediate: true })
</script>

<template>
  <view v-if="open" class="parent-gate" role="dialog" aria-modal="true" :aria-label="title">
    <view class="parent-gate__scrim" @click="cancel" />
    <view class="parent-gate__panel paper-card">
      <button class="parent-gate__close" aria-label="关闭家长验证" @click="cancel">
        <UiIcon name="close" :size="40" />
      </button>

      <view class="parent-gate__icon" aria-hidden="true">
        <UiIcon name="lock" :size="48" />
      </view>
      <text class="parent-gate__eyebrow">
        家长验证
      </text>
      <text class="parent-gate__title">
        {{ title }}
      </text>
      <text class="parent-gate__description">
        请家长完成下面的算术题
      </text>

      <label class="parent-gate__question" for="parent-gate-answer">
        {{ question }}
      </label>
      <input
        id="parent-gate-answer"
        class="parent-gate__input"
        :value="answer"
        type="number"
        inputmode="numeric"
        :maxlength="2"
        aria-label="算术题答案"
        :aria-invalid="Boolean(errorMessage)"
        :aria-describedby="errorMessage ? 'parent-gate-error' : undefined"
        @input="handleInput"
        @confirm="verify"
      >
      <text v-if="errorMessage" id="parent-gate-error" class="parent-gate__error" role="alert">
        {{ errorMessage }}
      </text>

      <button class="paper-button paper-button--primary parent-gate__submit" :disabled="!answer" @click="verify">
        确认进入
      </button>
      <button class="paper-button paper-button--ghost parent-gate__cancel" @click="cancel">
        暂不进入
      </button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
@use '../../style/tokens' as *;

.parent-gate {
  position: fixed;
  z-index: 800;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: $space-4;
}

.parent-gate__scrim {
  position: absolute;
  inset: 0;
  background: $overlay;
}

.parent-gate__panel {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 620rpx;
  padding: $space-6 $space-4 $space-4;
  border-radius: $radius-sheet;
}

.parent-gate__close {
  position: absolute;
  top: $space-2;
  right: $space-2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: $touch-target;
  height: $touch-target;
  margin: 0;
  padding: 0;
  border: 0;
  color: $ink-muted;
  background: transparent;
  cursor: pointer;
  touch-action: manipulation;
}

.parent-gate__close::after {
  border: 0;
}

.parent-gate__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88rpx;
  height: 88rpx;
  margin-bottom: $space-2;
  border-radius: 50%;
  color: $apricot-dark;
  background: $apricot-soft;
}

.parent-gate__eyebrow {
  color: $apricot-dark;
  font-size: $font-label;
  font-weight: 700;
  line-height: $line-height-label;
}

.parent-gate__title {
  margin-top: $space-1;
  color: $ink-strong;
  font-family: $font-display;
  font-size: $font-title;
  font-weight: 700;
  line-height: $line-height-title;
  text-align: center;
}

.parent-gate__description {
  margin-top: $space-2;
  color: $ink-muted;
  font-size: $font-body-size;
  line-height: $line-height-body;
  text-align: center;
}

.parent-gate__question {
  margin-top: $space-4;
  color: $ink;
  font-family: $font-number;
  font-size: $font-display-md;
  font-weight: 700;
  line-height: $line-height-display-md;
}

.parent-gate__input {
  box-sizing: border-box;
  width: 240rpx;
  min-height: $touch-target;
  margin-top: $space-3;
  padding: $space-2;
  border: 2rpx solid $line-strong;
  border-radius: $radius-sm;
  color: $ink-strong;
  background: $surface-soft;
  font-family: $font-number;
  font-size: $font-title;
  font-weight: 700;
  line-height: $line-height-title;
  text-align: center;
}

.parent-gate__error {
  min-height: 36rpx;
  margin-top: $space-2;
  color: $coral-dark;
  font-size: $font-label;
  line-height: $line-height-label;
  text-align: center;
}

.parent-gate__submit {
  margin-top: $space-4;
}

.parent-gate__cancel {
  margin-top: $space-2;
}
</style>
