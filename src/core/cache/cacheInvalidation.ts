import { apiCache } from './apiCache'

export function invalidateCacheOnMutation() {
  return {
    onUserUpdate: () => {
      apiCache.invalidatePattern(/\/users/)
      apiCache.invalidatePattern(/\/managers\/users/)
    },

    onTimeEntryChange: () => {
      apiCache.invalidate('/time-entries/active')
      apiCache.invalidate('/time-entries/summary/me')
      apiCache.invalidatePattern(/\/managers\/time-entries/)
    },

    onLeaveRequestChange: () => {
      apiCache.invalidatePattern(/\/leave-requests/)
      apiCache.invalidatePattern(/\/managers\/leave-requests/)
    },

    onCompanyUpdate: () => {
      apiCache.invalidatePattern(/\/companies/)
    },

    clearAll: () => {
      apiCache.clear()
    },
  }
}

export const cacheInvalidation = invalidateCacheOnMutation()
