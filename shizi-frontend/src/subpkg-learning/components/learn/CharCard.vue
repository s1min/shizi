<template>
  <div class="char-card">
    <!-- 字源展示区 -->
    <div class="origin-display">
      <!-- Emoji/图片展示 -->
      <div class="origin-visual" :class="{ 'animate-in': showAnimation }">
        <div class="emoji-orb">
          <div class="emoji-icon">
            {{ char.teaching?.emoji_fallback || '📝' }}
          </div>
        </div>
      </div>

      <!-- 汉字展示 -->
      <div class="char-display" :class="{ 'animate-in': showChar }">
        <div class="char-main">
          {{ char._id }}
        </div>
        <div class="char-pinyin">
          <button class="speaker-button" @click.stop="speakChar">
            <wd-icon name="sound" size="22px"></wd-icon>
          </button>
          <span class="pinyin-text">{{ char.pinyin }}</span>
        </div>
      </div>
    </div>

    <!-- 组词展示 -->
    <div class="words-section" :class="{ 'fade-in': showWords }">
      <div class="words-title">
        常用组词
      </div>
      <div v-if="displayWords.length" class="words-list">
        <button
          v-for="(word, index) in displayWords"
          :key="word"
          class="word-item"
          :style="getWordStyle(index)"
          @click="playWord(word)"
        >
          {{ word }}
        </button>
      </div>
      <div v-else class="word-item-empty">
        暂无组词，先记住这个字形。
      </div>
    </div>

    <!-- 下一步按钮 -->
    <div class="btn-continue-wrap" :class="{ show: showButton }">
      <button class="btn-continue" @click="handleNext">
        看好了，下一步
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Character } from '@/types/character'
import { computed, onMounted, ref, watch } from 'vue'
import { speakText } from '@/utils/tts'

const props = defineProps<{
  char: Character
}>()

const emit = defineEmits<{
  next: []
}>()

// 动画状态
const showAnimation = ref(false)
const showChar = ref(false)
const showWords = ref(false)
const showButton = ref(false)
const displayWords = computed(() =>
  (props.char.example_words ?? []).filter(Boolean).slice(0, 4),
)
const wordThemes = [
  { bg: 'linear-gradient(180deg, #f5fbff 0%, #e6f4ff 100%)', border: 'rgba(150, 199, 242, 0.72)', color: '#426b93' },
  { bg: 'linear-gradient(180deg, #f7fff2 0%, #e9f8dc 100%)', border: 'rgba(171, 214, 120, 0.72)', color: '#567a2c' },
  { bg: 'linear-gradient(180deg, #fff5fb 0%, #ffe5f3 100%)', border: 'rgba(239, 171, 207, 0.72)', color: '#9b4d7a' },
  { bg: 'linear-gradient(180deg, #fffaf0 0%, #fff1c9 100%)', border: 'rgba(241, 205, 123, 0.72)', color: '#8b6727' },
  { bg: 'linear-gradient(180deg, #f4fbfb 0%, #dff5f1 100%)', border: 'rgba(133, 214, 201, 0.72)', color: '#3f7f75' },
  { bg: 'linear-gradient(180deg, #f8f6ff 0%, #ece8ff 100%)', border: 'rgba(182, 170, 241, 0.72)', color: '#6556a6' },
  { bg: 'linear-gradient(180deg, #fff8f2 0%, #ffe9dc 100%)', border: 'rgba(244, 183, 149, 0.72)', color: '#9a6138' },
  { bg: 'linear-gradient(180deg, #fff7ef 0%, #ffefd8 100%)', border: 'rgba(242, 197, 119, 0.72)', color: '#8c5b2d' },
]

function getWordStyle(index: number) {
  const theme = wordThemes[index % wordThemes.length]
  return {
    background: theme.bg,
    borderColor: theme.border,
    color: theme.color,
  }
}

function playAnimation() {
  showAnimation.value = false
  showChar.value = false
  showWords.value = false
  showButton.value = false

  // 依次播放动画
  setTimeout(() => {
    showAnimation.value = true
  }, 100)
  setTimeout(() => {
    showChar.value = true
  }, 620)
  setTimeout(() => {
    showWords.value = true
  }, 1180)
  setTimeout(() => {
    showButton.value = true
  }, 1680)
}

function handleNext() {
  emit('next')
}

// 播放汉字读音
function speakChar() {
  speakText(props.char._id, props.char.pinyin)
}

function playWord(word: string) {
  speakText(word, word)
}

onMounted(() => {
  playAnimation()
})

