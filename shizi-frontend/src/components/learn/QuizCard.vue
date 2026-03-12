<template>
  <div class="quiz-card">
    <!-- 题目类型提示 -->
    <div class="quiz-type">
      {{ quizTypeLabel }}
    </div>

    <!-- 题目区域 -->
    <div class="question-area">
      <!-- 题型A: 看字选图 -->
      <template v-if="quizType === 'char-to-image'">
        <div class="question-char">
          {{ char._id }}
        </div>
        <div class="question-hint">
          选择正确的图片
        </div>
      </template>

      <!-- 题型B: 看图选字 -->
      <template v-else-if="quizType === 'image-to-char'">
        <div class="question-image">
          {{ char.teaching?.emoji_fallback || '❓' }}
        </div>
        <div class="question-hint">
          选择正确的汉字
        </div>
      </template>

      <!-- 题型C: 听音选字 -->
      <template v-else-if="quizType === 'audio-to-char'">
        <button class="btn-audio" @click="playAudio">
          <text class="audio-icon">{{ isPlaying ? '🔊' : '🔈' }}</text>
          <text>{{ isPlaying ? '播放中...' : '再听一遍' }}</text>
        </button>
        <div class="question-hint">
          听发音，选汉字
        </div>
      </template>

      <!-- 题型D: 拼音选字 -->
      <template v-else-if="quizType === 'pinyin-to-char'">
        <div class="question-pinyin">
          {{ char.pinyin }}
        </div>
        <div class="question-hint">
          选择正确的汉字
        </div>
      </template>
    </div>

    <!-- 选项区域 -->
    <div class="options-area">
      <div
        v-for="(option, index) in options"
        :key="index"
        class="option-item"
        :class="{
          selected: selectedIndex === index,
          correct: showResult && option.isCorrect,
          wrong: showResult && selectedIndex === index && !option.isCorrect,
        }"
        @click="selectOption(index)"
      >
        <!-- 图片选项 -->
        <template v-if="quizType === 'char-to-image'">
          <div class="option-image">
            {{ option.emoji }}
          </div>
        </template>

        <!-- 汉字选项 -->
        <template v-else>
          <div class="option-char">
            {{ option.char }}
          </div>
        </template>
      </div>
    </div>

    <!-- 结果反馈（底部横条，不遮挡选项） -->
    <div v-if="showResult" class="result-bar" :class="isCorrect ? 'correct' : 'wrong'">
      <div class="result-left">
        <text class="result-icon">{{ isCorrect ? '🎉' : '❌' }}</text>
        <text class="result-text">{{ isCorrect ? '答对了！' : `正确答案是「${char._id}」` }}</text>
      </div>
      <button class="btn-next" @click="handleNext">
        继续
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
  align-items: center;
  padding: 40rpx;
  padding-bottom: 200rpx;
}

.quiz-type {
  font-size: 24rpx;
  color: #999;
  background: #f0f0f0;
  padding: 8rpx 24rpx;
  border-radius: 20rpx;
  margin-bottom: 40rpx;
}

.question-area {
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

.question-image {
  font-size: 140rpx;
  margin-bottom: 20rpx;
}

.question-pinyin {
  font-size: 64rpx;
  color: #333;
  margin-bottom: 20rpx;
}

.question-hint {
  font-size: 28rpx;
  color: #666;
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

.options-area {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  width: 100%;
  margin-bottom: 40rpx;
}

.option-item {
  background: #fff;
  border: 4rpx solid #e0e0e0;
  border-radius: 24rpx;
  padding: 32rpx;
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

.option-char {
  font-size: 80rpx;
  font-family: 'KaiTi', 'STKaiti', serif;
  font-weight: bold;
  color: #333;
}

.option-image {
  font-size: 72rpx;
}

/* 底部结果横条 */
.result-bar {
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

.result-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.result-icon {
  font-size: 48rpx;
}

.result-text {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.btn-next {
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
</style>
