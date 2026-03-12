<route lang="json5" type="page">
{
  style: {
    navigationBarTitleText: '图鉴',
    navigationStyle: 'custom',
  },
}
</route>

<template>
  <div class="page-container">
    <div class="hero">
      <div class="hero-title">
        汉字图鉴
      </div>
      <div class="hero-stats">
        已收集 {{ learnedChars.length }} / {{ totalCharCount }} 个汉字
      </div>
      <div class="hero-progress">
        <div class="hero-progress-bg">
          <div class="hero-progress-fill" :style="{ width: `${collectionPercent}%` }" />
        </div>
      </div>
    </div>

    <!-- 今日复习 -->
    <div v-if="reviewChars.length > 0" class="section">
      <div class="section-header">
        <div class="section-title">
          今日复习
        </div>
        <div class="section-action" @click="goToReview">
          去复习 ▶
        </div>
      </div>
      <div class="grid-wall">
        <div
          v-for="char in reviewChars.slice(0, 8)"
          :key="char._id"
          class="grid-item review"
          @click="goToReview"
        >
          {{ char._id }}
        </div>
        <div v-if="reviewChars.length > 8" class="grid-item more" @click="goToReview">
          +{{ reviewChars.length - 8 }}
        </div>
      </div>
    </div>

    <!-- 汉字图鉴（三态展示） -->
    <div class="section">
      <div class="section-header">
        <div class="section-title">
          汉字图鉴
        </div>
      </div>
      <div class="grid-wall">
        <div
          v-for="item in allCharsWithState"
          :key="item.charId"
          class="grid-item" :class="[item.state]"
          @click="item.state !== 'unlearned' && item.char && showCharDetail(item.char)"
        >
          <template v-if="item.state === 'unlearned'">
            <div class="grid-char unlearned-char">
              ?
            </div>
          </template>
          <template v-else-if="item.state === 'learning'">
            <div class="grid-char">
              {{ item.charId }}
            </div>
            <div class="grid-pinyin">
              {{ item.char?.pinyin }}
            </div>
          </template>
          <template v-else>
            <div class="grid-char">
              {{ item.charId }}
            </div>
            <div class="grid-pinyin">
              {{ item.char?.pinyin }}
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 汉字详情弹窗 -->
    <div v-if="detailChar" class="detail-mask" @click="detailChar = null">
      <div class="detail-card" @click.stop>
        <div class="detail-close" @click="detailChar = null">
          ✕
        </div>
        <div class="detail-emoji">
          {{ detailChar.teaching?.emoji_fallback || '📝' }}
        </div>
        <div class="detail-char">
          {{ detailChar._id }}
        </div>
        <div class="detail-pinyin">
          {{ detailChar.pinyin }}
        </div>
        <div class="detail-type">
          <span class="type-tag">{{ detailChar.char_type }}</span>
          <span class="stroke-info">{{ detailChar.strokes }} 画 · 部首「{{ detailChar.radical }}」</span>
        </div>
        <div v-if="detailChar.example_words?.length" class="detail-words">
          <div class="words-label">
            组词
          </div>
          <div class="words-list">
            <span v-for="w in detailChar.example_words.slice(0, 4)" :key="w" class="word-tag">{{ w }}</span>
          </div>
        </div>
        <div v-if="charRecord" class="detail-review">
          <div class="review-info">
            已复习 {{ charRecord.reviewCount }} 次
          </div>
        </div>
        <button class="btn-replay" @click="replayOrigin(detailChar)">
          重播字源动画
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Character } from '@/types/character'
import { computed, ref } from 'vue'
import { useLearnStore } from '@/store'

const learnStore = useLearnStore()

const reviewChars = computed(() => learnStore.todayReviewChars)

/** 字库总字数 */
const totalCharCount = computed(() => {
  return learnStore.library.stages.flatMap((s: any) => s.units).reduce((sum: number, u: any) => sum + u.chars.length, 0)
})

/** 收集进度百分比 */
const collectionPercent = computed(() => {
  return totalCharCount.value > 0 ? (learnedChars.value.length / totalCharCount.value) * 100 : 0
})

/** 已学汉字列表（按学习时间排序，最新的在前） */
const learnedChars = computed(() => {
  const records = learnStore.charRecords
  return Object.keys(records)
    .sort((a, b) => (records[b]?.learnedAt || 0) - (records[a]?.learnedAt || 0))
    .map(id => learnStore.charMap.get(id))
    .filter(Boolean) as Character[]
})

