<template>
  <div class="page-container">
    <div class="profile-header">
      <!-- 已登录 -->
      <div v-if="isLoggedIn" class="user-card">
        <image
          v-if="userInfo.avatar"
          class="avatar-img"
          :src="userInfo.avatar"
          mode="aspectFill"
        />
        <div v-else class="avatar">
          <div class="avatar-emoji">
            🐵
          </div>
        </div>
        <div class="user-info">
          <div class="username">
            {{ displayName }}
          </div>
        </div>
      </div>
      <!-- 未登录 -->
      <div v-else class="user-card" @click="goLogin">
        <div class="avatar">
          <div class="avatar-emoji">
            👤
          </div>
        </div>
        <div class="user-info">
          <div class="username">
            点击登录
          </div>
          <div class="login-hint">
            登录后可云端同步学习进度
          </div>
        </div>
      </div>
    </div>

    <div class="stats-card">
      <div class="stat-item">
        <div class="stat-val">
          {{ learnStore.learnedCount }}
        </div>
        <div class="stat-label">
          已学字
        </div>
      </div>
      <div class="stat-divider" />
      <div class="stat-item">
        <div class="stat-val">
          {{ learnStore.learnDays.length }}
        </div>
        <div class="stat-label">
          学习天
        </div>
      </div>
      <div class="stat-divider" />
      <div class="stat-item">
        <div class="stat-val">
          {{ learnStore.streakDays }}
        </div>
        <div class="stat-label">
          连续天
        </div>
      </div>
    </div>

    <!-- 本周学习报告 -->
    <div v-if="learnStore.learnedCount > 0" class="report-card">
      <div class="report-title">
        本周学习
      </div>
      <div class="report-stats">
        <div class="report-item">
          <div class="report-val">
            {{ weekLearnedCount }}
          </div>
          <div class="report-label">
            新学字
          </div>
        </div>
        <div class="report-item">
          <div class="report-val">
            {{ weekDaysCount }}
          </div>
          <div class="report-label">
            学习天
          </div>
        </div>
        <div class="report-item" @click="goToReview">
          <div class="report-val">
            {{ wrongCount }}
          </div>
          <div class="report-label">
            待复习
          </div>
        </div>
      </div>
    </div>

    <div class="menu-list">
      <div class="menu-group-title">
        我的成就
      </div>
      <div class="menu-item" @click="goToMedals">
        <div class="menu-left">
          <div class="menu-icon medal">
            🏅
          </div>
          <text>勋章墙</text>
        </div>
        <text class="arrow">></text>
      </div>
      <div class="menu-item" @click="goToLoot">
        <div class="menu-left">
          <div class="menu-icon card">
            🎴
          </div>
          <text>汉字图鉴</text>
        </div>
        <text class="arrow">></text>
      </div>

      <div class="menu-group-title mt-4">
        家长中心
      </div>
      <div class="menu-item" @click="goToUnitCenter">
        <div class="menu-left">
          <div class="menu-icon report">
            📚
          </div>
          <text>学习单元</text>
        </div>
        <text class="arrow">></text>
      </div>
      <div class="menu-item" @click="showLearningReport">
        <div class="menu-left">
          <div class="menu-icon report">
            📊
          </div>
          <text>学习日报</text>
        </div>
        <text class="arrow">></text>
      </div>

      <!-- 学习设置 -->
      <div class="menu-group-title mt-4">
        学习设置
      </div>
      <div class="menu-item" @click="showDailyCharPicker">
        <div class="menu-left">
          <div class="menu-icon setting">
            📖
          </div>
          <text>每日新字数</text>
        </div>
        <div class="menu-right">
          <text class="menu-val">{{ learnStore.dailyCharCount }}字/天</text>
          <text class="arrow">></text>
        </div>
      </div>
      <div class="menu-item" @click="showReminderPicker">
        <div class="menu-left">
          <div class="menu-icon setting">
            ⏰
          </div>
          <text>学习提醒</text>
        </div>
        <div class="menu-right">
          <text class="menu-val">{{ learnStore.reminderTime }}</text>
          <text class="arrow">></text>
        </div>
      </div>

      <!-- 退出登录 -->
      <template v-if="isLoggedIn">
        <div class="menu-group-title mt-4">
          账号
        </div>
        <div class="menu-item logout-item" @click="handleLogout">
          <div class="menu-left">
            <div class="menu-icon logout-icon">
              🚪
            </div>
            <text class="logout-text">退出登录</text>
          </div>
          <text class="arrow">></text>
        </div>
      </template>

      <!-- 关于 -->
      <div class="menu-group-title mt-4">
        关于
      </div>
      <div class="menu-item" @click="goToPrivacy">
        <div class="menu-left">
          <div class="menu-icon about">
            🔒
          </div>
          <text>隐私政策</text>
        </div>
        <text class="arrow">></text>
      </div>
      <div class="menu-item" @click="goToAgreement">
        <div class="menu-left">
          <div class="menu-icon about">
            📄
          </div>
          <text>用户协议</text>
        </div>
        <text class="arrow">></text>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePage({
  style: {
    navigationBarTitleText: '我的',
    navigationStyle: 'custom',
  },
})

import { computed } from 'vue'
import { useLearnStore, useTokenStore, useUserStore } from '@/store'

const learnStore = useLearnStore()
const tokenStore = useTokenStore()
const userStore = useUserStore()

