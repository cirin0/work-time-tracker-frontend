export const WEBSOCKET_CONFIG = {
  broadcaster: 'ably' as const,
  key: import.meta.env.VITE_ABLY_PUBLIC_KEY,
  wsHost: 'realtime-pusher.ably.io',
  wsPort: 443,
  disableStats: true,
  encrypted: true,
}

export const BROADCASTING_AUTH_URL = '/broadcasting/auth'
export const TOKEN_STORAGE_KEY = 'token-store'