/** 字库中所有汉字的三态列表 */
const allCharsWithState = computed(() => {
  const records = learnStore.charRecords
  const unitProgress = learnStore.unitProgressMap
  const allUnits = learnStore.library.stages.flatMap((s: any) => s.units)

  // 收集所有汉字及其所属单元
  const result: { charId: string, state: 'learned' | 'learning' | 'unlearned', char: Character | undefined }[] = []

  for (const unit of allUnits) {
    const up = unitProgress[unit.id]
    for (const charId of unit.chars) {
      const hasRecord = !!records[charId]
      let state: 'learned' | 'learning' | 'unlearned'
      if (hasRecord && up?.completed) {
        state = 'learned'
      }
      else if (hasRecord) {
        state = 'learning'
      }
      else {
        state = 'unlearned'
      }
      result.push({ charId, state, char: learnStore.charMap.get(charId) })
    }
  }
  return result
})

const detailChar = ref<Character | null>(null)

const charRecord = computed(() => {
  if (!detailChar.value)
    return null
  return learnStore.charRecords[detailChar.value._id] || null
})

function showCharDetail(char: Character) {
  detailChar.value = char
}

function goToReview() {
  uni.navigateTo({ url: '/pages/review/index' })
}

function replayOrigin(char: Character | null) {
  if (!char)
    return
  detailChar.value = null
  // 跳转到学习页，只看字源动画
  uni.navigateTo({ url: `/pages/learn/index?unitId=replay&charId=${char._id}` })
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #fff8f0;
  padding-bottom: 100rpx;
}

.hero {
  background: linear-gradient(135deg, #f5a623, #e8941a);
  padding: 100rpx 40rpx 60rpx;
  color: #fff;
}

.hero-title {
  font-size: 48rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.hero-stats {
  font-size: 26rpx;
  opacity: 0.85;
}

.hero-progress {
  margin-top: 20rpx;
}

.hero-progress-bg {
  height: 12rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 6rpx;
  overflow: hidden;
}

.hero-progress-fill {
  height: 100%;
  background: #fff;
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.section {
  padding: 30rpx 40rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-weight: bold;
  font-size: 32rpx;
  color: #4a3728;
}

.section-action {
  font-size: 24rpx;
  color: #5dade2;
  font-weight: bold;
}

.grid-wall {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}

.grid-item {
  aspect-ratio: 1;
  background: #fff;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 48rpx;
  font-family: 'KaiTi', 'STKaiti', serif;
  border: 2px solid #eee;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);

  &.review {
    border-color: #5dade2;
    background: #e8f4fd;
    color: #4a9bd9;
  }

  &.learned {
    border-color: #f5a623;
    background: #fffbea;
  }

  &.learning {
    border-color: #5dade2;
    background: #fff;
  }

  &.unlearned {
    border-color: #e0e0e0;
    background: #f0f0f0;
    color: #bdbdbd;
  }

  &.more {
    border-color: #5dade2;
    background: #e8f4fd;
    color: #5dade2;
    font-size: 28rpx;
    font-family: inherit;
    font-weight: bold;
  }
}

.grid-char {
  font-size: 48rpx;
  line-height: 1.2;
}

.grid-pinyin {
  font-size: 18rpx;
  color: #999;
  font-family: inherit;
}

.unlearned-char {
  font-size: 48rpx;
  color: #bdbdbd;
  font-family: inherit;
}

/* 详情弹窗 */
.detail-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.detail-card {
  width: 580rpx;
  background: #fff;
  border-radius: 32rpx;
  padding: 60rpx 40rpx 40rpx;
  text-align: center;
  position: relative;
  animation: pop-in 0.25s ease-out;
}

.detail-close {
  position: absolute;
  top: 20rpx;
  right: 24rpx;
  font-size: 36rpx;
  color: #ccc;
  padding: 10rpx;
}

.detail-emoji {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.detail-char {
  font-size: 120rpx;
  font-weight: bold;
  font-family: 'KaiTi', 'STKaiti', serif;
  color: #4a3728;
  line-height: 1.2;
}

.detail-pinyin {
  font-size: 36rpx;
  color: #666;
  margin-bottom: 24rpx;
}

.detail-type {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 30rpx;
}

.type-tag {
  background: #fff3e0;
  color: #f5a623;
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: bold;
}

.stroke-info {
  font-size: 22rpx;
  color: #999;
}

.detail-words {
  margin-bottom: 24rpx;
}

.words-label {
  font-size: 22rpx;
  color: #999;
  margin-bottom: 12rpx;
}

.words-list {
  display: flex;
  justify-content: center;
  gap: 16rpx;
  flex-wrap: wrap;
}

.word-tag {
  background: #f5f5f5;
  padding: 8rpx 24rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
  color: #4a3728;
}

.detail-review {
  margin-top: 16rpx;
}

.review-info {
  font-size: 22rpx;
  color: #5dade2;
}

.btn-replay {
  margin-top: 24rpx;
  width: 100%;
  height: 80rpx;
  background: linear-gradient(135deg, #f5a623, #e8941a);
  border: none;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: bold;
  color: #fff;
}

@keyframes pop-in {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
