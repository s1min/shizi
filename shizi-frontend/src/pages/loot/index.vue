<template>
  <PaperPage class="atlas-page">
    <view class="atlas-header">
      <text class="eyebrow">汉字学习册</text>
      <text class="title">汉字图鉴</text>
      <text class="summary">已掌握 {{ masteredCount }} · 已接触 {{ exposedCount }} / {{ totalCount }}</text>
      <PaperProgress :percent="progressPercent" />
    </view>

    <view class="filter-row" role="tablist" aria-label="图鉴筛选">
      <button v-for="item in filters" :key="item.value" class="filter-button" :class="{ active: filter === item.value }" @click="filter = item.value">
        {{ item.label }}
      </button>
    </view>

    <UiEmptyState v-if="filteredItems.length === 0" title="这里还没有字" description="完成一节学习后，汉字会出现在图鉴里。" action-text="开始今天的学习" @action="startLearning" />
    <view v-else class="char-grid">
      <button v-for="item in filteredItems" :key="item.charId" class="char-tile" :class="`char-tile--${item.status}`" :aria-label="`${item.charId}，${statusLabel(item.status)}`" @click="item.char && showDetail(item.char)">
        <text class="char-glyph">{{ item.charId }}</text>
        <text class="char-status">{{ statusLabel(item.status) }}</text>
      </button>
    </view>

    <view v-if="detailChar" class="detail-layer" @click="detailChar = null">
      <view class="detail-sheet" @click.stop>
        <button class="detail-close" aria-label="关闭字详情" @click="detailChar = null">
          <UiIcon name="close" :size="36" />
        </button>
        <text class="detail-kicker">字详情</text>
        <text class="detail-char">{{ detailChar._id }}</text>
        <text class="detail-pinyin">{{ detailChar.pinyin }}</text>
        <view class="detail-line">
          <text>状态</text><text>{{ statusLabel(getStatus(detailChar._id)) }}</text>
        </view>
        <view v-if="detailChar.example_words?.length" class="word-row">
          <text class="detail-label">组词</text><view class="word-list">
            <text v-for="word in detailChar.example_words.slice(0, 4)" :key="word" class="word-chip">{{ word }}</text>
          </view>
        </view>
        <view class="detail-line">
          <text>下次复习</text><text>{{ nextReviewLabel(detailChar._id) }}</text>
        </view>
        <PaperButton variant="review" @click="replayOrigin">
          再看一遍字源
        </PaperButton>
      </view>
    </view>
  </PaperPage>
</template>

<script lang="ts" setup>
import type { Character } from '@/types/character'
import type { CharacterStatus } from '@/types/ui'
import { computed, ref } from 'vue'
import PaperButton from '@/components/ui/PaperButton.vue'
import PaperPage from '@/components/ui/PaperPage.vue'
import PaperProgress from '@/components/ui/PaperProgress.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import { useLearnStore } from '@/store'
import { getCharacterStatus } from '@/utils/ui-mode'

definePage({ style: { navigationBarTitleText: '图鉴', navigationStyle: 'custom' } })

type AtlasFilter = 'all' | 'mastered' | 'needs_review'
const learnStore = useLearnStore()
const filter = ref<AtlasFilter>('all')
const detailChar = ref<Character | null>(null)
const filters: { value: AtlasFilter, label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'mastered', label: '已掌握' },
  { value: 'needs_review', label: '待巩固' },
]

const allItems = computed(() => {
  const ids = learnStore.library.stages.flatMap(stage => stage.units).flatMap(unit => unit.chars)
  return ids.map(charId => ({ charId, char: learnStore.charMap.get(charId), status: getCharacterStatus(learnStore.charRecords[charId]) }))
})
const totalCount = computed(() => allItems.value.length)
const masteredCount = computed(() => allItems.value.filter(item => item.status === 'mastered' || item.status === 'stable').length)
const exposedCount = computed(() => allItems.value.filter(item => item.status !== 'unseen').length)
const progressPercent = computed(() => totalCount.value ? masteredCount.value / totalCount.value * 100 : 0)
const filteredItems = computed(() => allItems.value.filter((item) => {
  if (filter.value === 'mastered')
    return item.status === 'mastered' || item.status === 'stable'
  if (filter.value === 'needs_review')
    return item.status === 'needs_review' || item.status === 'emerging'
  return true
}))

