<template>
  <div class="test-container">
    <LearnFlowHeader
      title="单元测试"
      :current="currentIndex + 1"
      :total="questions.length"
      :progress-percent="progressPercent"
      :show-steps="false"
      @back="handleClose"
    />

    <div v-if="!testDone && currentQuestion" class="question-area">
      <div class="question-card learning-quiz-question-card">
        <div class="question-meta learning-quiz-question-meta">
          <div class="quiz-type learning-quiz-type">
            {{ currentQuestion.typeLabel }}
          </div>
          <div class="question-hint learning-quiz-hint">
            {{ currentQuestion.hint }}
          </div>
        </div>

        <div class="question-content learning-quiz-content">
          <div v-if="currentQuestion.type === 'char-to-image'" class="question-char learning-quiz-char">
            {{ currentQuestion.targetChar }}
          </div>
          <div v-else-if="currentQuestion.type === 'image-to-char'" class="question-image learning-quiz-image">
            {{ currentQuestion.targetEmoji }}
          </div>
          <button v-else-if="currentQuestion.type === 'audio-to-char'" class="btn-audio learning-quiz-audio-btn" @click="playQuestionAudio">
            <text class="audio-icon learning-quiz-audio-icon">{{ isPlaying ? '🔊' : '🔈' }}</text>
            <text>{{ isPlaying ? '播放中...' : '再听一遍' }}</text>
          </button>
          <div v-else-if="currentQuestion.type === 'pinyin-to-char'" class="question-pinyin learning-quiz-pinyin">
            {{ currentQuestion.targetPinyin }}
          </div>
        </div>
      </div>

      <div class="options-panel learning-quiz-options-panel">
        <div class="options-area learning-quiz-options-grid">
          <div
            v-for="(opt, i) in currentQuestion.options"
            :key="i"
            class="option-item learning-quiz-option"
            :class="{
              correct: feedbackState === 'success' && opt.isCorrect,
              wrong: answered && selectedIdx === i && !opt.isCorrect,
              selected: selectedIdx === i,
              disabled: feedbackState !== 'hidden',
            }"
            @click="selectAnswer(i)"
          >
            <template v-if="currentQuestion.type === 'char-to-image'">
              <div class="option-image learning-quiz-option-image">
                {{ opt.emoji }}
              </div>
            </template>
            <template v-else>
              <div class="option-char learning-quiz-option-char">
                {{ opt.char }}
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!testDone && feedbackState !== 'hidden'" class="feedback-dock learning-quiz-feedback-dock">
      <div class="feedback-card learning-quiz-feedback-card" :class="feedbackState">
        <div class="feedback-main learning-quiz-feedback-main">
          <div class="feedback-icon-wrap learning-quiz-feedback-icon-wrap">
            <text class="feedback-icon-large learning-quiz-feedback-icon">{{ feedbackIcon }}</text>
          </div>
          <div class="feedback-copy learning-quiz-feedback-copy">
            <div class="feedback-title learning-quiz-feedback-title">
              {{ feedbackTitle }}
            </div>
            <div class="feedback-desc learning-quiz-feedback-desc">
              {{ feedbackDesc }}
            </div>
          </div>
        </div>
        <div v-if="feedbackState === 'retryable-error'" class="feedback-actions learning-quiz-actions">
          <button class="btn-modal-secondary learning-quiz-btn-secondary" @click="skipCurrentQuestion">
            先看下一题
          </button>
          <button class="btn-modal-primary learning-quiz-btn-primary" @click="retryCurrentQuestion">
            再试一次
          </button>
        </div>
        <div v-else-if="feedbackState === 'final-error'" class="feedback-actions learning-quiz-actions single">
          <button class="btn-modal-primary learning-quiz-btn-primary" @click="goNextFromFinalError">
            继续下一题
          </button>
        </div>
      </div>
    </div>

    <div v-if="testDone" class="result-page">
      <div class="result-summary-card">
        <div class="result-badge">
          单元小测完成
        </div>
        <div class="result-stars">
          <wd-icon
            v-for="i in 3"
            :key="i"
            class="result-star"
            :class="{ active: i <= resultStars }"
            :name="i <= resultStars ? 'star-filled' : 'star'"
            size="36px"
          />
        </div>
        <div class="result-title">
          {{ resultTitle }}
        </div>
        <div class="result-score">
          {{ correctCount }}/{{ questions.length }} 题正确
        </div>
        <div class="result-stats">
          <div class="result-stat-item">
            <div class="result-stat-value">
              {{ accuracy }}%
            </div>
            <div class="result-stat-label">
              正确率
            </div>
          </div>
          <div class="result-stat-divider" />
          <div class="result-stat-item">
            <div class="result-stat-value">
              {{ formattedTime }}
            </div>
            <div class="result-stat-label">
              用时
            </div>
          </div>
        </div>
        <div class="result-summary-text">
          {{ resultSummaryText }}
        </div>
        <div class="result-next-hint">
          {{ passed ? '保持这个状态，进入下一步继续学。' : '先进入下一步学习，之后回来再练会更稳。' }}
        </div>
      </div>

      <div v-if="wrongList.length > 0" class="wrong-review">
        <div class="wrong-title">
          需要加强的字
        </div>
        <div class="wrong-desc">
          把这些字再看一看，会更有把握。
        </div>
        <div class="wrong-chars">
          <div v-for="w in wrongList" :key="w.char" class="wrong-char-item">
            <div class="wrong-pinyin">
              {{ w.pinyin }}
            </div>
            <div class="wrong-char">
              {{ w.char }}
            </div>
          </div>
        </div>
      </div>

      <div class="result-actions">
        <button v-if="!passed" class="btn-retry" @click="retryTest">
          再练一次
        </button>
        <button class="btn-primary" @click="goToComplete">
          {{ passed ? '进入下一步' : '先去学习页' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Character } from '@/types/character'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useLearnStore } from '@/store'
