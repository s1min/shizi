<template>
  <div class="complete-container">
    <button class="top-home-entry" @click="goHome">
      <text class="top-home-icon">←</text>
      <text class="top-home-text">回首页</text>
    </button>

    <div class="hero-section">
      <div class="stars-area">
        <div
          v-for="i in 3"
          :key="i"
          class="star"
          :class="{ active: i <= stars }"
          :style="{ animationDelay: `${(i - 1) * 0.2}s` }"
        >
          {{ i <= stars ? '⭐' : '☆' }}
        </div>
      </div>

      <div class="title">
        {{ pageTitle }}
      </div>
      <div class="subtitle">
        {{ unitName }}
      </div>
    </div>

    <div class="stats-card">
      <div class="stat-item">
        <div class="stat-val">
          {{ learnedChars.length }}
        </div>
        <div class="stat-label">
          学会汉字
        </div>
      </div>
      <div v-if="showResultStats" class="stat-divider" />
      <div v-if="showResultStats" class="stat-item">
        <div class="stat-val">
          {{ accuracyText }}
        </div>
        <div class="stat-label">
          正确率
        </div>
      </div>
      <div v-if="showResultStats" class="stat-divider" />
      <div v-if="showResultStats" class="stat-item">
        <div class="stat-val">
          {{ timeText }}
        </div>
        <div class="stat-label">
          用时
        </div>
      </div>
      <div class="stat-divider" />
      <div class="stat-item">
        <div class="stat-val">
          {{ learnStore.streakDays }}
        </div>
        <div class="stat-label">
          连续天数
        </div>
      </div>
    </div>

    <div class="char-wall">
      <div v-for="ch in learnedChars" :key="ch" class="char-tag">
        {{ ch }}
      </div>
    </div>

    <div class="total-hint">
      累计识字 {{ learnStore.learnedCount }} 个
    </div>

    <div v-if="showPosterActions" class="action-area">
      <button class="btn-share" @click="generatePoster">
        <text>生成打卡海报</text>
      </button>
      <!-- #ifdef MP-WEIXIN -->
      <button class="btn-share-wx" open-type="share">
        <text>分享给好友</text>
      </button>
      <!-- #endif -->
      <button class="btn-primary" @click="goNext">
        {{ hasNextUnit ? '下一单元' : '返回首页' }}
      </button>
    </div>

    <div v-else class="action-area">
      <button class="btn-primary" @click="goToUnitTest">
        开始单元小测
      </button>
      <button class="btn-secondary" @click="goHome">
        稍后再测
      </button>
    </div>

    <!-- 海报弹窗 -->
    <div v-if="showPoster" class="poster-mask" @click="closePoster">
      <div class="poster-wrapper" @click.stop>
        <!-- #ifdef MP-WEIXIN -->
        <canvas id="posterCanvas" type="2d" class="poster-canvas" />
        <!-- #endif -->
        <!-- #ifdef H5 -->
        <canvas ref="posterCanvasH5" class="poster-canvas" width="600" height="900" />
        <!-- #endif -->
        <div class="poster-actions">
          <!-- #ifdef MP-WEIXIN -->
          <button class="btn-save" @click="savePoster">
            保存到相册
          </button>
          <!-- #endif -->
          <!-- #ifdef H5 -->
          <button class="btn-save" @click="savePosterH5">
            保存图片
          </button>
          <!-- #endif -->
          <button class="btn-close-poster" @click="closePoster">
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { computed, getCurrentInstance, nextTick, onMounted, ref } from 'vue'
import { useLearnStore } from '@/store'

definePage({
  style: {
    navigationBarTitleText: '学习完成',
    navigationStyle: 'custom',
  },
})

const instance = getCurrentInstance()
const learnStore = useLearnStore()

const unitId = ref('')
const unitName = ref('')
const stars = ref(0)
const learnedChars = ref<string[]>([])
const accuracyVal = ref(0)
const timeSeconds = ref(0)
const showPoster = ref(false)
const hasNextUnit = ref(false)

