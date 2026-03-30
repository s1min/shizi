<template>
  <div class="onboarding-container">
    <div class="top-skip-entry" @click="handleSkip">
      稍后再选
    </div>

    <div class="header">
      <div class="step-badge">
        1/1
      </div>
      <div class="title">
        选择学习内容
      </div>
      <div class="subtitle">
        为宝宝选择一个字库开始学习吧
      </div>
    </div>

    <div class="library-list">
      <div
        v-for="lib in libraries"
        :key="lib.id"
        class="library-card"
        :class="[{ active: selectedId === lib.id }, { disabled: !lib.available }]"
        @click="lib.available && (selectedId = lib.id)"
      >
        <div class="lib-icon">
          {{ lib.icon }}
        </div>
        <div class="lib-info">
          <div class="lib-name">
            {{ lib.name }}
          </div>
          <div class="lib-desc">
            {{ lib.desc }}
          </div>
        </div>
        <div v-if="selectedId === lib.id && lib.available" class="lib-check">
          ✓
        </div>
        <div v-else-if="!lib.available" class="lib-coming">
          即将上线
        </div>
      </div>
    </div>

    <div class="action-area">
      <button class="btn-start" :disabled="!selectedId || saving" @click="handleConfirm">
        {{ saving ? '保存中...' : '开始学习' }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { updateChild } from '@/api/user'
import { useLearnStore } from '@/store'

definePage({
  style: {
    navigationBarTitleText: '选择字库',
    navigationStyle: 'custom',
  },
})

const selectedId = ref('lib_1a_upper')
const saving = ref(false)

const libraries = [
  { id: 'lib_1a_upper', name: '一年级上册', desc: '人教版语文，100个常用汉字', icon: '📘', available: true },
  { id: 'lib_1a_lower', name: '一年级下册', desc: '人教版语文，157个常用汉字', icon: '📗', available: false },
]

function applySelectedLibrary(libraryId: string) {
  const learnStore = useLearnStore()
  learnStore.currentLibraryId = libraryId
}

function goHome() {
  uni.switchTab({ url: '/pages/home/index' })
}

function handleSkip() {
  applySelectedLibrary(selectedId.value)
  goHome()
}

async function handleConfirm() {
  if (!selectedId.value || saving.value)
    return
  saving.value = true
  try {
    await updateChild({ current_library: selectedId.value })
  }
  catch (e) {
    console.warn('保存字库选择失败', e)
  }
  applySelectedLibrary(selectedId.value)
  saving.value = false
  goHome()
}
</script>

<style lang="scss" scoped>
.onboarding-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff9e6 0%, #ffffff 50%, #fff3e0 100%);
  padding: calc(env(safe-area-inset-top) + 24rpx) 60rpx 80rpx;
  display: flex;
  flex-direction: column;
}

.top-skip-entry {
  align-self: flex-end;
  font-size: 24rpx;
  color: #b7aa96;
  padding: 8rpx 0;
  margin-bottom: 48rpx;
}

.header {
  text-align: center;
  margin-bottom: 80rpx;
}

.step-badge {
  display: inline-block;
  background: #f5a623;
  color: #fff;
  font-size: 22rpx;
  font-weight: bold;
  padding: 6rpx 24rpx;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
}

.title {
  font-size: 44rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #999;
}

.library-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.library-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  border: 3rpx solid #eee;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  transition: all 0.2s;

  &.disabled {
    opacity: 0.6;
  }

  &.active {
    border-color: #f5a623;
    background: #fffbea;
    box-shadow: 0 4rpx 20rpx rgba(245, 166, 35, 0.15);
  }
}

.lib-icon {
  font-size: 56rpx;
  flex-shrink: 0;
}

.lib-info {
  flex: 1;
}

.lib-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #4a3728;
  margin-bottom: 8rpx;
}

.lib-desc {
  font-size: 24rpx;
  color: #999;
}

.lib-check {
  width: 48rpx;
  height: 48rpx;
  background: #f5a623;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: bold;
  flex-shrink: 0;
}

.lib-coming {
  font-size: 22rpx;
  color: #bbb;
  flex-shrink: 0;
}

.action-area {
  padding-top: 60rpx;
}

.btn-start {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #f5a623, #e8941a);
  border: none;
  border-radius: 48rpx;
  font-size: 34rpx;
  font-weight: bold;
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(245, 166, 35, 0.4);

  &:disabled {
    opacity: 0.5;
  }
}
</style>
