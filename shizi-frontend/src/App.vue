<script setup lang="ts">
import { onHide, onLaunch, onShow } from '@dcloudio/uni-app'
import { navigateToInterceptor } from '@/router/interceptor'
import { useLearnStore } from '@/store/learn'
import { useTokenStore } from '@/store/token'
import { initTTS } from '@/utils/tts'

onLaunch((options) => {
  console.log('App.vue onLaunch', options)
  // 初始化TTS插件
  initTTS()
})
onShow((options) => {
  console.log('App.vue onShow', options)
  // 处理直接进入页面路由的情况：如h5直接输入路由、微信小程序分享后进入等
  // https://github.com/unibest-tech/unibest/issues/192
  if (options?.path) {
    navigateToInterceptor.invoke({ url: `/${options.path}`, query: options.query })
  }
  else {
    navigateToInterceptor.invoke({ url: '/' })
  }
  // 已登录时从云端拉取最新进度
  const tokenStore = useTokenStore()
  if (tokenStore.hasLogin) {
    const learnStore = useLearnStore()
    learnStore.syncFromCloud()
  }
})
onHide(() => {
  console.log('App Hide')
  // 已登录时推送学习进度到云端
  const tokenStore = useTokenStore()
  if (tokenStore.hasLogin) {
    const learnStore = useLearnStore()
    learnStore.syncToCloud()
  }
})
</script>

<style lang="scss">

</style>