import { navigateBackOrTo } from '@/utils/navigation'
import { speakText } from '@/utils/tts'
import LearnFlowHeader from '../components/learn/LearnFlowHeader.vue'

definePage({
  style: {
    navigationBarTitleText: '单元测试',
    navigationStyle: 'custom',
  },
})

type QuizType = 'char-to-image' | 'image-to-char' | 'audio-to-char' | 'pinyin-to-char'

interface Question {
  type: QuizType
  typeLabel: string
  hint: string
  targetChar: string
  targetEmoji?: string
  targetPinyin?: string
  options: { char?: string, emoji?: string, isCorrect: boolean }[]
}

type FeedbackState = 'hidden' | 'success' | 'retryable-error' | 'final-error'
type AnswerResultType = 'correct_first_try' | 'correct_after_retry' | 'skipped_after_wrong' | 'wrong_final'

const PASS_THRESHOLD = 60 // 及格线 60%

const learnStore = useLearnStore()

const unitId = ref('')
const unitChars = ref<Character[]>([])
const questions = ref<Question[]>([])
const currentIndex = ref(0)
const selectedIdx = ref<number | null>(null)
const answered = ref(false)
const feedbackState = ref<FeedbackState>('hidden')
const attemptCount = ref(0)
const isPlaying = ref(false)
const testDone = ref(false)
const correctCount = ref(0)
const startTime = ref(0)
const elapsedMs = ref(0)
const wrongList = ref<{ char: string, pinyin: string }[]>([])
const answerRecords = ref<{
  questionIndex: number
  char: string
  quizType: string
  result: AnswerResultType
}[]>([])

const successMessages = [
  '你越来越厉害啦',
  '这个字你记住了',
  '真棒，继续下一个',
] as const
const retrySuccessMessages = [
  '再试一次就成功了',
  '你自己想出来了',
  '很棒，继续保持',
] as const
const retryErrorMessages = [
  '你已经很接近啦',
  '差一点点，再试试',
  '再看看，一定可以',
] as const
const finalErrorMessages = [
  '先继续下一题吧',
  '先往下学，等会再回顾它',
  '这个字之后再练一练',
] as const