const isLoggedIn = computed(() => tokenStore.hasLogin)
const userInfo = computed(() => userStore.userInfo)

const displayName = computed(() => userInfo.value.nickname || '小朋友')

/** 本周新学字数 */
const weekLearnedCount = computed(() => {
  const weekStart = getWeekStart()
  return Object.values(learnStore.charRecords)
    .filter(r => r.learnedAt >= weekStart.getTime())
    .length
})

/** 本周学习天数 */
const weekDaysCount = computed(() => {
  const weekStartStr = formatDate(getWeekStart())
  return learnStore.learnDays.filter((d: string) => d >= weekStartStr).length
})

/** 待复习错题数 */
const wrongCount = computed(() => learnStore.wrongChars?.length ?? 0)

function getWeekStart() {
  const now = new Date()
  const d = new Date(now)
  d.setDate(now.getDate() - now.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function goLogin() {
  uni.navigateTo({ url: '/pages/login/index' })
}

function goToReview() {
  uni.navigateTo({ url: '/subpkg-learning/review/index' })
}

function goToUnitCenter() {
  uni.switchTab({ url: '/pages/unit-list/index' })
}

function goToMedals() {
  uni.showToast({ title: '勋章墙即将开放', icon: 'none' })
}

function goToLoot() {
  uni.navigateTo({ url: '/pages/loot/index' })
}

function showLearningReport() {
  const learned = weekLearnedCount.value
  const days = weekDaysCount.value
  const review = wrongCount.value
  const total = learnStore.learnedCount
  const streak = learnStore.streakDays
  uni.showModal({
    title: '学习日报',
    content: `本周新学 ${learned} 字，学习 ${days} 天\n累计掌握 ${total} 字，连续学习 ${streak} 天\n待复习 ${review} 字`,
    showCancel: false,
    confirmText: '知道了',
  })
}

function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '退出后未同步的学习数据可能丢失，确定退出吗？',
    success: async (res) => {
      if (res.confirm) {
        await tokenStore.logout()
        uni.showToast({ title: '已退出登录', icon: 'success' })
      }
    },
  })
}

function showDailyCharPicker() {
  uni.showActionSheet({
    itemList: ['3字/天', '5字/天', '8字/天'],
    success: (res) => {
      const values = [3, 5, 8]
      learnStore.dailyCharCount = values[res.tapIndex]
      uni.showToast({ title: `已设为${values[res.tapIndex]}字/天`, icon: 'success' })
    },
  })
}

function goToPrivacy() {
  uni.navigateTo({ url: '/pages/privacy/index' })
}

function goToAgreement() {
  uni.navigateTo({ url: '/pages/agreement/index' })
}

function showReminderPicker() {
  // #ifdef MP-WEIXIN
  // 微信小程序使用 picker
  // #endif
  uni.showActionSheet({
    itemList: ['18:00', '19:00', '20:00', '21:00'],
    success: (res) => {
      const times = ['18:00', '19:00', '20:00', '21:00']
      learnStore.reminderTime = times[res.tapIndex]
      uni.showToast({ title: `提醒时间：${times[res.tapIndex]}`, icon: 'success' })
    },
  })
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #fff8f0;
  padding-bottom: 40rpx;
}

.profile-header {
  background: linear-gradient(135deg, #f5a623, #e8941a);
  padding: 120rpx 40rpx 100rpx;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 30rpx;
}

.avatar {
  width: 128rpx;
  height: 128rpx;
  background: #fff;
  border-radius: 50%;
  border: 6rpx solid rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.avatar-img {
  width: 128rpx;
  height: 128rpx;
  border-radius: 50%;
  border: 6rpx solid rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
}

.avatar-emoji {
  font-size: 70rpx;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 10rpx;
}

.login-hint {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.stats-card {
  background: #fff;
  margin: -60rpx 40rpx 30rpx;
  padding: 40rpx;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.stat-item {
  text-align: center;
}

.stat-val {
  font-size: 44rpx;
  font-weight: bold;
  color: #f5a623;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.stat-divider {
  width: 1px;
  height: 50rpx;
  background: #eee;
}

.report-card {
  background: #fff;
  margin: 0 40rpx 30rpx;
  padding: 36rpx;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.report-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #4a3728;
  margin-bottom: 24rpx;
}

.report-stats {
  display: flex;
  justify-content: space-around;
}

.report-item {
  text-align: center;
}

.report-val {
  font-size: 40rpx;
  font-weight: bold;
  color: #f5a623;
}

.report-label {
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
}

.menu-list {
  padding: 0 40rpx;
}

.menu-group-title {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 20rpx;
  font-weight: bold;
}

.menu-item {
  background: #fff;
  padding: 30rpx;
  border-radius: 24rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
  font-weight: bold;
  font-size: 30rpx;
  color: #4a3728;
}

.menu-icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28rpx;

  &.medal {
    background: #fff3e0;
  }
  &.card {
    background: #e3f2fd;
  }
  &.report {
    background: #ffebee;
  }
  &.logout-icon {
    background: #f5f5f5;
  }
  &.setting {
    background: #e8f5e9;
  }
  &.about {
    background: #f3e5f5;
  }
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.menu-val {
  font-size: 26rpx;
  color: #999;
}

.logout-item .menu-left {
  font-weight: normal;
  color: #999;
}

.logout-text {
  color: #999;
}

.arrow {
  color: #ccc;
  font-family: monospace;
}

.mt-4 {
  margin-top: 40rpx;
}
</style>
