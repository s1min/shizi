<template>
  <div class="page-container">
    <!-- Top Bar -->
    <div class="top-bar">
      <div class="level-selector" @click="showLibPicker = true">
        <wd-icon name="books" size="16px" />
        {{ learnStore.library.name }}
        <wd-icon name="arrow-down" size="14px" />
      </div>
      <div class="stats-mini">
        <span><wd-icon name="edit" size="14px" /> {{ learnedCount }}字</span>
        <span><wd-icon name="star-filled" size="14px" /> {{ streakDays }}天</span>
      </div>
    </div>

    <!-- 复习提醒 -->
    <div class="island-scroll">
      <div
        v-if="learnStore.todayReviewCount > 0"
        class="review-card"
        @click="goToReview"
      >
        <div class="review-left">
          <div class="review-icon">
            <wd-icon name="notification" size="28px" />
          </div>
          <div>
            <div class="review-title">
              今日复习
            </div>
            <div class="review-desc">
              {{ learnStore.todayReviewCount }} 个字等你复习
            </div>
          </div>
        </div>
        <div class="review-btn">
          开始 <wd-icon name="play" size="14px" />
        </div>
      </div>

      <div class="unit-label">
        当前单元
      </div>

      <!-- Active Island -->
      <div v-if="currentUnit" class="island-card active" @click="goToLearning">
        <div class="island-visual active-bg">
          <div class="island-icon">
            <wd-icon name="location" size="48px" color="#fff" />
          </div>
        </div>
        <div class="island-info">
          <div>
            <div class="island-title">
              {{ currentUnit.name }}
            </div>
            <div class="island-desc">
              {{ unitProgressText }} · {{ currentUnit.chars.slice(0, 4).join('、') }}...
            </div>
          </div>
          <div class="btn-start">
            {{ learnStore.getUnitProgress(currentUnit.id).charIndex > 0 ? '继续学习' : '开始学习' }}
          </div>
        </div>
      </div>

      <div v-if="upcomingUnits.length > 0" class="unit-label mt-4">
        即将解锁
      </div>

      <!-- Upcoming Islands -->
      <div
        v-for="unit in upcomingUnits"
        :key="unit.id"
        class="island-card"
        :class="learnStore.isUnitUnlocked(unit.id) ? 'unlocked' : 'locked'"
        @click="learnStore.isUnitUnlocked(unit.id) && goToUnit(unit.id)"
      >
        <div class="island-visual" :class="learnStore.isUnitUnlocked(unit.id) ? 'unlocked-bg' : 'locked-bg'">
          <div class="island-icon">
            <wd-icon name="location" size="48px" color="#fff" />
          </div>
        </div>
        <div class="island-info">
          <div>
            <div class="island-title">
              {{ unit.name }}
            </div>
            <div class="island-desc">
              包含：{{ unit.chars.slice(0, 4).join('、') }}...
            </div>
          </div>
          <div class="lock-icon">
            <wd-icon v-if="learnStore.getUnitProgress(unit.id).completed" name="star-filled" size="18px" color="#f5a623" />
            <wd-icon v-else :name="learnStore.isUnitUnlocked(unit.id) ? 'play' : 'lock-off'" size="18px" />
          </div>
        </div>
      </div>
    </div>

    <!-- 字库选择弹窗 -->
    <div v-if="showLibPicker" class="lib-mask" @click="showLibPicker = false">
      <div class="lib-picker" @click.stop>
        <div class="lib-picker-title">
          选择字库
        </div>
        <div
          v-for="lib in libraryList"
          :key="lib.id"
          class="lib-option"
          :class="{ active: lib.id === learnStore.currentLibraryId, disabled: !lib.available }"
          @click="lib.available && selectLibrary(lib.id)"
        >
          <div class="lib-option-left">
            <div class="lib-option-name">
              {{ lib.name }}
            </div>
            <div class="lib-option-desc">
              {{ lib.desc }}
            </div>
          </div>
          <div class="lib-option-right">
            <span v-if="lib.id === learnStore.currentLibraryId" class="lib-current">当前</span>
            <span v-else-if="!lib.available" class="lib-coming">即将推出</span>
            <wd-icon v-else name="arrow-right" size="16px" class="lib-arrow" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useLearnStore } from '@/store'

definePage({
  type: 'home',
  style: {
    navigationBarTitleText: '今日',
  },
})

const learnStore = useLearnStore()

// 页面加载时尝试从 API 加载最新数据
onMounted(() => {
  learnStore.loadLibraryFromApi()
  learnStore.loadCharsFromApi()
})

const currentStage = computed(() => learnStore.currentStage)
const currentUnit = computed(() => learnStore.currentUnit)
const learnedCount = computed(() => learnStore.learnedCount)
const streakDays = computed(() => learnStore.streakDays)

const showLibPicker = ref(false)

const libraryList = [
  { id: 'lib_1a_upper', name: '一年级上册', desc: '人教版部编版 · 257字', available: true },
  { id: 'lib_1a_lower', name: '一年级下册', desc: '人教版部编版 · 即将上线', available: false },
  { id: 'lib_2a_upper', name: '二年级上册', desc: '人教版部编版 · 即将上线', available: false },
  { id: 'lib_2a_lower', name: '二年级下册', desc: '人教版部编版 · 即将上线', available: false },
]

