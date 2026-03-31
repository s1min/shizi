<template>
  <div class="learn-container">
    <!-- 进度条 -->
    <div class="progress-header" :style="headerStyle">
      <div class="progress-topline">
        <button class="exit-entry" @click="handleClose">
          <wd-icon name="arrow-left" size="22px" />
        </button>
        <div class="step-title">
          {{ stepLabel }}
        </div>
      </div>
      <div class="progress-row">
        <div class="progress-bg">
          <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
        </div>
        <div class="progress-text">
          {{ currentCharIndex }}/{{ totalChars }}
        </div>
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
  paddingTop: `${navMetrics.navBarPaddingTop}px`,
}))

// 学习步骤
type LearnStep = 'origin' | 'speak' | 'trace' | 'quiz' | 'complete'

const step = ref<LearnStep>('origin')
const charIndex = ref(0)
const unitId = ref('unit_1')

const unitChars = ref<Character[]>([])
const currentChar = computed(() => unitChars.value[charIndex.value] || {} as Character)

// 进度计算
const totalChars = computed(() => unitChars.value.length)
const currentCharIndex = computed(() =>
  totalChars.value > 0 ? charIndex.value + 1 : 0,
)
const progressPercent = computed(() =>
  totalChars.value > 0 ? (currentCharIndex.value / totalChars.value) * 100 : 0,
)
const stepLabelMap: Record<LearnStep, string> = {
  origin: '字形认知',
  speak: '跟读练习',
  trace: '描红练习',
  quiz: '趣味小测',
  complete: '本字完成',
}
const stepLabel = computed(() => stepLabelMap[step.value])
const charProgressLabel = computed(() => {
  if (totalChars.value === 0)
    return '正在准备学习内容'
  return `当前生字 ${currentCharIndex.value}/${totalChars.value}`
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
  padding: 18rpx 32rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  background: linear-gradient(180deg, rgba(255, 252, 246, 0.98), rgba(255, 247, 234, 0.96));
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
  box-shadow:
    0 14rpx 28rpx rgba(226, 172, 70, 0.1),
    inset 0 -2rpx 0 rgba(255, 255, 255, 0.5);
}

.progress-topline {
  display: grid;
  grid-template-columns: 96rpx 1fr;
  align-items: center;
  gap: 12rpx;
}

.step-title {
  text-align: center;
  font-size: 32rpx;
  font-weight: 700;
  color: #6a5034;
  letter-spacing: 2rpx;
  padding-right: 96rpx;
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.progress-bg {
  flex: 1;
  min-width: 0;
  height: 18rpx;
  background: linear-gradient(180deg, rgba(255, 243, 220, 0.94), rgba(255, 238, 205, 0.96));
  border-radius: 999rpx;
  overflow: hidden;
  box-shadow:
    inset 0 1rpx 3rpx rgba(214, 170, 88, 0.07),
    inset 0 -1rpx 0 rgba(255, 255, 255, 0.45);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd977 0%, #f9bf45 56%, #f1a62a 100%);
  border-radius: 999rpx;
  box-shadow:
    inset 0 1rpx 0 rgba(255, 248, 220, 0.45),
    0 2rpx 6rpx rgba(240, 168, 46, 0.14);
  transition: width 0.3s ease;
}

.progress-text {
  flex-shrink: 0;
  min-width: 78rpx;
  text-align: right;
  font-size: 30rpx;
  font-weight: 700;
  color: #8b7357;
}

.exit-entry {
  width: 84rpx;
  height: 84rpx;
  justify-self: start;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid rgba(247, 213, 153, 0.46);
  border-radius: 999rpx;
  background: linear-gradient(180deg, #fffaf1 0%, #ffefcf 100%);
  color: #d08a16;
  box-shadow:
    0 8rpx 16rpx rgba(232, 177, 68, 0.14),
    inset 0 2rpx 0 rgba(255, 255, 255, 0.72);
  transition: all 0.2s ease;

  &::after {
    border: none;
  }

  &:active {
    transform: scale(0.97);
    background: linear-gradient(180deg, #fff1d9 0%, #ffe8bf 100%);
    box-shadow: 0 4rpx 10rpx rgba(232, 177, 68, 0.12);
  }
}

.progress-caption {
  font-size: 24rpx;
  color: #a79278;
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
