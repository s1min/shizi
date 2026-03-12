<template>
  <div class="speak-practice">
    <!-- 汉字展示 -->
    <div class="char-section">
      <div class="char-main">
        {{ char._id }}
      </div>
      <div v-if="answered" class="char-pinyin">
        {{ char.pinyin }}
      </div>
    </div>

    <!-- 示范播放 -->
    <div class="demo-section">
      <div class="demo-hint">
        {{ demoPlayed ? '选择正确的读音' : '点击听发音' }}
      </div>
      <button class="btn-play" :class="{ playing: isPlaying }" @click="playDemo">
        <text class="play-icon">{{ isPlaying ? '🔊' : '🔈' }}</text>
      </button>
    </div>

    <!-- 读音选项 -->
    <div v-if="demoPlayed" class="options-section">
      <button
        v-for="(opt, idx) in options"
        :key="idx"
        class="option-btn"
        :class="{
          selected: selectedIndex === idx && !answered,
          correct: answered && opt.isCorrect,
          wrong: answered && selectedIndex === idx && !opt.isCorrect,
        }"
        :disabled="answered"
        @click="selectOption(idx)"
      >
        <text class="option-pinyin">{{ opt.pinyin }}</text>
        <text class="option-play" @click.stop="playOption(idx)">🔈</text>
      </button>
    </div>

    <!-- 结果反馈 -->
    <div v-if="answered" class="feedback-bar" :class="isCorrect ? 'correct' : 'wrong'">
      <text class="feedback-icon">{{ isCorrect ? '✓' : '✕' }}</text>
      <text class="feedback-text">{{ isCorrect ? '选对了！' : `正确读音：${char.pinyin}` }}</text>
    </div>

    <!-- 下一步按钮 -->
    <button
      v-if="canProceed"
      class="btn-continue"
      @click="handleNext"
    >
      继续下一步
    </button>

    <!-- 跳过按钮 -->
    <div v-if="!canProceed && !answered" class="skip-link" @click="handleSkip">
      跳过此步骤
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Character } from '@/types/character'
import { onMounted, ref, watch } from 'vue'
import { speakText } from '@/utils/tts'

const props = defineProps<{
  char: Character
  allChars?: Character[]
}>()

const emit = defineEmits<{
  next: []
}>()

const isPlaying = ref(false)
const demoPlayed = ref(false)
const selectedIndex = ref(-1)
const answered = ref(false)
const isCorrect = ref(false)
const canProceed = ref(false)

interface PinyinOption {
  pinyin: string
  isCorrect: boolean
}

const options = ref<PinyinOption[]>([])

function generateOptions() {
  const correctPinyin = props.char.pinyin
  const distractors: string[] = []

  if (props.allChars?.length) {
    const candidates = props.allChars
      .filter(c => c.pinyin !== correctPinyin && c._id !== props.char._id)
      .map(c => c.pinyin)
    // 去重
    const unique = [...new Set(candidates)]
    // 随机选 2 个
    for (let i = unique.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[unique[i], unique[j]] = [unique[j], unique[i]]
    }
    distractors.push(...unique.slice(0, 2))
  }

  // 如果干扰项不够，生成简单变体
  while (distractors.length < 2) {
    const tones = ['ā', 'á', 'ǎ', 'à', 'ē', 'é', 'ě', 'è', 'ī', 'í', 'ǐ', 'ì', 'ō', 'ó', 'ǒ', 'ò', 'ū', 'ú', 'ǔ', 'ù']
    const fallback = tones[Math.floor(Math.random() * tones.length)]
    if (fallback !== correctPinyin && !distractors.includes(fallback)) {
      distractors.push(fallback)
    }
  }

  const all: PinyinOption[] = [
    { pinyin: correctPinyin, isCorrect: true },
    { pinyin: distractors[0], isCorrect: false },
    { pinyin: distractors[1], isCorrect: false },
  ]

  // 随机排序
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[all[i], all[j]] = [all[j], all[i]]
  }

  options.value = all
}