const accuracyText = computed(() => `${accuracyVal.value}%`)
const timeText = computed(() => {
  const m = Math.floor(timeSeconds.value / 60)
  const s = timeSeconds.value % 60
  return m > 0 ? `${m}分${s}秒` : `${s}秒`
})
const showResultStats = computed(() => accuracyVal.value > 0 || timeSeconds.value > 0)
const showPosterActions = computed(() => showResultStats.value)
const pageTitle = computed(() => showResultStats.value ? '单元完成！' : '本单元学习完成')

const todayStr = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
})

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const opts = currentPage?.options || {}
  unitId.value = opts.unitId || ''
  accuracyVal.value = Number.parseInt(opts.accuracy) || 0
  timeSeconds.value = Number.parseInt(opts.time) || 0
  stars.value = Number.parseInt(opts.stars) || 0

  const allUnits = learnStore.library.stages.flatMap((s: any) => s.units)
  const unit = allUnits.find((u: any) => u.id === unitId.value)

  if (unit) {
    unitName.value = unit.name
    learnedChars.value = unit.chars
    if (!opts.stars) {
      stars.value = learnStore.getUnitProgress(unitId.value).stars || 0
    }
    // 检查是否有下一单元
    const idx = allUnits.findIndex((u: any) => u.id === unitId.value)
    hasNextUnit.value = idx < allUnits.length - 1
  }
})

// 微信分享
onShareAppMessage(() => ({
  title: `我在趣字宝学会了「${learnedChars.value.join('、')}」，累计识字 ${learnStore.learnedCount} 个！`,
  path: '/pages/home/index',
}))

onShareTimeline(() => ({
  title: `趣字宝打卡：今天学会了 ${learnedChars.value.length} 个汉字！`,
}))

function goHome() {
  uni.switchTab({ url: '/pages/home/index' })
}

function goNext() {
  if (hasNextUnit.value) {
    // 跳转到下一单元的学习页
    const allUnits = learnStore.library.stages.flatMap((s: any) => s.units)
    const idx = allUnits.findIndex((u: any) => u.id === unitId.value)
    const nextUnit = allUnits[idx + 1]
    if (nextUnit) {
      uni.redirectTo({ url: `/subpkg-learning/learn/index?unitId=${nextUnit.id}` })
      return
    }
  }
  goHome()
}

function goToUnitTest() {
  if (!unitId.value)
    return

  uni.redirectTo({ url: `/subpkg-learning/learn/unit-test?unitId=${unitId.value}` })
}

// ─── 海报绘制 ─────────────────────────────────────────────────────
const posterCanvasH5 = ref<HTMLCanvasElement | null>(null)

function generatePoster() {
  showPoster.value = true
  nextTick(() => {
    // #ifdef MP-WEIXIN
    drawPosterWx()
    // #endif
    // #ifdef H5
    drawPosterH5()
    // #endif
  })
}

function closePoster() {
  showPoster.value = false
}

