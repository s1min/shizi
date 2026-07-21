<template>
  <div class="char-card">
    <!-- 字源展示区 -->
    <div class="origin-display">
      <!-- Emoji/图片展示 -->
      <div class="origin-visual" :class="{ 'animate-in': showAnimation }">
        <div class="emoji-icon">
          {{ char.teaching?.emoji_fallback || '📝' }}
        </div>
      </div>

      <!-- 汉字展示 -->
      <div class="char-display" :class="{ 'animate-in': showChar }">
        <div class="char-main">
          {{ char._id }}
        </div>
        <div class="char-pinyin">
          <wd-icon class="speaker-icon" name="sound" size="20px" @click.stop="speakChar" />
          <span>{{ char.pinyin }}</span>
        </div>
      </div>
    </div>

    <!-- 字源说明 -->
    <div class="origin-desc" :class="{ 'fade-in': showDesc }">
      <div class="desc-title">
        <span class="char-type-tag">{{ char.char_type }}</span>
        {{ getDescTitle() }}
      </div>
      <div class="desc-content">
        {{ getDescContent() }}
      </div>
    </div>

    <!-- 组词展示 -->
    <div class="words-section" :class="{ 'fade-in': showWords }">
      <div class="words-title">
        常用组词
      </div>
      <div class="words-list">
        <div
          v-for="word in char.example_words?.slice(0, 3)"
          :key="word"
          class="word-item"
        >
          {{ word }}
        </div>
      </div>
    </div>

    <!-- 下一步按钮 -->
    <button class="btn-continue" :class="{ show: showButton }" @click="handleNext">
      我记住了，继续
    </button>
  </div>
</template>

<script lang="ts" setup>
import type { Character } from '@/types/character'
import { onMounted, ref, watch } from 'vue'
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
const showDesc = ref(false)
const showWords = ref(false)
const showButton = ref(false)

function getDescTitle() {
  const type = props.char.teaching?.animation_type
  if (type === 'origin')
    return '字源演变'
  if (type === 'decompose')
    return '字形拆解'
  return '字义理解'
}

function getDescContent() {
  const t = props.char.teaching
  if (!t)
    return ''
  if (t.animation_type === 'origin')
    return t.origin_desc || ''
  if (t.animation_type === 'decompose') {
    const parts = t.decompose_parts?.join(' + ') || ''
    return parts ? `${parts}\n${t.decompose_desc}` : t.decompose_desc || ''
  }
  return t.scene_desc || ''
}

function playAnimation() {
  showAnimation.value = false
  showChar.value = false
  showDesc.value = false
  showWords.value = false
  showButton.value = false

  // 依次播放动画
  setTimeout(() => { showAnimation.value = true }, 100)
  setTimeout(() => { showChar.value = true }, 800)
  setTimeout(() => { showDesc.value = true }, 1500)
  setTimeout(() => { showWords.value = true }, 2200)
  setTimeout(() => { showButton.value = true }, 2800)
}

function handleNext() {
  emit('next')
}

// 播放汉字读音
function speakChar() {
  speakText(props.char._id, props.char.pinyin)
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
  align-items: center;
  padding: 40rpx;
}

.origin-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
}

.origin-visual {
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);

  &.animate-in {
    opacity: 1;
    transform: scale(1);
  }
}

.emoji-icon {
  font-size: 160rpx;
  margin-bottom: 40rpx;
}

.char-display {
  text-align: center;
  opacity: 0;
  transform: translateY(40rpx);
  transition: all 0.5s ease-out;

  &.animate-in {
    opacity: 1;
    transform: translateY(0);
  }
}

.char-main {
  font-size: 200rpx;
  font-weight: bold;
  font-family: 'KaiTi', 'STKaiti', serif;
  color: #333;
  line-height: 1;
}

.char-pinyin {
  font-size: 48rpx;
  color: #666;
  margin-top: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.speaker-icon {
  font-size: 40rpx;
  cursor: pointer;
  opacity: 0.8;
  transition: all 0.2s;

  &:active {
    transform: scale(0.9);
    opacity: 1;
  }
}

.origin-desc {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  width: 100%;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  margin-bottom: 40rpx;
  opacity: 0;
  transform: translateY(20rpx);
  transition: all 0.4s ease-out;

  &.fade-in {
    opacity: 1;
    transform: translateY(0);
  }
}

.desc-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.char-type-tag {
  background: linear-gradient(135deg, #f5a623, #e8941a);
  color: #fff;
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}

.desc-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  white-space: pre-wrap;
}

.words-section {
  width: 100%;
  opacity: 0;
  transform: translateY(20rpx);
  transition: all 0.4s ease-out;

  &.fade-in {
    opacity: 1;
    transform: translateY(0);
  }
}

.words-title {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.words-list {
  display: flex;
  gap: 20rpx;
  flex-wrap: wrap;
}

.word-item {
  background: #fff;
  padding: 16rpx 32rpx;
  border-radius: 32rpx;
  font-size: 32rpx;
  color: #333;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.btn-continue {
  margin-top: auto;
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #f5a623, #e8941a);
  border: none;
  border-radius: 48rpx;
  font-size: 34rpx;
  font-weight: bold;
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(245, 166, 35, 0.4);
  opacity: 0;
  transform: translateY(20rpx);
  transition: all 0.4s ease-out;

  &.show {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
