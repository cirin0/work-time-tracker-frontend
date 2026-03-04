type TokenHandlers = {
  get: () => string | undefined
  set: (token: string) => void
  clear: () => void
}

let _get: () => string | undefined = () => undefined
let _set: (token: string) => void = () => {}
let _clear: () => void = () => {}
let _registered = false

export const tokenService = {
  register(handlers: TokenHandlers) {
    if (_registered) return
    _registered = true
    _get = handlers.get
    _set = handlers.set
    _clear = handlers.clear
  },
  get: (): string | undefined => _get(),
  set: (token: string): void => _set(token),
  clear: (): void => _clear(),
}
