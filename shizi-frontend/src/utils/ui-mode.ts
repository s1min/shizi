import type {
  AgeGroup,
  CharacterStatus,
  CharacterStatusRecord,
  TaskState,
  TaskStateSnapshot,
  UiMode,
} from '@/types/ui'

const AGE_GROUPS: ReadonlySet<string> = new Set(['early', 'preschool', 'school'])
const CHARACTER_STATUSES: ReadonlySet<string> = new Set([
  'unseen',
  'exposed',
  'emerging',
  'needs_review',
  'mastered',
  'stable',
])

const UI_MODES: Record<AgeGroup, UiMode> = {
  early: {
    ageGroup: 'early',
    showTaskDetails: false,
    showPinyin: false,
    useImageOptions: true,
    allowTraceSkip: true,
    useVoicePrompt: true,
  },
  preschool: {
    ageGroup: 'preschool',
    showTaskDetails: false,
    showPinyin: true,
    useImageOptions: true,
    allowTraceSkip: false,
    useVoicePrompt: true,
  },
  school: {
    ageGroup: 'school',
    showTaskDetails: true,
    showPinyin: true,
    useImageOptions: false,
    allowTraceSkip: false,
    useVoicePrompt: false,
  },
}

export function normalizeAgeGroup(value: unknown): AgeGroup {
  return typeof value === 'string' && AGE_GROUPS.has(value)
    ? value as AgeGroup
    : 'preschool'
}

export function getUiMode(ageGroup: unknown): UiMode {
  return { ...UI_MODES[normalizeAgeGroup(ageGroup)] }
}

export function getCharacterStatus(record?: CharacterStatusRecord | null): CharacterStatus {
  if (!record) {
    return 'unseen'
  }

  if (record.status && CHARACTER_STATUSES.has(record.status)) {
    return record.status
  }

  if (!record.learnedAt) {
    return 'unseen'
  }

  if (record.quizCorrect === false) {
    return 'needs_review'
  }

  if (record.quizCorrect !== true) {
    return 'exposed'
  }

  const reviewCount = Math.max(0, record.reviewCount ?? 0)
  const delayedReviewCorrect = record.delayedReviewCorrect ?? reviewCount >= 2
  if (!delayedReviewCorrect) {
    return 'emerging'
  }

  const scheduledCorrectReviews = Math.max(0, record.scheduledCorrectReviews ?? reviewCount - 2)
  if (reviewCount >= 4 && scheduledCorrectReviews >= 2) {
    return 'stable'
  }

  return 'mastered'
}

export function getTaskState(snapshot: TaskStateSnapshot): TaskState {
  if (snapshot.offline || snapshot.syncFailed || snapshot.localOnly) {
    return 'offline'
  }

  if (snapshot.hasResume || snapshot.inProgress) {
    return 'resume'
  }

  if ((snapshot.reviewCount ?? snapshot.dueReviewCount ?? 0) > 0) {
    return 'review'
  }

  if ((snapshot.newCount ?? snapshot.availableNewCount ?? 0) > 0) {
    return 'new'
  }

  if (snapshot.complete || snapshot.isComplete) {
    return 'complete'
  }

  return snapshot.isFirstUse || !snapshot.hasStarted ? 'first' : 'complete'
}
