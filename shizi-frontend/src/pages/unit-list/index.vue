<template>
  <view class="unit-page">
    <view class="page-top-shell">
      <wd-navbar
        :left-arrow="showBack"
        safe-area-inset-top
        custom-class="unit-page-navbar"
        @click-left="handleBack"
      >
        <template #title>
          <UnitPageTabs v-model="activeTab" />
        </template>
      </wd-navbar>
    </view>

    <view class="page-body">
      <LibrarySummaryCard
        :library-name="activeLibraryName"
        :mode="activeTab"
        :summary-items="summaryItems"
        @switch-library="openLibraryPicker"
      />

      <WrongSummaryCard
        v-if="activeTab === 'wrong'"
        :unit-count="wrongStats.unitCount"
        :char-count="wrongStats.charCount"
        :recent-char-count="wrongStats.recentCharCount"
        :primary-weakness="wrongStats.primaryWeakness"
      />

      <view v-if="activeTab === 'wrong' && wrongPendingSections.length > 0" class="wrong-focus-banner">
        <view class="wrong-focus-title">
          优先处理待强化单元
        </view>
        <view class="wrong-focus-desc">
          先完成这些问题单元，再查看已清空内容
        </view>
      </view>

      <view v-if="learnStore.loadingUnitOverview" class="loading-wrap">
        <wd-loading />
      </view>

      <view v-else-if="activeTab === 'unit' && unitStageSections.length === 0" class="inline-empty">
        <view class="inline-empty-title">
          当前字库暂无单元数据
        </view>
      </view>

      <view v-else-if="activeTab === 'wrong' && wrongPendingSections.length === 0 && wrongClearedSections.length === 0" class="inline-empty">
        <view class="inline-empty-title">
          当前没有待强化错字
        </view>
      </view>

      <view v-else class="stage-list">
        <template v-if="activeTab === 'unit'">
          <UnitStageSection
            v-for="stage in unitStageSections"
            :key="stage.id"
            :title="stage.name"
            :units="stage.units"
            mode="unit"
            :highlight-unit-id="highlightUnitId"
            @primary="handleUnitPrimary"
            @secondary="handleUnitSecondary"
          />
        </template>

        <template v-else>
          <UnitStageSection
            v-for="stage in wrongPendingSections"
            :key="stage.id"
            :title="stage.name"
            :units="stage.units"
            mode="wrong"
            :highlight-unit-id="highlightUnitId"
            @primary="handleWrongPrimary"
          />

          <view v-if="wrongClearedSections.length > 0" class="wrong-group">
            <view class="group-title-row">
              <view class="group-title">
                已清空
              </view>
              <view class="group-count">
                {{ clearedUnitCount }} 个单元
              </view>
            </view>

            <wd-collapse v-model="showClearedUnits">
              <wd-collapse-item name="cleared-units" title="查看已清空单元">
                <view class="collapse-list">
                  <UnitStageSection
                    v-for="stage in wrongClearedSections"
                    :key="stage.id"
                    :title="stage.name"
                    :units="stage.units"
                    mode="wrong"
                    :highlight-unit-id="highlightUnitId"
                    @primary="handleWrongPrimary"
                  />
                </view>
              </wd-collapse-item>
            </wd-collapse>
          </view>
        </template>
      </view>
    </view>

    <wd-action-sheet
      v-model="showLibrarySheet"
      :actions="libraryActions"
      title="选择字库"
      @select="handleLibrarySelect"
    />
  </view>
</template>

<script lang="ts" setup>
import LibrarySummaryCard from './components/LibrarySummaryCard.vue'
import UnitPageTabs from './components/UnitPageTabs.vue'
import UnitStageSection from './components/UnitStageSection.vue'
import WrongSummaryCard from './components/WrongSummaryCard.vue'
import { useUnitListPage } from './useUnitListPage'

const props = withDefaults(defineProps<{
  showBack?: boolean
  backUrl?: string
  backIsTab?: boolean
}>(), {
  showBack: false,
  backUrl: '/pages/me/index',
  backIsTab: false,
})

