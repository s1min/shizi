<template>
  <PaperPage class="me-page">
    <view class="me-header">
      <view class="me-heading">
        <text class="eyebrow">家长与孩子</text><text class="title">我的学习册</text>
      </view>
      <button class="avatar-button" aria-label="账户" @click="isLoggedIn ? undefined : goLogin">
        <image v-if="userInfo.avatar" class="avatar-image" :src="userInfo.avatar" mode="aspectFill" /><UiIcon v-else name="user" :size="42" />
      </button>
    </view>

    <PaperCard class="summary-card">
      <view class="summary-row">
        <view><text class="summary-kicker">孩子正在学习</text><text class="summary-name">{{ displayName }}</text></view><UiIcon name="book" :size="46" color="#b86e08" />
      </view>
      <view class="metrics">
        <view><text class="metric-value">{{ learnStore.learnedCount }}</text><text class="metric-label">已接触字</text></view><view><text class="metric-value">{{ learnStore.todayReviewCount }}</text><text class="metric-label">待巩固</text></view><view><text class="metric-value">{{ learnStore.streakDays }}</text><text class="metric-label">连续学习天</text></view>
      </view>
    </PaperCard>

    <template v-if="!uiStore.isParentMode">
      <PaperCard class="gate-card" interactive @click="gateVisible = true">
        <view class="gate-icon">
          <UiIcon name="lock" :size="42" />
        </view><view class="gate-copy">
          <text class="gate-title">家长中心</text><text class="gate-desc">查看报告、管理单元和学习设置</text>
        </view><UiIcon name="chevron-right" :size="32" />
      </PaperCard>
      <PaperCard class="child-tip">
        <text class="child-tip__title">学习册交给小朋友</text><text class="child-tip__copy">孩子可以从“今日”开始学习，家长设置需要先验证。</text>
      </PaperCard>
    </template>

    <template v-else>
      <view class="section-title">
        家长中心
      </view>
      <PaperCard class="menu-card">
        <button class="menu-item" @click="goToReport">
          <view class="menu-copy">
            <UiIcon name="book" :size="36" color="#266c98" /><text>学习报告</text>
          </view><UiIcon name="chevron-right" :size="30" />
        </button><button class="menu-item" @click="goToUnitList">
          <view class="menu-copy">
            <UiIcon name="book" :size="36" color="#b86e08" /><text>单元管理</text>
          </view><UiIcon name="chevron-right" :size="30" />
        </button><button class="menu-item" @click="showDailyCharPicker">
          <view class="menu-copy">
            <UiIcon name="settings" :size="36" color="#397745" /><text>每日新字数</text>
          </view><text class="menu-value">{{ learnStore.dailyCharCount }} 字/天</text>
        </button><button class="menu-item" @click="showReminderPicker">
          <view class="menu-copy">
            <UiIcon name="speaker" :size="36" color="#397745" /><text>学习提醒</text>
          </view><text class="menu-value">{{ learnStore.reminderTime }}</text>
        </button>
      </PaperCard>
      <view class="section-title">
        隐私与账号
      </view>
      <PaperCard class="menu-card">
        <button class="menu-item" @click="goToPrivacy">
          <view class="menu-copy">
            <UiIcon name="lock" :size="36" /><text>隐私与数据</text>
          </view><UiIcon name="chevron-right" :size="30" />
        </button><button class="menu-item" @click="goToAgreement">
          <view class="menu-copy">
            <UiIcon name="info" :size="36" /><text>用户协议</text>
          </view><UiIcon name="chevron-right" :size="30" />
        </button><button v-if="isLoggedIn" class="menu-item menu-item--danger" @click="handleLogout">
          <view class="menu-copy">
            <UiIcon name="close" :size="36" color="#a94339" /><text>退出登录</text>
          </view>
        </button>
      </PaperCard>
      <button class="leave-parent" @click="uiStore.leaveParentMode">
        退出家长模式
      </button>
    </template>

    <view v-if="gateVisible" class="gate-layer">
      <ParentGate reason="settings" @verified="handleVerified" @cancel="gateVisible = false" />
    </view>
  </PaperPage>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import PaperCard from '@/components/ui/PaperCard.vue'
import PaperPage from '@/components/ui/PaperPage.vue'
import ParentGate from '@/components/ui/ParentGate.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import { useLearnStore, useTokenStore, useUiStore, useUserStore } from '@/store'

