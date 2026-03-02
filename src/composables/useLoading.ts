import { useUiStore } from '@/stores/ui.store'

/**
 * Composable для ручного керування глобальним індикатором завантаження
 *
 * @example
 * ```ts
 * const { withLoading } = useLoading()
 *
 * // Автоматично обгорне функцію в loading state
 * await withLoading(async () => {
 *   await someAsyncOperation()
 * }, 'Завантаження даних...')
 * ```
 */
export function useLoading() {
  const uiStore = useUiStore()

  /**
   * Виконує асинхронну функцію з автоматичним керуванням loading state
   *
   * @param fn - Асинхронна функція для виконання
   * @param message - Опціональне повідомлення для відображення
   * @returns Результат виконання функції
   */
  async function withLoading<T>(fn: () => Promise<T>, message?: string): Promise<T> {
    uiStore.startLoading(message)
    try {
      return await fn()
    } finally {
      uiStore.stopLoading()
    }
  }

  return {
    isLoading: uiStore.isLoading,
    loadingMessage: uiStore.loadingMessage,
    startLoading: uiStore.startLoading,
    stopLoading: uiStore.stopLoading,
    resetLoading: uiStore.resetLoading,
    withLoading,
  }
}
