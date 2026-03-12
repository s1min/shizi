<template>
  <div class="tracing-practice">
    <!-- 汉字展示区 -->
    <div class="char-header">
      <div class="char-preview">
        {{ char._id }}
      </div>
      <div class="char-info">
        <div class="pinyin">
          {{ char.pinyin }}
        </div>
        <div class="stroke-count">
          {{ char.strokes }} 画
        </div>
      </div>
    </div>

    <!-- 描红/笔顺区域 -->
    <div class="tracing-area">
      <div class="grid-container">
        <!-- 田字格背景 -->
        <div class="grid-bg">
          <div class="grid-line horizontal" />
          <div class="grid-line vertical" />
        </div>

        <!-- #ifdef H5 -->
        <div
          :id="`hanzi-writer-${char._id}`"
          ref="writerContainer"
          class="hanzi-writer-container"
        />
        <!-- #endif -->

        <!-- #ifdef MP-WEIXIN -->
        <!-- Canvas 2D 新 API（笔顺动画 + 描红） -->
        <canvas
          id="traceCanvas"
          type="2d"
          class="trace-canvas"
          disable-scroll
          @touchstart.stop.prevent="onTouchStart"
          @touchmove.stop.prevent="onTouchMove"
          @touchend.stop.prevent="onTouchEnd"
        />
        <!-- #endif -->
      </div>
    </div>

    <!-- 状态提示 -->
    <div class="status-bar">
      <!-- #ifdef MP-WEIXIN -->
      <text v-if="quizMode" class="status-quiz">
        请按笔顺描写（第 {{ currentStrokeIndex + 1 }} / {{ char.strokes }} 笔）
      </text>
      <text v-else-if="isAnimating" class="status-anim">笔顺示范中...</text>
      <text v-else class="status-idle">点击「示范」查看笔顺，或点击「测试」开始描红</text>
      <!-- #endif -->
    </div>

    <!-- 操作按钮 -->
    <div class="action-bar">
      <button class="btn-action btn-clear" @click="clearCanvas">
        <text class="btn-icon">🗑️</text>
        <text>清除</text>
      </button>
      <button class="btn-action btn-demo" :disabled="isAnimating" @click="playStrokeDemo">
        <text class="btn-icon">{{ isAnimating ? '⏸️' : '▶️' }}</text>
        <text>{{ isAnimating ? '播放中' : '示范' }}</text>
      </button>
      <button v-if="!quizMode" class="btn-action btn-quiz" @click="startQuizMode">
        <text class="btn-icon">✍️</text>
        <text>测试</text>
      </button>
      <button v-if="quizMode" class="btn-action btn-next-stroke" @click="confirmStroke">
        <text class="btn-icon">✓</text>
        <text>下一笔</text>
      </button>
    </div>

    <!-- 练习次数提示 -->
    <div class="practice-hint">
      已练习 {{ practiceCount }} 次
      <text v-if="practiceCount >= 2" class="hint-done">✓ 完成</text>
    </div>

    <!-- 下一步按钮 -->
    <button
      v-if="practiceCount >= 1"
      class="btn-continue"
      @click="handleNext"
    >
      {{ practiceCount >= 2 ? '继续下一步' : '跳过练习' }}
    </button>
  </div>
</template>

