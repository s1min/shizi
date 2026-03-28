<template>
  <div class="login-container">
    <div class="logo-area">
      <div class="logo-icon">
        趣
      </div>
      <div class="app-name">
        趣字宝
      </div>
      <div class="app-desc">
        让识字变得有趣
      </div>
    </div>

    <!-- #ifdef MP-WEIXIN -->
    <div class="action-area">
      <button class="btn-wx-login" :loading="loading" @click="handleWxLogin">
        微信一键登录
      </button>
      <div class="login-tip">
        登录后可云端同步学习进度
      </div>
    </div>
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <div class="action-area">
      <div class="trial-card">
        <div class="trial-title">
          体验模式
        </div>
        <div class="trial-desc">
          H5 环境暂不支持微信登录，学习数据将保存在本地
        </div>
      </div>
      <button class="btn-trial" @click="handleTrialMode">
        开始体验
      </button>
    </div>
    <!-- #endif -->

    <div class="skip-area" @click="handleSkip">
      <text class="skip-text">暂不登录</text>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePage({
  style: {
    navigationBarTitleText: '登录',
    navigationStyle: 'custom',
  },
})

import { ref } from 'vue'
import { useTokenStore } from '@/store'

const loading = ref(false)

// #ifdef MP-WEIXIN
async function handleWxLogin() {
  if (loading.value)
    return
  loading.value = true
  try {
    const result = await useTokenStore().wxLogin()
    if (result.needOnboarding) {
      uni.redirectTo({ url: '/pages/onboarding/index' })
    }
    else {
      goBack()
    }
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
  if (pages.length > 1) {
    uni.navigateBack()
  }
  else {
    uni.switchTab({ url: '/pages/home/index' })
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff9e6 0%, #ffffff 50%, #fff3e0 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 200rpx 60rpx 80rpx;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 120rpx;
}

.logo-icon {
  width: 160rpx;
  height: 160rpx;
  background: linear-gradient(135deg, #f5a623, #e8941a);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80rpx;
  font-weight: bold;
  color: #fff;
  font-family: 'KaiTi', 'STKaiti', serif;
  box-shadow: 0 12rpx 32rpx rgba(245, 166, 35, 0.3);
  margin-bottom: 32rpx;
}

.app-name {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
}

.app-desc {
  font-size: 28rpx;
  color: #999;
}

.action-area {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.btn-wx-login {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #07c160, #06ad56);
  border: none;
  border-radius: 48rpx;
  font-size: 34rpx;
  font-weight: bold;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(7, 193, 96, 0.3);
}

.login-tip {
  font-size: 24rpx;
  color: #bbb;
}

.trial-card {
  width: 100%;
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.trial-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #f5a623;
  margin-bottom: 16rpx;
}

.trial-desc {
  font-size: 26rpx;
  color: #999;
  line-height: 1.5;
}

.btn-trial {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #f5a623, #e8941a);
  border: none;
  border-radius: 48rpx;
  font-size: 34rpx;
  font-weight: bold;
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(245, 166, 35, 0.4);
}

.skip-area {
  margin-top: 60rpx;
  padding: 20rpx;
}

.skip-text {
  font-size: 28rpx;
  color: #bbb;
}
</style>

