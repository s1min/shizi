import { http } from '@/http/http'

/** 学习进度数据（与 learn store 对齐） */
export interface ILearningProgress {
  charRecords: Record<string, any>
  unitProgressMap: Record<string, any>
  wrongRecords: any[]
  learnDays: string[]
  currentLibraryId: string
  currentStageIndex: number
  currentUnitId: string
  clientUpdatedAt: number
}

/** 获取云端学习进度 */
export function getProgress() {
  return http.get<ILearningProgress | null>('/learning/progress')
}

/** 全量覆盖学习进度 */
export function putProgress(data: ILearningProgress) {
  return http.put<ILearningProgress>('/learning/progress', data as any)
}

/** 增量同步学习进度 */
export function syncProgress(data: ILearningProgress) {
  return http.post<ILearningProgress>('/learning/sync', data as any)
}
