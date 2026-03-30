<template>
  <div class="learn-container">
    <!-- 进度条 -->
    <div class="progress-header">
      <div class="progress-bar">
        <div class="progress-bg">
          <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
        </div>
        <div class="progress-text">
          {{ currentStep }}/{{ totalSteps }}
        </div>
      </div>
      <button class="exit-entry" @click="handleClose">
        退出学习
      </button>
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
  background: linear-gradient(180deg, #fff9e6 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
}

.progress-header {
  padding: calc(env(safe-area-inset-top) + 24rpx) 32rpx 20rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  background: rgba(255, 255, 255, 0.9);
}

.progress-bar {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.progress-bg {
  flex: 1;
  height: 16rpx;
  background: #e0e0e0;
  border-radius: 8rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f5a623, #e8941a);
  border-radius: 8rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 24rpx;
  color: #666;
  min-width: 60rpx;
  text-align: right;
}

.exit-entry {
  align-self: flex-start;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 24rpx;
  color: #b7aa96;
  line-height: 1.4;
}

.learn-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 32rpx;
}

.complete-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.complete-icon {
  font-size: 120rpx;
  margin-bottom: 40rpx;
}

.complete-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.complete-char {
  font-size: 160rpx;
  font-weight: bold;
  color: $uni-color-primary;
  font-family: 'KaiTi', 'STKaiti', serif;
  margin: 40rpx 0;
}

.complete-desc {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 60rpx;
}

.btn-next {
  width: 400rpx;
  height: 88rpx;
  background: linear-gradient(135deg, #f5a623, #e8941a);
  border: none;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(245, 166, 35, 0.4);
}
</style>
