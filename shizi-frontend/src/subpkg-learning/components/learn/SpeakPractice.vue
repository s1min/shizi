<template>
  <div class="speak-practice">
    <div class="sound-stage">
      <div class="char-panel" :class="{ answered }">
        <div class="char-glow" />
        <div class="char-main">
          {{ char._id }}
        </div>
        <button class="sound-entry" :class="{ playing: isPlaying }" @click="playDemo">
          <wd-icon name="sound" size="26px" />
        </button>
      </div>
    </div>

    <div class="answer-panel">
      <div class="answer-title">
        选一选
      </div>
      <div class="answer-grid">
        <div
          v-for="(opt, idx) in options"
          :key="idx"
          class="option-card"
          :class="{
            selected: selectedIndex === idx && !answered,
            correct: answered && opt.isCorrect,
            wrong: answered && selectedIndex === idx && !opt.isCorrect,
            disabled: answered,
          }"
          @click="selectOption(idx)"
        >
          <button class="option-sound" @click.stop="playOption(opt.pinyin)">
            <wd-icon name="sound" size="22px" />
          </button>
          <div class="option-main">
            {{ opt.pinyin }}
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="answered"
      class="feedback-bar"
      :class="isCorrect ? 'correct' : 'wrong'"
    >
      <text class="feedback-icon">{{ isCorrect ? '✓' : '✕' }}</text>
      <div class="feedback-content">
        <text class="feedback-title">{{ isCorrect ? '答对啦' : '再听一次' }}</text>
        <text class="feedback-text">{{ isCorrect ? char.pinyin : `正确读音：${char.pinyin}` }}</text>
      </div>
    </div>

    <div class="step-actions" :class="{ ready: canProceed }">
      <button class="btn-secondary" @click="handlePrev">
        上一步
      </button>
      <button
        class="btn-continue"
        :class="{ disabled: !canProceed }"
        :disabled="!canProceed"
        @click="handleNext"
      >
        下一步
      </button>
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
  prev: []
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
    const unique = Array.from(new Set(candidates))
    for (let i = unique.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[unique[i], unique[j]] = [unique[j], unique[i]]
    }
    distractors.push(...unique.slice(0, 2))
  }

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

function autoPlayDemo() {
  if (isPlaying.value)
    return
  playDemo()
}

function playOption(pinyin: string) {
  speakText('', pinyin, {
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
  canProceed.value = true

  if (!opt.isCorrect) {
    setTimeout(() => {
      speakText(props.char._id, props.char.pinyin, {
        onEnd: () => {},
        onError: () => {},
      })
    }, 700)
  }
}

function handlePrev() {
  emit('prev')
}

function handleNext() {
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
  setTimeout(() => {
    autoPlayDemo()
  }, 160)
}

watch(() => props.char._id, () => {
  resetState()
})

onMounted(() => {
  generateOptions()
  setTimeout(() => {
    autoPlayDemo()
  }, 160)
})
</script>

<style lang="scss" scoped>
.speak-practice {
  --cream: #fffaf1;
  --cream-deep: #fff1db;
  --gold: #f5a623;
  --gold-deep: #e28d12;
  --ink: #4a3728;
  --brown-soft: #8f7558;
  --blue: #5dade2;
  --green: #82c785;
  --red: #ff8a80;

  flex: 1;
  display: flex;
  flex-direction: column;
  color: var(--ink);
}

.sound-stage {
  margin-bottom: 16rpx;
}

.char-panel {
  position: relative;
  padding: 32rpx 0 32rpx;
  border-radius: 32rpx;
  text-align: center;
}

.char-glow {
  position: absolute;
  top: -40rpx;
  left: 50%;
  width: 224rpx;
  height: 224rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 222, 148, 0.34) 0%, rgba(255, 222, 148, 0) 72%);
  transform: translateX(-50%);
  pointer-events: none;
}

.char-main {
  position: relative;
  font-size: 204rpx;
  line-height: 1;
  font-weight: 700;
  font-family: 'KaiTi', 'STKaiti', serif;
  color: #4c3624;
  text-shadow: 0 8rpx 24rpx rgba(226, 161, 38, 0.14);
}

