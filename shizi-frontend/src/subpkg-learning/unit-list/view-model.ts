import type { IUnitOverviewItem } from '@/api/learning'
import type { SummaryItem, UnitCardTone, UnitCardViewModel, UnitTaskStatus } from './types'

export interface WrongStatsInput {
  unitCount: number
  charCount: number
  recentCharCount: number
}

export function buildSummaryItems(
  mode: 'unit' | 'wrong',
  statusStats: {
    total: number
    learning: number
    ready: number
    tested: number
  },
  wrongStats: WrongStatsInput,
): SummaryItem[] {
  if (mode === 'unit') {
    return [
      { label: '总单元', value: statusStats.total },
      { label: '学习中', value: statusStats.learning, tone: 'primary' },
      { label: '待测试', value: statusStats.ready, tone: 'warning' },
      { label: '已测评', value: statusStats.tested, tone: 'success' },
    ]
  }

  return [
    { label: '待强化单元', value: wrongStats.unitCount, tone: 'danger' },
    { label: '待强化错字', value: wrongStats.charCount, tone: 'danger' },
    { label: '近24h新错', value: wrongStats.recentCharCount, tone: 'warning' },
  ]
}

export function formatChars(chars: string[]) {
  if (!Array.isArray(chars) || chars.length === 0) {
    return '暂无汉字'
  }

  const visible = chars.slice(0, 6).join('、')
  return chars.length > 6 ? `${visible} +${chars.length - 6}` : visible
}

export function getWrongTypeLabel(type?: string) {
  const labelMap: Record<string, string> = {
    review: '复习识记',
    'char-to-image': '看字选图',
    'image-to-char': '看图认字',
    'audio-to-char': '听音认字',
    'pinyin-to-char': '拼音认字',
    unknown: '综合识字',
  }

  return labelMap[type || 'unknown'] || '综合识字'
}

export function formatRelativeWrongTime(timestamp: number) {
  const diff = Date.now() - timestamp
  const hour = 60 * 60 * 1000
  const day = 24 * hour

  if (diff < hour) {
    return '刚刚错过'
  }
  if (diff < day) {
    return `${Math.max(1, Math.floor(diff / hour))}小时前错过`
  }
  if (diff < 2 * day) {
    return '昨天错过'
  }

  return `${Math.max(2, Math.floor(diff / day))}天前错过`
}

export function compareUnitPriority(a: IUnitOverviewItem, b: IUnitOverviewItem) {
  const statusOrder = {
    ready_for_test: 0,
    learning: 1,
    tested: 2,
    not_started: 3,
  } as const

  const statusDiff = statusOrder[a.status] - statusOrder[b.status]
  if (statusDiff !== 0) {
    return statusDiff
  }

  return a.name.localeCompare(b.name, 'zh-Hans-CN')
}

export function getUnitCardTone(status: UnitTaskStatus): UnitCardTone {
  switch (status) {
    case 'learning':
      return 'learning'
    case 'ready_for_test':
      return 'ready'
    case 'tested':
      return 'tested'
    default:
      return 'not_started'
  }
}

export function buildUnitProgressText(unit: IUnitOverviewItem) {
  switch (unit.status) {
    case 'not_started':
      return `本单元共 ${unit.totalChars} 字，尚未开始`
    case 'learning':
      return `已学 ${unit.charIndex}/${unit.totalChars} 字`
    case 'ready_for_test':
      return '已完成学习，可安排测试'
    case 'tested':
      return '已完成测试'
    default:
      return ''
  }
}

export function createUnitCardViewModel(
  unit: IUnitOverviewItem,
  options: {
    wrongCount: number
    hasReviewAction: boolean
    primaryActionText: string
  },
): UnitCardViewModel {
  return {
    id: unit.id,
    name: unit.name,
    lesson: unit.lesson || '教材同步单元',
    charsPreview: formatChars(unit.chars),
    status: unit.status,
    progressText: buildUnitProgressText(unit),
    stars: unit.stars,
    wrongCount: options.wrongCount,
    primaryActionText: options.primaryActionText,
    secondaryActionText: options.hasReviewAction ? '复习' : undefined,
    cardTone: getUnitCardTone(unit.status),
  }
}

export function createWrongUnitCardViewModel(
  unit: IUnitOverviewItem,
  options: {
    wrongCount: number
    cleared: boolean
    latestWrongText?: string
    primaryWeaknessText?: string
  },
): UnitCardViewModel {
  return {
    id: unit.id,
    name: unit.name,
    lesson: unit.lesson || '教材同步单元',
    charsPreview: formatChars(unit.chars),
    status: unit.status,
    progressText: options.cleared ? '当前没有待强化错字' : `共 ${options.wrongCount} 个错字待强化`,
    stars: unit.stars,
    wrongCount: options.wrongCount,
    wrongHintText: options.cleared
      ? '孩子最近掌握得不错'
      : options.wrongCount >= 3 ? '建议优先强化，本单元错字较多' : '建议安排一轮巩固强化',
    wrongUpdatedText: options.cleared ? undefined : options.latestWrongText,
    primaryWeaknessText: options.cleared ? undefined : options.primaryWeaknessText,
    primaryActionText: options.cleared ? '暂无错字' : '开始强化',
    cardTone: options.cleared ? 'cleared' : 'wrong',
    disabled: options.cleared,
  }
}