function playDemo() {
  if (isPlaying.value)
    return
  isPlaying.value = true

  speakText(props.char._id, props.char.pinyin, {
    onEnd: () => {
      isPlaying.value = false
      demoPlayed.value = true
    },
    onError: () => {
      setTimeout(() => {
        isPlaying.value = false
        demoPlayed.value = true
      }, 800)
    },
  })
}

function playOption(idx: number) {
  const opt = options.value[idx]
  // 播放该选项的拼音读音
  speakText('', opt.pinyin, {
    onEnd: () => {},
    onError: () => {},
  })
}

function selectOption(idx: number) {
  if (answered.value)
    return
  selectedIndex.value = idx
  answered.value = true

  const opt = options.value[idx]
  isCorrect.value = opt.isCorrect

  if (opt.isCorrect) {
    canProceed.value = true
  }
  else {
    // 答错：播放正确读音，1.5 秒后允许继续
    setTimeout(() => {
      speakText(props.char._id, props.char.pinyin, {
        onEnd: () => {},
        onError: () => {},
      })
      canProceed.value = true
    }, 1000)
  }
}

function handleNext() {
  emit('next')
}

function handleSkip() {
  emit('next')
}

function resetState() {
  isPlaying.value = false
  demoPlayed.value = false
  selectedIndex.value = -1
  answered.value = false
  isCorrect.value = false
  canProceed.value = false
  generateOptions()
}

// 切换汉字时重置状态
watch(() => props.char._id, () => {
  resetState()
})

onMounted(() => {
  generateOptions()
})
</script>

<style lang="scss" scoped>
.speak-practice {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx;
}

.char-section {
  text-align: center;
  margin-bottom: 40rpx;
}

.char-main {
  font-size: 200rpx;
  font-weight: bold;
  font-family: 'KaiTi', 'STKaiti', serif;
  color: #4a3728;
  line-height: 1;
}

.char-pinyin {
  font-size: 48rpx;
  color: #5dade2;
  margin-top: 16rpx;
  font-weight: bold;
}

.demo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48rpx;
}

.demo-hint {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 24rpx;
}

.btn-play {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #5dade2, #4a9bd9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(93, 173, 226, 0.4);
  transition: transform 0.2s;

  &.playing {
    transform: scale(1.1);
    animation: pulse 0.5s infinite alternate;
  }
}

.play-icon {
  font-size: 48rpx;
}

@keyframes pulse {
  from {
    transform: scale(1.1);
  }
  to {
    transform: scale(1.2);
  }
}

/* 读音选项 */
.options-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-bottom: 40rpx;
  animation: fade-in 0.3s ease;
}

.option-btn {
  width: 100%;
  height: 96rpx;
  background: #fff;
  border: 4rpx solid #e0e0e0;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  font-size: 36rpx;
  transition: all 0.2s;

  &.selected {
    border-color: #f5a623;
    background: #fff8f0;
  }

  &.correct {
    border-color: #82c785;
    background: #e8f5e9;
  }

  &.wrong {
    border-color: #ff6b6b;
    background: #ffebee;
  }
}

.option-pinyin {
  font-size: 36rpx;
  font-weight: bold;
  color: #4a3728;
}

.option-play {
  font-size: 32rpx;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 反馈条 */
.feedback-bar {
  width: 100%;
  padding: 20rpx 32rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;

  &.correct {
    background: #e8f5e9;
    border: 2rpx solid #82c785;
  }

  &.wrong {
    background: #ffebee;
    border: 2rpx solid #ff6b6b;
  }
}

.feedback-icon {
  font-size: 36rpx;
  font-weight: bold;
}

.feedback-bar.correct .feedback-icon {
  color: #82c785;
}
.feedback-bar.wrong .feedback-icon {
  color: #ff6b6b;
}

.feedback-text {
  font-size: 28rpx;
  color: #4a3728;
  font-weight: bold;
}

.btn-continue {
  margin-top: auto;
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #82c785, #6ab06d);
  border: none;
  border-radius: 48rpx;
  font-size: 34rpx;
  font-weight: bold;
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(130, 199, 133, 0.4);
}

.skip-link {
  margin-top: auto;
  font-size: 28rpx;
  color: #999;
  padding: 20rpx;
}
</style>