<script lang="ts" setup>
import type { Character } from '@/types/character'
// #ifdef H5
import HanziWriter from 'hanzi-writer'
import { getCurrentInstance, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

import { loadFullCharData } from '@/utils/stroke-loader'
// #endif

const props = defineProps<{
  char: Character
}>()

const emit = defineEmits<{
  next: []
}>()

// 完整汉字数据（含笔画路径），按需加载
const fullChar = ref<Character>(props.char)

const practiceCount = ref(0)
const isAnimating = ref(false)
const quizMode = ref(false)

// #ifdef H5
let writer: HanziWriter | null = null
const writerContainer = ref<HTMLElement | null>(null)

function initHanziWriter() {
  nextTick(() => {
    const containerId = `hanzi-writer-${props.char._id}`
    const container = document.getElementById(containerId)
    if (!container)
      return
    container.innerHTML = ''
    writer = HanziWriter.create(containerId, props.char._id, {
      width: 250,
      height: 250,
      padding: 5,
      showOutline: true,
      showCharacter: true,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 150,
      strokeColor: '#333',
      outlineColor: '#DDD',
      drawingColor: '#333',
      drawingWidth: 6,
      showHintAfterMisses: 2,
      highlightOnComplete: true,
      highlightColor: '#F5A623',
      charDataLoader: (char: string) => {
        return fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@latest/${char}.json`)
          .then(res => res.json())
      },
    })
  })
}

function playStrokeDemo() {
  if (!writer || isAnimating.value)
    return
  isAnimating.value = true
  writer.animateCharacter({
    onComplete: () => {
      isAnimating.value = false
      practiceCount.value++
    },
  })
}

function startQuizMode() {
  if (!writer)
    return
  quizMode.value = true
  writer.quiz({
    onMistake: (strokeData: any) => console.log('错误笔画:', strokeData.strokeNum),
    onCorrectStroke: (strokeData: any) => console.log('正确笔画:', strokeData.strokeNum),
    onComplete: (summaryData: any) => {
      quizMode.value = false
      practiceCount.value++
      if (summaryData.totalMistakes === 0) {
        uni.showToast({ title: '太棒了！全对！', icon: 'success' })
      }
    },
  })
}

function clearCanvas() {
  if (writer) {
    writer.cancelQuiz()
    quizMode.value = false
    initHanziWriter()
  }
}

onMounted(async () => {
  const full = await loadFullCharData(props.char._id)
  if (full)
    fullChar.value = full
  initHanziWriter()
})
watch(() => props.char._id, async () => {
  const full = await loadFullCharData(props.char._id)
  if (full)
    fullChar.value = full
  initHanziWriter()
})
onUnmounted(() => { writer = null })
// #endif

// #ifdef MP-WEIXIN
// ─── Canvas 2D 新 API ───────────────────────────────────────────────
// 在 setup 阶段立即获取 instance，避免异步回调中 getCurrentInstance() 返回 null
const instance = getCurrentInstance()
// makemeahanzi 坐标系：1000×1000，Y 轴朝上（左下角为原点）
// Canvas 坐标系：Y 轴朝下，需要做镜像变换：y' = canvasSize - y

let canvas: any = null
let ctx: any = null
let canvasSize = 0 // 实际像素尺寸（含 dpr）
let dpr = 1

// 描红状态
let isDrawing = false
let lastX = 0
let lastY = 0
const canDraw = ref(false)
const currentStrokeIndex = ref(0)
// 当前笔画的用户轨迹点
let currentStrokePath: Array<[number, number]> = []

// ─── 坐标转换 ───────────────────────────────────────────────────────
// makemeahanzi → Canvas 像素坐标
function toCanvasCoord(mx: number, my: number): [number, number] {
  const scale = canvasSize / 1000
  return [mx * scale, (900 - my) * scale] // Y 轴翻转，900 是 makemeahanzi 字形上边界
}

// ─── SVG Path 轮廓绘制（fill） ──────────────────────────────────────
// 将 makemeahanzi SVG path 轮廓构建到当前 ctx path 上（不 fill/stroke，供 clip 或外部调用）
function buildPathOnCtx(pathStr: string) {
  const cmds = pathStr.match(/[MLQCZA][^MLQCZA]*/gi) || []
  for (const cmd of cmds) {
    const type = cmd[0].toUpperCase()
    const nums = cmd.slice(1).trim().split(/[\s,]+/).filter(Boolean).map(Number)
    if (type === 'M') {
      const [x, y] = toCanvasCoord(nums[0], nums[1])
      ctx.moveTo(x, y)
    }
    else if (type === 'L') {
      const [x, y] = toCanvasCoord(nums[0], nums[1])
      ctx.lineTo(x, y)
    }
    else if (type === 'Q') {
      const [cx, cy] = toCanvasCoord(nums[0], nums[1])
      const [ex, ey] = toCanvasCoord(nums[2], nums[3])
      ctx.quadraticCurveTo(cx, cy, ex, ey)
    }
    else if (type === 'C') {
      const [c1x, c1y] = toCanvasCoord(nums[0], nums[1])
      const [c2x, c2y] = toCanvasCoord(nums[2], nums[3])
      const [ex, ey] = toCanvasCoord(nums[4], nums[5])
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, ex, ey)
    }
    else if (type === 'Z') {
      ctx.closePath()
    }
  }
}

// 填充绘制一个完整笔画
function drawStrokeFill(pathStr: string, color: string) {
  if (!ctx)
    return
  ctx.beginPath()
  buildPathOnCtx(pathStr)
  ctx.fillStyle = color
  ctx.fill()
}

// ─── Median 中心线采样 ──────────────────────────────────────────────
// median 是 [[x,y], [x,y], ...] 的折线，在相邻点之间插值得到更平滑的点序列
function sampleMedian(median: number[][], steps = 16): Array<[number, number]> {
  const pts: Array<[number, number]> = []
  for (let i = 0; i < median.length - 1; i++) {
    const [ax, ay] = median[i]
    const [bx, by] = median[i + 1]
    for (let s = 0; s <= (i === median.length - 2 ? steps : steps - 1); s++) {
      const t = s / steps
      const mx = ax + (bx - ax) * t
      const my = ay + (by - ay) * t
      pts.push(toCanvasCoord(mx, my))
    }
  }
  return pts
}

// ─── 笔画生长动画 ────────────────────────────────────────────────────
// 沿 median 中心线逐步用圆形遮罩揭示已填充的笔画轮廓
let rafId: number | null = null

function animateStroke(
  pathStr: string,
  median: number[][],
  color: string,
  onDone: () => void,
) {
  if (!ctx || !canvas) { onDone(); return }

  const pts = sampleMedian(median)
  if (pts.length < 2) {
    drawStrokeFill(pathStr, color)
    onDone()
    return
  }

  // 遮罩半径：笔画宽度的一半，按 canvas 尺寸缩放
  const maskRadius = canvasSize * 0.06
  const pointsPerFrame = Math.max(1, Math.ceil(pts.length / 40))
  let revealed = 0

  const frame = () => {
    const end = Math.min(revealed + pointsPerFrame, pts.length)

    ctx.save()
    // 构建 clip 区域：沿已走过的中心线点画圆形遮罩
    ctx.beginPath()
    for (let i = 0; i < end; i++) {
      ctx.moveTo(pts[i][0] + maskRadius, pts[i][1])
      ctx.arc(pts[i][0], pts[i][1], maskRadius, 0, Math.PI * 2)
    }
    ctx.clip()
    // 在 clip 内填充笔画轮廓
    ctx.beginPath()
    buildPathOnCtx(pathStr)
    ctx.fillStyle = color
    ctx.fill()
    ctx.restore()

    revealed = end

    if (revealed < pts.length) {
      rafId = canvas.requestAnimationFrame(frame)
    }
    else {
      rafId = null
      onDone()
    }
  }
  rafId = canvas.requestAnimationFrame(frame)
}

// ─── 渲染函数 ───────────────────────────────────────────────────────
function renderFrame() {
  if (!ctx || !canvas)
    return
  ctx.clearRect(0, 0, canvasSize, canvasSize)

  const paths = fullChar.value.stroke_paths || []

  if (quizMode.value) {
    paths.forEach((path, i) => {
      if (i < currentStrokeIndex.value) {
        drawStrokeFill(path, '#333333')
      }
      else if (i === currentStrokeIndex.value) {
        drawStrokeFill(path, 'rgba(255, 165, 0, 0.25)')
      }
      else {
        drawStrokeFill(path, 'rgba(0,0,0,0.06)')
      }
    })
    // 绘制用户当前笔画轨迹
    if (currentStrokePath.length > 1) {
      ctx.beginPath()
      ctx.strokeStyle = '#1a1a1a'
      ctx.lineWidth = canvasSize * 0.025
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.moveTo(currentStrokePath[0][0], currentStrokePath[0][1])
      for (let i = 1; i < currentStrokePath.length; i++) {
        ctx.lineTo(currentStrokePath[i][0], currentStrokePath[i][1])
      }
      ctx.stroke()
    }
  }
  else {
    paths.forEach(path => drawStrokeFill(path, 'rgba(0,0,0,0.08)'))
  }
}

// ─── 笔顺动画 ───────────────────────────────────────────────────────
let animTimer: ReturnType<typeof setTimeout> | null = null

function playStrokeDemo() {
  if (isAnimating.value)
    return
  isAnimating.value = true
  canDraw.value = false
  quizMode.value = false

  const paths = fullChar.value.stroke_paths || []
  const medians = fullChar.value.stroke_medians || []
  if (!paths.length) { isAnimating.value = false; return }

  let strokeIdx = 0

  const playNextStroke = () => {
    if (!ctx || strokeIdx >= paths.length) {
      animTimer = setTimeout(() => {
        isAnimating.value = false
        practiceCount.value++
        renderFrame()
      }, 600)
      return
    }

    // 重绘：已完成笔画深色 + 未完成淡色底图
    ctx.clearRect(0, 0, canvasSize, canvasSize)
    paths.forEach((p, i) => {
      if (i < strokeIdx)
        drawStrokeFill(p, '#333333')
      else drawStrokeFill(p, 'rgba(0,0,0,0.07)')
    })

    // 沿 median 中心线动画揭示当前笔画
    const median = medians[strokeIdx] || [[0, 0], [500, 500]]
    animateStroke(paths[strokeIdx], median, '#E65100', () => {
      strokeIdx++
      animTimer = setTimeout(playNextStroke, 300)
    })
  }

  playNextStroke()
}

// ─── 描红模式 ───────────────────────────────────────────────────────
function startQuizMode() {
  quizMode.value = true
  canDraw.value = true
  currentStrokeIndex.value = 0
  currentStrokePath = []
  renderFrame()
}

// 判断用户笔画是否与标准笔画方向大致吻合（基于 medians 起终点）
function isStrokeCorrect(): boolean {
  const medians = fullChar.value.stroke_medians || []
  const stdMedian = medians[currentStrokeIndex.value]
  if (!stdMedian || stdMedian.length < 2 || currentStrokePath.length < 2)
    return true

  // 标准笔画起点和终点（转换到 canvas 坐标）
  const [stdSx, stdSy] = toCanvasCoord(stdMedian[0][0], stdMedian[0][1])
  const [stdEx, stdEy] = toCanvasCoord(stdMedian[stdMedian.length - 1][0], stdMedian[stdMedian.length - 1][1])

  // 用户笔画起点和终点
  const [uSx, uSy] = currentStrokePath[0]
  const [uEx, uEy] = currentStrokePath[currentStrokePath.length - 1]

  // 计算方向向量的点积，判断方向是否大致相同
  const stdDx = stdEx - stdSx
  const stdDy = stdEy - stdSy
  const uDx = uEx - uSx
  const uDy = uEy - uSy
  const dot = stdDx * uDx + stdDy * uDy

  // 检查用户起点是否在标准笔画附近（容差 40% canvas 尺寸）
  const tolerance = canvasSize * 0.4
  const startDist = Math.hypot(uSx - stdSx, uSy - stdSy)

  return dot > 0 && startDist < tolerance
}

function confirmStroke() {
  if (!quizMode.value)
    return
  const correct = isStrokeCorrect()

  if (correct) {
    currentStrokeIndex.value++
    currentStrokePath = []

    if (currentStrokeIndex.value >= props.char.strokes) {
      // 全部完成
      quizMode.value = false
      canDraw.value = false
      practiceCount.value++
      uni.showToast({ title: '写完了！', icon: 'success' })
      renderFrame()
    }
    else {
      renderFrame()
    }
  }
  else {
    uni.showToast({ title: '笔顺方向不对，再试试', icon: 'none', duration: 1500 })
    currentStrokePath = []
    renderFrame()
  }
}

// ─── 触摸事件 ───────────────────────────────────────────────────────
function onTouchStart(e: any) {
  if (!canDraw.value || !ctx)
    return
  isDrawing = true
  const touch = e.touches[0]
  lastX = touch.x * dpr
  lastY = touch.y * dpr
  currentStrokePath = [[lastX, lastY]]
}

function onTouchMove(e: any) {
  if (!isDrawing || !canDraw.value || !ctx)
    return
  const touch = e.touches[0]
  const x = touch.x * dpr
  const y = touch.y * dpr

  // 实时绘制用户轨迹
  ctx.beginPath()
  ctx.strokeStyle = '#1a1a1a'
  ctx.lineWidth = canvasSize * 0.025
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(x, y)
  ctx.stroke()

  currentStrokePath.push([x, y])
  lastX = x
  lastY = y
}

function onTouchEnd() {
  isDrawing = false
}

// ─── 清除 ───────────────────────────────────────────────────────────
function clearCanvas() {
  if (animTimer) { clearTimeout(animTimer); animTimer = null }
  if (rafId !== null && canvas) { canvas.cancelAnimationFrame(rafId); rafId = null }
  isAnimating.value = false
  quizMode.value = false
  canDraw.value = false
  currentStrokeIndex.value = 0
  currentStrokePath = []
  renderFrame()
}

// ─── 初始化 Canvas ──────────────────────────────────────────────────
function initCanvas() {
  const query = uni.createSelectorQuery().in(instance)
  query.select('#traceCanvas')
    .fields({ node: true, size: true })
    .exec((res: any) => {
      if (!res || !res[0] || !res[0].node)
        return
      canvas = res[0].node
      dpr = uni.getSystemInfoSync().pixelRatio || 1
      const size = res[0].width || 250
      canvasSize = size * dpr
      canvas.width = canvasSize
      canvas.height = canvasSize
      ctx = canvas.getContext('2d')
      renderFrame()
    })
}

onMounted(async () => {
  // 按需加载完整笔画数据
  const full = await loadFullCharData(props.char._id)
  if (full)
    fullChar.value = full
  nextTick(() => initCanvas())
})

watch(() => props.char._id, async () => {
  if (animTimer) { clearTimeout(animTimer); animTimer = null }
  practiceCount.value = 0
  isAnimating.value = false
  quizMode.value = false
  canDraw.value = false
  currentStrokeIndex.value = 0
  currentStrokePath = []
  const full = await loadFullCharData(props.char._id)
  if (full)
    fullChar.value = full
  nextTick(() => initCanvas())
})

onUnmounted(() => {
  if (animTimer)
    clearTimeout(animTimer)
  if (rafId !== null && canvas)
    canvas.cancelAnimationFrame(rafId)
})
// #endif

const handleNext = () => emit('next')
</script>

<style lang="scss" scoped>
.tracing-practice {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx;
}

.char-header {
  display: flex;
  align-items: center;
  gap: 32rpx;
  margin-bottom: 40rpx;
}

.char-preview {
  font-size: 100rpx;
  font-weight: bold;
  font-family: 'KaiTi', 'STKaiti', serif;
  color: #333;
  line-height: 1;
}

.char-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.pinyin {
  font-size: 32rpx;
  color: #666;
}

.stroke-count {
  font-size: 24rpx;
  color: #999;
  background: #f0f0f0;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}

.tracing-area {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 24rpx;
}

.grid-container {
  width: 500rpx;
  height: 500rpx;
  position: relative;
  background: #fff8f0;
  border: 4rpx solid #e0d5c0;
  border-radius: 16rpx;
  overflow: hidden;
}

.grid-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.grid-line {
  position: absolute;
  background: transparent;

  &.horizontal {
    width: 100%;
    height: 0;
    top: 50%;
    left: 0;
    border-top: 2rpx dashed #d0c5b0;
  }

  &.vertical {
    width: 0;
    height: 100%;
    top: 0;
    left: 50%;
    border-left: 2rpx dashed #d0c5b0;
  }
}

.hanzi-writer-container {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.trace-canvas {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 2;
}

.status-bar {
  height: 48rpx;
  margin-bottom: 16rpx;
  font-size: 26rpx;
  text-align: center;

  .status-quiz {
    color: #e65100;
  }
  .status-anim {
    color: #1976d2;
  }
  .status-idle {
    color: #999;
  }
}

.action-bar {
  display: flex;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 32rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;

  &.btn-clear {
    background: #f5f5f5;
    color: #666;
  }

  &.btn-demo {
    background: #e3f2fd;
    color: #1976d2;

    &:disabled {
      opacity: 0.6;
    }
  }

  &.btn-quiz {
    background: #fff3e0;
    color: #e65100;
  }

  &.btn-next-stroke {
    background: #e8f5e9;
    color: #2e7d32;
  }
}

.btn-icon {
  font-size: 32rpx;
}

.practice-hint {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.hint-done {
  color: #82c785;
  margin-left: 16rpx;
}

.btn-continue {
  margin-top: auto;
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #f5a623, #e8941a);
  border: none;
  border-radius: 48rpx;
  font-size: 34rpx;
  font-weight: bold;
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(245, 166, 35, 0.4);
}
</style>
