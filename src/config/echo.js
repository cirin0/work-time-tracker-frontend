import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import axios from 'axios'

window.Pusher = Pusher

const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST,
  wsPort: import.meta.env.VITE_REVERB_PORT,
  wssPort: import.meta.env.VITE_REVERB_PORT,
  forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
  enabledTransports: ['ws', 'wss'],

  authorizer: (channel) => {
    return {
      authorize: (socketId, callback) => {
        const token = localStorage.getItem('token-store')
        axios
          .post(
            'http://localhost:8000/broadcasting/auth',
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
  },
})

export default echo
