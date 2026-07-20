<template>
  <view class="char-card">
    <ChildInstruction :mode="mode" :text="mode.ageGroup === 'early' ? '先看看这个字的故事' : '看看字形和它的小故事'" icon="book" />
    <view class="char-card__origin paper-card">
      <view class="char-card__visual" aria-hidden="true">
        <view class="char-card__visual-line" />
        <text class="char-card__visual-label">字源小故事</text>
      </view>
      <text class="char-card__hanzi">{{ char._id }}</text>
      <view class="char-card__pinyin">
        <button class="char-card__audio" aria-label="播放读音" @click="speakChar">
          <UiIcon name="speaker" :size="36" />
        </button>
        <text v-if="mode.showPinyin" class="char-card__pinyin-text">{{ char.pinyin }}</text>
      </view>
      <text class="char-card__desc">{{ char.teaching?.origin_desc || '这个字从生活里的形状慢慢变成了今天的样子。' }}</text>
    </view>

    <view v-if="displayWords.length && mode.ageGroup !== 'early'" class="char-card__words paper-card">
      <text class="char-card__section-title">生活里的词</text>
      <view class="char-card__word-list">
        <button v-for="word in displayWords" :key="word" class="char-card__word" @click="playWord(word)">
          {{ word }}
        </button>
      </view>
    </view>

    <view class="char-card__actions">
      <button class="paper-button paper-button--secondary" @click="speakChar">
        再看一遍
      </button>
      <button class="paper-button paper-button--primary" @click="handleNext">
        我看懂了
      </button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { Character } from '@/types/character'
import type { UiMode } from '@/types/ui'
import { computed } from 'vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import { speakText } from '@/utils/tts'
import ChildInstruction from './ChildInstruction.vue'

const props = defineProps<{ char: Character, mode: UiMode }>()
const emit = defineEmits<{ next: [] }>()
const displayWords = computed(() => (props.char.example_words ?? []).filter(Boolean).slice(0, 3))
function speakChar() {
  speakText(props.char._id, props.char.pinyin)
}
function playWord(word: string) {
  speakText(word, word)
}
function handleNext() {
  emit('next')
}
</script>

<style lang="scss" scoped>
@use '../../../style/tokens' as *;
.char-card {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  min-height: 100%;
  color: $ink;
}
.char-card__origin {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $space-5 $space-4;
}
.char-card__visual {
  display: flex;
  align-items: center;
  gap: $space-2;
  width: 100%;
  color: $sky-dark;
  font-size: $font-label;
  font-weight: 700;
}
.char-card__visual-line {
  width: 64rpx;
  height: 6rpx;
  border-radius: $radius-pill;
  background: $sky;
}
.char-card__hanzi {
  margin-top: $space-3;
  color: $ink-strong;
  font-family: $font-hanzi;
  font-size: 220rpx;
  line-height: 1;
}
.char-card__pinyin {
  display: flex;
  align-items: center;
  gap: $space-2;
  margin-top: $space-2;
}
.char-card__audio {
  display: flex;
  align-items: center;
  justify-content: center;
  width: $touch-target;
  height: $touch-target;
  margin: 0;
  border: 2rpx solid rgba(93, 173, 226, 0.3);
  border-radius: 50%;
  color: $sky-dark;
  background: $sky-soft;
}
.char-card__audio::after {
  border: 0;
}
.char-card__pinyin-text {
  color: $ink-muted;
  font-size: 44rpx;
  font-weight: 700;
}
.char-card__desc {
  max-width: 620rpx;
  margin-top: $space-3;
  color: $ink-muted;
  font-size: $font-body-size;
  line-height: $line-height-body;
  text-align: center;
}
.char-card__words {
  padding: $space-3;
}
.char-card__section-title {
  color: $ink-muted;
  font-size: $font-label;
  font-weight: 700;
}
.char-card__word-list {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2;
  margin-top: $space-2;
}
.char-card__word {
  min-height: 64rpx;
  margin: 0;
  padding: 0 $space-3;
  border: 2rpx solid $line;
  border-radius: $radius-pill;
  color: $ink;
  background: $surface-soft;
  font-size: $font-body-size;
}
.char-card__word::after {
  border: 0;
}
.char-card__actions {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: $space-3;
  margin-top: auto;
  padding-top: $space-3;
}
</style>
