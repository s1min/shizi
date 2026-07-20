<template>
  <PaperPage class="onboarding-page" hide-tabbar>
    <view class="stepper">
      <view v-for="(item, index) in steps" :key="item.key" class="step" :class="{ active: index === stepIndex, done: index < stepIndex }">
        <view class="step-dot">
          <UiIcon v-if="index < stepIndex" name="check" :size="22" /><text v-else>{{ index + 1 }}</text>
        </view>
        <text>{{ item.label }}</text>
      </view>
    </view>

    <view v-if="step === 'age'" class="step-panel">
      <text class="panel-title">宝宝现在几岁？</text><text class="panel-subtitle">我们会推荐合适的学习方式</text>
      <view class="choice-list">
        <PaperCard v-for="item in ageOptions" :key="item.value" interactive class="choice-card" :class="{ selected: selectedAge === item.value }" @click="selectedAge = item.value">
          <UiIcon :name="item.icon" :size="46" /><view class="choice-copy">
            <text class="choice-title">{{ item.label }}</text><text class="choice-desc">{{ item.desc }}</text>
          </view><UiIcon v-if="selectedAge === item.value" name="check" :size="34" />
        </PaperCard>
      </view>
    </view>

    <view v-else-if="step === 'library'" class="step-panel">
      <text class="panel-title">选择学习内容</text><text class="panel-subtitle">已根据年龄为你标出推荐内容</text>
      <view class="choice-list">
        <PaperCard v-for="lib in libraries" :key="lib.id" interactive class="choice-card" :class="{ selected: selectedId === lib.id, disabled: !lib.available }" @click="lib.available && (selectedId = lib.id)">
          <UiIcon name="book" :size="46" /><view class="choice-copy">
            <view class="choice-title-row">
              <text class="choice-title">{{ lib.name }}</text><text v-if="lib.recommended" class="recommended">推荐</text>
            </view><text class="choice-desc">{{ lib.desc }}</text>
          </view><text v-if="!lib.available" class="coming">即将上线</text><UiIcon v-else-if="selectedId === lib.id" name="check" :size="34" />
        </PaperCard>
      </view>
    </view>

    <view v-else-if="step === 'plan'" class="step-panel">
      <text class="panel-title">每天认识几个字？</text><text class="panel-subtitle">少量、稳定，比一次学很多更重要</text>
      <view class="count-grid">
        <button v-for="count in [2, 3, 5]" :key="count" class="count-card" :class="{ selected: dailyCount === count }" @click="dailyCount = count">
          <text class="count-value">{{ count }}</text><text>个字/天</text>
        </button>
      </view>
      <PaperCard class="plan-note">
        <UiIcon name="info" :size="32" /><text>{{ planHint }}</text>
      </PaperCard>
    </view>

    <view v-else class="handoff-panel">
      <view class="handoff-mark">
        <UiIcon name="check" :size="64" />
      </view><text class="panel-title">设置完成</text><text class="panel-subtitle">把手机交给孩子，开始今天的学习吧</text>
    </view>

    <view class="onboarding-actions">
      <PaperButton v-if="stepIndex > 0 && step !== 'done'" variant="ghost" @click="goPrevious">
        上一步
      </PaperButton>
      <PaperButton :loading="saving" :disabled="!canContinue" @click="goNext">
        {{ actionText }}
      </PaperButton>
    </view>
  </PaperPage>
</template>

<script lang="ts" setup>
import type { AgeGroup, UiIconName } from '@/types/ui'
import { computed, ref } from 'vue'
import { updateChild } from '@/api/user'
import PaperButton from '@/components/ui/PaperButton.vue'
import PaperCard from '@/components/ui/PaperCard.vue'
import PaperPage from '@/components/ui/PaperPage.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import { useLearnStore, useUiStore } from '@/store'