let successTimer: ReturnType<typeof setTimeout> | null = null

const currentQuestion = computed(() => questions.value[currentIndex.value])
const progressPercent = computed(() =>
  questions.value.length > 0 ? ((currentIndex.value + 1) / questions.value.length) * 100 : 0,
)
const accuracy = computed(() =>
  questions.value.length > 0 ? Math.round((correctCount.value / questions.value.length) * 100) : 0,
)
const passed = computed(() => accuracy.value >= PASS_THRESHOLD)
const resultStars = computed(() => {
  if (accuracy.value >= 100)
    return 3
  if (accuracy.value >= 80)
    return 2
  if (accuracy.value >= PASS_THRESHOLD)
    return 1
  return 0
})
const resultTitle = computed(() => {
  if (resultStars.value === 3)
    return '太棒了！全部答对！'
  if (resultStars.value === 2)
    return '很不错！继续加油！'
  if (resultStars.value === 1)
    return '通过了，再练练更好！'
  return '还需要多练习哦'
})
const retrySuccessCount = computed(() =>
  answerRecords.value.filter(item => item.result === 'correct_after_retry').length,
)
const resultSummaryText = computed(() => {
  if (retrySuccessCount.value >= 3)
    return '你已经会很多了，再练一练会更稳。'
  if (retrySuccessCount.value > 0)
    return '有些字再试一次就答对了，继续加油。'
  if (wrongList.value.length === 0)
    return '这次状态很棒，很多字都已经记住了。'
  return '把需要加强的字再看一看，会更有把握。'
})
const formattedTime = computed(() => {
  const s = Math.floor(elapsedMs.value / 1000)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return m > 0 ? `${m}分${sec}秒` : `${sec}秒`
})
const feedbackIcon = computed(() => {
  if (feedbackState.value === 'success')
    return '🎉'
  if (feedbackState.value === 'retryable-error')
    return '💡'
  if (feedbackState.value === 'final-error')
    return '🌱'
  return ''
})
const feedbackTitle = computed(() => {
  if (feedbackState.value === 'success')
    return '答对啦！'
  if (feedbackState.value === 'retryable-error')
    return '再想一想'
  if (feedbackState.value === 'final-error')
    return '这个字我们之后再练一练'
  return ''
})
const feedbackDesc = computed(() => {
  if (feedbackState.value === 'success') {
    const messages = attemptCount.value === 1 ? successMessages : retrySuccessMessages
    return messages[currentIndex.value % messages.length]
  }
  if (feedbackState.value === 'retryable-error')
    return retryErrorMessages[currentIndex.value % retryErrorMessages.length]
  if (feedbackState.value === 'final-error')
    return finalErrorMessages[currentIndex.value % finalErrorMessages.length]
  return ''
})

function recordAnswerResult(result: AnswerResultType) {
  if (!currentQuestion.value)
    return
  answerRecords.value.push({
    questionIndex: currentIndex.value,
    char: currentQuestion.value.targetChar,
    quizType: currentQuestion.value.type,
    result,
  })
}

function markCurrentQuestionWrong() {
  if (!currentQuestion.value)
    return
  learnStore.recordWrong(
    currentQuestion.value.targetChar,
    currentQuestion.value.type,
    unitId.value,
  )

  if (!wrongList.value.some(w => w.char === currentQuestion.value.targetChar)) {
    wrongList.value.push({
      char: currentQuestion.value.targetChar,
      pinyin: currentQuestion.value.targetPinyin || '',
    })
  }
}

function clearSuccessTimer() {
  if (successTimer) {
    clearTimeout(successTimer)
    successTimer = null
  }
}

function playErrorSfx() {
  uni.vibrateShort?.({ type: 'light' as any })
}

function resetCurrentQuestionState() {
  selectedIdx.value = null
  answered.value = false
  feedbackState.value = 'hidden'
  attemptCount.value = 0
}

