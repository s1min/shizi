import type { ILearningProgress, IUnitOverviewResponse } from '@/api/learning'
import type { Character } from '@/types/character'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getCharactersBatch } from '@/api/character'
import { getProgress, getUnitOverview, syncProgress } from '@/api/learning'
import { getLibraryById } from '@/api/library'
import charactersData from '@/data/characters-light.json'
import libraryData from '@/data/lib_1a_upper.json'

/** 单字学习记录 */
interface CharRecord {
  charId: string
  learnedAt: number // 时间戳
  quizCorrect: boolean
  reviewCount: number
  nextReviewAt: number // 艾宾浩斯复习时间
}

/** 错题记录 */
interface WrongRecord {
  charId: string
  quizType: string // 题型
  unitId: string
  wrongAt: number // 时间戳
  retried: boolean // 是否已重新答对
}

/** 单元进度 */
interface UnitProgress {
  unitId: string
  charIndex: number // 当前学到第几个字
  learnCompleted: boolean
  testCompleted: boolean
  stars: number // 0-3
  completed?: boolean
}

type UnitTaskStatus = 'not_started' | 'learning' | 'ready_for_test' | 'tested'

export const useLearnStore = defineStore(
  'learn',
  () => {
    // ===== 状态 =====
    const currentLibraryId = ref('lib_1a_upper')
    const currentStageIndex = ref(0)
    const currentUnitId = ref('unit_1')

    // 已学汉字记录 { charId: CharRecord }
    const charRecords = ref<Record<string, CharRecord>>({})
    // 单元进度 { unitId: UnitProgress }
    const unitProgressMap = ref<Record<string, UnitProgress>>({})
    // 学习天数记录 (日期字符串集合)
    const learnDays = ref<string[]>([])
    // 错题记录
    const wrongRecords = ref<WrongRecord[]>([])
    // 学习设置
    const dailyCharCount = ref(5) // 每日新字数：3/5/8
    const reminderTime = ref('19:00') // 学习提醒时间
    const unitOverview = ref<Record<string, IUnitOverviewResponse>>({})
    const loadingUnitOverview = ref(false)

    // ===== 计算属性 =====
    const libraryRef = ref<any>(libraryData)
    const allCharsRef = ref<Character[]>(charactersData as Character[])
    const library = computed(() => libraryRef.value)
    const allChars = computed(() => allCharsRef.value)
    const charMap = computed(() => new Map(allChars.value.map(c => [c._id, c])))

    const currentStage = computed(() => library.value.stages[currentStageIndex.value])

    const currentUnit = computed(() => {
      if (!currentStage.value)
        return null
      return currentStage.value.units.find(u => u.id === currentUnitId.value) || currentStage.value.units[0]
    })

    /** 当前单元的汉字详情列表 */
    const currentUnitChars = computed(() => {
      if (!currentUnit.value)
        return []
      return currentUnit.value.chars
        .map(id => charMap.value.get(id))
        .filter(Boolean) as Character[]
    })

    /** 已学汉字总数 */
    const learnedCount = computed(() => Object.keys(charRecords.value).length)

    /** 连续学习天数 */
    const streakDays = computed(() => {
      if (learnDays.value.length === 0)
        return 0
      const sorted = [...learnDays.value].sort().reverse()
      const today = new Date().toISOString().slice(0, 10)
      if (sorted[0] !== today)
        return 0
      let streak = 1
      for (let i = 1; i < sorted.length; i++) {
        const prev = new Date(sorted[i - 1])
        const curr = new Date(sorted[i])
        const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
        if (diff === 1)
          streak++
        else break
      }
      return streak
    })

    /** 获取单元进度 */
    function getUnitProgress(unitId: string): UnitProgress {
      const progress = unitProgressMap.value[unitId] as (UnitProgress & { completed?: boolean }) | undefined
      if (!progress) {
        return {
          unitId,
          charIndex: 0,
          learnCompleted: false,
          testCompleted: false,
          stars: 0,
        }
      }

      const learnCompleted = progress.learnCompleted ?? progress.completed ?? false
      const testCompleted = progress.testCompleted ?? ((progress.completed ?? false) && (progress.stars || 0) > 0)

      return {
        unitId,
        charIndex: progress.charIndex || 0,
        learnCompleted,
        testCompleted,
        stars: progress.stars || 0,
      }
    }

    /** 单元是否已解锁 */
    function isUnitUnlocked(unitId: string): boolean {
      // 第一个单元始终解锁
      const allUnits = library.value.stages.flatMap(s => s.units)
      const idx = allUnits.findIndex(u => u.id === unitId)
      if (idx <= 0)
        return true
      // 前一个单元学完才解锁
      const prevUnit = allUnits[idx - 1]
      return getUnitProgress(prevUnit.id).learnCompleted
    }

    function getUnitTaskStatus(unitId: string): UnitTaskStatus {
      const progress = getUnitProgress(unitId)

      if (progress.testCompleted)
        return 'tested'
      if (progress.learnCompleted)
        return 'ready_for_test'
      if (progress.charIndex > 0)
        return 'learning'
      return 'not_started'
    }

    function resolveUnitIdByCharId(charId: string): string {
      const allUnits = library.value?.stages?.flatMap((stage: any) => stage.units || []) || []
      const unit = allUnits.find((item: any) => Array.isArray(item.chars) && item.chars.includes(charId))
      return unit?.id || ''
    }

    function buildLocalUnitOverview(): IUnitOverviewResponse {
      return {
        libraryId: currentLibraryId.value,
        libraryName: library.value?.name || '',
        stages: (library.value?.stages || []).map((stage: any) => ({
          id: stage.id,
          name: stage.name,
          units: (stage.units || []).map((unit: any) => {
            const progress = getUnitProgress(unit.id)
            return {
              id: unit.id,
              name: unit.name,
              lesson: unit.lesson,
              chars: unit.chars || [],
              totalChars: Array.isArray(unit.chars) ? unit.chars.length : 0,
              charIndex: progress.charIndex,
              learnCompleted: progress.learnCompleted,
              testCompleted: progress.testCompleted,
              stars: progress.stars,
              status: getUnitTaskStatus(unit.id),
            }
          }),
        })),
      }
    }

    // ===== 操作 =====

    /** 记录一个字学完 */
    function markCharLearned(charId: string, quizCorrect: boolean) {
      const now = Date.now()
      const existing = charRecords.value[charId]
      charRecords.value[charId] = {
        charId,
        learnedAt: existing?.learnedAt || now,
        quizCorrect,
        reviewCount: (existing?.reviewCount || 0) + 1,
        // 简化版艾宾浩斯：1天、3天、7天、15天
        nextReviewAt: now + getNextReviewInterval(existing?.reviewCount || 0),
      }
      // 答对时，标记该字的错题为已重试
      if (quizCorrect) {
        wrongRecords.value
          .filter(r => r.charId === charId && !r.retried)
          .forEach((r) => { r.retried = true })
      }
      // 记录今天学习
      const today = new Date().toISOString().slice(0, 10)
      if (!learnDays.value.includes(today)) {
        learnDays.value.push(today)
      }
    }

    /** 记录错题 */
    function recordWrong(charId: string, quizType: string, unitId: string) {
      wrongRecords.value.push({
        charId,
        quizType,
        unitId,
        wrongAt: Date.now(),
        retried: false,
      })
    }

    /** 更新单元进度 */
    function updateUnitProgress(unitId: string, charIndex: number) {
      const unit = library.value.stages.flatMap(s => s.units).find(u => u.id === unitId)
      const totalChars = unit?.chars.length || 0
      const normalizedIndex = charIndex >= totalChars ? totalChars : charIndex
      const progress = getUnitProgress(unitId)

      unitProgressMap.value[unitId] = {
        ...progress,
        unitId,
        charIndex: normalizedIndex,
        learnCompleted: normalizedIndex >= totalChars && totalChars > 0,
      }
    }

    /** 标记单元学习完成 */
    function markUnitLearnCompleted(unitId: string) {
      const unit = library.value.stages.flatMap(s => s.units).find(u => u.id === unitId)
      const totalChars = unit?.chars.length || 0
      const progress = getUnitProgress(unitId)

      unitProgressMap.value[unitId] = {
        ...progress,
        unitId,
        charIndex: totalChars,
        learnCompleted: true,
      }
    }

    /** 完成单元测试，设置星级 */
    function completeUnit(unitId: string, stars: number) {
      const progress = getUnitProgress(unitId)
      unitProgressMap.value[unitId] = {
        ...progress,
        learnCompleted: true,
        testCompleted: true,
        stars: Math.max(progress.stars, stars),
      }
      // 自动推进到下一个单元
      advanceToNextUnit(unitId)
      // 完成单元后推送进度到云端
      syncToCloud()
    }

    /** 推进到下一个单元 */
    function advanceToNextUnit(completedUnitId: string) {
      const allUnits = library.value.stages.flatMap(s => s.units)
      const idx = allUnits.findIndex(u => u.id === completedUnitId)
      if (idx < allUnits.length - 1) {
        const next = allUnits[idx + 1]
        currentUnitId.value = next.id
        // 更新 stageIndex
        const stageIdx = library.value.stages.findIndex(s => s.units.some(u => u.id === next.id))
        if (stageIdx >= 0)
          currentStageIndex.value = stageIdx
      }
    }

    /** 获取复习间隔（毫秒） */
    function getNextReviewInterval(reviewCount: number): number {
      const intervals = [0, 1, 3, 7, 15, 30] // 天；首次学习后当天进入第一次复习
      const days = intervals[Math.min(reviewCount, intervals.length - 1)]
      return days * 24 * 60 * 60 * 1000
    }

    /** 复习场景：记录答题结果并更新复习计划 */
    function reviewChar(charId: string, correct: boolean) {
      const now = Date.now()
      const existing = charRecords.value[charId]
      if (!existing)
        return

      if (correct) {
        // 答对：reviewCount 递增，拉长下次复习间隔
        const newCount = existing.reviewCount + 1
        charRecords.value[charId] = {
          ...existing,
          quizCorrect: true,
          reviewCount: newCount,
          nextReviewAt: now + getNextReviewInterval(Math.max(0, newCount - 1)),
        }
        // 标记该字的错题为已重试
        wrongRecords.value
          .filter(r => r.charId === charId && !r.retried)
          .forEach((r) => { r.retried = true })
      }
      else {
        // 答错：reviewCount 回退一级，明天再复习
        const newCount = Math.max(0, existing.reviewCount - 1)
        charRecords.value[charId] = {
          ...existing,
          quizCorrect: false,
          reviewCount: newCount,
          nextReviewAt: now + 24 * 60 * 60 * 1000,
        }
        // 记录错题
        wrongRecords.value.push({
          charId,
          quizType: 'review',
          unitId: resolveUnitIdByCharId(charId),
          wrongAt: now,
          retried: false,
        })
      }

      // 记录今天学习
      const today = new Date().toISOString().slice(0, 10)
      if (!learnDays.value.includes(today)) {
        learnDays.value.push(today)
      }
    }

    function getUnitReviewChars(unitId: string): Character[] {
      const unit = library.value?.stages
        ?.flatMap((s: any) => s.units)
        ?.find((u: any) => u.id === unitId)

      if (!unit) {
        return []
      }

      return (unit.chars || [])
        .map((id: string) => charMap.value.get(id))
        .filter(Boolean) as Character[]
    }

    function getUnitWrongChars(unitId: string): Character[] {
      const wrongIds = new Set(
        wrongRecords.value
          .filter((item) => {
            if (item.retried) {
              return false
            }

            const normalizedUnitId = item.unitId || resolveUnitIdByCharId(item.charId)
            return normalizedUnitId === unitId
          })
          .map(item => item.charId),
      )

      return Array.from(wrongIds)
        .map(id => charMap.value.get(id))
        .filter(Boolean) as Character[]
    }

    /** 获取今日待复习的汉字 */
    const todayReviewChars = computed(() => {
      const now = Date.now()
      return Object.values(charRecords.value)
        .filter(r => r.nextReviewAt <= now)
        .map(r => charMap.value.get(r.charId))
        .filter(Boolean) as Character[]
    })

    /** 今日待复习数量 */
    const todayReviewCount = computed(() => todayReviewChars.value.length)

    /** 未重试的错题汉字（去重） */
    const wrongChars = computed(() => {
      const ids = Array.from(new Set(
        wrongRecords.value
          .filter(r => !r.retried)
          .map(r => r.charId),
      ))
      return ids
        .map(id => charMap.value.get(id))
        .filter(Boolean) as Character[]
    })

    // ===== 云端同步 =====
    const syncing = ref(false)

    /** 将本地数据打包为同步格式 */
    function toSyncData(): ILearningProgress {
      return {
        charRecords: charRecords.value,
        unitProgressMap: unitProgressMap.value,
        wrongRecords: wrongRecords.value,
        learnDays: learnDays.value,
        currentLibraryId: currentLibraryId.value,
        currentStageIndex: currentStageIndex.value,
        currentUnitId: currentUnitId.value,
        clientUpdatedAt: Date.now(),
      }
    }

    /** 将云端数据合并到本地（字段级合并，取更优的） */
    function mergeFromCloud(cloud: ILearningProgress) {
      // charRecords：取并集，同 charId 取 reviewCount 更高的
      const merged = { ...charRecords.value }
      for (const [id, cr] of Object.entries(cloud.charRecords || {})) {
        if (!merged[id] || (cr as any).reviewCount > merged[id].reviewCount) {
          merged[id] = cr as any
        }
      }
      charRecords.value = merged

      // unitProgressMap：取并集，同 unitId 取 stars 更高的
      const mergedUnits = { ...unitProgressMap.value }
      for (const [id, up] of Object.entries(cloud.unitProgressMap || {})) {
        const local = mergedUnits[id]
        if (!local) {
          mergedUnits[id] = up as any
        }
        else {
          mergedUnits[id] = {
            ...local,
            learnCompleted: local.learnCompleted || (up as any).learnCompleted || (up as any).completed || false,
            testCompleted: local.testCompleted || (up as any).testCompleted || (((up as any).completed || false) && ((up as any).stars || 0) > 0),
            stars: Math.max(local.stars, (up as any).stars || 0),
            charIndex: Math.max(local.charIndex, (up as any).charIndex || 0),
          }
        }
      }
      unitProgressMap.value = mergedUnits

      // learnDays：取并集去重
      const daySet = new Set([...learnDays.value, ...(cloud.learnDays || [])])
      learnDays.value = Array.from(daySet).sort()

      // wrongRecords：取并集（按 charId+wrongAt 去重）
      const existingKeys = new Set(
        wrongRecords.value.map(r => `${r.charId}_${r.wrongAt}`),
      )
      for (const r of cloud.wrongRecords || []) {
        const key = `${(r as any).charId}_${(r as any).wrongAt}`
        if (!existingKeys.has(key)) {
          wrongRecords.value.push(r as any)
        }
      }

      // 进度指针：取更靠后的
      if ((cloud.currentStageIndex || 0) > currentStageIndex.value) {
        currentStageIndex.value = cloud.currentStageIndex
      }
      if (cloud.currentLibraryId) {
        currentLibraryId.value = cloud.currentLibraryId
      }
      if (cloud.currentUnitId) {
        // 比较哪个单元更靠后
        const allUnits = library.value.stages.flatMap(s => s.units)
        const localIdx = allUnits.findIndex(u => u.id === currentUnitId.value)
        const cloudIdx = allUnits.findIndex(u => u.id === cloud.currentUnitId)
        if (cloudIdx > localIdx) {
          currentUnitId.value = cloud.currentUnitId
        }
      }
    }

    /** 从云端拉取数据并合并到本地 */
    async function syncFromCloud() {
      try {
        syncing.value = true
        const cloud = await getProgress()
        if (cloud) {
          mergeFromCloud(cloud)
        }
      }
      catch (e) {
        console.warn('拉取云端进度失败', e)
      }
      finally {
        syncing.value = false
      }
    }

    /** 推送本地数据到云端（增量同步） */
    async function syncToCloud() {
      try {
        syncing.value = true
        const result = await syncProgress(toSyncData())
        // 如果服务端返回了更新的数据，合并回来
        if (result && result.clientUpdatedAt > Date.now() - 1000) {
          mergeFromCloud(result)
        }
      }
      catch (e) {
        console.warn('推送云端进度失败', e)
      }
      finally {
        syncing.value = false
      }
    }

    async function setCurrentLibrary(libraryId: string) {
      currentLibraryId.value = libraryId
      currentStageIndex.value = 0

      await loadLibraryFromApi(libraryId)
      await loadCharsFromApi()

      const firstUnit = library.value?.stages?.[0]?.units?.[0]
      if (firstUnit?.id) {
        currentUnitId.value = firstUnit.id
      }
    }

    async function loadUnitOverview(libraryId?: string) {
      const id = libraryId || currentLibraryId.value
      try {
        loadingUnitOverview.value = true
        const data = await getUnitOverview(id)
        if (data) {
          unitOverview.value[id] = data
          return data
        }
      }
      catch (e) {
        console.warn('加载单元总览失败，回退到本地拼装', e)
      }
      finally {
        loadingUnitOverview.value = false
      }

      const fallback = buildLocalUnitOverview()
      unitOverview.value[id] = fallback
      return fallback
    }

    // ===== 从 API 加载数据（fallback 到本地 JSON） =====

    /** 从 API 加载字库数据 */
    async function loadLibraryFromApi(libraryId?: string) {
      try {
        const id = libraryId || currentLibraryId.value
        const data = await getLibraryById(id)
        if (data)
          libraryRef.value = data
      }
      catch (e) {
        console.warn('从 API 加载字库失败，使用本地数据', e)
      }
    }

    /** 从 API 加载汉字数据 */
    async function loadCharsFromApi() {
      try {
        const allCharIds = library.value.stages
          .flatMap((s: any) => s.units)
          .flatMap((u: any) => u.chars) as string[]
        if (allCharIds.length === 0)
          return
        // 分批加载，每批 50 个
        const batches: string[][] = []
        for (let i = 0; i < allCharIds.length; i += 50) {
          batches.push(allCharIds.slice(i, i + 50))
        }
        const results: Character[] = []
        for (const batch of batches) {
          const chars = await getCharactersBatch(batch)
          if (chars)
            results.push(...chars)
        }
        if (results.length > 0)
          allCharsRef.value = results
      }
      catch (e) {
        console.warn('从 API 加载汉字失败，使用本地数据', e)
      }
    }

    return {
      // 状态
      currentLibraryId,
      currentStageIndex,
      currentUnitId,
      charRecords,
      unitProgressMap,
      learnDays,
      wrongRecords,
      dailyCharCount,
      reminderTime,
      unitOverview,
      loadingUnitOverview,
      // 计算属性
      library,
      allChars,
      charMap,
      currentStage,
      currentUnit,
      currentUnitChars,
      learnedCount,
      streakDays,
      todayReviewChars,
      todayReviewCount,
      wrongChars,
      // 方法
      getUnitProgress,
      getUnitTaskStatus,
      isUnitUnlocked,
      markCharLearned,
      reviewChar,
      recordWrong,
      updateUnitProgress,
      markUnitLearnCompleted,
      completeUnit,
      getUnitReviewChars,
      getUnitWrongChars,
      // 云端同步
      syncing,
      syncFromCloud,
      syncToCloud,
      setCurrentLibrary,
      loadUnitOverview,
      // API 数据加载
      loadLibraryFromApi,
      loadCharsFromApi,
    }
  },
  {
    persist: true,
  },
)
