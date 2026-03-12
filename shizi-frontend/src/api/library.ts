import type { Library } from '@/types/character'
import { http } from '@/http/http'

/** 获取字库列表（不含 stages 详情） */
export function getLibraries() {
  return http.get<Library[]>('/libraries')
}

/** 获取字库详情（含完整 stages/units/chars） */
export function getLibraryById(id: string) {
  return http.get<Library>(`/libraries/${id}`)
}
