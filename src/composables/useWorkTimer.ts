import type { Ref } from 'vue'
import { ref, computed, watch, onUnmounted } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import { calculateElapsedMinutes, formatMinutes } from '@/core/utils/date'

/**
 * Composable for tracking elapsed work time with live updates.
 * Updates every second to show current work session duration.
 *
 * @param startTime - Ref or string ISO datetime of work session start
 * @returns Reactive elapsed time string (e.g., "3г 25хв")
 */
export function useWorkTimer(
  startTime: Ref<string | null | undefined> | string | null | undefined,
) {
  const startTimeRef = ref(
    typeof startTime === 'string' || startTime === null || startTime === undefined
      ? startTime
      : startTime.value,
  )
  const elapsedMinutes = ref(calculateElapsedMinutes(startTimeRef.value))

  // Update elapsed time every second
  const { pause, resume, isActive } = useIntervalFn(
    () => {
      elapsedMinutes.value = calculateElapsedMinutes(startTimeRef.value)
    },
    1000,
    { immediate: false },
  )

  // Watch for changes in startTime
  if (typeof startTime !== 'string' && startTime !== null && startTime !== undefined) {
    watch(
      startTime,
      (newStartTime) => {
        startTimeRef.value = newStartTime
        elapsedMinutes.value = calculateElapsedMinutes(newStartTime)

        // Restart timer if we have a valid start time
        if (isActive.value) {
          pause()
        }
        if (newStartTime) {
          resume()
        }
      },
      { immediate: true },
    )
  } else {
    // Start timer if we have a valid start time
    if (startTimeRef.value) {
      resume()
    }
  }

  // Format for display
  const formattedTime = computed(() => formatMinutes(elapsedMinutes.value))

  // Cleanup on unmount
  onUnmounted(() => {
    if (isActive.value) {
      pause()
    }
  })

  return {
    elapsedMinutes,
    formattedTime,
    pause,
    resume,
  }
}
