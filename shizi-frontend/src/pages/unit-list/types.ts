export type UnitPageTab = 'unit' | 'wrong'

export type UnitTaskStatus = 'not_started' | 'learning' | 'ready_for_test' | 'tested'

export type UnitCardTone = 'not_started' | 'learning' | 'ready' | 'tested' | 'wrong' | 'cleared'

export interface SummaryItem {
  label: string
  value: string | number
  tone?: 'default' | 'primary' | 'warning' | 'success' | 'danger'
}

export interface UnitCardViewModel {
  id: string
  name: string
  lesson?: string
  charsPreview: string
  status: UnitTaskStatus
  progressText: string
  stars: number
  wrongCount: number
  wrongHintText?: string
  wrongUpdatedText?: string
  primaryWeaknessText?: string
  primaryActionText: string
  secondaryActionText?: string
  cardTone: UnitCardTone
  disabled?: boolean
}

export interface UnitStageViewModel {
  id: string
  name: string
  units: UnitCardViewModel[]
}