function goNextQuestion() {
  clearSuccessTimer()
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
    resetCurrentQuestionState()
    const next = questions.value[currentIndex.value]
    if (next?.type === 'audio-to-char') {
      setTimeout(() => playQuestionAudio(), 400)
    }
  }
  else {
    elapsedMs.value = Date.now() - startTime.value
    testDone.value = true
    if (passed.value) {
      learnStore.completeUnit(unitId.value, resultStars.value)
    }
  }
}

function scheduleNextQuestion() {
  clearSuccessTimer()
  successTimer = setTimeout(() => {
    goNextQuestion()
  }, 900)
}

function retryCurrentQuestion() {
  feedbackState.value = 'hidden'
  selectedIdx.value = null
  answered.value = false
  if (currentQuestion.value?.type === 'audio-to-char') {
    setTimeout(() => playQuestionAudio(), 300)
  }
}

function skipCurrentQuestion() {
  recordAnswerResult('skipped_after_wrong')
  markCurrentQuestionWrong()
  feedbackState.value = 'hidden'
  goNextQuestion()
}

function goNextFromFinalError() {
  feedbackState.value = 'hidden'
  goNextQuestion()
}

/** 为每个字生成多道题，确保题型覆盖 */
function generateQuestions(chars: Character[], allChars: Character[]) {
  const qs: Question[] = []

  // 可用题型池（按字的特征筛选）
  function getAvailableTypes(char: Character): QuizType[] {
    const types: QuizType[] = ['pinyin-to-char', 'audio-to-char']
    const hasEmoji = !!char.teaching?.emoji_fallback
    if (hasEmoji) {
      types.push('char-to-image', 'image-to-char')
    }
    return types
  }

  for (const char of chars) {
    const available = getAvailableTypes(char)
    // 随机选 2 种不同题型
    const shuffledTypes = shuffle(available)
    const selectedTypes = shuffledTypes.slice(0, 2)

    for (const type of selectedTypes) {
      const distractors = getDistractors(char, allChars, 3)
      const q = buildQuestion(char, type, distractors)
      qs.push(q)
    }
  }

  return shuffle(qs)
}

function buildQuestion(char: Character, type: QuizType, distractors: Character[]): Question {
  const typeLabels: Record<QuizType, string> = {
    'char-to-image': '看字选图',
    'image-to-char': '看图选字',
    'audio-to-char': '听音选字',
    'pinyin-to-char': '看拼音选字',
  }
  const hints: Record<QuizType, string> = {
    'char-to-image': '选择正确的图片',
    'image-to-char': '选择正确的汉字',
    'audio-to-char': '听发音，选汉字',
    'pinyin-to-char': '选择正确的汉字',
  }

  const q: Question = {
    type,
    typeLabel: typeLabels[type],
    hint: hints[type],
    targetChar: char._id,
    targetEmoji: char.teaching?.emoji_fallback,
    targetPinyin: char.pinyin,
    options: shuffle([
      { char: char._id, emoji: char.teaching?.emoji_fallback || '❓', isCorrect: true },
      ...distractors.map(d => ({
        char: d._id,
        emoji: d.teaching?.emoji_fallback || '❓',
        isCorrect: false,
      })),
    ]),
  }

  return q
}

