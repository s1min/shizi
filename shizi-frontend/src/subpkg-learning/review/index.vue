<template>
  <div class="review-container">
    <!-- 完成结算 -->
    <div v-if="finished" class="finish-screen">
      <div class="finish-icon">
        🎉
      </div>
      <div class="finish-title">
        {{ finishTitle }}
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
        {{ backButtonText }}
      </button>
    </div>

    <!-- 闪卡复习 -->
    <template v-else>
      <div class="progress-header" :style="headerStyle">
        <div class="mode-badge">
          {{ reviewBadgeText }}
        </div>
        <div class="progress-row">
          <div class="progress-bg">
            <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
          </div>
          <div class="progress-text">
            {{ charIndex + 1 }}/{{ reviewChars.length }}
          </div>
          <button class="exit-entry" @click="handleClose">
            退出复习
          </button>
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
          {{ emptyTitle }}
        </div>
        <div class="empty-desc">
          {{ emptyDesc }}
        </div>
        <button class="btn-back" @click="goBack">
          {{ backButtonText }}
        </button>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import type { Character } from '@/types/character'
import { computed, onMounted, ref } from 'vue'
import { useLearnStore } from '@/store'
import { getCustomNavBarMetrics } from '@/utils/navbar'
import { navigateBackOrTo } from '@/utils/navigation'

definePage({
  style: {
    navigationBarTitleText: '复习',
    navigationStyle: 'custom',
  },
})

const learnStore = useLearnStore()
const navMetrics = getCustomNavBarMetrics()
const headerStyle = computed(() => ({
  paddingTop: `${navMetrics.navBarPaddingTop + navMetrics.navBarContentHeight + 16}px`,
}))

const reviewChars = ref<Character[]>([])
const charIndex = ref(0)
const finished = ref(false)
const knowCount = ref(0)
const flipped = ref(false)
const reviewMode = ref<'today' | 'unit'>('today')
const reviewUnitId = ref('')
const reviewScope = ref<'all' | 'wrong'>('all')

const currentChar = computed(() => reviewChars.value[charIndex.value])
const totalCount = computed(() => reviewChars.value.length)
const progressPercent = computed(() =>
  totalCount.value > 0 ? (charIndex.value / totalCount.value) * 100 : 0,
)

const reviewBadgeText = computed(() => {
  if (reviewMode.value !== 'unit') {
    return '今日复习'
  }

  return reviewScope.value === 'wrong' ? '错字强化任务' : '单元复习'
})

const finishTitle = computed(() => {
  if (reviewMode.value !== 'unit') {
    return '复习完成！'
  }

  return reviewScope.value === 'wrong' ? '错字强化完成！' : '单元复习完成！'
})

const emptyTitle = computed(() => {
  if (reviewMode.value !== 'unit') {
    return '暂无待复习的字'
  }

  return reviewScope.value === 'wrong' ? '本单元暂无待强化错字' : '本单元暂无可复习内容'
})

const emptyDesc = computed(() => {
  if (reviewMode.value !== 'unit') {
    return '学过的字会按记忆规律安排复习'
  }

  return reviewScope.value === 'wrong'
    ? '你可以返回学习单元页，查看其他单元的错字强化任务'
    : '你可以返回学习单元页，选择其他单元复习'
})

const backButtonText = computed(() => {
  if (reviewMode.value !== 'unit') {
    return '返回首页'
  }

  return reviewScope.value === 'wrong' ? '返回常错字强化' : '返回学习单元'
})

const encourageText = computed(() => {
  if (reviewScope.value === 'wrong') {
    const ratio = totalCount.value > 0 ? knowCount.value / totalCount.value : 0
    if (ratio === 1)
      return '这一轮错字都巩固住了，强化效果很好。'
    if (ratio >= 0.7)
      return '大部分错字已经稳住了，再巩固一轮会更扎实。'
    return '这些字还需要多见几次，继续强化会越来越稳。'
  }

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
  if (reviewMode.value === 'unit') {
    if (reviewScope.value === 'wrong' && reviewUnitId.value) {
      uni.setStorageSync('unitReviewReturnState', {
        tab: 'wrong',
        highlightUnitId: reviewUnitId.value,
        timestamp: Date.now(),
      })
      navigateBackOrTo('/pages/unit-list/index', true)
      return
    }
    navigateBackOrTo('/pages/unit-list/index', true)
    return
  }
  navigateBackOrTo('/pages/home/index', true)
}

function loadReviewCharsByMode() {
  const currentPage = getCurrentPages().pop() as { options?: Record<string, string> } | undefined
  const mode = currentPage?.options?.mode
  const unitId = currentPage?.options?.unitId
  const scope = currentPage?.options?.scope

  if (mode === 'unit' && unitId) {
    reviewMode.value = 'unit'
    reviewUnitId.value = unitId
    reviewScope.value = scope === 'wrong' ? 'wrong' : 'all'
    reviewChars.value = reviewScope.value === 'wrong'
      ? learnStore.getUnitWrongChars(unitId)
      : learnStore.getUnitReviewChars(unitId)
    return
  }

  reviewMode.value = 'today'
  reviewUnitId.value = ''
  reviewScope.value = 'all'
  reviewChars.value = [...learnStore.todayReviewChars]
}

onMounted(() => {
  loadReviewCharsByMode()
})
</script>

<style lang="scss" scoped>
.review-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #e8f4fd 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
}