definePage({ style: { navigationBarTitleText: '学习设置', navigationStyle: 'custom' } })
type Step = 'age' | 'library' | 'plan' | 'done'
const steps = [{ key: 'age', label: '年龄' }, { key: 'library', label: '字库' }, { key: 'plan', label: '计划' }]
const step = ref<Step>('age')
const selectedAge = ref<AgeGroup>('preschool')
const selectedId = ref('lib_1a_upper')
const dailyCount = ref(3)
const saving = ref(false)
const ageOptions: { value: AgeGroup, label: string, desc: string, icon: UiIconName }[] = [
  { value: 'early', label: '3-4 岁', desc: '图片和声音为主，描红可跳过', icon: 'play' },
  { value: 'preschool', label: '5-6 岁', desc: '认读、听音和描红一起练', icon: 'book' },
  { value: 'school', label: '7-8 岁', desc: '同步单元，加入拼音和简单语境', icon: 'book' },
]
const libraries = computed(() => [
  { id: 'lib_preschool', name: '学前启蒙', desc: '从生活中常见的汉字开始', available: false, recommended: selectedAge.value !== 'school' },
  { id: 'lib_1a_upper', name: '一年级上册', desc: '人教版语文同步内容', available: true, recommended: selectedAge.value === 'school' },
])
const stepIndex = computed(() => step.value === 'age' ? 0 : step.value === 'library' ? 1 : step.value === 'plan' ? 2 : 3)
const canContinue = computed(() => step.value === 'age' ? Boolean(selectedAge.value) : step.value === 'library' ? Boolean(selectedId.value) : true)
const actionText = computed(() => step.value === 'age' || step.value === 'library' ? '下一步' : step.value === 'plan' ? '完成设置' : '进入今天的学习')
const planHint = computed(() => selectedAge.value === 'early' ? '建议每天 2 个字，用时约 5 分钟' : selectedAge.value === 'school' ? '建议每天 3-5 个字，用时约 10 分钟' : '建议每天 3 个字，用时约 8 分钟')
function goPrevious() {
  step.value = step.value === 'plan' ? 'library' : 'age'
}
async function goNext() {
  if (step.value === 'age') {
    useUiStore().setAgeGroup(selectedAge.value)
    step.value = 'library'
    return
  }
  if (step.value === 'library') {
    step.value = 'plan'
    return
  }
  if (step.value === 'done') {
    uni.switchTab({ url: '/pages/home/index' })
    return
  }
  saving.value = true
  try {
    await updateChild({ current_library: selectedId.value })
    const learnStore = useLearnStore()
    learnStore.currentLibraryId = selectedId.value
    learnStore.dailyCharCount = dailyCount.value
    step.value = 'done'
  }
  catch (e) {
    console.warn('保存学习设置失败', e)
    step.value = 'done'
  }
  finally {
    saving.value = false
  }
}
</script>

<style lang="scss" scoped>
@use '../../style/tokens' as *;
.onboarding-page {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  padding-top: calc(env(safe-area-inset-top) + 32rpx);
}
.stepper {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}
.step {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  color: $ink-light;
  font-size: $font-caption;
}
.step-dot {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid $line;
  border-radius: 50%;
  background: $surface;
}
.step.active {
  color: $apricot-dark;
  font-weight: 700;
}
.step.active .step-dot {
  border-color: $apricot;
  background: $apricot-soft;
}
.step.done {
  color: $mint-dark;
}
.step.done .step-dot {
  border-color: $mint;
  background: $mint-soft;
}
.step-panel,
.handoff-panel {
  margin-top: 72rpx;
}
.panel-title,
.panel-subtitle {
  display: block;
  text-align: center;
}
.panel-title {
  color: $ink-strong;
  font-family: $font-display;
  font-size: $font-display-md;
  font-weight: 700;
}
.panel-subtitle {
  margin-top: 12rpx;
  color: $ink-muted;
  font-size: $font-body-size;
}
.choice-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 48rpx;
}
.choice-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
}
.choice-card.selected {
  border-color: $apricot;
  background: $apricot-soft;
}
.choice-card.disabled {
  opacity: 0.52;
}
.choice-copy {
  min-width: 0;
  flex: 1;
}
.choice-title,
.choice-desc {
  display: block;
}
.choice-title {
  color: $ink-strong;
  font-size: $font-body-lg;
  font-weight: 700;
}
.choice-desc {
  margin-top: 6rpx;
  color: $ink-muted;
  font-size: $font-label;
}
.choice-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.recommended {
  padding: 4rpx 12rpx;
  border-radius: $radius-pill;
  color: $apricot-dark;
  background: $apricot-soft;
  font-size: $font-caption;
}
.coming {
  color: $ink-light;
  font-size: $font-caption;
}
.count-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin-top: 56rpx;
}
.count-card {
  min-height: 180rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  border: 2rpx solid $line;
  border-radius: $radius-card;
  color: $ink-muted;
  background: $surface;
}
.count-card.selected {
  border-color: $apricot;
  color: $apricot-dark;
  background: $apricot-soft;
}
.count-value {
  font-family: $font-number;
  font-size: 56rpx;
  font-weight: 700;
}
.plan-note {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 32rpx;
  color: $sky-dark;
  background: $sky-soft;
  font-size: $font-label;
}
.handoff-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.handoff-mark {
  width: 144rpx;
  height: 144rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
  border-radius: 50%;
  color: $mint-dark;
  background: $mint-soft;
}
.onboarding-actions {
  display: flex;
  gap: 16rpx;
  margin-top: auto;
  padding: 48rpx 0 calc(32rpx + env(safe-area-inset-bottom));
}
.onboarding-actions :deep(.paper-button--ghost) {
  width: 34%;
}
.onboarding-actions :deep(.paper-button--primary) {
  flex: 1;
}
</style>
