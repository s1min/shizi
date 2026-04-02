<template>
  <div class="learn-container">
    <!-- 进度条 -->
    <div class="progress-header" :style="headerStyle">
      <div class="progress-topline">
        <button class="exit-entry" @click="handleClose">
          <wd-icon name="arrow-left" size="22px" />
        </button>
        <div class="step-title-wrap">
          <div class="step-title">
            {{ stepLabel }}
          </div>
        </div>
      </div>
      <div class="progress-row">
        <div class="progress-track-wrap">
          <div class="progress-bg">
            <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
          </div>
          <div class="progress-text">
            {{ currentCharIndex }}/{{ totalChars }}
          </div>
        </div>
      </div>
      <div class="step-flow">
        <template v-for="(item, index) in stepItems" :key="item.key">
          <button class="step-chip" :class="[`is-${item.state}`, { clickable: item.clickable }]"
            :disabled="!item.clickable" @click="handleStepClick(item.key)">
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

    <!-- 学习内容区域 -->
    <div class="learn-content">
      <!-- 步骤1: 字源动画 -->
      <CharCard v-if="currentStep === 'origin'" :char="currentChar" @next="goToNextStep" />

      <!-- 步骤2: 跟读互动 -->
      <SpeakPractice v-else-if="currentStep === 'speak'" :char="currentChar" :all-chars="unitChars"
        @prev="goToPreviousStep" @next="goToNextStep" />

      <!-- 步骤3: 描红练习 -->
      <TracingPractice v-else-if="currentStep === 'trace'" :char="currentChar" @prev="goToPreviousStep"
        @next="goToNextStep" />

      <!-- 步骤4: 小测验 -->
      <QuizCard v-else-if="currentStep === 'quiz'" :char="currentChar" :all-chars="unitChars" @prev="goToPreviousStep"
        @next="handleQuizComplete" />

      <!-- 单字学习完成 -->
      <div v-else-if="currentStep === 'complete'" class="complete-screen">
        <div class="complete-icon">
          🎉
        </div>
        <div class="complete-char">
          {{ currentChar._id }}
        </div>
        <div class="complete-desc">
          太棒了！你已经学会了「{{ currentChar._id }}」
        </div>
        <button class="btn-next" @click="nextChar">
          继续学习
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Character } from '@/types/character'
import { computed, onMounted, ref, watch } from 'vue'
import { useLearnStore } from '@/store'
import { getCustomNavBarMetrics } from '@/utils/navbar'
import CharCard from '../components/learn/CharCard.vue'
import QuizCard from '../components/learn/QuizCard.vue'
import SpeakPractice from '../components/learn/SpeakPractice.vue'
import TracingPractice from '../components/learn/TracingPractice.vue'

definePage({
  style: {
    navigationBarTitleText: '学习',
    navigationStyle: 'custom',
  },
})

const learnStore = useLearnStore()
const navMetrics = getCustomNavBarMetrics()
const headerStyle = computed(() => ({
  paddingTop: `${navMetrics.navBarPaddingTop}px`,
}))

// 学习步骤
type LearnStep = 'origin' | 'speak' | 'trace' | 'quiz' | 'complete'
type NavigableStep = Exclude<LearnStep, 'complete'>

type StepVisualState = 'current' | 'done' | 'available'

const stepOrder: NavigableStep[] = ['origin', 'speak', 'trace', 'quiz']
const currentStep = ref<LearnStep>('origin')
const completedSteps = ref<NavigableStep[]>([])
const quizResultRecorded = ref(false)
const charIndex = ref(0)
const unitId = ref('unit_1')

const unitChars = ref<Character[]>([])
const currentChar = computed(() => unitChars.value[charIndex.value] || {} as Character)
const currentStepIndex = computed(() =>
  currentStep.value === 'complete' ? stepOrder.length - 1 : stepOrder.indexOf(currentStep.value as NavigableStep),
)

