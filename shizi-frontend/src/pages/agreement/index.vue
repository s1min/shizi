<template>
  <PaperPage class="legal-page" hide-tabbar>
    <SecondaryPageNavbar
      title="用户协议"
      fallback-url="/pages/me/index"
      :fallback-is-tab="true"
    />

    <view class="legal-page__content paper-content-width">
      <text class="legal-page__title">
        趣字宝用户协议
      </text>
      <text class="legal-page__date">
        更新日期：2026年3月10日
      </text>

      <div class="section">
        <div class="section-title">
          一、服务说明
        </div>
        <div class="section-text">
          趣字宝是一款面向学龄前及小学低年级儿童的汉字学习应用，通过字源动画、跟读互动、描红练习和趣味测验等方式帮助儿童识字。
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          二、账号注册与使用
        </div>
        <div class="section-text">
          1. 您可以通过微信授权登录使用本应用，也可以选择不登录以本地模式体验。
        </div>
        <div class="section-text">
          2. 登录后，您的学习进度将同步至云端，支持多设备使用。
        </div>
        <div class="section-text">
          3. 您应妥善保管自己的账号信息，因账号保管不善导致的损失由您自行承担。
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          三、用户行为规范
        </div>
        <div class="section-text">
          1. 您应合法、合规地使用本应用提供的服务。
        </div>
        <div class="section-text">
          2. 不得利用本应用从事任何违法违规活动。
        </div>
        <div class="section-text">
          3. 不得对本应用进行反向工程、反编译或其他破解行为。
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          四、知识产权
        </div>
        <div class="section-text">
          1. 本应用中的所有内容（包括但不限于文字、图片、音频、动画、软件代码）均受知识产权法律保护。
        </div>
        <div class="section-text">
          2. 未经我们书面许可，您不得复制、修改、传播本应用中的任何内容。
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          五、免责声明
        </div>
        <div class="section-text">
          1. 本应用提供的学习内容仅供参考，不构成专业教育建议。
        </div>
        <div class="section-text">
          2. 因不可抗力、网络故障等原因导致的服务中断，我们不承担责任，但会尽力恢复服务。
        </div>
        <div class="section-text">
          3. 本地模式下的数据丢失（如清除缓存、卸载应用），我们不承担责任。
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          六、协议变更
        </div>
        <div class="section-text">
          我们有权根据需要修改本协议。修改后的协议将在应用内公布，您继续使用本应用即视为同意修改后的协议。
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          七、适用法律与争议解决
        </div>
        <div class="section-text">
          本协议适用中华人民共和国法律。因本协议引起的争议，双方应友好协商解决；协商不成的，任何一方均可向有管辖权的人民法院提起诉讼。
        </div>
      </div>
    </view>
  </PaperPage>
</template>

<script lang="ts" setup>
import SecondaryPageNavbar from '@/components/navigation/SecondaryPageNavbar.vue'
import PaperPage from '@/components/ui/PaperPage.vue'

definePage({
  style: {
    navigationBarTitleText: '用户协议',
    navigationStyle: 'custom',
  },
})
</script>

<style lang="scss" scoped>
@use '../../style/tokens' as *;

.legal-page__content {
  box-sizing: border-box;
  padding-top: $space-5;
  padding-bottom: $space-8;
}

.legal-page__title,
.legal-page__date {
  display: block;
  text-align: center;
}

.legal-page__title {
  color: $ink-strong;
  font-family: $font-display;
  font-size: $font-title;
  font-weight: 700;
  line-height: $line-height-title;
}

.legal-page__date {
  margin-top: $space-2;
  margin-bottom: $space-7;
  color: $ink-muted;
  font-size: $font-label;
}

.section {
  margin-bottom: $space-6;
}

.section-title {
  margin-bottom: $space-3;
  color: $ink-strong;
  font-size: $font-title;
  font-weight: 700;
  line-height: $line-height-title;
}

.section-text {
  margin-bottom: $space-2;
  color: $ink;
  font-size: $font-body-size;
  line-height: 1.75;
}
</style>
