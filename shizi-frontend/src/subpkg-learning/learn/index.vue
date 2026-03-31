<template>
  <div class="learn-container">
    <!-- 进度条 -->
    <div class="progress-header" :style="headerStyle">
      <div class="progress-topline">
        <div class="stage-chip">
          {{ stepLabel }}
        </div>
        <button class="exit-entry" @click="handleClose">
          退出学习
        </button>
      </div>
      <div class="progress-row">
        <div class="progress-bg">
          <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
        </div>
        <div class="progress-text">
          {{ currentStep }}/{{ totalSteps }}
        </div>
      </div>
      <div class="progress-caption">
        {{ charProgressLabel }}
      </div>
    </div>

    <!-- 学习内容区域 -->
    <div class="learn-content">
      <!-- 步骤1: 字源动画 -->
      <CharCard
        v-if="step === 'origin'"
        :char="currentChar"
        @next="goToSpeak"
      />

      <!-- 步骤2: 跟读互动 -->
      <SpeakPractice
        v-else-if="step === 'speak'"
        :char="currentChar"
        :all-chars="unitChars"
        @next="goToTrace"
      />

      <!-- 步骤3: 描红练习 -->
      <TracingPractice
        v-else-if="step === 'trace'"
        :char="currentChar"
        @next="goToQuiz"
      />

      <!-- 步骤4: 小测验 -->
      <QuizCard
        v-else-if="step === 'quiz'"
        :char="currentChar"
        :all-chars="unitChars"
        @next="handleQuizComplete"
      />

      <!-- 单字学习完成 -->
      <div v-else-if="step === 'complete'" class="complete-screen">
        <div class="complete-icon">
          🎉
        </div>
        <div class="complete-title">
          太棒了！
        </div>
        <div class="complete-char">
          {{ currentChar._id }}
        </div>
        <div class="complete-desc">
          你已经学会了「{{ currentChar._id }}」
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
import { computed, onMounted, ref } from 'vue'
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
  paddingTop: `${navMetrics.navBarPaddingTop + navMetrics.navBarContentHeight + 16}px`,
}))

// 学习步骤
type LearnStep = 'origin' | 'speak' | 'trace' | 'quiz' | 'complete'

const step = ref<LearnStep>('origin')
const charIndex = ref(0)
const unitId = ref('unit_1')

const unitChars = ref<Character[]>([])
const currentChar = computed(() => unitChars.value[charIndex.value] || {} as Character)

// 进度计算
const stepsPerChar = 4
const currentStep = computed(() => {
  const stepIndex = ['origin', 'speak', 'trace', 'quiz', 'complete'].indexOf(step.value)
  return charIndex.value * stepsPerChar + Math.min(stepIndex + 1, stepsPerChar)
})
const totalSteps = computed(() => unitChars.value.length * stepsPerChar)
const progressPercent = computed(() =>
  totalSteps.value > 0 ? (currentStep.value / totalSteps.value) * 100 : 0,
)
const stepLabelMap: Record<LearnStep, string> = {
  origin: '字源认知',
  speak: '跟读练习',
  trace: '描红练习',
  quiz: '趣味小测',
  complete: '本字完成',
}
const stepLabel = computed(() => stepLabelMap[step.value])
const charProgressLabel = computed(() => {
  if (unitChars.value.length === 0)
    return '正在准备学习内容'
  return `当前生字 ${charIndex.value + 1}/${unitChars.value.length}`
})

// 步骤切换
function goToSpeak() {
  step.value = 'speak'
}

function goToTrace() {
  step.value = 'trace'
}

function goToQuiz() {
  step.value = 'quiz'
}
function handleQuizComplete(correct: boolean, quizType?: string) {
  // 记录学习结果
  learnStore.markCharLearned(currentChar.value._id, correct)
  // 答错记录错题
  if (!correct) {
    learnStore.recordWrong(currentChar.value._id, quizType || 'unknown', unitId.value)
  }
  step.value = 'complete'
}

function nextChar() {
  if (charIndex.value < unitChars.value.length - 1) {
    charIndex.value++
    step.value = 'origin'
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
  }
})
</script>

<style lang="scss" scoped>
.learn-container {
  min-height: 100vh;
  background:
    radial-gradient(circle at 12% 16%, rgba(251, 210, 128, 0.24) 0%, rgba(251, 210, 128, 0) 34%),
    radial-gradient(circle at 84% 30%, rgba(255, 230, 184, 0.32) 0%, rgba(255, 230, 184, 0) 38%),
    linear-gradient(180deg, #fffaf0 0%, #ffffff 62%, #fffdf8 100%);
  display: flex;
  flex-direction: column;
}

.progress-header {
  padding: 26rpx 32rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 249, 239, 0.94));
  border-bottom-left-radius: 36rpx;
  border-bottom-right-radius: 36rpx;
  box-shadow: 0 12rpx 32rpx rgba(214, 149, 37, 0.1);
}

.progress-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.stage-chip {
  padding: 10rpx 24rpx;
  border-radius: 999rpx;
  background: rgba(245, 166, 35, 0.14);
  color: #b36f00;
  font-size: 22rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.progress-bg {
  flex: 1;
  min-width: 0;
  height: 14rpx;
  background: rgba(245, 166, 35, 0.18);
  border-radius: 999rpx;
  overflow: hidden;
  box-shadow: inset 0 1rpx 4rpx rgba(120, 84, 27, 0.08);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f8ca62, #f5a623 56%, #e4941a);
  border-radius: 999rpx;
  transition: width 0.3s ease;
}

.progress-text {
  min-width: 82rpx;
  text-align: right;
  font-size: 26rpx;
  font-weight: 700;
  color: #7d6850;
}

.exit-entry {
  flex-shrink: 0;
  min-width: 144rpx;
  height: 58rpx;
  padding: 0 22rpx;
  border: 2rpx solid rgba(193, 168, 128, 0.38);
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.9);
  font-size: 24rpx;
  font-weight: 500;
  color: #9f8463;
  line-height: 54rpx;
  text-align: center;
  transition: all 0.2s ease;

  &::after {
    border: none;
  }

  &:active {
    transform: scale(0.98);
    background: rgba(245, 166, 35, 0.08);
  }
}

.progress-caption {
  font-size: 24rpx;
  color: #9e8a70;
  line-height: 1.2;
  padding-left: 2rpx;
}

.learn-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24rpx 28rpx 30rpx;
}

.complete-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: rgba(255, 255, 255, 0.92);
  border: 2rpx solid rgba(245, 166, 35, 0.08);
  padding: 64rpx 40rpx;
  border-radius: 28rpx;
  box-shadow: 0 14rpx 40rpx rgba(245, 166, 35, 0.14);
}

.complete-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.complete-title {
  font-size: 52rpx;
  font-weight: bold;
  color: #4a3728;
  margin-bottom: 24rpx;
}

.complete-char {
  font-size: 168rpx;
  font-weight: bold;
  color: #f5a623;
  font-family: 'KaiTi', 'STKaiti', serif;
  line-height: 1.1;
  margin: 24rpx 0 32rpx;
}

.complete-desc {
  font-size: 30rpx;
  color: #7a6a58;
  margin-bottom: 72rpx;
}

.btn-next {
  width: 100%;
  max-width: 420rpx;
  height: 96rpx;
  background: linear-gradient(135deg, #f5a623, #e8941a);
  border: none;
  border-radius: 48rpx;
  font-size: 34rpx;
  font-weight: bold;
  color: #fff;
  box-shadow: 0 12rpx 28rpx rgba(245, 166, 35, 0.28);
}
</style>
