export const CHAT_ROUTES = {
  messagesIndex: (receiverId: number | string) => `/messages/${receiverId}`,
  messagesStore: '/messages',
} as const