/** 绘制海报内容（通用逻辑） */
function drawPosterContent(ctx: any, w: number, h: number, dpr: number) {
  const scale = dpr

  // 背景渐变
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#FFF9E6')
  grad.addColorStop(0.5, '#FFFFFF')
  grad.addColorStop(1, '#FFF3E0')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // 顶部装饰条
  ctx.fillStyle = '#F5A623'
  ctx.fillRect(0, 0, w, 8 * scale)

  // 标题
  ctx.fillStyle = '#333'
  ctx.font = `bold ${32 * scale}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('趣字宝 · 学习打卡', w / 2, 60 * scale)

  // 日期
  ctx.fillStyle = '#999'
  ctx.font = `${16 * scale}px sans-serif`
  ctx.fillText(todayStr.value, w / 2, 90 * scale)

  // 星星
  const starY = 130 * scale
  const starSize = 40 * scale
  ctx.font = `${starSize}px sans-serif`
  ctx.textAlign = 'center'
  for (let i = 0; i < 3; i++) {
    const x = w / 2 + (i - 1) * 50 * scale
    ctx.fillText(i < stars.value ? '⭐' : '☆', x, starY)
  }

  // 单元名
  ctx.fillStyle = '#333'
  ctx.font = `bold ${22 * scale}px sans-serif`
  ctx.fillText(unitName.value, w / 2, 175 * scale)

  // 统计卡片背景
  const cardY = 200 * scale
  const cardH = 80 * scale
  const cardMargin = 30 * scale
  ctx.fillStyle = '#fff'
  roundRect(ctx, cardMargin, cardY, w - cardMargin * 2, cardH, 12 * scale)
  ctx.fill()
  ctx.strokeStyle = '#f0f0f0'
  ctx.lineWidth = 1 * scale
  ctx.stroke()

  // 统计数据
  const statItems = [
    { val: `${learnedChars.value.length}`, label: '学会汉字' },
    { val: accuracyText.value, label: '正确率' },
    { val: timeText.value, label: '用时' },
    { val: `${learnStore.streakDays}`, label: '连续天数' },
  ]
  const statW = (w - cardMargin * 2) / statItems.length
  statItems.forEach((item, i) => {
    const cx = cardMargin + statW * i + statW / 2
    ctx.fillStyle = '#F5A623'
    ctx.font = `bold ${20 * scale}px sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(item.val, cx, cardY + 35 * scale)
    ctx.fillStyle = '#999'
    ctx.font = `${12 * scale}px sans-serif`
    ctx.fillText(item.label, cx, cardY + 58 * scale)

    // 分隔线
    if (i < statItems.length - 1) {
      ctx.strokeStyle = '#eee'
      ctx.lineWidth = 1 * scale
      ctx.beginPath()
      ctx.moveTo(cardMargin + statW * (i + 1), cardY + 15 * scale)
      ctx.lineTo(cardMargin + statW * (i + 1), cardY + cardH - 15 * scale)
      ctx.stroke()
    }
  })

  // 汉字展示区
  const charsY = 310 * scale
  ctx.fillStyle = '#666'
  ctx.font = `${14 * scale}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('本次学会的汉字', w / 2, charsY)

  const charSize = 48 * scale
  const charGap = 12 * scale
  const charsPerRow = Math.min(learnedChars.value.length, 6)
  const totalCharsW = charsPerRow * charSize + (charsPerRow - 1) * charGap
  const startX = (w - totalCharsW) / 2

  learnedChars.value.forEach((ch, i) => {
    const row = Math.floor(i / 6)
    const col = i % 6
    const x = startX + col * (charSize + charGap)
    const y = charsY + 20 * scale + row * (charSize + charGap)

    // 字卡背景
    ctx.fillStyle = '#FFF9E6'
    roundRect(ctx, x, y, charSize, charSize, 8 * scale)
    ctx.fill()
    ctx.strokeStyle = '#F5A623'
    ctx.lineWidth = 1 * scale
    ctx.stroke()

    // 汉字
    ctx.fillStyle = '#333'
    ctx.font = `bold ${28 * scale}px 'KaiTi', 'STKaiti', serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(ch, x + charSize / 2, y + charSize / 2)
  })

  // 底部
  ctx.textBaseline = 'alphabetic'
  const bottomY = h - 40 * scale
  ctx.fillStyle = '#bbb'
  ctx.font = `${13 * scale}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(`累计识字 ${learnStore.learnedCount} 个`, w / 2, bottomY)

  ctx.fillStyle = '#ddd'
  ctx.font = `${11 * scale}px sans-serif`
  ctx.fillText('趣字宝 — 让识字变得有趣', w / 2, h - 16 * scale)
}

/** 圆角矩形辅助 */
function roundRect(ctx: any, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

// #ifdef MP-WEIXIN
let posterCanvas: any = null

function drawPosterWx() {
  const query = uni.createSelectorQuery().in(instance)
  query.select('#posterCanvas')
    .fields({ node: true, size: true }, (res: any) => {
      if (!res?.node)
        return
      posterCanvas = res.node
      const dpr = uni.getSystemInfoSync().pixelRatio || 2
      const cssW = res.width || 300
      const cssH = res.height || 450
      posterCanvas.width = cssW * dpr
      posterCanvas.height = cssH * dpr
      const ctx = posterCanvas.getContext('2d')
      drawPosterContent(ctx, posterCanvas.width, posterCanvas.height, dpr)
    })
    .exec()
}

function savePoster() {
  if (!posterCanvas)
    return
  uni.canvasToTempFilePath(
    {
      canvasId: 'posterCanvas',
      canvas: posterCanvas,
      success: (res) => {
        uni.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            uni.showToast({ title: '已保存到相册', icon: 'success' })
          },
          fail: () => {
            uni.showToast({ title: '保存失败，请授权相册权限', icon: 'none' })
          },
        })
      },
    },
    instance?.proxy,
  )
}
// #endif

// #ifdef H5
function drawPosterH5() {
  const canvas = posterCanvasH5.value
  if (!canvas)
    return
  const ctx = canvas.getContext('2d')
  if (!ctx)
    return
  drawPosterContent(ctx, canvas.width, canvas.height, 1)
}

function savePosterH5() {
  const canvas = posterCanvasH5.value
  if (!canvas)
    return
  const link = document.createElement('a')
  link.download = `趣字宝打卡_${todayStr.value}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