// 当字符变化时重新播放动画
watch(() => props.char._id, () => {
  playAnimation()
})
</script>

<style lang="scss" scoped>
.char-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.origin-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 46rpx;
}

.origin-visual {
  opacity: 0;
  transform: scale(0.55);
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);

  &.animate-in {
    opacity: 1;
    transform: scale(1);
  }
}

.emoji-orb {
  width: 192rpx;
  height: 192rpx;
  border-radius: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 30% 25%, #ffd76f 0%, #f5be44 52%, #eda41c 100%);
  box-shadow:
    0 16rpx 34rpx rgba(245, 166, 35, 0.28),
    inset 0 2rpx 12rpx rgba(255, 255, 255, 0.44);
}

.emoji-icon {
  font-size: 108rpx;
  line-height: 1;
}

.char-display {
  text-align: center;
  opacity: 0;
  transform: translateY(36rpx);
  transition: all 0.5s ease-out;
  margin-top: 38rpx;

  &.animate-in {
    opacity: 1;
    transform: translateY(0);
  }
}

.char-main {
  padding: 16rpx;
  font-size: 260rpx;
  font-weight: bold;
  font-family: 'KaiTi', 'STKaiti', serif;
  color: #2f2a24;
  line-height: 1;
  text-shadow: 0 8rpx 16rpx rgba(47, 42, 36, 0.08);
}

.char-pinyin {
  margin-top: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.speaker-button {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  border: 2rpx solid rgba(247, 213, 153, 0.5);
  border-radius: 999rpx;
  background: linear-gradient(180deg, #fffaf1 0%, #ffefcf 100%);
  color: #d08a16;
  box-shadow:
    0 8rpx 16rpx rgba(232, 177, 68, 0.14),
    inset 0 2rpx 0 rgba(255, 255, 255, 0.72);
  transition: all 0.18s ease;

  &::after {
    border: none;
  }

  &:active {
    transform: scale(0.95);
    background: linear-gradient(180deg, #fff1d9 0%, #ffe8bf 100%);
    box-shadow: 0 4rpx 10rpx rgba(232, 177, 68, 0.12);
  }
}

.pinyin-text {
  font-size: 62rpx;
  font-weight: 600;
  color: #625344;
  letter-spacing: 1rpx;
}

.words-section {
  width: 100%;
  margin-bottom: 34rpx;
  opacity: 0;
  transform: translateY(16rpx);
  transition: all 0.4s ease-out;

  &.fade-in {
    opacity: 1;
    transform: translateY(0);
  }
}

.words-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #8c6a3d;
  margin-bottom: 20rpx;
  padding-left: 6rpx;
}

.words-list {
  display: flex;
  gap: 18rpx;
  flex-wrap: wrap;
}

.word-item {
  padding: 14rpx 28rpx;
  border-radius: 46rpx;
  border: 2rpx solid transparent;
  font-size: 30rpx;
  font-weight: 600;
  box-shadow:
    0 6rpx 12rpx rgba(214, 153, 41, 0.08),
    inset 0 2rpx 0 rgba(255, 255, 255, 0.6);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;

  &::after {
    border: none;
  }

  &:active {
    transform: scale(0.96);
    box-shadow: 0 3rpx 8rpx rgba(214, 153, 41, 0.08);
  }
}

.word-item-empty {
  background: linear-gradient(180deg, rgba(255, 250, 240, 0.96), rgba(255, 242, 214, 0.96));
  border: 2rpx dashed rgba(222, 182, 108, 0.7);
  border-radius: 28rpx;
  font-size: 28rpx;
  color: #8f724f;
  line-height: 1.6;
  padding: 24rpx 28rpx;
}

.btn-continue-wrap {
  margin-top: auto;
  width: 100%;
  display: flex;
  justify-content: center;
  opacity: 0;
  transform: translateY(16rpx);
  transition: all 0.4s ease-out;

  &.show {
    opacity: 1;
    transform: translateY(0);
  }
}

.btn-continue {
  width: 100%;
  max-width: 100%;
  height: 106rpx;
  background: linear-gradient(135deg, #f5a623 0%, #eb9a1a 52%, #e28412 100%);
  border: none;
  border-radius: 56rpx;
  font-size: 42rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
  color: #fff;
  box-shadow: 0 14rpx 30rpx rgba(230, 145, 24, 0.36);

  &::after {
    border: none;
  }

  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 8rpx 18rpx rgba(230, 145, 24, 0.26);
  }
}
</style>
