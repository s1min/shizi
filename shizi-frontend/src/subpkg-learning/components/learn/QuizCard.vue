<template>
  <div class="quiz-card">
    <div class="question-card learning-quiz-question-card">
      <div class="question-meta learning-quiz-question-meta">
        <div class="quiz-type learning-quiz-type">
          {{ quizTypeLabel }}
        </div>
        <div class="question-hint learning-quiz-hint">
          {{ quizHint }}
        </div>
      </div>

      <div class="question-content learning-quiz-content">
        <template v-if="quizType === 'char-to-image'">
          <div class="question-char learning-quiz-char">
            {{ char._id }}
          </div>
        </template>

        <template v-else-if="quizType === 'image-to-char'">
          <div class="question-image learning-quiz-image">
            {{ char.teaching?.emoji_fallback || '❓' }}
          </div>
        </template>

        <template v-else-if="quizType === 'audio-to-char'">
          <button class="btn-audio learning-quiz-audio-btn" @click="playAudio">
            <text class="audio-icon learning-quiz-audio-icon">{{ isPlaying ? '🔊' : '🔈' }}</text>
            <text>{{ isPlaying ? '播放中...' : '再听一遍' }}</text>
          </button>
        </template>

        <template v-else-if="quizType === 'pinyin-to-char'">
          <div class="question-pinyin learning-quiz-pinyin">
            {{ char.pinyin }}
          </div>
        </template>
      </div>
    </div>

    <div class="options-panel learning-quiz-options-panel">
      <div class="options-area learning-quiz-options-grid">
        <div
          v-for="(option, index) in options"
          :key="index"
          class="option-item learning-quiz-option"
          :class="{
            selected: selectedIndex === index,
            correct: showResult && option.isCorrect,
            wrong: showResult && selectedIndex === index && !option.isCorrect,
            disabled: showResult,
          }"
          @click="selectOption(index)"
        >
          <template v-if="quizType === 'char-to-image'">
            <div class="option-image learning-quiz-option-image">
              {{ option.emoji }}
            </div>
          </template>

          <template v-else>
            <div class="option-char learning-quiz-option-char">
              {{ option.char }}
            </div>
          </template>
        </div>
      </div>
    </div>

    <div v-if="feedbackState !== 'hidden'" class="feedback-dock learning-quiz-feedback-dock">
      <div class="feedback-card learning-quiz-feedback-card" :class="feedbackState">
        <div class="feedback-main learning-quiz-feedback-main">
          <div class="feedback-icon-wrap learning-quiz-feedback-icon-wrap">
            <text class="feedback-icon-large learning-quiz-feedback-icon">{{ isCorrect ? '🎉' : '💡' }}</text>
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
      </div>
    </div>

    <div class="step-actions learning-quiz-actions">
      <button class="btn-secondary learning-quiz-btn-secondary" @click="handlePrev">
        上一步
      </button>
      <button class="btn-next learning-quiz-btn-primary" :class="{ disabled: !showResult }" :disabled="!showResult" @click="handleNext">
        完成小测
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Character } from '@/types/character'
import { computed, onMounted, ref, watch } from 'vue'
import { speakText } from '@/utils/tts'

type QuizType = 'char-to-image' | 'image-to-char' | 'audio-to-char' | 'pinyin-to-char'

interface Option {
  char?: string
  emoji?: string
  isCorrect: boolean
}

const props = defineProps<{
  char: Character
  allChars: Character[]
}>()

const emit = defineEmits<{
  prev: []
  next: [correct: boolean, quizType: string]
}>()

const quizType = ref<QuizType>('image-to-char')
const options = ref<Option[]>([])
const selectedIndex = ref<number | null>(null)
const showResult = ref(false)
const isCorrect = ref(false)
const isPlaying = ref(false)

const quizTypeLabel = computed(() => {
  const labels: Record<QuizType, string> = {
    'char-to-image': '看字选图',
    'image-to-char': '看图选字',
    'audio-to-char': '听音选字',
    'pinyin-to-char': '看拼音选字',
  }
  return labels[quizType.value]
})