function getStatus(charId: string): CharacterStatus {
  return getCharacterStatus(learnStore.charRecords[charId])
}
function statusLabel(status: CharacterStatus) {
  return ({ unseen: '未接触', exposed: '已接触', emerging: '待巩固', needs_review: '待巩固', mastered: '已掌握', stable: '稳定' } as Record<CharacterStatus, string>)[status]
}
function nextReviewLabel(charId: string) {
  const at = learnStore.charRecords[charId]?.nextReviewAt
  if (!at)
    return '完成学习后安排'
  const days = Math.max(0, Math.ceil((at - Date.now()) / 86400000))
  return days === 0 ? '今天' : `${days} 天后`
}
function showDetail(char: Character) {
  detailChar.value = char
}
function replayOrigin() {
  if (!detailChar.value)
    return
  const charId = detailChar.value._id
  detailChar.value = null
  uni.navigateTo({ url: `/subpkg-learning/learn/index?unitId=replay&charId=${charId}` })
}
function startLearning() {
  uni.switchTab({ url: '/pages/home/index' })
}
</script>

<style lang="scss" scoped>
@use '../../style/tokens' as *;
.atlas-page {
  min-height: 100vh;
  padding: $space-4 $page-gutter $space-8;
  background: $paper;
}
.atlas-header {
  padding: $space-4 0 $space-5;
}
.eyebrow {
  display: block;
  color: $ink-muted;
  font-size: $font-label;
}
.title {
  display: block;
  margin-top: $space-1;
  color: $ink-strong;
  font-family: $font-display;
  font-size: 56rpx;
  font-weight: 700;
}
.summary {
  display: block;
  margin: $space-2 0 $space-4;
  color: $ink;
  font-size: $font-body-size;
}
.filter-row {
  display: flex;
  gap: $space-2;
  margin-bottom: $space-4;
}
.filter-button {
  min-height: $touch-target;
  padding: 0 $space-4;
  border: 2rpx solid $line;
  border-radius: $radius-pill;
  color: $ink-muted;
  background: $surface;
  font-size: $font-body-size;
}
.filter-button.active {
  border-color: $sky;
  color: $sky-dark;
  background: $sky-soft;
  font-weight: 700;
}
.char-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: $space-2;
}
.char-tile {
  min-height: 156rpx;
  padding: $space-2;
  border: 2rpx solid $line;
  border-radius: $radius-card;
  color: $ink;
  background: $surface;
  box-shadow: $shadow-card;
}
.char-tile--mastered,
.char-tile--stable {
  border-color: rgba(130, 199, 133, 0.55);
  background: $mint-soft;
}
.char-tile--needs_review,
.char-tile--emerging {
  border-color: rgba(233, 120, 105, 0.55);
  background: $coral-soft;
}
.char-glyph {
  display: block;
  color: $ink-strong;
  font-family: $font-hanzi;
  font-size: 64rpx;
  line-height: 1.15;
}
.char-status {
  display: block;
  margin-top: $space-1;
  color: $ink-muted;
  font-size: $font-caption;
}
.detail-layer {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: flex-end;
  background: $overlay;
}
.detail-sheet {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  padding: $space-6 $page-gutter calc($space-5 + env(safe-area-inset-bottom));
  border-radius: $radius-sheet $radius-sheet 0 0;
  background: $surface;
}
.detail-close {
  position: absolute;
  top: $space-2;
  right: $space-2;
  width: $touch-target;
  height: $touch-target;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: $ink-muted;
}
.detail-kicker {
  display: block;
  color: $ink-muted;
  font-size: $font-label;
}
.detail-char {
  display: block;
  margin-top: $space-1;
  color: $ink-strong;
  font-family: $font-hanzi;
  font-size: 144rpx;
  line-height: 1;
  text-align: center;
}
.detail-pinyin {
  display: block;
  margin: $space-2 0 $space-4;
  color: $sky-dark;
  font-size: 36rpx;
  text-align: center;
}
.detail-line {
  display: flex;
  justify-content: space-between;
  padding: $space-3 0;
  border-top: 1rpx solid $line;
  color: $ink;
  font-size: $font-body-size;
}
.word-row {
  padding: $space-3 0;
  border-top: 1rpx solid $line;
}
.detail-label {
  display: block;
  margin-bottom: $space-2;
  color: $ink-muted;
  font-size: $font-label;
}
.word-list {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2;
}
.word-chip {
  padding: $space-1 $space-2;
  border-radius: $radius-pill;
  color: $ink;
  background: $apricot-soft;
  font-size: $font-label;
}
</style>
