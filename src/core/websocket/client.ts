import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { WEBSOCKET_CONFIG } from '../config/websocket.config'
import { createEchoAuthorizer } from './authorizer'

declare global {
  interface Window {
    Pusher: typeof Pusher
  }
}

window.Pusher = Pusher

export const echoClient = new Echo({
  broadcaster: WEBSOCKET_CONFIG.broadcaster,
  key: WEBSOCKET_CONFIG.key,
  wsHost: WEBSOCKET_CONFIG.wsHost,
  wsPort: WEBSOCKET_CONFIG.wsPort,
  disableStats: WEBSOCKET_CONFIG.disableStats,
  encrypted: WEBSOCKET_CONFIG.encrypted,
  authorizer: createEchoAuthorizer,
})
