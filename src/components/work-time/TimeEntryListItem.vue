<script setup lang="ts">
import { computed } from 'vue'
import type { TimeEntry } from '@/types/interfaces/timeEntry.interface'
import { formatDate, formatTime, formatMinutes } from '@/core/utils/date'

interface Props {
  entry: TimeEntry
}

const props = defineProps<Props>()

const entryTypeLabel = computed(() => {
  const typeMap: Record<string, { label: string; icon: string }> = {
    remote: { label: 'Віддалено', icon: '🏠' },
    office: { label: 'В офісі', icon: '🏢' },
    gps: { label: 'GPS', icon: '📍' },
    gps_qr: { label: 'GPS + QR', icon: '📍' },
    manual: { label: 'Вручну', icon: '✍️' },
  }
  return typeMap[props.entry.entry_type] || { label: props.entry.entry_type, icon: '📝' }
})

const durationMinutes = computed(() => {
  return Math.floor((props.entry.duration || 0) / 60)
})

const badges = computed(() => {
  const result = []

  // Lateness badge
  if (props.entry.lateness_minutes) {
    if (props.entry.lateness_minutes > 0) {
      result.push({
        type: 'late',
        icon: '⏰',
        text: `Запізнення ${props.entry.lateness_minutes}хв`,
      })
    } else if (props.entry.lateness_minutes < 0) {
      result.push({
        type: 'early',
        icon: '🌅',
        text: `Раніше на ${Math.abs(props.entry.lateness_minutes)}хв`,
      })
    }
  }

  // Early leave badge
  if (props.entry.early_leave_minutes && props.entry.early_leave_minutes > 0) {
    result.push({
      type: 'early-leave',
      icon: '🚪',
      text: `Раніше на ${props.entry.early_leave_minutes}хв`,
    })
  }

  // Overtime badge
  if (props.entry.overtime_minutes && props.entry.overtime_minutes > 0) {
    result.push({
      type: 'overtime',
      icon: '⚡',
      text: `Понаднормово ${props.entry.overtime_minutes}хв`,
    })
  }

  // On-time badge (if no lateness and has scheduled time)
  if (
    props.entry.scheduled_start_time &&
    (!props.entry.lateness_minutes || props.entry.lateness_minutes === 0) &&
    props.entry.stop_time
  ) {
    result.push({
      type: 'on-time',
      icon: '✅',
      text: 'Вчасно',
    })
  }

  return result
})

const isActive = computed(() => !props.entry.stop_time)
</script>

<template>
  <div class="entry-item" :class="{ active: isActive }">
    <div class="entry-header">
      <div class="entry-date-info">
        <span class="entry-date">{{ formatDate(entry.date) }}</span>
        <span class="entry-type">
          <span class="type-icon">{{ entryTypeLabel.icon }}</span>
          <span class="type-label">{{ entryTypeLabel.label }}</span>
        </span>
      </div>
      <div class="entry-duration">
        {{ formatMinutes(durationMinutes) }}
      </div>
    </div>

    <div class="entry-time">
      <span class="time-value">{{ formatTime(entry.start_time) }}</span>
      <span class="time-arrow">→</span>
      <span class="time-value">{{ isActive ? '...' : formatTime(entry.stop_time) }}</span>
    </div>

    <div v-if="badges.length > 0" class="entry-badges">
      <span
        v-for="(badge, index) in badges"
        :key="index"
        class="badge"
        :class="`badge-${badge.type}`"
      >
        <span class="badge-icon">{{ badge.icon }}</span>
        <span class="badge-text">{{ badge.text }}</span>
      </span>
    </div>

    <div v-if="entry.start_comment || entry.stop_comment" class="entry-comments">
      <p v-if="entry.start_comment" class="comment">
        <span class="comment-label">Початок:</span> {{ entry.start_comment }}
      </p>
      <p v-if="entry.stop_comment" class="comment">
        <span class="comment-label">Завершення:</span> {{ entry.stop_comment }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.entry-item {
  padding: 1rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  transition: all 0.2s;
}

.entry-item:hover {
  border-color: var(--accent-2);
  box-shadow: 0 2px 8px var(--shadow);
}

.entry-item.active {
  border-color: var(--accent-2);
  border-width: 2px;
  background: var(--sand-light);
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.entry-date-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.entry-date {
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text);
}

.entry-type {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--text-muted);
}

.type-icon {
  font-size: 0.875rem;
}

.entry-duration {
  font-family: var(--font-mono);
  font-size: 1rem;
  font-weight: 700;
  color: var(--accent-2);
}

.entry-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.time-value {
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--text);
}

.time-arrow {
  color: var(--text-muted);
}

.entry-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-icon {
  font-size: 0.875rem;
}

.badge-late {
  background: var(--error-bg);
  color: var(--error-text);
  border: 1px solid var(--error-border);
}

.badge-early {
  background: rgba(59, 130, 246, 0.15);
  color: #1e40af;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

[data-theme='dark'] .badge-early {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.badge-early-leave {
  background: rgba(251, 191, 36, 0.15);
  color: #d97706;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

[data-theme='dark'] .badge-early-leave {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.badge-overtime {
  background: rgba(251, 191, 36, 0.15);
  color: #d97706;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

[data-theme='dark'] .badge-overtime {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.badge-on-time {
  background: rgba(34, 197, 94, 0.15);
  color: #16a34a;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

[data-theme='dark'] .badge-on-time {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

.entry-comments {
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
}

.comment {
  margin: 0;
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.comment + .comment {
  margin-top: 0.375rem;
}

.comment-label {
  font-weight: 600;
  color: var(--text);
}

@media (max-width: 768px) {
  .entry-item {
    padding: 0.875rem;
  }

  .entry-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .entry-duration {
    align-self: flex-start;
  }

  .entry-badges {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
