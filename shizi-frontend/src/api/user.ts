import { http } from '@/http/http'

export interface IChildInfo {
  name?: string
  age_group?: string
  current_library?: string
  daily_new_chars?: number
}

export function updateChild(data: IChildInfo) {
  return http.put<any>('/user/child', data)
}
