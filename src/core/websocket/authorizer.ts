import { API_BASE_URL, apiClient } from '../api/client'
import { BROADCASTING_AUTH_URL, TOKEN_STORAGE_KEY } from '../config/websocket.config'

interface EchoChannel {
  name: string
}

interface AuthCallback {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (error: Error | null, data: any): void
}

export const createEchoAuthorizer = (channel: EchoChannel) => {
  return {
    authorize: (socketId: string, callback: AuthCallback) => {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY)

      apiClient
        .post(
          `${API_BASE_URL}${BROADCASTING_AUTH_URL}`,
          {
            socket_id: socketId,
            channel_name: channel.name,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        .then((response) => {
          callback(null, response.data)
        })
        .catch((error) => {
          callback(error, null)
        })
    },
  }
}
