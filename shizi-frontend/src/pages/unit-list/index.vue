<template>
  <view class="unit-page" :class="pageThemeClass">
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

const previewTheme = 'cream'
const pageThemeClass = `theme-${previewTheme}`

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
  --page-bg: #fffdf9;
  --page-bg-accent: rgba(255, 214, 153, 0.14);
  --surface-card: rgba(255, 255, 255, 0.92);
  --surface-card-strong: #ffffff;
  --text-main: #463224;
  --text-sub: #8b7766;
  --text-muted: #b5a698;
  --line-soft: rgba(226, 214, 201, 0.72);
  --shadow-card: 0 12rpx 32rpx rgba(92, 66, 42, 0.08);
  --shadow-soft: 0 8rpx 20rpx rgba(92, 66, 42, 0.05);
  --brand-primary: #5b8def;
  --brand-primary-soft: rgba(91, 141, 239, 0.12);
  --tone-learning: #5b8def;
  --tone-ready: #f2a93b;
  --tone-tested: #5fbc8a;
  --tone-wrong: #ee7f5d;
  min-height: 100vh;
  background:
    radial-gradient(circle at 0% 0%, var(--page-bg-accent) 0%, rgba(255, 255, 255, 0) 32%),
    linear-gradient(180deg, #fffaf4 0%, var(--page-bg) 22%, #ffffff 100%);
}

.unit-page.theme-modern {
  --page-bg: #fbfcff;
  --page-bg-accent: rgba(91, 141, 239, 0.1);
  --surface-card: rgba(255, 255, 255, 0.96);
  --text-main: #24324a;
  --text-sub: #6e7b91;
  --text-muted: #96a1b3;
  --line-soft: rgba(214, 223, 236, 0.9);
  --shadow-card: 0 10rpx 28rpx rgba(41, 72, 126, 0.08);
  --shadow-soft: 0 6rpx 18rpx rgba(41, 72, 126, 0.05);
}

.page-top-shell {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  padding-bottom: 16rpx;
  background: linear-gradient(
    135deg,
    rgba(255, 248, 238, 0.96) 0%,
    rgba(255, 243, 228, 0.92) 48%,
    rgba(241, 247, 255, 0.96) 100%
  );
  backdrop-filter: blur(16rpx);
  box-shadow: 0 6rpx 18rpx rgba(110, 84, 55, 0.06);
}

.unit-page.theme-modern .page-top-shell {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.96) 0%,
    rgba(247, 250, 255, 0.94) 58%,
    rgba(240, 246, 255, 0.96) 100%
  );
  box-shadow: 0 6rpx 18rpx rgba(41, 72, 126, 0.05);
}

.page-body {
  padding: 176rpx 24rpx calc(40rpx + env(safe-area-inset-bottom));
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
  padding: 88rpx 32rpx;
  border-radius: 28rpx;
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
  margin-bottom: 32rpx;
}

.wrong-focus-banner {
  padding: 24rpx;
  margin-bottom: 24rpx;
  border-radius: 24rpx;
  background: rgba(255, 243, 238, 0.94);
  box-shadow: inset 0 0 0 2rpx rgba(255, 227, 219, 0.92);
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
  padding: 4rpx 8rpx 20rpx;
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
