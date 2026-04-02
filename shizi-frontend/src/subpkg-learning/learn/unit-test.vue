<template>
  <div class="test-container">
    <LearnFlowHeader
      title="单元测试"
      :current="currentIndex + 1"
      :total="questions.length"
      :progress-percent="progressPercent"
      :step-items="testStepItems"
      :show-steps="false"
      @back="handleClose"
    />

    <!-- 题目区域 -->
    <div v-if="!testDone && currentQuestion" class="question-area">
      <div class="question-card">
        <div class="quiz-type-tag">
          {{ currentQuestion.typeLabel }}
        </div>

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
            <text
              v-for="(seg, i) in currentQuestion.sentenceSegments"
              :key="i"
              :class="{ blank: seg === '___' }"
            >
              {{ seg }}
            </text>
          </div>
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
        <text class="feedback-icon">{{ lastCorrect ? '🎉' : '💡' }}</text>
        <text class="feedback-text">{{ lastCorrect ? '答对了！' : `正确答案是「${currentQuestion?.targetChar}」` }}</text>
      </div>
      <button class="btn-feedback-next" @click="goNext">
        继续
      </button>
    </div>

    <!-- 结果页 -->
    <div v-if="testDone" class="result-page">
      <div class="result-summary-card">
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
import type { LearnFlowHeaderStepItem } from '../components/learn/LearnFlowHeader.vue'
import type { Character } from '@/types/character'
import { computed, onMounted, ref } from 'vue'
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

type TestFlowStep = 'origin' | 'speak' | 'trace' | 'quiz'

const PASS_THRESHOLD = 60 // 及格线 60%

const learnStore = useLearnStore()
const testStepItems = computed<LearnFlowHeaderStepItem[]>(() => {
  const stepLabelMap: Record<TestFlowStep, string> = {
    origin: '看一看',
    speak: '读一读',
    trace: '写一写',
    quiz: '试一试',
  }

  return (['origin', 'speak', 'trace', 'quiz'] as TestFlowStep[]).map(key => ({
    key,
    label: stepLabelMap[key],
    state: key === 'quiz' ? 'current' : 'done',
    clickable: false,
  }))
})

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
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
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
  gap: 0;
  padding: 24rpx 24rpx 176rpx;
  color: #4a3728;
}

