import { apiClient } from '@/shared/api/client'
import type { Message, SendMessageRequest } from '../lib/message.interface'
import { CHAT_ROUTES } from './chat.routes'

export async function fetchMessages(receiverId: number) {
  const { data } = await apiClient.get<Message[]>(CHAT_ROUTES.messagesIndex(receiverId))
  return data
}

export async function sendMessageRequest(payload: SendMessageRequest) {
  const { data } = await apiClient.post<Message>(CHAT_ROUTES.messagesStore, payload)
  return data
}