function getDistractors(char: Character, allChars: Character[], count: number): Character[] {
  const similar = (char.similar_chars || [])
    .map(id => allChars.find(c => c._id === id))
    .filter(Boolean) as Character[]

  const others = allChars.filter(c => c._id !== char._id && !char.similar_chars?.includes(c._id))

  const result: Character[] = []
  const shuffledSimilar = shuffle([...similar])
  const shuffledOthers = shuffle([...others])

  // 优先取形近字
  while (result.length < count) {
    if (shuffledSimilar.length > 0 && result.length < 2) {
      result.push(shuffledSimilar.shift()!)
    }
    else if (shuffledOthers.length > 0) {
      result.push(shuffledOthers.shift()!)
    }
    else {
      break
    }
  }
  return result
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function selectAnswer(idx: number) {
  if (answered.value || feedbackState.value !== 'hidden' || !currentQuestion.value)
    return

  selectedIdx.value = idx
  answered.value = true
  attemptCount.value += 1

  const correct = currentQuestion.value.options[idx].isCorrect
  if (correct) {
    correctCount.value++
    recordAnswerResult(attemptCount.value === 1 ? 'correct_first_try' : 'correct_after_retry')
    feedbackState.value = 'success'
    scheduleNextQuestion()
    return
  }

  playErrorSfx()
  if (attemptCount.value === 1) {
    feedbackState.value = 'retryable-error'
    return
  }

  recordAnswerResult('wrong_final')
  markCurrentQuestionWrong()
  feedbackState.value = 'final-error'
}

function goNext() {
  goNextQuestion()
}

function playQuestionAudio() {
  if (isPlaying.value || !currentQuestion.value)
    return
  isPlaying.value = true
  speakText(currentQuestion.value.targetChar, currentQuestion.value.targetPinyin, {
    onEnd: () => { isPlaying.value = false },
    onError: () => { isPlaying.value = false },
  })
}

/** 重新测试 */
function retryTest() {
  clearSuccessTimer()
  testDone.value = false
  currentIndex.value = 0
  correctCount.value = 0
  wrongList.value = []
  answerRecords.value = []
  resetCurrentQuestionState()
  questions.value = generateQuestions(unitChars.value, learnStore.allChars as Character[])
  startTime.value = Date.now()
  if (questions.value[0]?.type === 'audio-to-char') {
    setTimeout(() => playQuestionAudio(), 400)
  }
}

function goToComplete() {
  const seconds = Math.floor(elapsedMs.value / 1000)
  const query = passed.value
    ? `unitId=${unitId.value}&accuracy=${accuracy.value}&time=${seconds}&stars=${resultStars.value}`
    : `unitId=${unitId.value}`

  uni.redirectTo({
    url: `/subpkg-learning/learn/unit-complete?${query}`,
  })
}

function handleClose() {
  uni.showModal({
    title: '确定退出吗？',
    content: '当前测试进度不会保留，建议完成后再退出',
    success: (res) => {
      if (res.confirm) {
        navigateBackOrTo('/pages/home/index', true)
      }
    },
  })
}

function initTest() {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  unitId.value = currentPage?.options?.unitId || ''

  // 获取单元汉字
  const unit = learnStore.library.stages
    .flatMap((s: any) => s.units)
    .find((u: any) => u.id === unitId.value)

  if (unit) {
    const chars = unit.chars
      .map((id: string) => learnStore.charMap.get(id))
      .filter(Boolean) as Character[]

    unitChars.value = chars
    questions.value = generateQuestions(chars, learnStore.allChars as Character[])
    startTime.value = Date.now()

    // 第一题如果是听音选字，自动播放
    if (questions.value[0]?.type === 'audio-to-char') {
      setTimeout(() => playQuestionAudio(), 400)
    }
  }
}

onMounted(() => initTest())
onUnmounted(() => {
  clearSuccessTimer()
})
</script>

<style lang="scss" scoped>
.test-container {
  min-height: 100vh;
  background:
    radial-gradient(circle at 12% 16%, rgba(251, 210, 128, 0.2) 0%, rgba(251, 210, 128, 0) 32%),
    radial-gradient(circle at 84% 28%, rgba(255, 230, 184, 0.28) 0%, rgba(255, 230, 184, 0) 36%),
    linear-gradient(180deg, #fffaf2 0%, #fffdf8 56%, #ffffff 100%);
  display: flex;
  flex-direction: column;
}

.question-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 24rpx 24rpx 196rpx;
  color: #4a3728;
}

.result-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  padding: 24rpx 24rpx 40rpx;
}