.question-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  padding: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.quiz-type-tag {
  align-self: center;
  font-size: 32rpx;
  font-weight: 700;
  color: #9a8368;
  background: linear-gradient(180deg, #fffaf1 0%, #fff1db 100%);
  padding: 8rpx 24rpx;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
}

.question-content {
  width: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  text-align: center;
  margin-bottom: 0;
}

.question-char {
  font-size: 160rpx;
  font-weight: 700;
  font-family: 'KaiTi', 'STKaiti', serif;
  color: #333;
  line-height: 1;
  margin-bottom: 20rpx;
}

.question-emoji {
  font-size: 140rpx;
  line-height: 1;
  margin-bottom: 20rpx;
}

.question-pinyin {
  font-size: 64rpx;
  line-height: 1.2;
  color: #333;
  margin-bottom: 20rpx;
}

.question-sentence {
  font-size: 56rpx;
  line-height: 1.6;
  color: #4a3728;
  text-align: center;
  margin-bottom: 20rpx;

  .blank {
    color: #f5a623;
    font-weight: 700;
    border-bottom: 4rpx solid #f5a623;
    padding: 0 8rpx;
  }
}

.btn-audio {
  display: flex;
  align-items: center;
  gap: 16rpx;
  min-width: 240rpx;
  min-height: 88rpx;
  padding: 24rpx 32rpx;
  background: linear-gradient(180deg, #fffaf1 0%, #ffefcf 100%);
  border: none;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: #d08a16;
  margin-bottom: 16rpx;
  box-shadow:
    0 8rpx 16rpx rgba(232, 177, 68, 0.14),
    inset 0 4rpx 0 rgba(255, 255, 255, 0.72);
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24rpx;
  width: 100%;
  margin-top: 32rpx;
}

.option-btn {
  min-height: 144rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: linear-gradient(180deg, #fffefd 0%, #fff8ef 100%);
  box-shadow:
    0 4rpx 12rpx rgba(223, 185, 108, 0.05),
    inset 0 0 0 4rpx rgba(240, 222, 190, 0.72);
  transition: all 0.3s;

  &.selected {
    background: linear-gradient(180deg, #fff4d8 0%, #ffeabf 100%);
    box-shadow:
      0 8rpx 16rpx rgba(237, 179, 70, 0.1),
      inset 0 0 0 4rpx rgba(245, 166, 35, 0.28);
  }

  &.correct {
    background: linear-gradient(180deg, #f5ffef 0%, #e7f8d7 100%);
    box-shadow:
      0 8rpx 16rpx rgba(130, 199, 133, 0.1),
      inset 0 0 0 4rpx rgba(130, 199, 133, 0.32);
    transform: scale(1.03);
  }

  &.wrong {
    background: linear-gradient(180deg, #fff3f1 0%, #ffe2df 100%);
    box-shadow:
      0 8rpx 16rpx rgba(255, 138, 128, 0.1),
      inset 0 0 0 4rpx rgba(255, 138, 128, 0.26);
    opacity: 0.84;
  }
}

.opt-char {
  font-size: 100rpx;
  font-family: 'KaiTi', 'STKaiti', serif;
  font-weight: 700;
  color: #333;
}

.opt-emoji {
  font-size: 72rpx;
  line-height: 1;
}

.feedback-bar {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: calc(24rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 20rpx 24rpx;
  border-radius: 24rpx;
  box-shadow: 0 12rpx 28rpx rgba(0, 0, 0, 0.08);
  z-index: 100;
  animation: slide-up 0.3s ease-out;

  &.correct {
    background: linear-gradient(180deg, #f7fff0 0%, #eef8df 100%);
    border: 2rpx solid rgba(163, 210, 96, 0.44);
  }

  &.wrong {
    background: linear-gradient(180deg, #fffaf6 0%, #fff1ea 100%);
    border: 2rpx solid rgba(241, 165, 142, 0.4);
  }
}

.feedback-left {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.feedback-icon {
  flex-shrink: 0;
  font-size: 36rpx;
}

.feedback-text {
  font-size: 28rpx;
  line-height: 1.4;
  font-weight: 600;
  color: #5a4737;
}

.btn-feedback-next {
  flex-shrink: 0;
  height: 72rpx;
  padding: 0 32rpx;
  border-radius: 36rpx;
  border: none;
  font-size: 28rpx;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #f5a623, #e8941a);
  box-shadow: 0 8rpx 20rpx rgba(245, 166, 35, 0.22);
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
  gap: 24rpx;
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

.result-stars {
  display: flex;
  gap: 20rpx;
  margin-bottom: 32rpx;
}

.star {
  font-size: 72rpx;
  opacity: 0.3;

  &.active {
    opacity: 1;
  }
}

.result-title {
  font-size: 44rpx;
  font-weight: 700;
  color: #4a3728;
  margin-bottom: 16rpx;
}

.result-score {
  font-size: 32rpx;
  color: #6f5b49;
  margin-bottom: 8rpx;
}

.result-accuracy {
  font-size: 28rpx;
  color: #8f7d6b;
  margin-bottom: 8rpx;
}

.result-time {
  font-size: 24rpx;
  color: #ab9987;
}

.wrong-review {
  width: 100%;
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
  color: #bf7f3e;
  font-weight: 700;
  margin-bottom: 20rpx;
}

.wrong-chars {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.wrong-char-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.wrong-char {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20rpx;
  border: 2rpx solid rgba(243, 178, 107, 0.48);
  background: rgba(255, 255, 255, 0.92);
  font-size: 44rpx;
  font-family: 'KaiTi', 'STKaiti', serif;
  font-weight: 700;
  color: #333;
}

.wrong-pinyin {
  font-size: 20rpx;
  color: #9c8b79;
}

.result-actions {
  width: 100%;
  display: flex;
  gap: 16rpx;
  margin-top: auto;
}

.btn-retry,
.btn-primary {
  flex: 1;
  height: 88rpx;
  border-radius: 24rpx;
  font-size: 30rpx;
  font-weight: 700;
}

.btn-retry {
  background: #fff;
  border: 2rpx solid rgba(245, 166, 35, 0.56);
  color: #f5a623;
}

.btn-primary {
  border: none;
  background: linear-gradient(135deg, #f5a623, #e8941a);
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(245, 166, 35, 0.22);
}
</style>