// #endif
</script>

<style lang="scss" scoped>
.complete-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #fffaf0 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: calc(env(safe-area-inset-top) + 24rpx) 32rpx 40rpx;
  box-sizing: border-box;
}

.top-home-entry {
  align-self: flex-start;
  min-height: 56rpx;
  padding: 0;
  margin-bottom: 32rpx;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.top-home-icon {
  font-size: 24rpx;
  line-height: 1;
  color: #b7aa96;
}

.top-home-text {
  font-size: 28rpx;
  line-height: 1;
  color: #b7aa96;
}

.hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-top: 40rpx;
  margin-bottom: 44rpx;
}

.stars-area {
  display: flex;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.star {
  font-size: 80rpx;
  opacity: 0.3;
  transition: all 0.3s;

  &.active {
    opacity: 1;
    animation: star-pop 0.5s ease-out both;
  }
}

@keyframes star-pop {
  0% {
    opacity: 0;
    transform: scale(1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.title {
  font-size: 56rpx;
  font-weight: bold;
  color: #4a3728;
  margin-bottom: 16rpx;
}

.subtitle {
  font-size: 32rpx;
  color: #7a6a58;
}

.stats-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.96);
  border: 2rpx solid rgba(245, 166, 35, 0.08);
  border-radius: 28rpx;
  padding: 44rpx;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 8rpx 24rpx rgba(245, 166, 35, 0.08);
  margin-bottom: 40rpx;
}

.stat-item {
  text-align: center;
}

.stat-val {
  font-size: 48rpx;
  font-weight: bold;
  color: #f5a623;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.stat-divider {
  width: 1px;
  height: 60rpx;
  background: #eee;
}

.char-wall {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  justify-content: center;
  margin-bottom: 24rpx;
}

.char-tag {
  width: 88rpx;
  height: 88rpx;
  background: #fff9e6;
  border: 2rpx solid #f5a623;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  font-family: 'KaiTi', 'STKaiti', serif;
  font-weight: bold;
  color: #333;
}

.total-hint {
  font-size: 26rpx;
  color: #bbb;
  margin-bottom: 40rpx;
}

.action-area {
  margin-top: auto;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
}

.btn-share {
  flex: 1;
  min-width: 40%;
  height: 84rpx;
  background: #fff;
  border: 2rpx solid #f0d9b5;
  border-radius: 28rpx;
  font-size: 28rpx;
  color: #9a815f;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-share-wx {
  flex: 1;
  min-width: 40%;
  height: 84rpx;
  background: #fff;
  border: 2rpx solid #d5edda;
  border-radius: 28rpx;
  font-size: 28rpx;
  color: #4d9d64;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  flex: 1;
  min-width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #f5a623, #e8941a);
  border: none;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  box-shadow: 0 12rpx 28rpx rgba(245, 166, 35, 0.28);
}

.poster-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.poster-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.poster-canvas {
  width: 600rpx;
  height: 900rpx;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.3);
}

.poster-actions {
  display: flex;
  gap: 24rpx;
}

.btn-save {
  padding: 20rpx 48rpx;
  background: linear-gradient(135deg, #f5a623, #e8941a);
  border: none;
  border-radius: 40rpx;
  font-size: 30rpx;
  font-weight: bold;
  color: #fff;
}

.btn-close-poster {
  padding: 20rpx 48rpx;
  background: rgba(255, 255, 255, 0.3);
  border: 2rpx solid rgba(255, 255, 255, 0.6);
  border-radius: 40rpx;
  font-size: 30rpx;
  color: #fff;
}
</style>
