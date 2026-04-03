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

export interface IUnitOverviewItem {
  id: string
  name: string
  lesson: string
  chars: string[]
  totalChars: number
  charIndex: number
  learnCompleted: boolean
  testCompleted: boolean
  stars: number
  status: 'not_started' | 'learning' | 'ready_for_test' | 'tested'
}

export interface IUnitOverviewStage {
  id: string
  name: string
  units: IUnitOverviewItem[]
}

export interface IUnitOverviewResponse {
  libraryId: string
  libraryName: string
  stages: IUnitOverviewStage[]
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

export function getUnitOverview(libraryId: string) {
  return http.get<IUnitOverviewResponse>(`/learning/unit-overview?libraryId=${libraryId}`)
}