// 进度计算
const totalChars = computed(() => unitChars.value.length)
const currentCharIndex = computed(() =>
  totalChars.value > 0 ? charIndex.value + 1 : 0,
)
const progressPercent = computed(() =>
  totalChars.value > 0 ? (currentCharIndex.value / totalChars.value) * 100 : 0,
)
const stepLabelMap: Record<LearnStep, string> = {
  origin: '看一看',
  speak: '读一读',
  trace: '写一写',
  quiz: '试一试',
  complete: '本字完成',
}
const stepLabel = computed(() => stepLabelMap[currentStep.value])
const stepItems = computed(() =>
  stepOrder.map((stepKey, index) => ({
    key: stepKey,
    label: stepLabelMap[stepKey],
    state: getStepState(stepKey),
    clickable: index <= currentStepIndex.value || isStepCompleted(stepKey),
  })),
)
function isConnectorDone(index: number) {
  return isStepCompleted(stepOrder[index])
}

function isStepCompleted(stepKey: NavigableStep) {
  return completedSteps.value.includes(stepKey)
}

function getStepState(stepKey: NavigableStep): StepVisualState {
  if (currentStep.value === stepKey)
    return 'current'
  if (isStepCompleted(stepKey))
    return 'done'
  return 'available'
}

function markStepCompleted(stepKey: NavigableStep) {
  if (!completedSteps.value.includes(stepKey))
    completedSteps.value = [...completedSteps.value, stepKey]
}

function resetCharFlow() {
  currentStep.value = 'origin'
  completedSteps.value = []
  quizResultRecorded.value = false
}

function moveToStep(stepKey: LearnStep) {
  currentStep.value = stepKey
}

function goToPreviousStep() {
  if (currentStep.value === 'complete') {
    moveToStep('quiz')
    return
  }

  const currentIndex = currentStepIndex.value
  if (currentIndex <= 0)
    return
  moveToStep(stepOrder[currentIndex - 1])
}

function goToNextStep() {
  if (currentStep.value === 'complete')
    return

  const stepKey = currentStep.value as NavigableStep
  markStepCompleted(stepKey)
  const nextStep = stepOrder[currentStepIndex.value + 1]
  if (nextStep)
    moveToStep(nextStep)
}

function handleStepClick(stepKey: NavigableStep) {
  const item = stepItems.value.find(step => step.key === stepKey)
  if (!item?.clickable || currentStep.value === stepKey)
    return
  moveToStep(stepKey)
}

function handleQuizComplete(correct: boolean, quizType?: string) {
  markStepCompleted('quiz')

  if (!quizResultRecorded.value) {
    learnStore.markCharLearned(currentChar.value._id, correct)
    if (!correct) {
      learnStore.recordWrong(currentChar.value._id, quizType || 'unknown', unitId.value)
    }
    quizResultRecorded.value = true
  }

  moveToStep('complete')
}

function nextChar() {
  if (charIndex.value < unitChars.value.length - 1) {
    charIndex.value++
    resetCharFlow()
    // 保存单元进度
    learnStore.updateUnitProgress(unitId.value, charIndex.value)
  }
  else {
    // 单元所有字学完，进入单元测试
    learnStore.updateUnitProgress(unitId.value, unitChars.value.length)
    uni.redirectTo({ url: `/subpkg-learning/learn/unit-test?unitId=${unitId.value}` })
  }
}

function handleClose() {
  uni.showModal({
    title: '确定退出吗？',
    content: '当前进度已自动保存',
    success: (res) => {
      if (res.confirm) {
        // 退出前保存当前进度
        learnStore.updateUnitProgress(unitId.value, charIndex.value)
        uni.navigateBack()
      }
    },
  })
}

watch(charIndex, () => {
  resetCharFlow()
})

