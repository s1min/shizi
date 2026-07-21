<template>
  <div class="review-container">
    <!-- 完成结算 -->
    <div v-if="finished" class="finish-screen">
      <div class="finish-icon">
        <wd-icon name="check-circle-filled" size="48px" />
      </div>
      <div class="finish-title">
        复习完成！
      </div>
      <div class="finish-stats">
        <div class="stat-item">
          <div class="stat-val">
            {{ totalCount }}
          </div>
          <div class="stat-label">
            复习字数
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-val know">
            {{ knowCount }}
          </div>
          <div class="stat-label">
            认识
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-val dont-know">
            {{ totalCount - knowCount }}
          </div>
          <div class="stat-label">
            不认识
          </div>
        </div>
      </div>
      <div class="finish-msg">
        {{ encourageText }}
      </div>
      <button class="btn-back" @click="goBack">
        返回首页
      </button>
    </div>

    <!-- 闪卡复习 -->
    <template v-else>
      <div class="progress-bar">
        <div class="progress-bg">
          <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
        </div>
        <div class="progress-text">
          {{ charIndex + 1 }}/{{ reviewChars.length }}
        </div>
        <div class="close-btn" @click="handleClose">
          <wd-icon name="close" size="20px" />
        </div>
      </div>

      <div v-if="currentChar" class="flashcard-area">
        <!-- 闪卡 -->
        <div class="flashcard" :class="{ flipped }" @click="flipCard">
          <!-- 正面：大字 -->
          <div class="card-front">
            <div class="card-emoji">
              {{ currentChar.teaching?.emoji_fallback }}
            </div>
            <div class="card-char">
              {{ currentChar._id }}
            </div>
            <div class="card-hint">
              点击翻转查看读音
            </div>
          </div>
          <!-- 背面：拼音 + 组词 -->
          <div class="card-back">
            <div class="card-char-back">
              {{ currentChar._id }}
            </div>
            <div class="card-pinyin">
              {{ currentChar.pinyin }}
            </div>
            <div v-if="currentChar.example_words?.length" class="card-words">
              <div class="words-label">
                组词
              </div>
              <div class="words-list">
                <span v-for="w in currentChar.example_words" :key="w" class="word-tag">{{ w }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部操作按钮 -->
        <div v-if="flipped" class="action-buttons">
          <button class="btn-action btn-dont-know" @click="handleDontKnow">
            不认识
          </button>
          <button class="btn-action btn-know" @click="handleKnow">
            认识
          </button>
        </div>
      </div>

      <!-- 无待复习 -->
      <div v-if="reviewChars.length === 0" class="empty-screen">
        <div class="empty-icon">
          ✅
        </div>
        <div class="empty-title">
          暂无待复习的字
        </div>
        <div class="empty-desc">
          学过的字会按记忆规律安排复习
        </div>
        <button class="btn-back" @click="goBack">
          返回首页
        </button>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import type { Character } from '@/types/character'
import { computed, onMounted, ref } from 'vue'
import { useLearnStore } from '@/store'
import { navigateBackOrTo } from '@/utils/navigation'

definePage({
  style: {
    navigationBarTitleText: '复习',
    navigationStyle: 'custom',
  },
})

const learnStore = useLearnStore()

const reviewChars = ref<Character[]>([])
const charIndex = ref(0)
const finished = ref(false)
const knowCount = ref(0)
const flipped = ref(false)

const currentChar = computed(() => reviewChars.value[charIndex.value])
const totalCount = computed(() => reviewChars.value.length)
const progressPercent = computed(() =>
  totalCount.value > 0 ? (charIndex.value / totalCount.value) * 100 : 0,
)

const encourageText = computed(() => {
  const ratio = totalCount.value > 0 ? knowCount.value / totalCount.value : 0
  if (ratio === 1)
    return '全部认识，记忆力超强！'
  if (ratio >= 0.8)
    return '表现不错，继续保持！'
  if (ratio >= 0.6)
    return '还不错，不认识的字明天再复习'
  return '别灰心，多复习几次就记住了'
})

function flipCard() {
  flipped.value = !flipped.value
}

function nextCard() {
  if (charIndex.value < reviewChars.value.length - 1) {
    flipped.value = false
    charIndex.value++
  }
  else {
    finished.value = true
    learnStore.syncToCloud()
  }
}

function handleKnow() {
  knowCount.value++
  learnStore.reviewChar(currentChar.value._id, true)
  nextCard()
}

function handleDontKnow() {
  learnStore.reviewChar(currentChar.value._id, false)
  nextCard()
}

function handleClose() {
  uni.showModal({
    title: '确定退出吗？',
    content: '已复习的进度已保存',
    success: (res) => {
      if (res.confirm) {
        goBack()
      }
    },
  })
}

function goBack() {
  navigateBackOrTo('/pages/home/index', true)
}

onMounted(() => {
  reviewChars.value = [...learnStore.todayReviewChars]
})
</script>

<style lang="scss" scoped>
.review-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #e8f4fd 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
}

