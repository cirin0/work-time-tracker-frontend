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
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  transition: all 0.2s;
}

.entry-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.entry-item.active {
  border-color: #22c55e;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
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
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
}

.entry-type {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.type-icon {
  font-size: 0.875rem;
}

.entry-duration {
  font-size: 1rem;
  font-weight: 700;
  color: #2563eb;
}

.entry-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.time-value {
  font-weight: 600;
  color: #374151;
}

.time-arrow {
  color: #9ca3af;
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
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-icon {
  font-size: 0.875rem;
}

.badge-late {
  background: #fee2e2;
  color: #991b1b;
}

.badge-early {
  background: #dbeafe;
  color: #1e40af;
}

.badge-early-leave {
  background: #fef3c7;
  color: #92400e;
}

.badge-overtime {
  background: #fef3c7;
  color: #92400e;
}

.badge-on-time {
  background: #dcfce7;
  color: #166534;
}

.entry-comments {
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.comment {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
}

.comment + .comment {
  margin-top: 0.375rem;
}

.comment-label {
  font-weight: 600;
  color: #374151;
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
