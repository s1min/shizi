<template>
  <div class="test-container">
    <!-- 顶部进度 -->
    <div class="test-header">
      <div class="close-btn" @click="handleClose">
        ✕
      </div>
      <div class="progress-bg">
        <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
      </div>
      <div class="progress-text">
        {{ currentIndex + 1 }}/{{ questions.length }}
      </div>
    </div>

    <!-- 题目区域 -->
    <div v-if="!testDone && currentQuestion" class="question-area">
      <!-- 题型标签 -->
      <div class="quiz-type-tag">
        {{ currentQuestion.typeLabel }}
      </div>

      <!-- 题干 -->
      <div class="question-content">
        <!-- 看字选图 / 看图选字 -->
        <div v-if="currentQuestion.type === 'char-to-image'" class="question-char">
          {{ currentQuestion.targetChar }}
        </div>
        <div v-else-if="currentQuestion.type === 'image-to-char'" class="question-emoji">
          {{ currentQuestion.targetEmoji }}
        </div>
        <!-- 听音选字 -->
        <button v-else-if="currentQuestion.type === 'audio-to-char'" class="btn-audio" @click="playQuestionAudio">
          <text class="audio-icon">{{ isPlaying ? '🔊' : '🔈' }}</text>
          <text>{{ isPlaying ? '播放中...' : '再听一遍' }}</text>
        </button>
        <!-- 拼音选字 -->
        <div v-else-if="currentQuestion.type === 'pinyin-to-char'" class="question-pinyin">
          {{ currentQuestion.targetPinyin }}
        </div>
        <!-- 语境选字 -->
        <div v-else-if="currentQuestion.type === 'context'" class="question-sentence">
          <text v-for="(seg, i) in currentQuestion.sentenceSegments" :key="i" :class="{ blank: seg === '___' }">{{ seg }}</text>
        </div>

        <div class="question-hint">
          {{ currentQuestion.hint }}
        </div>
      </div>

      <!-- 选项 -->
      <div class="options-grid">
        <div
          v-for="(opt, i) in currentQuestion.options"
          :key="i"
          class="option-btn"
          :class="{
            correct: answered && opt.isCorrect,
            wrong: answered && selectedIdx === i && !opt.isCorrect,
            selected: selectedIdx === i,
          }"
          @click="selectAnswer(i)"
        >
          <template v-if="currentQuestion.type === 'char-to-image'">
            <div class="opt-emoji">
              {{ opt.emoji }}
            </div>
          </template>
          <template v-else>
            <div class="opt-char">
              {{ opt.char }}
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 答题反馈（底部横条） -->
    <div v-if="showFeedback" class="feedback-bar" :class="lastCorrect ? 'correct' : 'wrong'">
      <div class="feedback-left">
        <text class="feedback-icon">{{ lastCorrect ? '🎉' : '❌' }}</text>
        <text class="feedback-text">{{ lastCorrect ? '答对了！' : `正确答案是「${currentQuestion?.targetChar}」` }}</text>
      </div>
      <button class="btn-feedback-next" @click="goNext">
        继续
      </button>
    </div>

    <!-- 结果页 -->
    <div v-if="testDone" class="result-page">
      <div class="result-stars">
        <span v-for="i in 3" :key="i" class="star" :class="{ active: i <= resultStars }">
          {{ i <= resultStars ? '⭐' : '☆' }}
        </span>
      </div>
      <div class="result-title">
        {{ resultTitle }}
      </div>
      <div class="result-score">
        {{ correctCount }}/{{ questions.length }} 题正确
      </div>
      <div class="result-accuracy">
        正确率 {{ accuracy }}%
      </div>
      <div class="result-time">
        用时 {{ formattedTime }}
      </div>

      <!-- 错题回顾 -->
      <div v-if="wrongList.length > 0" class="wrong-review">
        <div class="wrong-title">
          需要加强的字
        </div>
        <div class="wrong-chars">
          <div v-for="w in wrongList" :key="w.char" class="wrong-char-item">
            <div class="wrong-char">
              {{ w.char }}
            </div>
            <div class="wrong-pinyin">
              {{ w.pinyin }}
            </div>
          </div>
        </div>
      </div>

      <div class="result-actions">
        <button v-if="!passed" class="btn-retry" @click="retryTest">
          再试一次
        </button>
        <button class="btn-primary" @click="goToComplete">
          {{ passed ? '继续' : '跳过' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Character } from '@/types/character'
import { computed, onMounted, ref } from 'vue'
import { useLearnStore } from '@/store'
import { navigateBackOrTo } from '@/utils/navigation'
import { speakText } from '@/utils/tts'

definePage({
  style: {
    navigationBarTitleText: '单元测试',
    navigationStyle: 'custom',
  },
})

type QuizType = 'char-to-image' | 'image-to-char' | 'audio-to-char' | 'pinyin-to-char' | 'context'

interface Question {
  type: QuizType
  typeLabel: string
  hint: string
  targetChar: string
  targetEmoji?: string
  targetPinyin?: string
  sentenceSegments?: string[]
  options: { char?: string, emoji?: string, isCorrect: boolean }[]
}

const PASS_THRESHOLD = 60 // 及格线 60%

const learnStore = useLearnStore()

const unitId = ref('')
const unitChars = ref<Character[]>([])
const questions = ref<Question[]>([])
const currentIndex = ref(0)
const selectedIdx = ref<number | null>(null)
const answered = ref(false)
const showFeedback = ref(false)
const lastCorrect = ref(false)
const isPlaying = ref(false)
const testDone = ref(false)
const correctCount = ref(0)
const startTime = ref(0)
const elapsedMs = ref(0)
// 记录答错的字（charId → pinyin）
const wrongList = ref<{ char: string, pinyin: string }[]>([])

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
const formattedTime = computed(() => {
  const s = Math.floor(elapsedMs.value / 1000)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return m > 0 ? `${m}分${sec}秒` : `${sec}秒`
})

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
    if (char.example_sentences?.length > 0) {
      types.push('context')
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
    'context': '语境选字',
  }
  const hints: Record<QuizType, string> = {
    'char-to-image': '选择正确的图片',
    'image-to-char': '选择正确的汉字',
    'audio-to-char': '听发音，选汉字',
    'pinyin-to-char': '选择正确的汉字',
    'context': '选择合适的字填空',
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

  // 语境题：拆分句子
  if (type === 'context' && char.example_sentences?.length > 0) {
    const sentence = char.example_sentences[0].text
    const idx = sentence.indexOf(char._id)
    if (idx >= 0) {
      q.sentenceSegments = [sentence.slice(0, idx), '___', sentence.slice(idx + 1)]
    }
    else {
      q.sentenceSegments = [sentence, '（', '___', '）']
    }
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
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function selectAnswer(idx: number) {
  if (answered.value)
    return
  selectedIdx.value = idx
  answered.value = true

  const correct = currentQuestion.value.options[idx].isCorrect
  lastCorrect.value = correct
  if (correct)
    correctCount.value++

  // 答错记录错题
  if (!correct) {
    learnStore.recordWrong(
      currentQuestion.value.targetChar,
      currentQuestion.value.type,
      unitId.value,
    )
    // 记录到本次错题列表（去重）
    if (!wrongList.value.some(w => w.char === currentQuestion.value.targetChar)) {
      wrongList.value.push({
        char: currentQuestion.value.targetChar,
        pinyin: currentQuestion.value.targetPinyin || '',
      })
    }
  }

  showFeedback.value = true

  // 答错时播放正确答案的发音
  if (!correct) {
    setTimeout(() => {
      speakText(currentQuestion.value.targetChar, currentQuestion.value.targetPinyin)
    }, 600)
  }
}

function goNext() {
  showFeedback.value = false
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
    selectedIdx.value = null
    answered.value = false
    // 如果下一题是听音选字，自动播放
    const next = questions.value[currentIndex.value]
    if (next?.type === 'audio-to-char') {
      setTimeout(() => playQuestionAudio(), 400)
    }
  }
  else {
    // 测试结束
    elapsedMs.value = Date.now() - startTime.value
    testDone.value = true
    // 只有通过才记录星级
    if (passed.value) {
      learnStore.completeUnit(unitId.value, resultStars.value)
    }
  }
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
  testDone.value = false
  currentIndex.value = 0
  selectedIdx.value = null
  answered.value = false
  showFeedback.value = false
  correctCount.value = 0
  wrongList.value = []
  // 重新生成题目
  questions.value = generateQuestions(unitChars.value, learnStore.allChars as Character[])
  startTime.value = Date.now()
  // 第一题如果是听音选字，自动播放
  if (questions.value[0]?.type === 'audio-to-char') {
    setTimeout(() => playQuestionAudio(), 400)
  }
}

function goToComplete() {
  const seconds = Math.floor(elapsedMs.value / 1000)
  uni.redirectTo({
    url: `/subpkg-learning/learn/unit-complete?unitId=${unitId.value}&accuracy=${accuracy.value}&time=${seconds}&stars=${resultStars.value}`,
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
</script>

<style lang="scss" scoped>
.test-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff9e6 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  padding: 40rpx;
}

.test-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 40rpx;
  padding-top: 40rpx;
}

.close-btn {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #999;
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
  transition: width 0.3s;
}

.progress-text {
  font-size: 24rpx;
  color: #666;
  min-width: 80rpx;
  text-align: center;
}

.quiz-type-tag {
  align-self: center;
  font-size: 24rpx;
  color: #999;
  background: #f0f0f0;
  padding: 8rpx 24rpx;
  border-radius: 20rpx;
  margin-bottom: 40rpx;
}

.question-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.question-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
}

.question-char {
  font-size: 160rpx;
  font-weight: bold;
  font-family: 'KaiTi', 'STKaiti', serif;
  color: #333;
  line-height: 1;
  margin-bottom: 20rpx;
}

.question-emoji {
  font-size: 140rpx;
  margin-bottom: 20rpx;
}

.question-pinyin {
  font-size: 64rpx;
  color: #333;
  margin-bottom: 20rpx;
}

.question-sentence {
  font-size: 40rpx;
  color: #333;
  margin-bottom: 20rpx;

  .blank {
    color: #f5a623;
    font-weight: bold;
    border-bottom: 4rpx solid #f5a623;
    padding: 0 8rpx;
  }
}

.btn-audio {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 32rpx 48rpx;
  background: linear-gradient(135deg, #5dade2, #4a9bd9);
  border: none;
  border-radius: 60rpx;
  font-size: 32rpx;
  color: #fff;
  margin-bottom: 20rpx;
}

.audio-icon {
  font-size: 48rpx;
}

.question-hint {
  font-size: 28rpx;
  color: #666;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  width: 100%;
}

.option-btn {
  background: #fff;
  border: 4rpx solid #e0e0e0;
  border-radius: 24rpx;
  padding: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);

  &.selected {
    border-color: #f5a623;
    background: #fffde7;
  }
  &.correct {
    border-color: #82c785;
    background: #e8f5e9;
    transform: scale(1.05);
  }
  &.wrong {
    border-color: #ff6b6b;
    background: #ffebee;
    opacity: 0.7;
  }
}

.opt-char {
  font-size: 80rpx;
  font-family: 'KaiTi', 'STKaiti', serif;
  font-weight: bold;
  color: #333;
}

.opt-emoji {
  font-size: 72rpx;
}

/* 底部反馈横条 */
.feedback-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 40rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
  z-index: 100;
  animation: slide-up 0.3s ease-out;

  &.correct {
    background: #e8f5e9;
    border-top: 4rpx solid #82c785;
  }

  &.wrong {
    background: #ffebee;
    border-top: 4rpx solid #ff6b6b;
  }
}

.feedback-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.feedback-icon {
  font-size: 48rpx;
}
.feedback-text {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.btn-feedback-next {
  padding: 16rpx 48rpx;
  border-radius: 40rpx;
  border: none;
  font-size: 30rpx;
  font-weight: bold;
  color: #fff;
  background: linear-gradient(135deg, #f5a623, #e8941a);
}

@keyframes slide-up {
  0% {
    transform: translateY(100%);
  }
  100% {
    transform: translateY(0);
  }
}

.result-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 40rpx;
}

.result-stars {
  display: flex;
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.star {
  font-size: 80rpx;
  opacity: 0.3;
  &.active {
    opacity: 1;
  }
}

.result-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.result-score {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.result-accuracy {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.result-time {
  font-size: 26rpx;
  color: #bbb;
  margin-bottom: 40rpx;
}

/* 错题回顾 */
.wrong-review {
  width: 100%;
  background: #fff5f5;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 40rpx;
}

.wrong-title {
  font-size: 28rpx;
  color: #ff6b6b;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.wrong-chars {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
}

.wrong-char-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.wrong-char {
  width: 80rpx;
  height: 80rpx;
  background: #fff;
  border: 2rpx solid #ff6b6b;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
  font-family: 'KaiTi', 'STKaiti', serif;
  font-weight: bold;
  color: #333;
}

.wrong-pinyin {
  font-size: 20rpx;
  color: #999;
}

.result-actions {
  width: 100%;
  display: flex;
  gap: 24rpx;
  margin-top: auto;
  padding-bottom: 40rpx;
}

.btn-retry {
  flex: 1;
  height: 96rpx;
  background: #fff;
  border: 4rpx solid #f5a623;
  border-radius: 48rpx;
  font-size: 34rpx;
  font-weight: bold;
  color: #f5a623;
}

.btn-primary {
  flex: 1;
  height: 96rpx;
  background: linear-gradient(135deg, #f5a623, #e8941a);
  border: none;
  border-radius: 48rpx;
  font-size: 34rpx;
  font-weight: bold;
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(245, 166, 35, 0.4);
}
</style>
