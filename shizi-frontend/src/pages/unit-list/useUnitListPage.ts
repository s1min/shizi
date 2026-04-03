import { onShow } from '@dcloudio/uni-app'
import { computed, onMounted, ref } from 'vue'
import { useLearnStore } from '@/store'
import { navigateBackOrTo } from '@/utils/navigation'
import type { SummaryItem, UnitPageTab, UnitStageViewModel } from './types'
import {
  buildSummaryItems,
  compareUnitPriority,
  createUnitCardViewModel,
  createWrongUnitCardViewModel,
  formatRelativeWrongTime,
  getWrongTypeLabel,
} from './view-model'

export function useUnitListPage(options?: {
  showBack?: boolean
  backUrl?: string
  backIsTab?: boolean
}) {
  const learnStore = useLearnStore()
  const showLibrarySheet = ref(false)
  const activeTab = ref<UnitPageTab>('unit')
  const showClearedUnits = ref<string[]>([])
  const highlightUnitId = ref('')

  const showBack = options?.showBack ?? false
  const backUrl = options?.backUrl ?? '/pages/me/index'
  const backIsTab = options?.backIsTab ?? false

  const libraryOptions = [
    { id: 'lib_1a_upper', name: '一年级上册', disabled: false },
    { id: 'lib_1a_lower', name: '一年级下册', disabled: true },
    { id: 'lib_2a_upper', name: '二年级上册', disabled: true },
    { id: 'lib_2a_lower', name: '二年级下册', disabled: true },
  ]

  const activeOverview = computed(() => learnStore.unitOverview[learnStore.currentLibraryId])

  const activeLibraryName = computed(() => {
    return activeOverview.value?.libraryName
      || libraryOptions.find(item => item.id === learnStore.currentLibraryId)?.name
      || '当前字库'
  })

  const rawStages = computed(() => activeOverview.value?.stages || [])
  const flattenedUnits = computed(() => rawStages.value.flatMap(stage => stage.units))

  const statusStats = computed(() => ({
    total: flattenedUnits.value.length,
    notStarted: flattenedUnits.value.filter(item => item.status === 'not_started').length,
    learning: flattenedUnits.value.filter(item => item.status === 'learning').length,
    ready: flattenedUnits.value.filter(item => item.status === 'ready_for_test').length,
    tested: flattenedUnits.value.filter(item => item.status === 'tested').length,
  }))

  const wrongStats = computed(() => {
    const pendingRecords = learnStore.wrongRecords.filter(item => !item.retried)
    const typeCountMap = pendingRecords.reduce<Record<string, number>>((acc, item) => {
      acc[item.quizType] = (acc[item.quizType] || 0) + 1
      return acc
    }, {})

    const primaryType = Object.entries(typeCountMap)
      .sort((a, b) => b[1] - a[1])[0]?.[0]

    const recentCharIds = new Set(
      pendingRecords
        .filter(item => Date.now() - item.wrongAt <= 24 * 60 * 60 * 1000)
        .map(item => item.charId),
    )

    const unitCount = flattenedUnits.value.filter(unit => getWrongCount(unit.id) > 0).length
    const charCount = flattenedUnits.value.reduce((sum, unit) => sum + getWrongCount(unit.id), 0)

    return {
      unitCount,
      charCount,
      recentCharCount: recentCharIds.size,
      primaryWeakness: getWrongTypeLabel(primaryType),
    }
  })

  const summaryItems = computed<SummaryItem[]>(() => {
    return buildSummaryItems(activeTab.value, statusStats.value, wrongStats.value)
  })

  const unitStageSections = computed<UnitStageViewModel[]>(() => {
    return rawStages.value.map((stage) => {
      const units = [...stage.units]
        .sort((a, b) => compareUnitPriority(a, b))
        .map(unit => createUnitCardViewModel(unit, {
          wrongCount: getWrongCount(unit.id),
          hasReviewAction: hasReviewAction(unit.status),
          primaryActionText: primaryActionText(unit.status),
        }))

      return {
        id: stage.id,
        name: stage.name,
        units,
      }
    })
  })

  const wrongPendingSections = computed<UnitStageViewModel[]>(() => {
    return rawStages.value
      .map((stage) => {
        const units = stage.units
          .filter(unit => getWrongCount(unit.id) > 0)
          .sort((a, b) => getWrongCount(b.id) - getWrongCount(a.id) || compareUnitPriority(a, b))
          .map(unit => createWrongUnitCardViewModel(unit, {
            wrongCount: getWrongCount(unit.id),
            cleared: false,
            latestWrongText: getLatestWrongText(unit.id),
            primaryWeaknessText: getPrimaryWrongTypeText(unit.id),
          }))

        return {
          id: stage.id,
          name: stage.name,
          units,
        }
      })
      .filter(stage => stage.units.length > 0)
  })

  const wrongClearedSections = computed<UnitStageViewModel[]>(() => {
    return rawStages.value
      .map((stage) => {
        const units = stage.units
          .filter(unit => getWrongCount(unit.id) === 0)
          .sort((a, b) => compareUnitPriority(a, b))
          .map(unit => createWrongUnitCardViewModel(unit, {
            wrongCount: 0,
            cleared: true,
          }))

        return {
          id: stage.id,
          name: stage.name,
          units,
        }
      })
      .filter(stage => stage.units.length > 0)
  })

  const clearedUnitCount = computed(() => wrongClearedSections.value.reduce((sum, stage) => sum + stage.units.length, 0))

  const libraryActions = computed(() => {
    return libraryOptions.map(item => ({
      name: item.name,
      disabled: item.disabled,
      value: item.id,
    }))
  })

  onMounted(async () => {
    await learnStore.loadLibraryFromApi()
    await learnStore.loadCharsFromApi()
    await learnStore.loadUnitOverview()
  })

  onShow(() => {
    const returnState = uni.getStorageSync('unitReviewReturnState') as
      | { tab?: string, highlightUnitId?: string, timestamp?: number }
      | undefined

    if (!returnState?.timestamp || Date.now() - returnState.timestamp > 10 * 1000) {
      uni.removeStorageSync('unitReviewReturnState')
      return
    }

    if (returnState.tab === 'wrong') {
      activeTab.value = 'wrong'
    }

    if (returnState.highlightUnitId) {
      highlightUnitId.value = returnState.highlightUnitId
      showClearedUnits.value = ['cleared-units']
      uni.showToast({
        title: '该单元强化已完成',
        icon: 'none',
      })
      setTimeout(() => {
        highlightUnitId.value = ''
      }, 2200)
    }

    uni.removeStorageSync('unitReviewReturnState')
  })

  function handleBack() {
    if (!showBack) {
      return
    }

    navigateBackOrTo(backUrl, backIsTab)
  }

  function openLibraryPicker() {
    showLibrarySheet.value = true
  }

  async function handleLibrarySelect({ item }: any) {
    if (!item?.value || item.disabled) {
      return
    }

    await learnStore.setCurrentLibrary(item.value)
    await learnStore.loadUnitOverview(item.value)
  }

  function handleUnitPrimary(unitId: string) {
    const unit = flattenedUnits.value.find(item => item.id === unitId)
    if (!unit) {
      return
    }

    if (unit.status === 'not_started' || unit.status === 'learning') {
      uni.navigateTo({ url: `/subpkg-learning/learn/index?unitId=${unit.id}` })
      return
    }

    uni.navigateTo({ url: `/subpkg-learning/learn/unit-test?unitId=${unit.id}` })
  }

  function handleUnitSecondary(unitId: string) {
    goUnitReview(unitId)
  }

  function handleWrongPrimary(unitId: string) {
    goUnitWrongReview(unitId)
  }

  function getWrongCount(unitId: string) {
    return learnStore.getUnitWrongChars(unitId).length
  }

  function getUnitWrongRecords(unitId: string) {
    return learnStore.wrongRecords.filter((item) => {
      if (item.retried) {
        return false
      }

      const normalizedUnitId = item.unitId || learnStore.library.stages
        .flatMap((stage: any) => stage.units || [])
        .find((unit: any) => Array.isArray(unit.chars) && unit.chars.includes(item.charId))?.id || ''

      return normalizedUnitId === unitId
    })
  }

  function getLatestWrongText(unitId: string) {
    const records = getUnitWrongRecords(unitId)
    if (records.length === 0) {
      return '当前没有错题'
    }

    const latest = [...records].sort((a, b) => b.wrongAt - a.wrongAt)[0]
    return formatRelativeWrongTime(latest.wrongAt)
  }

  function getPrimaryWrongTypeText(unitId: string) {
    const records = getUnitWrongRecords(unitId)
    if (records.length === 0) {
      return '暂无强化任务'
    }

    const typeCountMap = records.reduce<Record<string, number>>((acc, item) => {
      acc[item.quizType] = (acc[item.quizType] || 0) + 1
      return acc
    }, {})

    const primaryType = Object.entries(typeCountMap)
      .sort((a, b) => b[1] - a[1])[0]?.[0]

    const labelMap: Record<string, string> = {
      review: '复习识记薄弱',
      'char-to-image': '看字选图易错',
      'image-to-char': '看图认字易错',
      'audio-to-char': '听音认字易错',
      'pinyin-to-char': '拼音认字易错',
      unknown: '识字题型易错',
    }

    return labelMap[primaryType || 'unknown'] || '识字题型易错'
  }

  function hasReviewAction(status: string) {
    return status === 'ready_for_test' || status === 'tested'
  }

  function primaryActionText(status: string) {
    switch (status) {
      case 'not_started':
        return '开始学习'
      case 'learning':
        return '继续学习'
      case 'ready_for_test':
        return '开始测试'
      case 'tested':
        return '重新测试'
      default:
        return '开始学习'
    }
  }

  function goUnitReview(unitId: string) {
    uni.navigateTo({ url: `/subpkg-learning/review/index?mode=unit&unitId=${unitId}&scope=all` })
  }

  function goUnitWrongReview(unitId: string) {
    if (getWrongCount(unitId) === 0) {
      return
    }

    uni.navigateTo({ url: `/subpkg-learning/review/index?mode=unit&unitId=${unitId}&scope=wrong` })
  }

  return {
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
  }
}
