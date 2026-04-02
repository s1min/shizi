<template>
  <div class="learn-container">
    <LearnFlowHeader
      :title="stepLabel"
      :current="currentCharIndex"
      :total="totalChars"
      :progress-percent="progressPercent"
      :step-items="stepItems"
      @back="handleClose"
      @step-click="handleStepClick"
    />

    <!-- 学习内容区域 -->
    <div class="learn-content">
      <!-- 步骤1: 字源动画 -->
      <CharCard v-if="currentStep === 'origin'" :char="currentChar" @next="goToNextStep" />

      <!-- 步骤2: 跟读互动 -->
      <SpeakPractice
        v-else-if="currentStep === 'speak'" :char="currentChar" :all-chars="unitChars"
        @prev="goToPreviousStep" @next="goToNextStep"
      />

      <!-- 步骤3: 描红练习 -->
      <TracingPractice
        v-else-if="currentStep === 'trace'" :char="currentChar" @prev="goToPreviousStep"
        @next="goToNextStep"
      />

      <!-- 步骤4: 小测验 -->
      <QuizCard
        v-else-if="currentStep === 'quiz'" :char="currentChar" :all-chars="unitChars" @prev="goToPreviousStep"
        @next="handleQuizComplete"
      />

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
import CharCard from '../components/learn/CharCard.vue'
import LearnFlowHeader from '../components/learn/LearnFlowHeader.vue'
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
    learnStore.markUnitLearnCompleted(unitId.value)
    uni.redirectTo({ url: `/subpkg-learning/learn/unit-complete?unitId=${unitId.value}` })
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