.progress-header {
  padding: 24rpx 32rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  background: rgba(255, 255, 255, 0.96);
  border-bottom-left-radius: 28rpx;
  border-bottom-right-radius: 28rpx;
  box-shadow: 0 10rpx 28rpx rgba(93, 173, 226, 0.1);
}

.mode-badge {
  align-self: flex-start;
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(93, 173, 226, 0.12);
  color: #5f89a8;
  font-size: 22rpx;
  font-weight: 600;
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.progress-bg {
  flex: 1;
  min-width: 0;
  height: 16rpx;
  background: rgba(93, 173, 226, 0.18);
  border-radius: 999rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #7ec3ea, #5dade2);
  border-radius: 999rpx;
  transition: width 0.3s ease;
}

.progress-text {
  min-width: 76rpx;
  text-align: right;
  font-size: 24rpx;
  font-weight: 600;
  color: #7c91a6;
}

.exit-entry {
  flex-shrink: 0;
  min-width: 132rpx;
  height: 60rpx;
  padding: 0 20rpx;
  border: 2rpx solid rgba(155, 178, 198, 0.35);
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.88);
  font-size: 24rpx;
  color: #7f98ad;
  line-height: 56rpx;
  text-align: center;
}

.flashcard-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32rpx 40rpx 40rpx;
}

.flashcard {
  width: 100%;
  max-width: 580rpx;
  min-height: 680rpx;
  perspective: 1000px;
  cursor: pointer;
  margin-bottom: 64rpx;
}

.card-front,
.card-back {
  width: 100%;
  min-height: 680rpx;
  background: rgba(255, 255, 255, 0.96);
  border: 2rpx solid rgba(93, 173, 226, 0.08);
  border-radius: 36rpx;
  box-shadow: 0 12rpx 36rpx rgba(93, 173, 226, 0.14);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 72rpx 40rpx;
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
  font-size: 248rpx;
  font-weight: bold;
  font-family: 'KaiTi', 'STKaiti', serif;
  color: #4a3728;
  line-height: 1.15;
}

.card-hint {
  font-size: 28rpx;
  color: #8da3b5;
  margin-top: 40rpx;
}

.card-char-back {
  font-size: 168rpx;
  font-weight: bold;
  font-family: 'KaiTi', 'STKaiti', serif;
  color: #4a3728;
  line-height: 1.2;
}

.card-pinyin {
  font-size: 52rpx;
  color: #5dade2;
  margin: 20rpx 0 44rpx;
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

.action-buttons {
  display: flex;
  gap: 32rpx;
  width: 100%;
  max-width: 580rpx;
  animation: fade-in 0.3s ease;
}

.btn-action {
  flex: 1;
  height: 100rpx;
  border: none;
  border-radius: 28rpx;
  font-size: 34rpx;
  font-weight: bold;
  color: #fff;
}

.btn-dont-know {
  background: linear-gradient(135deg, #8fb6d9, #769fc5);
  box-shadow: 0 10rpx 24rpx rgba(118, 159, 197, 0.28);
}

.btn-know {
  background: linear-gradient(135deg, #82c785, #6ab06d);
  box-shadow: 0 10rpx 24rpx rgba(130, 199, 133, 0.28);
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

.finish-screen,
.empty-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx;
  text-align: center;
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
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
  width: 100%;
  margin-bottom: 40rpx;
}

.stat-item {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 24rpx;
  padding: 24rpx 16rpx;
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
    color: #769fc5;
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
  width: 100%;
  max-width: 420rpx;
  height: 92rpx;
  background: linear-gradient(135deg, #5dade2, #4a9bd9);
  border: none;
  border-radius: 46rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  box-shadow: 0 10rpx 24rpx rgba(93, 173, 226, 0.28);
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
