<script setup lang="ts">
// i-carbon-code
import { customTabbarEnable, needHideNativeTabbar, tabbarCacheEnable } from './config'
import { tabbarList, tabbarStore } from './store'
import TabbarItem from './TabbarItem.vue'

// #ifdef MP-WEIXIN
// 将自定义节点设置成虚拟的（去掉自定义组件包裹层），更加接近Vue组件的表现，能更好的使用flex属性
defineOptions({
  virtualHost: true,
})
// #endif

function handleClick(index: number) {
  // 点击原来的不做操作
  if (index === tabbarStore.curIdx) {
    return
  }
  const url = tabbarList[index].pagePath
  tabbarStore.setCurIdx(index)
  if (tabbarCacheEnable) {
    uni.switchTab({ url })
  }
  else {
    uni.navigateTo({ url })
  }
}
// #ifndef MP-WEIXIN || MP-ALIPAY
// 因为有了 custom:true， 微信里面不需要多余的hide操作
onLoad(() => {
  // 解决原生 tabBar 未隐藏导致有2个 tabBar 的问题
  needHideNativeTabbar
  && uni.hideTabBar({
    fail(err) {
      console.log('hideTabBar fail: ', err)
    },
    success(res) {
      // console.log('hideTabBar success: ', res)
    },
  })
})
// #endif

// #ifdef MP-ALIPAY
onMounted(() => {
  // 解决支付宝自定义tabbar 未隐藏导致有2个 tabBar 的问题; 注意支付宝很特别，需要在 onMounted 钩子调用
  customTabbarEnable // 另外，支付宝里面，只要是 customTabbar 都需要隐藏
  && uni.hideTabBar({
    fail(err) {
      console.log('hideTabBar fail: ', err)
    },
    success(res) {
      // console.log('hideTabBar success: ', res)
    },
  })
})
// #endif
</script>

<template>
  <view v-if="customTabbarEnable && !tabbarStore.isHidden" class="paper-tabbar-wrap">
    <view class="border-and-fixed" @touchmove.stop.prevent>
      <view class="paper-tabbar">
        <view
          v-for="(item, index) in tabbarList" :key="index"
          class="paper-tabbar__slot"
          @click="handleClick(index)"
        >
          <TabbarItem :item="item" :index="index" />
        </view>
      </view>

      <view class="pb-safe" />
    </view>
  </view>
</template>

<style scoped lang="scss">
.border-and-fixed {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  border-top: 1rpx solid var(--line, #eadbcb);
  background: var(--paper, #fff8f0);
  box-shadow: 0 -8rpx 24rpx rgba(112, 75, 34, 0.06);
  box-sizing: border-box;
}

.paper-tabbar-wrap {
  height: 112rpx;
  padding-bottom: env(safe-area-inset-bottom);
}

.paper-tabbar {
  display: flex;
  height: 112rpx;
  align-items: stretch;
  padding: 8rpx 20rpx 0;
  box-sizing: border-box;
}

.paper-tabbar__slot {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: stretch;
  justify-content: center;
}
</style>
