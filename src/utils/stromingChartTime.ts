export type SixHourAxisBounds = {
  min: number
  max: number
  tickAmount: number
}

export type SixHourAnnotation = {
  x: number
  borderColor: string
  strokeDashArray: number
}

const SIX_HOURS_MS = 6 * 60 * 60 * 1000

export function formatLocalAxisDateTime(valueMs: number): string {
  const date = new Date(valueMs)
  const weekday = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
  }).format(date)
  const day = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
  })
    .format(date)
  const hour = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    hour12: false,
  }).format(date)

  return `${weekday} ${day}, ${hour}u`
}

export function formatLocalTooltipDateTime(valueMs: number): string {
  return new Intl.DateTimeFormat('nl-NL', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(valueMs))
}

export function toTimestampMs(value: string): number | null {
  const timestampMs = Date.parse(value)
  if (Number.isNaN(timestampMs)) {
    return null
  }

  return timestampMs
}

export function alignLocalFloorToSixHours(valueMs: number): number {
  const date = new Date(valueMs)
  date.setMinutes(0, 0, 0)
  date.setHours(Math.floor(date.getHours() / 6) * 6)
  return date.getTime()
}

export function alignLocalCeilToSixHours(valueMs: number): number {
  const floorMs = alignLocalFloorToSixHours(valueMs)
  if (floorMs === valueMs) {
    return floorMs
  }

  return floorMs + SIX_HOURS_MS
}

export function buildSixHourAxisBounds(
  timestamps: number[],
): SixHourAxisBounds | null {
  if (timestamps.length === 0) {
    return null
  }

  const minTimestampMs = Math.min(...timestamps)
  const maxTimestampMs = Math.max(...timestamps)
  const min = alignLocalFloorToSixHours(minTimestampMs)
  const max = alignLocalCeilToSixHours(maxTimestampMs)
  const tickAmount = Math.max(1, Math.floor((max - min) / SIX_HOURS_MS))

  return { min, max, tickAmount }
}

export function buildSixHourAnnotations(
  timestamps: number[],
): SixHourAnnotation[] {
  if (timestamps.length === 0) {
    return []
  }

  const minMs = alignLocalFloorToSixHours(Math.min(...timestamps))
  const maxMs = alignLocalCeilToSixHours(Math.max(...timestamps))
  const annotations: SixHourAnnotation[] = []

  for (let markerMs = minMs; markerMs <= maxMs; markerMs += SIX_HOURS_MS) {
    annotations.push({
      x: markerMs,
      borderColor: '#d3d7df',
      strokeDashArray: 0,
    })
  }

  return annotations
}
