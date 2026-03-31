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
            🔊
          </button>
          <span class="pinyin-text">{{ char.pinyin }}</span>
        </div>
      </div>
    </div>

    <!-- 字源说明 -->
    <div class="origin-desc" :class="{ 'fade-in': showDesc }">
      <div class="desc-title">
        <span class="char-type-tag">{{ charTypeLabel }}</span>
        <span class="desc-title-text">{{ getDescTitle() }}</span>
      </div>
      <div class="desc-divider" />
      <div class="desc-content">
        {{ getDescContent() }}
      </div>
    </div>

    <!-- 组词展示 -->
    <div class="words-section" :class="{ 'fade-in': showWords }">
      <div class="words-title">
        常用组词
      </div>
      <div v-if="displayWords.length" class="words-list">
        <div
          v-for="word in displayWords"
          :key="word"
          class="word-item"
        >
          {{ word }}
        </div>
      </div>
      <div v-else class="word-item-empty">
        暂无组词，先记住这个字形。
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
const showDesc = ref(false)
const showWords = ref(false)
const showButton = ref(false)
const displayWords = computed(() =>
  (props.char.example_words ?? []).filter(Boolean).slice(0, 4),
)
const charTypeLabel = computed(() => props.char.char_type || '识字')

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
    return '通过图像、读音和组词一起记住这个字。'
  if (t.animation_type === 'origin')
    return t.origin_desc || '这个字来源于生活中的常见形象。'
  if (t.animation_type === 'decompose') {
    const parts = t.decompose_parts?.join(' + ') || ''
    return parts ? `${parts}\n${t.decompose_desc || ''}` : t.decompose_desc || ''
  }
  return t.scene_desc || '把这个字放进熟悉的场景里，更容易记住。'
}

function playAnimation() {
  showAnimation.value = false
  showChar.value = false
  showDesc.value = false
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
    showDesc.value = true
  }, 1200)
  setTimeout(() => {
    showWords.value = true
  }, 1700)
  setTimeout(() => {
    showButton.value = true
  }, 2200)
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
  width: 100%;
  padding: 12rpx 8rpx calc(env(safe-area-inset-bottom) + 12rpx);
}

.origin-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 34rpx;
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
  margin-top: 42rpx;

  &.animate-in {
    opacity: 1;
    transform: translateY(0);
  }
}

.char-main {
  font-size: 210rpx;
  font-weight: bold;
  font-family: 'KaiTi', 'STKaiti', serif;
  color: #2f2a24;
  line-height: 1;
  text-shadow: 0 6rpx 12rpx rgba(47, 42, 36, 0.08);
}

.char-pinyin {
  margin-top: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
}

.speaker-button {
  width: 58rpx;
  height: 58rpx;
  border: 2rpx solid rgba(188, 162, 124, 0.42);
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.92);
  color: #8a6a41;
  font-size: 30rpx;
  line-height: 54rpx;
  text-align: center;
  transition: all 0.18s ease;

  &::after {
    border: none;
  }

  &:active {
    transform: scale(0.95);
    background: rgba(245, 166, 35, 0.14);
  }
}

.pinyin-text {
  font-size: 62rpx;
  font-weight: 600;
  color: #625344;
  letter-spacing: 1rpx;
}

.origin-desc {
  background: linear-gradient(180deg, #ffffff 0%, #fffef8 100%);
  border: 2rpx solid rgba(238, 209, 160, 0.42);
  border-radius: 28rpx;
  padding: 30rpx 30rpx 28rpx;
  width: 100%;
  box-shadow: 0 10rpx 28rpx rgba(187, 132, 44, 0.08);
  margin-bottom: 32rpx;
  opacity: 0;
  transform: translateY(18rpx);
  transition: all 0.4s ease-out;

  &.fade-in {
    opacity: 1;
    transform: translateY(0);
  }
}

.desc-title {
  display: flex;
  align-items: center;
  gap: 14rpx;
  font-size: 32rpx;
  margin-bottom: 14rpx;
}

.desc-title-text {
  font-weight: 700;
  color: #43352b;
}

.char-type-tag {
  background: linear-gradient(135deg, #f5a623, #e69318);
  color: #fff;
  font-size: 22rpx;
  font-weight: 600;
  padding: 6rpx 18rpx;
  border-radius: 999rpx;
}

.desc-divider {
  width: 100%;
  height: 2rpx;
  background: linear-gradient(90deg, rgba(238, 209, 160, 0.56), rgba(238, 209, 160, 0));
  margin-bottom: 14rpx;
}

.desc-content {
  font-size: 30rpx;
  color: #6f6050;
  line-height: 1.7;
  white-space: pre-wrap;
}

.words-section {
  width: 100%;
  margin-bottom: 30rpx;
  opacity: 0;
  transform: translateY(16rpx);
  transition: all 0.4s ease-out;

  &.fade-in {
    opacity: 1;
    transform: translateY(0);
  }
}

.words-title {
  font-size: 28rpx;
  color: #9f8a6f;
  margin-bottom: 18rpx;
  padding-left: 4rpx;
}

.words-list {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.word-item {
  background: rgba(255, 255, 255, 0.94);
  border: 2rpx solid rgba(236, 221, 194, 0.85);
  padding: 14rpx 30rpx;
  border-radius: 999rpx;
  font-size: 34rpx;
  color: #3f352d;
  box-shadow: 0 5rpx 14rpx rgba(148, 117, 73, 0.07);
}

.word-item-empty {
  background: rgba(255, 255, 255, 0.85);
  border: 2rpx dashed rgba(202, 185, 156, 0.6);
  border-radius: 24rpx;
  font-size: 26rpx;
  color: #9d8a71;
  line-height: 1.5;
  padding: 20rpx 24rpx;
}

.btn-continue {
  margin-top: auto;
  width: 100%;
  height: 106rpx;
  background: linear-gradient(135deg, #f5a623 0%, #eb9a1a 52%, #e28412 100%);
  border: none;
  border-radius: 56rpx;
  font-size: 42rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
  color: #fff;
  box-shadow: 0 14rpx 30rpx rgba(230, 145, 24, 0.36);
  opacity: 0;
  transform: translateY(16rpx);
  transition: all 0.4s ease-out;

  &::after {
    border: none;
  }

  &.show {
    opacity: 1;
    transform: translateY(0);
  }

  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 8rpx 18rpx rgba(230, 145, 24, 0.26);
  }
}
</style>
