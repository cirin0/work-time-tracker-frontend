/**
 * Parses an ISO 8601 date string from the backend into a JS Date object.
 * Falls back to current date and logs an error on invalid input.
 */
export function parseDate(dateString: string | null | undefined): Date {
  if (!dateString) {
    return new Date()
  }

  const date = new Date(dateString)

  if (isNaN(date.getTime())) {
    console.error('Invalid date string:', dateString)
    return new Date()
  }

  return date
}

/**
 * Formats a date value for display to the user.
 * Accepts a Date object, an ISO string, or null/undefined.
 * Returns a Ukrainian-locale formatted date string (DD.MM.YYYY).
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'

  const d = date instanceof Date ? date : new Date(date)

  if (isNaN(d.getTime())) {
    console.error('Invalid date value:', date)
    return '—'
  }

  return d.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Formats a date value with time for display.
 * Returns a Ukrainian-locale formatted datetime string (DD.MM.YYYY HH:MM).
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—'

  const d = date instanceof Date ? date : new Date(date)

  if (isNaN(d.getTime())) {
    console.error('Invalid date value:', date)
    return '—'
  }

  return d.toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Formats a date value to display only the time portion.
 * Returns a formatted time string (HH:MM).
 */
export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return '—'

  const d = date instanceof Date ? date : new Date(date)

  if (isNaN(d.getTime())) {
    console.error('Invalid date value:', date)
    return '—'
  }

  return d.toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Returns today's date as a YYYY-MM-DD string, suitable for use as
 * the `min` attribute on HTML date inputs.
 */
export function todayAsInputDate(): string {
  return new Date().toISOString().split('T')[0]!
}

/**
 * Formats a duration given in total minutes into a human-readable
 * Ukrainian string, e.g. "2г 15хв" or "45хв".
 */
export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}г ${m}хв` : `${m}хв`
}

/**
 * Calculates elapsed time in minutes from a given ISO start time to now.
 */
export function calculateElapsedMinutes(startTime: string | null | undefined): number {
  if (!startTime) return 0

  const start = new Date(startTime)
  const now = new Date()

  if (isNaN(start.getTime())) {
    console.error('Invalid start time:', startTime)
    return 0
  }

  const diffMs = now.getTime() - start.getTime()
  return Math.floor(diffMs / 1000 / 60) // Convert to minutes
}

/**
 * Formats elapsed time from start time to now.
 * Returns a formatted string like "3г 25хв".
 */
export function formatElapsedTime(startTime: string | null | undefined): string {
  return formatMinutes(calculateElapsedMinutes(startTime))
}