const quizHint = computed(() => {
  const hints: Record<QuizType, string> = {
    'char-to-image': '选择正确的图片',
    'image-to-char': '选择正确的汉字',
    'audio-to-char': '听发音，选汉字',
    'pinyin-to-char': '选择正确的汉字',
  }
  return hints[quizType.value]
})

const feedbackState = computed(() => {
  if (!showResult.value)
    return 'hidden'
  return isCorrect.value ? 'success' : 'error'
})

const feedbackTitle = computed(() =>
  isCorrect.value ? '答对啦！' : '再看一看这个字',
)

const feedbackDesc = computed(() =>
  isCorrect.value ? '已经记住这个字了，继续下一步吧。' : '先听一听正确发音，再完成这一题。',
)

function initQuiz() {
  selectedIndex.value = null
  showResult.value = false
  isCorrect.value = false

  // 根据汉字类型选择合适的题型
  const charType = props.char.char_type
  const hasEmoji = !!props.char.teaching?.emoji_fallback

  if (charType === '象形' && hasEmoji) {
    // 象形字优先用图片题
    quizType.value = Math.random() > 0.5 ? 'char-to-image' : 'image-to-char'
  }
  else {
    // 其他类型用拼音或听音
    quizType.value = Math.random() > 0.5 ? 'pinyin-to-char' : 'audio-to-char'
  }

  // 生成选项
  generateOptions()

  // 听音选字：自动播放一次语音
  if (quizType.value === 'audio-to-char') {
    setTimeout(() => playAudio(), 400)
  }
}

function generateOptions() {
  const correctChar = props.char
  const distractors: Character[] = []

  // 优先从形近字中选取干扰项
  const similarChars = correctChar.similar_chars || []
  const availableChars = props.allChars.filter(
    c => c._id !== correctChar._id && similarChars.includes(c._id),
  )

  // 如果形近字不够，从所有字中随机选取
  const otherChars = props.allChars.filter(
    c => c._id !== correctChar._id && !similarChars.includes(c._id),
  )

  // 打乱并选取干扰项
  const shuffledSimilar = [...availableChars].sort(() => Math.random() - 0.5)
  const shuffledOther = [...otherChars].sort(() => Math.random() - 0.5)

  while (distractors.length < 3 && (shuffledSimilar.length > 0 || shuffledOther.length > 0)) {
    if (shuffledSimilar.length > 0 && (distractors.length < 2 || shuffledOther.length === 0)) {
      distractors.push(shuffledSimilar.shift()!)
    }
    else if (shuffledOther.length > 0) {
      distractors.push(shuffledOther.shift()!)
    }
  }

  // 构建选项
  const allOptions: Option[] = [
    {
      char: correctChar._id,
      emoji: correctChar.teaching?.emoji_fallback || '❓',
      isCorrect: true,
    },
    ...distractors.map(c => ({
      char: c._id,
      emoji: c.teaching?.emoji_fallback || '❓',
      isCorrect: false,
    })),
  ]

  // 打乱选项顺序
  options.value = allOptions.sort(() => Math.random() - 0.5)
}

function selectOption(index: number) {
  if (showResult.value)
    return

  selectedIndex.value = index
  isCorrect.value = options.value[index].isCorrect
  showResult.value = true

  // 答错时播放正确答案的发音，帮助记忆
  if (!isCorrect.value) {
    setTimeout(() => {
      speakText(props.char._id, props.char.pinyin)
    }, 600)
  }
}

function playAudio() {
  if (isPlaying.value)
    return
  isPlaying.value = true
  speakText(props.char._id, props.char.pinyin, {
    onEnd: () => { isPlaying.value = false },
    onError: () => { isPlaying.value = false },
  })
}

function handlePrev() {
  emit('prev')
}

function handleNext() {
  emit('next', isCorrect.value, quizType.value)
}

onMounted(() => {
  initQuiz()
})

// 当字符变化时重新初始化
watch(() => props.char._id, () => {
  initQuiz()
})
</script>

<style lang="scss" scoped>
.quiz-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  color: #4a3728;
}

.options-panel {
  margin-top: 24rpx;
}
</style>
