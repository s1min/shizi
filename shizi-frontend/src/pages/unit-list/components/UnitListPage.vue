<template>
  <view class="unit-page">
    <wd-navbar
      :left-arrow="showBack"
      safe-area-inset-top
      @click-left="handleBack"
    >
      <template #title>
        <UnitPageTabs v-model="activeTab" />
      </template>
    </wd-navbar>

    <view class="page-body">
      <LibrarySummaryCard
        :library-name="activeLibraryName"
        :mode="activeTab"
        :summary-items="summaryItems"
        @switch-library="openLibraryPicker"
      />

      <StatusLegendBar :mode="activeTab" />

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
import LibrarySummaryCard from './LibrarySummaryCard.vue'
import StatusLegendBar from './StatusLegendBar.vue'
import UnitPageTabs from './UnitPageTabs.vue'
import UnitStageSection from './UnitStageSection.vue'
import WrongSummaryCard from './WrongSummaryCard.vue'
import { useUnitListPage } from '../useUnitListPage'

const props = withDefaults(defineProps<{
  showBack?: boolean
  backUrl?: string
  backIsTab?: boolean
}>(), {
  showBack: false,
  backUrl: '/pages/me/index',
  backIsTab: false,
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
  --bg-page: #fff9f2;
  --bg-card: #ffffff;
  --text-main: #4a3728;
  --text-sub: #8c7b6b;
  --text-muted: #b3a596;
  --line-soft: #efe7dc;
  --status-not-started: #c9cdd6;
  --status-learning: #5dade2;
  --status-ready: #f5a623;
  --status-tested: #68b984;
  --status-wrong: #ef7d57;
  --bg-soft-blue: #eef7fd;
  --bg-soft-orange: #fff6e8;
  --bg-soft-green: #eef9f1;
  --bg-soft-red: #fff1eb;
  --shadow-card: 0 10rpx 26rpx rgba(74, 55, 40, 0.06);
  min-height: 100vh;
  background:
    radial-gradient(circle at 12% 10%, rgba(255, 232, 200, 0.28) 0%, rgba(255, 232, 200, 0) 34%),
    linear-gradient(180deg, var(--bg-page) 0%, #ffffff 100%);
}

.page-body {
  padding: 24rpx 24rpx calc(40rpx + env(safe-area-inset-bottom));
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
  padding: 84rpx 32rpx;
  background: rgba(255, 255, 255, 0.94);
  border-radius: 24rpx;
  box-shadow: var(--shadow-card);
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
  background: rgba(255, 244, 239, 0.92);
  box-shadow: inset 0 0 0 2rpx rgba(255, 227, 219, 0.88);
}

.wrong-focus-title {
  font-size: 24rpx;
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
  justify-content: space-between;
  align-items: center;
  padding: 4rpx 8rpx 18rpx;
}

.group-title {
  font-size: 28rpx;
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
</style>
