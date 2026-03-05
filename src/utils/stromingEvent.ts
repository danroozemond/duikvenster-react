export type StromingEvent = {
  timestamp: string
  value: number
}

export function toStromingEvent(event: unknown): StromingEvent | null {
  if (typeof event !== 'object' || event === null) {
    return null
  }

  const rawTimestamp = (event as { timeStamp?: unknown }).timeStamp
  const rawValue = (event as { value?: unknown }).value

  if (typeof rawTimestamp !== 'string' || rawTimestamp.trim() === '') {
    return null
  }

  const numericValue =
    typeof rawValue === 'number' ? rawValue : Number(rawValue)
  if (!Number.isFinite(numericValue)) {
    return null
  }

  return {
    timestamp: rawTimestamp,
    value: numericValue,
  }
}
