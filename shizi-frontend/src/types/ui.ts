export type AgeGroup = 'early' | 'preschool' | 'school'
export type CharacterStatus = 'unseen' | 'exposed' | 'emerging' | 'needs_review' | 'mastered' | 'stable'
export type TaskState = 'first' | 'resume' | 'review' | 'new' | 'complete' | 'offline'
export type ParentGateReason = 'settings' | 'report' | 'library' | 'privacy' | 'account'

export interface UiMode {
  ageGroup: AgeGroup
  showTaskDetails: boolean
  showPinyin: boolean
  useImageOptions: boolean
  allowTraceSkip: boolean
  useVoicePrompt: boolean
}

export interface CharacterStatusRecord {
  learnedAt?: number | null
  quizCorrect?: boolean | null
  reviewCount?: number | null
  nextReviewAt?: number | null
  status?: CharacterStatus | null
  delayedReviewCorrect?: boolean | null
  scheduledCorrectReviews?: number | null
}

// Compatibility name used by state consumers while records are normalized incrementally.
export type CharacterRecordSnapshot = CharacterStatusRecord

export interface TaskStateSnapshot {
  offline?: boolean
  syncFailed?: boolean
  localOnly?: boolean
  hasResume?: boolean
  inProgress?: boolean
  reviewCount?: number
  dueReviewCount?: number
  newCount?: number
  availableNewCount?: number
  isFirstUse?: boolean
  hasStarted?: boolean
  complete?: boolean
  isComplete?: boolean
}

export type UiIconName =
  | 'arrow-left'
  | 'book'
  | 'check'
  | 'chevron-right'
  | 'close'
  | 'error'
  | 'home'
  | 'info'
  | 'lock'
  | 'pause'
  | 'play'
  | 'refresh'
  | 'settings'
  | 'speaker'
  | 'user'
  | 'volume-off'