.progress-bar {
  padding: 60rpx 32rpx 20rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: rgba(255, 255, 255, 0.9);
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
  background: linear-gradient(90deg, #5dade2, #4a9bd9);
  border-radius: 8rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 24rpx;
  color: #666;
  min-width: 60rpx;
  text-align: center;
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

/* 闪卡区域 */
.flashcard-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.flashcard {
  width: 580rpx;
  min-height: 640rpx;
  perspective: 1000px;
  cursor: pointer;
  margin-bottom: 60rpx;
}

.card-front,
.card-back {
  width: 100%;
  min-height: 640rpx;
  background: #fff;
  border-radius: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(93, 173, 226, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 40rpx;
  backface-visibility: hidden;
  transition: transform 0.5s ease;
}

.card-back {
  position: absolute;
  top: 0;
  left: 0;
  transform: rotateY(180deg);
}

.flashcard.flipped .card-front {
  transform: rotateY(180deg);
}

.flashcard.flipped .card-back {
  transform: rotateY(0deg);
}

.card-emoji {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.card-char {
  font-size: 240rpx;
  font-weight: bold;
  font-family: 'KaiTi', 'STKaiti', serif;
  color: #4a3728;
  line-height: 1.2;
}

.card-hint {
  font-size: 26rpx;
  color: #999;
  margin-top: 40rpx;
}

.card-char-back {
  font-size: 160rpx;
  font-weight: bold;
  font-family: 'KaiTi', 'STKaiti', serif;
  color: #4a3728;
  line-height: 1.2;
}

.card-pinyin {
  font-size: 48rpx;
  color: #5dade2;
  margin: 16rpx 0 40rpx;
  font-weight: bold;
}

.card-words {
  width: 100%;
}

.words-label {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 16rpx;
  text-align: center;
}

.words-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16rpx;
}

.word-tag {
  background: #fff8f0;
  border: 2rpx solid #f5a623;
  padding: 8rpx 24rpx;
  border-radius: 24rpx;
  font-size: 28rpx;
  color: #4a3728;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 32rpx;
  width: 100%;
  max-width: 580rpx;
  animation: fade-in 0.3s ease;
}

.btn-action {
  flex: 1;
  height: 96rpx;
  border: none;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}

.btn-dont-know {
  background: linear-gradient(135deg, #f5a623, #e8941a);
  box-shadow: 0 8rpx 24rpx rgba(245, 166, 35, 0.4);
}

.btn-know {
  background: linear-gradient(135deg, #82c785, #6ab06d);
  box-shadow: 0 8rpx 24rpx rgba(130, 199, 133, 0.4);
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

/* 完成结算 */
.finish-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx;
}

.finish-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.finish-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #4a3728;
  margin-bottom: 60rpx;
}

.finish-stats {
  display: flex;
  gap: 60rpx;
  margin-bottom: 40rpx;
}

.stat-item {
  text-align: center;
}

.stat-val {
  font-size: 56rpx;
  font-weight: bold;
  color: #5dade2;

  &.know {
    color: #82c785;
  }
  &.dont-know {
    color: #f5a623;
  }
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.finish-msg {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 80rpx;
}

.btn-back {
  width: 400rpx;
  height: 88rpx;
  background: linear-gradient(135deg, #5dade2, #4a9bd9);
  border: none;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(93, 173, 226, 0.4);
}

/* 空状态 */
.empty-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.empty-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #4a3728;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 60rpx;
}
</style>
