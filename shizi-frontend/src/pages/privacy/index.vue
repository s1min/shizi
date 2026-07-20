<template>
  <PaperPage class="legal-page" hide-tabbar>
    <SecondaryPageNavbar
      title="隐私政策"
      fallback-url="/pages/me/index"
      :fallback-is-tab="true"
    />

    <view class="legal-page__content paper-content-width">
      <text class="legal-page__title">
        趣字宝隐私政策
      </text>
      <text class="legal-page__date">
        更新日期：2026年3月10日
      </text>

      <div class="section">
        <div class="section-title">
          引言
        </div>
        <div class="section-text">
          趣字宝（以下简称"我们"）非常重视用户的隐私保护。本隐私政策旨在向您说明我们如何收集、使用、存储和保护您的个人信息。请您在使用我们的服务前，仔细阅读并了解本政策。
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          一、我们收集的信息
        </div>
        <div class="section-text">
          1. 微信登录信息：当您使用微信登录时，我们会获取您的微信昵称、头像等公开信息，用于创建和识别您的账号。
        </div>
        <div class="section-text">
          2. 学习数据：包括您的学习进度、答题记录、复习计划等，用于提供个性化的学习体验和进度同步。
        </div>
        <div class="section-text">
          3. 宝宝信息：您主动填写的宝宝昵称、年龄段等信息，用于推荐适合的学习内容。
        </div>
        <div class="section-text">
          4. 设备信息：设备型号、操作系统版本等基本信息，用于优化应用兼容性。
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          二、信息的使用
        </div>
        <div class="section-text">
          我们收集的信息仅用于以下目的：
        </div>
        <div class="section-text">
          1. 提供、维护和改进我们的服务；
        </div>
        <div class="section-text">
          2. 同步您的学习进度，确保多设备数据一致；
        </div>
        <div class="section-text">
          3. 根据学习情况提供个性化的复习计划；
        </div>
        <div class="section-text">
          4. 分析和改善产品体验。
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          三、信息的存储与保护
        </div>
        <div class="section-text">
          1. 您的数据存储在安全的云服务器上，我们采用行业标准的加密技术保护数据传输和存储安全。
        </div>
        <div class="section-text">
          2. 我们会定期备份数据，防止数据丢失。
        </div>
        <div class="section-text">
          3. 我们不会将您的个人信息出售、出租或以其他方式提供给第三方。
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          四、信息的共享
        </div>
        <div class="section-text">
          除以下情况外，我们不会与任何第三方共享您的个人信息：
        </div>
        <div class="section-text">
          1. 获得您的明确同意；
        </div>
        <div class="section-text">
          2. 根据法律法规的要求或政府主管部门的强制性要求；
        </div>
        <div class="section-text">
          3. 为维护我们的合法权益所必需。
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          五、未成年人保护
        </div>
        <div class="section-text">
          我们的产品主要面向儿童用户，我们高度重视未成年人信息保护。我们建议家长或监护人指导未成年人使用本应用，并在家长或监护人的同意下提供相关信息。
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          六、您的权利
        </div>
        <div class="section-text">
          1. 您可以随时查看和修改您的个人信息；
        </div>
        <div class="section-text">
          2. 您可以删除您的账号及相关数据；
        </div>
        <div class="section-text">
          3. 您可以选择不登录，以本地模式使用应用（学习数据仅保存在本地）。
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          七、政策更新
        </div>
        <div class="section-text">
          我们可能会不时更新本隐私政策。更新后的政策将在应用内公布，建议您定期查阅。
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          八、联系我们
        </div>
        <div class="section-text">
          如果您对本隐私政策有任何疑问，请通过应用内的反馈功能联系我们。
        </div>
      </div>

      <view class="legal-page__danger-zone">
        <view class="legal-page__danger-heading">
          数据删除说明
        </view>
        <view class="legal-page__danger-copy">
          家长可在“我的 - 隐私与数据”中申请删除账号及相关学习记录。删除后通常无法恢复，请在确认前先完成必要的数据备份。
        </view>
      </view>
    </view>
  </PaperPage>
</template>

<script lang="ts" setup>
import SecondaryPageNavbar from '@/components/navigation/SecondaryPageNavbar.vue'
import PaperPage from '@/components/ui/PaperPage.vue'

definePage({
  style: {
    navigationBarTitleText: '隐私政策',
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

.legal-page__danger-zone {
  margin-top: $space-7;
  padding: $space-4;
  border: 2rpx solid rgba(233, 120, 105, 0.4);
  border-radius: $radius-card;
  background: $coral-soft;
}

.legal-page__danger-heading {
  color: $coral-dark;
  font-size: $font-body-lg;
  font-weight: 700;
}

.legal-page__danger-copy {
  margin-top: $space-2;
  color: $ink;
  font-size: $font-body-size;
  line-height: 1.75;
}
</style>