.result-summary-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 32rpx;
  border-radius: 32rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 251, 243, 0.94) 100%);
  box-shadow:
    0 12rpx 28rpx rgba(226, 182, 92, 0.08),
    inset 0 0 0 2rpx rgba(255, 244, 220, 0.6);
  text-align: center;
}

.result-badge {
  padding: 8rpx 24rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: #9a8368;
  background: linear-gradient(180deg, #fffaf1 0%, #fff1db 100%);
}

.result-stars {
  display: flex;
  gap: 20rpx;
  margin-top: 24rpx;
}

.result-star {
  color: rgba(208, 198, 184, 0.68);
}

.result-star.active {
  color: #efb347;
}

.result-title {
  margin-top: 24rpx;
  font-size: 48rpx;
  line-height: 1.3;
  font-weight: 700;
  color: #4a3728;
}

.result-score {
  margin-top: 16rpx;
  font-size: 36rpx;
  line-height: 1.4;
  font-weight: 700;
  color: #6f5b49;
}

.result-stats {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  margin-top: 24rpx;
  padding: 24rpx 32rpx;
  border-radius: 24rpx;
  background: rgba(255, 250, 242, 0.8);
}

.result-stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.result-stat-value {
  font-size: 36rpx;
  line-height: 1.2;
  font-weight: 700;
  color: #4a3728;
}

.result-stat-label {
  font-size: 24rpx;
  line-height: 1.4;
  color: #9c8b79;
}

.result-stat-divider {
  width: 2rpx;
  height: 56rpx;
  background: rgba(232, 177, 68, 0.18);
}

.result-summary-text {
  margin-top: 24rpx;
  font-size: 28rpx;
  line-height: 1.6;
  color: #7f6a56;
}

.result-next-hint {
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.5;
  color: #9c8b79;
}

.wrong-review {
  padding: 28rpx 24rpx;
  border-radius: 28rpx;
  background: linear-gradient(180deg, rgba(255, 250, 245, 0.96) 0%, rgba(255, 244, 236, 0.96) 100%);
  box-shadow:
    0 8rpx 20rpx rgba(245, 166, 35, 0.06),
    inset 0 0 0 2rpx rgba(255, 238, 225, 0.72);
}

.wrong-title {
  font-size: 28rpx;
  line-height: 1.4;
  font-weight: 700;
  color: #6f5b49;
}

.wrong-desc {
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 1.5;
  color: #9c8b79;
}

.wrong-chars {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx 16rpx;
  margin-top: 24rpx;
}

.wrong-char-item {
  width: 88rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 8rpx;
}

.wrong-char {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 24rpx;
  border: 2rpx solid rgba(243, 178, 107, 0.4);
  background: rgba(255, 255, 255, 0.96);
  font-size: 48rpx;
  font-family: 'KaiTi', 'STKaiti', serif;
  font-weight: 700;
  color: #333;
  box-shadow: 0 6rpx 12rpx rgba(226, 188, 112, 0.08);
}

.wrong-pinyin {
  font-size: 20rpx;
  line-height: 1.2;
  color: #9c8b79;
  text-align: center;
}

.result-actions {
  width: 100%;
  display: flex;
  gap: 16rpx;
  margin-top: 8rpx;
}

.btn-retry,
.btn-primary {
  flex: 1;
  height: 96rpx;
  line-height: 96rpx;
  text-align: center;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 700;
}

.btn-retry {
  background: linear-gradient(180deg, #fffaf1 0%, #fff1db 100%);
  border: 2rpx solid rgba(232, 177, 68, 0.2);
  color: #c5871a;
  box-shadow: 0 10rpx 20rpx rgba(226, 188, 112, 0.12);
}

.btn-primary {
  border: none;
  background: linear-gradient(135deg, #f5a623 0%, #eb9a1a 52%, #e28412 100%);
  color: #fff;
  box-shadow: 0 12rpx 24rpx rgba(230, 145, 24, 0.24);
}

.btn-retry::after,
.btn-primary::after {
  border: none;
}
</style>