.sound-entry {
  position: relative;
  margin: 8rpx auto 0;
  width: 88rpx;
  height: 88rpx;
  border: 4rpx solid rgba(247, 213, 153, 0.46);
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #fffaf1 0%, #ffefcf 100%);
  color: #d08a16;
  box-shadow:
    0 8rpx 16rpx rgba(232, 177, 68, 0.14),
    inset 0 4rpx 0 rgba(255, 255, 255, 0.72);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &::after {
    border: none;
  }

  &:active {
    transform: scale(0.96);
  }

  &.playing {
    box-shadow:
      0 8rpx 16rpx rgba(232, 177, 68, 0.18),
      0 0 0 8rpx rgba(255, 224, 163, 0.16),
      inset 0 4rpx 0 rgba(255, 255, 255, 0.72);
  }
}

.answer-panel {
  margin-top: 0;
  padding: 24rpx 24rpx 24rpx;
  border-radius: 24rpx;
  background: linear-gradient(180deg, rgba(255, 252, 246, 0.94) 0%, rgba(255, 248, 239, 0.94) 100%);
  box-shadow:
    0 8rpx 16rpx rgba(229, 180, 83, 0.04),
    inset 0 0 0 4rpx rgba(244, 226, 193, 0.5);
}

.answer-title {
  margin-bottom: 16rpx;
  padding-left: 8rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #9a8368;
  letter-spacing: 1rpx;
}

.answer-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24rpx;
}

.option-card {
  height: 120rpx;
  padding: 0 24rpx;
  border: none;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  text-align: left;
  background: linear-gradient(180deg, #fffefd 0%, #fff8ef 100%);
  box-shadow:
    0 4rpx 12rpx rgba(223, 185, 108, 0.05),
    inset 0 0 0 4rpx rgba(240, 222, 190, 0.72);
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;

  &:active {
    transform: scale(0.985);
  }

  &.disabled {
    opacity: 1;
  }

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
  }

  &.wrong {
    background: linear-gradient(180deg, #fff3f1 0%, #ffe2df 100%);
    box-shadow:
      0 8rpx 16rpx rgba(255, 138, 128, 0.1),
      inset 0 0 0 4rpx rgba(255, 138, 128, 0.26);
  }
}

.option-sound {
  width: 80rpx;
  height: 80rpx;
  border: 4rpx solid rgba(247, 213, 153, 0.38);
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #fffaf1 0%, #ffefcf 100%);
  color: #d08a16;
  flex-shrink: 0;
  box-shadow:
    0 4rpx 8rpx rgba(232, 177, 68, 0.08),
    inset 0 4rpx 0 rgba(255, 255, 255, 0.72);

  &::after {
    border: none;
  }

  &:active {
    transform: scale(0.96);
  }
}

.option-main {
  flex: 1;
  min-width: 0;
  font-size: 40rpx;
  font-weight: 700;
  color: #4a3728;
  letter-spacing: 1rpx;
  text-align: center;
}

.feedback-bar {
  margin-top: 16rpx;
  padding: 16rpx 24rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;

  &.correct {
    background: linear-gradient(180deg, #f2faec 0%, #e8f5e1 100%);
    box-shadow: inset 0 0 0 4rpx rgba(130, 199, 133, 0.28);
  }

  &.wrong {
    background: linear-gradient(180deg, #fff4f1 0%, #ffe8e3 100%);
    box-shadow: inset 0 0 0 4rpx rgba(255, 138, 128, 0.24);
  }
}

.feedback-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.feedback-bar.correct .feedback-icon {
  background: var(--green);
}

.feedback-bar.wrong .feedback-icon {
  background: var(--red);
}

.feedback-content {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.feedback-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #4a3728;
}

.feedback-text {
  font-size: 24rpx;
  color: #8a735c;
}

.step-actions {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24rpx;
  margin-top: auto;
  padding-top: 32rpx;
}

.step-actions.ready {
  .btn-secondary {
    opacity: 1;
  }
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

  &::after {
    border: none;
  }

  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 8rpx 18rpx rgba(226, 188, 112, 0.14);
  }
}

.btn-continue {
  width: 100%;
  height: 104rpx;
  background: linear-gradient(135deg, #f5a623 0%, #eb9a1a 52%, #e28412 100%);
  border: none;
  border-radius: 56rpx;
  font-size: 38rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
  color: #fff;
  box-shadow: 0 14rpx 30rpx rgba(230, 145, 24, 0.36);

  &.disabled {
    opacity: 0.45;
    box-shadow: none;
  }

  &::after {
    border: none;
  }

  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 8rpx 18rpx rgba(230, 145, 24, 0.26);
  }
}
</style>
