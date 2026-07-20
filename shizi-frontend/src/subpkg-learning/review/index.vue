<template>
  <PaperPage class="review-container" hide-tabbar safe-bottom>
    <!-- 完成结算 -->
    <div v-if="finished" class="finish-screen">
      <UiIcon class="finish-icon" name="check" :size="72" />
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
      <PaperButton variant="secondary" class="btn-back" @click="goBack">
        {{ backButtonText }}
      </PaperButton>
    </div>

    <!-- 闪卡复习 -->
    <template v-else>
      <div class="progress-header" :style="headerStyle">
        <div class="paper-status-badge paper-status-badge--review">
          {{ reviewBadgeText }}
        </div>
        <div class="progress-row">
          <div class="paper-progress progress-bg" :style="{ '--paper-progress': `${progressPercent}%`, '--paper-progress-color': 'var(--sky)' }" />
          <div class="progress-text">
            {{ charIndex + 1 }}/{{ reviewChars.length }}
          </div>
          <PaperButton variant="ghost" class="exit-entry" @click="handleClose">
            退出复习
          </PaperButton>
        </div>
      </div>

      <div v-if="currentChar" class="flashcard-area">
        <!-- 闪卡 -->
        <div class="flashcard paper-card" :class="{ flipped }" @click="flipCard">
          <!-- 正面：大字 -->
          <div class="card-front">
            <div class="card-char">
              {{ currentChar._id }}
            </div>
            <div class="card-hint">
              点击翻转查看拼音和组词
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
          <PaperButton variant="review" class="btn-action btn-dont-know" @click="handleDontKnow">
            不认识
          </PaperButton>
          <PaperButton variant="success" class="btn-action btn-know" @click="handleKnow">
            认识
          </PaperButton>
        </div>
      </div>

      <!-- 无待复习 -->
      <div v-if="reviewChars.length === 0" class="empty-screen">
        <UiIcon class="empty-icon" name="check" :size="72" />
        <div class="empty-title">
          {{ emptyTitle }}
        </div>
        <div class="empty-desc">
          {{ emptyDesc }}
        </div>
        <PaperButton variant="secondary" class="btn-back" @click="goBack">
          {{ backButtonText }}
        </PaperButton>
      </div>
    </template>
  </PaperPage>
</template>

<script lang="ts" setup>
import type { Character } from '@/types/character'
import { computed, onMounted, ref } from 'vue'
import PaperButton from '@/components/ui/PaperButton.vue'
import PaperPage from '@/components/ui/PaperPage.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
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
@use '../../style/tokens' as *;

.review-container {
  display: flex;
  flex-direction: column;
}

.progress-header {
  padding: $space-3 0 $space-3;
  display: flex;
  flex-direction: column;
  gap: $space-2;
  border-bottom: 2rpx solid $line;
}

.progress-row {
  display: flex;
  align-items: center;
  gap: $space-2;
}

.progress-bg {
  flex: 1;
  min-width: 0;
}

.progress-text {
  min-width: 96rpx;
  text-align: right;
  font-size: $font-label;
  font-weight: 600;
  color: $ink-muted;
}

.exit-entry {
  flex-shrink: 0;
  min-width: 160rpx;
  font-size: $font-label;
  color: $ink-muted;
  text-align: center;
}

.flashcard-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $space-4 0 $space-5;
}

.flashcard {
  width: 100%;
  max-width: 640rpx;
  min-height: 680rpx;
  perspective: 1000px;
  cursor: pointer;
  margin-bottom: $space-5;
  padding: 0;
  border-color: $line;
  box-shadow: $shadow-raised;
}

.card-front,
.card-back {
  width: 100%;
  min-height: 680rpx;
  background: $surface;
  border-radius: $radius-sheet;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $space-7 $space-5;
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

.card-char {
  font-size: 248rpx;
  font-weight: bold;
  font-family: $font-hanzi;
  color: $ink-strong;
  line-height: 1.15;
}

.card-hint {
  color: $ink-light;
  margin-top: $space-5;
  font-size: $font-body-size;
}

.card-char-back {
  font-size: 168rpx;
  font-weight: bold;
  font-family: $font-hanzi;
  color: $ink-strong;
  line-height: 1.2;
}

.card-pinyin {
  font-size: 52rpx;
  color: $sky-dark;
  margin: $space-2 0 $space-5;
  font-weight: bold;
}

.card-words {
  width: 100%;
}

.words-label {
  font-size: 24rpx;
  color: $ink-muted;
  margin-bottom: $space-2;
  text-align: center;
}

.words-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: $space-2;
}

.word-tag {
  background: $sky-soft;
  border: 2rpx solid rgba(93, 173, 226, 0.28);
  padding: $space-1 $space-3;
  border-radius: $radius-pill;
  font-size: $font-body-size;
  color: $sky-dark;
}

.action-buttons {
  display: flex;
  gap: $space-3;
  width: 100%;
  max-width: 640rpx;
  animation: fade-in 0.3s ease;
}

.btn-action {
  flex: 1;
  min-width: 240rpx;
  flex: 1 1 240rpx;
  font-size: $font-body-lg;
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
  padding: $space-7 $space-4;
  text-align: center;
}

.finish-icon {
  margin-bottom: $space-3;
  color: $mint-dark;
}

.finish-title {
  font-size: $font-display-md;
  font-weight: bold;
  color: $ink-strong;
  margin-bottom: $space-6;
}

.finish-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $space-2;
  width: 100%;
  margin-bottom: $space-4;
}

.stat-item {
  background: $surface;
  border: 2rpx solid $line;
  border-radius: $radius-card;
  padding: $space-3 $space-2;
  text-align: center;
}

.stat-val {
  font-size: $font-display-md;
  font-weight: bold;
  color: $sky-dark;

  &.know {
    color: $mint-dark;
  }
  &.dont-know {
    color: $coral-dark;
  }
}

.stat-label {
  font-size: 24rpx;
  color: $ink-muted;
  margin-top: $space-1;
}

.finish-msg {
  font-size: 28rpx;
  color: $ink-muted;
  margin-bottom: $space-7;
}

.btn-back {
  max-width: 520rpx;
  width: 100%;
}

.empty-icon {
  margin-bottom: $space-3;
  color: $mint-dark;
}

.empty-title {
  font-size: $font-title;
  font-weight: bold;
  color: $ink-strong;
  margin-bottom: $space-2;
}

.empty-desc {
  font-size: $font-body-size;
  color: $ink-muted;
  margin-bottom: $space-6;
}
</style>
