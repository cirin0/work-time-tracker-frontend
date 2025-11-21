export interface Message {
  id: number
  sender_id: number
  receiver_id: number
  message: string
  created_at: string
  updated_at: string
  sender?: {
    id: number
    name: string
    email: string
  }
  receiver?: {
    id: number
    name: string
    email: string
  }
}

export interface SendMessageRequest {
  receiver_id: number
  message: string
}