definePage({ style: { navigationBarTitleText: '我的', navigationStyle: 'custom' } })
const learnStore = useLearnStore()
const tokenStore = useTokenStore()
const userStore = useUserStore()
const uiStore = useUiStore()
const gateVisible = ref(false)
const isLoggedIn = computed(() => tokenStore.hasLogin)
const userInfo = computed(() => userStore.userInfo)
const displayName = computed(() => userInfo.value.nickname || '小朋友')
function goLogin() {
  uni.navigateTo({ url: '/pages/login/index' })
}
function handleVerified() {
  gateVisible.value = false
}
function goToReport() {
  uni.navigateTo({ url: '/pages/parent-report/index' })
}
function goToUnitList() {
  uni.navigateTo({ url: '/pages/unit-list/index' })
}
function goToPrivacy() {
  uni.navigateTo({ url: '/pages/privacy/index' })
}
function goToAgreement() {
  uni.navigateTo({ url: '/pages/agreement/index' })
}
function showDailyCharPicker() {
  uni.showActionSheet({
    itemList: ['3 字/天', '5 字/天', '8 字/天'],
    success: ({ tapIndex }) => {
      learnStore.dailyCharCount = [3, 5, 8][tapIndex]
    },
  })
}
function showReminderPicker() {
  uni.showActionSheet({
    itemList: ['18:00', '19:00', '20:00', '21:00'],
    success: ({ tapIndex }) => {
      learnStore.reminderTime = ['18:00', '19:00', '20:00', '21:00'][tapIndex]
    },
  })
}
function handleLogout() {
  uni.showModal({ title: '退出登录', content: '未同步的本地学习数据仍会保留。确定退出吗？', success: async ({ confirm }) => {
    if (confirm)
      await tokenStore.logout()
  } })
}
</script>

<style lang="scss" scoped>
@use '../../style/tokens' as *;
.me-page {
  min-height: 100vh;
  padding: $space-4 $page-gutter $space-8;
  background: $paper;
}
.me-header,
.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.me-header {
  padding: $space-3 0 $space-4;
}
.eyebrow,
.summary-kicker {
  display: block;
  color: $ink-muted;
  font-size: $font-label;
}
.title {
  display: block;
  margin-top: $space-1;
  color: $ink-strong;
  font-family: $font-display;
  font-size: 52rpx;
  font-weight: 700;
}
.avatar-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: $touch-target;
  height: $touch-target;
  padding: 0;
  border: 2rpx solid $line;
  border-radius: 50%;
  color: $apricot-dark;
  background: $apricot-soft;
}
.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
.summary-card {
  margin-top: $space-2;
}
.summary-name {
  display: block;
  margin-top: $space-1;
  color: $ink-strong;
  font-size: $font-title;
  font-weight: 700;
}
.metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $space-2;
  margin-top: $space-5;
  padding-top: $space-4;
  border-top: 1rpx solid $line;
  text-align: center;
}
.metric-value {
  display: block;
  color: $apricot-dark;
  font-family: $font-number;
  font-size: 44rpx;
  font-weight: 700;
}
.metric-label {
  display: block;
  margin-top: $space-1;
  color: $ink-muted;
  font-size: $font-caption;
}
.gate-card {
  display: flex;
  align-items: center;
  gap: $space-3;
  margin-top: $space-4;
}
.gate-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  color: $apricot-dark;
  background: $apricot-soft;
}
.gate-copy {
  flex: 1;
}
.gate-title,
.gate-desc {
  display: block;
}
.gate-title {
  color: $ink-strong;
  font-size: $font-body-lg;
  font-weight: 700;
}
.gate-desc {
  margin-top: $space-1;
  color: $ink-muted;
  font-size: $font-label;
}
.child-tip {
  margin-top: $space-3;
  background: $sky-soft;
}
.child-tip__title,
.child-tip__copy {
  display: block;
}
.child-tip__title {
  color: $sky-dark;
  font-weight: 700;
}
.child-tip__copy {
  margin-top: $space-1;
  color: $ink;
  font-size: $font-label;
  line-height: $line-height-body;
}
.section-title {
  margin: $space-6 0 $space-2;
  color: $ink-muted;
  font-size: $font-label;
  font-weight: 700;
}
.menu-card {
  padding: 0;
  overflow: hidden;
}
.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: $touch-target;
  padding: $space-3 $space-4;
  border: 0;
  border-bottom: 1rpx solid $line;
  border-radius: 0;
  color: $ink;
  background: transparent;
  text-align: left;
}
.menu-item:last-child {
  border-bottom: 0;
}
.menu-copy {
  display: flex;
  align-items: center;
  gap: $space-2;
  font-size: $font-body-size;
}
.menu-value {
  color: $ink-muted;
  font-size: $font-label;
}
.menu-item--danger {
  color: $coral-dark;
}
.leave-parent {
  display: block;
  width: 100%;
  min-height: $touch-target;
  margin-top: $space-4;
  border: 0;
  color: $ink-muted;
  background: transparent;
  font-size: $font-label;
}
.gate-layer {
  position: fixed;
  inset: 0;
  z-index: 50;
}
</style>