function selectLibrary(libId: string) {
  if (libId === learnStore.currentLibraryId) {
    showLibPicker.value = false
    return
  }
  // 目前只有一个字库，切换逻辑预留
  learnStore.currentLibraryId = libId
  showLibPicker.value = false
}

/** 当前单元已学进度文案 */
const unitProgressText = computed(() => {
  if (!currentUnit.value)
    return ''
  const progress = learnStore.getUnitProgress(currentUnit.value.id)
  if (progress.completed)
    return '已完成'
  if (progress.charIndex > 0)
    return `已学 ${progress.charIndex}/${currentUnit.value.chars.length} 字`
  return `共 ${currentUnit.value.chars.length} 字`
})

/** 后续单元列表（排除当前单元） */
const upcomingUnits = computed(() => {
  if (!currentStage.value)
    return []
  return currentStage.value.units.filter(u => u.id !== currentUnit.value?.id).slice(0, 3)
})

function goToLearning() {
  if (currentUnit.value) {
    uni.navigateTo({
      url: `/subpkg-learning/learn/index?unitId=${currentUnit.value.id}`,
    })
  }
}

function goToUnit(unitId: string) {
  uni.navigateTo({
    url: `/subpkg-learning/learn/index?unitId=${unitId}`,
  })
}

function goToReview() {
  uni.navigateTo({ url: '/subpkg-learning/review/index' })
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: $uni-bg-color;
  padding-bottom: 100rpx;
}

.top-bar {
  padding: $uni-spacing-col-base $uni-spacing-row-lg;
  background: $uni-bg-color;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
}

.level-selector {
  background: #fff;
  padding: $uni-spacing-col-sm $uni-spacing-row-base;
  border-radius: 40rpx;
  border: 2px solid $uni-color-primary;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10rpx;
  font-size: $uni-font-size-sm;
}

.progress-ring {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  border: 6rpx solid #eee;
  border-top-color: $uni-color-error;
}

.stats-mini {
  display: flex;
  gap: 16rpx;
  font-size: $uni-font-size-xs;
  color: $uni-text-color-grey;
}

.island-scroll {
  padding: $uni-spacing-col-base $uni-spacing-row-lg;
}

.unit-label {
  font-size: $uni-font-size-xs;
  color: $uni-text-color-grey;
  margin-bottom: $uni-spacing-col-base;
}

.island-card {
  background: #fff;
  border-radius: $uni-border-radius-lg;
  margin-bottom: $uni-spacing-col-lg;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.2s;

  &.active {
    border: 2px solid $uni-color-primary;
  }

  &.locked {
    filter: grayscale(1);
    opacity: 0.7;
  }

  &.unlocked {
    border: 1px solid #e0e0e0;
  }
}

.island-visual {
  height: 200rpx;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-end;

  &.active-bg {
    background: #fff9c4;
  }
  &.locked-bg {
    background: #e0e0e0;
  }
  &.unlocked-bg {
    background: #e8f5e9;
  }
}

.island-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.island-info {
  padding: $uni-spacing-col-lg;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.island-title {
  font-weight: bold;
  font-size: $uni-font-size-base;
  color: $uni-text-color;
}

.island-desc {
  font-size: $uni-font-size-xs;
  color: $uni-text-color-grey;
  margin-top: 8rpx;
}

.btn-start {
  background: $uni-color-primary;
  color: #fff;
  padding: 12rpx 28rpx;
  border-radius: 30rpx;
  font-size: $uni-font-size-xs;
  font-weight: bold;
}

.lock-icon {
  font-size: 40rpx;
}

.mt-4 {
  margin-top: $uni-spacing-col-xl;
}

.review-card {
  background: linear-gradient(135deg, #5dade2, #4a9bd9);
  border-radius: $uni-border-radius-lg;
  padding: 28rpx 32rpx;
  margin-bottom: $uni-spacing-col-lg;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  box-shadow: 0 4px 16px rgba(93, 173, 226, 0.3);
}

.review-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.review-icon {
  font-size: 48rpx;
}

.review-title {
  font-size: $uni-font-size-base;
  font-weight: bold;
}

.review-desc {
  font-size: $uni-font-size-xs;
  opacity: 0.85;
  margin-top: 4rpx;
}

.review-btn {
  background: rgba(255, 255, 255, 0.25);
  padding: 12rpx 28rpx;
  border-radius: 30rpx;
  font-size: $uni-font-size-xs;
  font-weight: bold;
}

/* 字库选择弹窗 */
.lib-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 999;
}

.lib-picker {
  width: 100%;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 40rpx 40rpx calc(40rpx + env(safe-area-inset-bottom));
  animation: slide-up 0.25s ease-out;
}

.lib-picker-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 30rpx;
}

.lib-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 24rpx;
  border-radius: 20rpx;
  margin-bottom: 16rpx;
  background: #f9f9f9;
  transition: background 0.2s;

  &.active {
    background: #fff9e6;
    border: 2px solid $uni-color-primary;
  }

  &.disabled {
    opacity: 0.5;
  }
}

.lib-option-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.lib-option-desc {
  font-size: 22rpx;
  color: #999;
  margin-top: 6rpx;
}

.lib-current {
  font-size: 22rpx;
  color: $uni-color-primary;
  font-weight: bold;
  background: #fff9e6;
  padding: 4rpx 16rpx;
  border-radius: 16rpx;
}

.lib-coming {
  font-size: 22rpx;
  color: #bbb;
}

.lib-arrow {
  font-size: 24rpx;
  color: #ccc;
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
