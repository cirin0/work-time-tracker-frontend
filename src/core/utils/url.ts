import { API_BASE_URL } from '../api/client'

export function getAvatarUrl(
  avatarPath: string | null | undefined,
  timestamp?: number,
): string | null {
  if (!avatarPath) return null

  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath
  }

  const baseUrl = `${API_BASE_URL}${avatarPath}`
  if (timestamp) {
    return `${baseUrl}?t=${timestamp}`
  }
  return baseUrl
}
