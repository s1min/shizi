<template>
  <PaperPage class="login-page">
    <button class="login-back" aria-label="返回" @click="goBack">
      <UiIcon name="arrow-left" :size="36" />
    </button>
    <view class="login-hero">
      <view class="book-mark">
        <text>趣</text>
      </view>
      <text class="login-title">趣字宝</text>
      <text class="login-subtitle">每天认识几个字，慢慢记住它们</text>
      <view class="book-illustration">
        <UiIcon name="book" :size="96" />
      </view>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <view class="login-actions">
      <button class="paper-login-button" :loading="loading" @click="handleWxLogin">
        微信一键登录
      </button>
      <text class="login-hint">登录后可云端同步学习进度</text>
    </view>
    <!-- #endif -->
    <!-- #ifdef H5 -->
    <view class="login-actions">
      <PaperCard class="trial-card">
        <text class="trial-title">体验模式</text><text class="trial-desc">当前数据仅保存在本机，登录后可跨设备同步。</text>
      </PaperCard>
      <PaperButton @click="handleTrialMode">
        开始体验
      </PaperButton>
    </view>
    <!-- #endif -->
    <button class="login-skip" @click="handleSkip">
      暂不登录
    </button>
    <text class="login-legal">继续使用即代表家长已阅读并同意 <navigator url="/pages/privacy/index">隐私政策</navigator> 和 <navigator url="/pages/agreement/index">用户协议</navigator></text>
  </PaperPage>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import PaperButton from '@/components/ui/PaperButton.vue'
import PaperCard from '@/components/ui/PaperCard.vue'
import PaperPage from '@/components/ui/PaperPage.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import { useTokenStore } from '@/store'

definePage({ style: { navigationBarTitleText: '登录', navigationStyle: 'custom' } })
const loading = ref(false)
// #ifdef MP-WEIXIN
async function handleWxLogin() {
  if (loading.value)
    return
  loading.value = true
  try {
    const result = await useTokenStore().wxLogin()
    if (result.needOnboarding)
      uni.redirectTo({ url: '/pages/onboarding/index' })
    else
      goBack()
  }
  catch (e) {
    console.error('微信登录失败', e)
  }
  finally {
    loading.value = false
  }
}
// #endif
// #ifdef H5
function handleTrialMode() {
  goBack()
}
// #endif
function handleSkip() {
  goBack()
}
function goBack() {
  const pages = getCurrentPages()
  if (pages.length > 1)
    uni.navigateBack()
  else
    uni.switchTab({ url: '/pages/home/index' })
}
</script>

<style lang="scss" scoped>
@use '../../style/tokens' as *;
.login-page {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  padding-top: calc(env(safe-area-inset-top) + 24rpx);
}
.login-back {
  width: $touch-target;
  height: $touch-target;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 2rpx solid $line;
  border-radius: 50%;
  color: $ink-muted;
  background: $surface;
}
.login-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 56rpx;
}
.book-mark {
  width: 160rpx;
  height: 160rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40rpx 40rpx 16rpx 40rpx;
  color: $surface;
  background: $apricot;
  box-shadow: $shadow-raised;
  font-family: $font-hanzi;
  font-size: 88rpx;
}
.login-title {
  margin-top: 28rpx;
  color: $ink-strong;
  font-family: $font-display;
  font-size: 56rpx;
  font-weight: 700;
}
.login-subtitle {
  margin-top: 12rpx;
  color: $ink-muted;
  font-size: $font-body-size;
}
.book-illustration {
  width: 240rpx;
  height: 144rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 48rpx;
  border-bottom: 4rpx solid $paper-grid;
  border-radius: 20rpx;
  color: $apricot-dark;
  background: $apricot-soft;
  transform: rotate(-3deg);
}
.login-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
  margin-top: 96rpx;
}
.paper-login-button {
  width: 100%;
  min-height: $touch-target;
  border: 0;
  border-radius: $radius-pill;
  color: white;
  background: #07c160;
  font-size: $font-body-lg;
  font-weight: 700;
}
.login-hint,
.login-legal {
  color: $ink-muted;
  font-size: $font-caption;
}
.trial-card {
  width: 100%;
  text-align: center;
}
.trial-title,
.trial-desc {
  display: block;
}
.trial-title {
  color: $apricot-dark;
  font-size: $font-body-lg;
  font-weight: 700;
}
.trial-desc {
  margin-top: 12rpx;
  color: $ink-muted;
  font-size: $font-label;
  line-height: 1.5;
}
.login-skip {
  min-height: $touch-target;
  margin-top: 28rpx;
  border: 0;
  color: $ink-muted;
  background: transparent;
  font-size: $font-body-size;
}
.login-legal {
  margin-top: auto;
  padding: 40rpx 0 24rpx;
  text-align: center;
  line-height: 1.6;
}
.login-legal navigator {
  display: inline;
  color: $apricot-dark;
}
</style>
