<template>
  <div class="quiz-card">
    <!-- 题目类型提示 -->
    <div class="quiz-type">
      {{ quizTypeLabel }}
    </div>

    <div class="quiz-body">
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
    </div>

    <!-- 底部切换按钮 -->
    <div class="step-actions">
      <button class="btn-secondary" @click="handlePrev">
        上一步
      </button>
      <button class="btn-next" :class="{ disabled: !showResult }" :disabled="!showResult" @click="handleNext">
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
  padding: 0;
  color: #4a3728;
}

.quiz-type {
  align-self: center;
  font-size: 32rpx;
  font-weight: 700;
  color: #9a8368;
  background: linear-gradient(180deg, #fffaf1 0%, #fff1db 100%);
  padding: 8rpx 24rpx;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
}

.quiz-body {
  // display: flex;
  // flex-direction: column;
  // gap: 0;
  // padding: 24rpx;
  // border-radius: 24rpx;
  // background: linear-gradient(180deg, rgba(255, 252, 246, 0.96) 0%, rgba(255, 248, 239, 0.94) 100%);
  // box-shadow:
  //   0 8rpx 16rpx rgba(229, 180, 83, 0.04),
  //   inset 0 0 0 4rpx rgba(244, 226, 193, 0.5);
}

.question-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32rpx;
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

.options-area {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.option-item {
  min-height: 144rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #fffefd 0%, #fff8ef 100%);
  transition: all 0.3s;
  box-shadow:
    0 4rpx 12rpx rgba(223, 185, 108, 0.05),
    inset 0 0 0 4rpx rgba(240, 222, 190, 0.72);

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

.option-char {
  font-size: 100rpx;
  font-family: 'KaiTi', 'STKaiti', serif;
  font-weight: bold;
  color: #333;
}

.option-image {
  font-size: 72rpx;
}

/* 底部结果导航 */
.step-actions {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24rpx;
  margin-top: auto;
  padding-top: 32rpx;
}

.btn-secondary {
  width: 100%;
  height: 104rpx;
  background: linear-gradient(180deg, #fffaf1 0%, #fff1db 100%);
  border: 2rpx solid rgba(232, 177, 68, 0.2);
  border-radius: 56rpx;
  font-size: 38rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
  color: #c5871a;
  box-shadow: 0 12rpx 26rpx rgba(226, 188, 112, 0.18);
}

.btn-secondary::after {
  border: none;
}

.btn-secondary:active {
  transform: translateY(2rpx);
  box-shadow: 0 8rpx 18rpx rgba(226, 188, 112, 0.14);
}

.btn-next {
  width: 100%;
  height: 104rpx;
  border-radius: 56rpx;
  border: none;
  font-size: 38rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
  color: #fff;
  background: linear-gradient(135deg, #f5a623 0%, #eb9a1a 52%, #e28412 100%);
  box-shadow: 0 14rpx 30rpx rgba(230, 145, 24, 0.36);
}

.btn-next.disabled {
  opacity: 0.45;
  color: rgba(255, 255, 255, 0.9);
  background: linear-gradient(135deg, #f4d69f 0%, #efcb89 52%, #e7bf72 100%);
  box-shadow: none;
}

.btn-next::after {
  border: none;
}

.btn-next:active {
  transform: translateY(2rpx);
  box-shadow: 0 8rpx 18rpx rgba(230, 145, 24, 0.26);
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
