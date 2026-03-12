import type { Character } from '@/types/character'
import { http } from '@/http/http'

/** 批量获取汉字数据 */
export function getCharactersBatch(ids: string[]) {
  return http.get<Character[]>('/characters/batch', { ids: ids.join(',') } as any)
}
