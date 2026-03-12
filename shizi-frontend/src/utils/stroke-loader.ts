import type { Character } from '@/types/character'

let fullDataCache: Map<string, Character> | null = null

/**
 * 按需加载完整汉字数据（含 stroke_paths / stroke_medians）
 * 仅在描红练习等需要笔画数据时调用
 */
export async function loadFullCharData(charId: string): Promise<Character | null> {
  if (!fullDataCache) {
    const data = await import('@/data/characters.json')
    const chars = (data.default || data) as Character[]
    fullDataCache = new Map(chars.map(c => [c._id, c]))
  }
  return fullDataCache.get(charId) || null
}