definePage({
  style: {
    navigationBarTitleText: '学习单元',
    navigationStyle: 'custom',
  },
})

const {
  learnStore,
  showLibrarySheet,
  activeTab,
  showClearedUnits,
  highlightUnitId,
  activeLibraryName,
  summaryItems,
  wrongStats,
  unitStageSections,
  wrongPendingSections,
  wrongClearedSections,
  clearedUnitCount,
  libraryActions,
  handleBack,
  openLibraryPicker,
  handleLibrarySelect,
  handleUnitPrimary,
  handleUnitSecondary,
  handleWrongPrimary,
} = useUnitListPage(props)
</script>

<style lang="scss" scoped>
.unit-page {
  --page-bg: #fbfcff;
  --page-bg-accent: rgba(91, 141, 239, 0.08);
  --surface-card: rgba(255, 255, 255, 0.96);
  --surface-card-strong: #ffffff;
  --text-main: #24324a;
  --text-sub: #6e7b91;
  --text-muted: #96a1b3;
  --line-soft: rgba(214, 223, 236, 0.88);
  --shadow-card: 0 10rpx 24rpx rgba(41, 72, 126, 0.06);
  --shadow-soft: 0 6rpx 16rpx rgba(41, 72, 126, 0.04);
  --brand-primary: #5b84e8;
  --brand-primary-soft: rgba(91, 132, 232, 0.1);
  --tone-learning: #5b84e8;
  --tone-ready: #f0a63a;
  --tone-tested: #58b782;
  --tone-wrong: #ea7a59;
  min-height: 100vh;
  background:
    radial-gradient(circle at 0% 0%, var(--page-bg-accent) 0%, rgba(255, 255, 255, 0) 28%),
    linear-gradient(180deg, #f9fbff 0%, var(--page-bg) 22%, #ffffff 100%);
}

.page-top-shell {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  padding-bottom: 12rpx;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(248, 251, 255, 0.96) 62%,
    rgba(244, 248, 255, 0.94) 100%
  );
  backdrop-filter: blur(16rpx);
  box-shadow: 0 4rpx 12rpx rgba(36, 50, 74, 0.04);
}

.page-top-shell::after {
  content: '';
  position: absolute;
  left: 24rpx;
  right: 24rpx;
  bottom: 0;
  height: 2rpx;
  background: rgba(214, 223, 236, 0.7);
  border-radius: 999rpx;
}

.page-body {
  padding: 168rpx 24rpx calc(40rpx + env(safe-area-inset-bottom));
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 96rpx 0;
}

.inline-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80rpx 32rpx;
  border-radius: 24rpx;
  background: var(--surface-card);
  box-shadow: var(--shadow-soft);
  text-align: center;
}

.inline-empty-title {
  font-size: 26rpx;
  line-height: 1.5;
  color: var(--text-sub);
}

.wrong-group {
  margin-bottom: 24rpx;
}

.wrong-focus-banner {
  padding: 20rpx 24rpx;
  margin-bottom: 20rpx;
  border-radius: 20rpx;
  background: rgba(255, 243, 239, 0.92);
  box-shadow: inset 0 0 0 2rpx rgba(255, 229, 223, 0.84);
}

.wrong-focus-title {
  font-size: 24rpx;
  line-height: 1.2;
  font-weight: 700;
  color: #b55f42;
}

.wrong-focus-desc {
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.5;
  color: var(--text-sub);
}

.group-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4rpx 8rpx 16rpx;
}

.group-title {
  font-size: 28rpx;
  line-height: 1.2;
  font-weight: 700;
  color: var(--text-main);
}

.group-count {
  font-size: 22rpx;
  color: var(--text-sub);
}

.collapse-list {
  padding-top: 16rpx;
}

:deep(.unit-page-navbar) {
  background: transparent !important;
  box-shadow: none !important;
}
</style>
