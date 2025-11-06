import { API_BASE_URL } from '@/config/api'

export function getAvatarUrl(avatarPath: string | null | undefined): string | null {
  if (!avatarPath) return null

  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath
  }

  return `${API_BASE_URL}${avatarPath}`
}