// 加载单元数据
onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  unitId.value = currentPage?.options?.unitId || learnStore.currentUnitId

  // 获取单元汉字
  const unit = learnStore.library.stages
    .flatMap((s: any) => s.units)
    .find((u: any) => u.id === unitId.value)

  if (unit) {
    unitChars.value = unit.chars
      .map((id: string) => learnStore.charMap.get(id))
      .filter(Boolean) as Character[]

    // 恢复上次进度
    const progress = learnStore.getUnitProgress(unitId.value)
    if (progress.charIndex > 0 && !progress.completed) {
      charIndex.value = progress.charIndex
    }
    resetCharFlow()
  }
})
</script>

<style lang="scss" scoped>
.learn-container {
  min-height: 100vh;
  background:
    radial-gradient(circle at 12% 16%, rgba(251, 210, 128, 0.2) 0%, rgba(251, 210, 128, 0) 32%),
    radial-gradient(circle at 84% 28%, rgba(255, 230, 184, 0.28) 0%, rgba(255, 230, 184, 0) 36%),
    linear-gradient(180deg, #fffaf2 0%, #fffdf8 56%, #ffffff 100%);
  display: flex;
  flex-direction: column;
}

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

.step-caption {
  font-size: 20rpx;
  font-weight: 600;
  color: #b49a7a;
  line-height: 1;
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

.progress-meta {
  font-size: 22rpx;
  font-weight: 600;
  color: #ad9372;
  line-height: 1.2;
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
    max-content minmax(24rpx, 1fr) max-content minmax(24rpx, 1fr) max-content minmax(24rpx, 1fr) max-content;
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
  background:
    radial-gradient(circle at 30% 28%, rgba(255, 255, 255, 0.96), rgba(255, 250, 241, 0.92) 58%, rgba(255, 242, 214, 0.9) 100%);
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
  transition: color 0.2s ease, opacity 0.2s ease;
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

.learn-content {
  padding: 24rpx 24rpx 32rpx;
}

.learn-stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 32rpx 24rpx;
  border-radius: 32rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 251, 244, 0.9) 100%);
  box-shadow:
    0 12rpx 28rpx rgba(226, 182, 92, 0.08),
    inset 0 0 0 2rpx rgba(255, 244, 220, 0.6);
}

.complete-screen {
  // flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  // padding: 48rpx 24rpx;
  // border-radius: 32rpx;
  // background: linear-gradient(180deg, rgba(255, 252, 246, 0.96) 0%, rgba(255, 246, 232, 0.96) 100%);
  // box-shadow:
  //   0 12rpx 28rpx rgba(245, 166, 35, 0.1),
  //   inset 0 0 0 4rpx rgba(245, 214, 154, 0.4);
}

.complete-badge {
  margin-bottom: 16rpx;
  padding: 8rpx 24rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: #9a8368;
  background: linear-gradient(180deg, #fffaf1 0%, #fff1db 100%);
}

.complete-icon {
  font-size: 160rpx;
  margin-bottom: 24rpx;
}

.complete-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #4a3728;
  margin-bottom: 16rpx;
}

.complete-char {
  padding: 24rpx;
  margin-bottom: 24rpx;
  font-size: 260rpx;
  font-weight: bold;
  color: #2f2a24;
  font-family: 'KaiTi', 'STKaiti', serif;
  line-height: 1;
  text-shadow: 0 8rpx 16rpx rgba(47, 42, 36, 0.08);
}

.complete-desc {
  font-size: 28rpx;
  color: #7a6a58;
  margin-bottom: 48rpx;
}

.btn-next {
  width: 100%;
  height: 104rpx;
  background: linear-gradient(135deg, #f5a623 0%, #eb9a1a 52%, #e28412 100%);
  border: none;
  border-radius: 56rpx;
  font-size: 38rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
  color: #fff;
  box-shadow: 0 14rpx 30rpx rgba(230, 145, 24, 0.36);
}

.btn-next::after {
  border: none;
}

.btn-next:active {
  transform: translateY(2rpx);
  box-shadow: 0 8rpx 18rpx rgba(230, 145, 24, 0.26);
}
</style>
