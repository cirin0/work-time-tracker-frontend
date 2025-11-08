import { onUnmounted } from 'vue'
import echo from '@/config/echo'
import type { User } from '@/types/interfaces/user.interface'
import type { Message } from '@/types/interfaces/message.interface'

export function useChatWebSocket(
  currentUser: { value: User | null },
  onMessageReceived: (message: Message) => void,
) {
  function setupWebSocket() {
    if (!currentUser.value) return

    const channel = echo.private(`chat.${currentUser.value.id}`)

    channel
      .listen(
        '.new-message',
        (e: { message: string; user: { id: number; name: string; email: string } }) => {
          const newMsg: Message = {
            id: Date.now(),
            sender_id: e.user.id,
            receiver_id: currentUser.value!.id,
            message: e.message,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sender: e.user,
          }
          onMessageReceived(newMsg)
        },
      )
      .error((error: Error) => {
        console.error('Echo channel error:', error)
      })
  }

  function cleanup() {
    if (currentUser.value) {
      echo.leave(`chat.${currentUser.value.id}`)
    }
  }

  onUnmounted(() => {
    cleanup()
  })

  return {
    setupWebSocket,
    cleanup,
  }
}
