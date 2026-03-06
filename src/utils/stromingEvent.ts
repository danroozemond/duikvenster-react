export type StromingEvent = {
  timestamp: string
  value: number
  richting: number | null
}

export function toStromingEvent(event: unknown): StromingEvent | null {
  if (typeof event !== 'object' || event === null) {
    return null
  }

  const rawTimestamp = (event as { timeStamp?: unknown }).timeStamp
  const rawValue = (event as { value?: unknown }).value
  const rawRichting = (event as { richting?: unknown }).richting

  if (typeof rawTimestamp !== 'string' || rawTimestamp.trim() === '') {
    return null
  }

  const numericValue =
    typeof rawValue === 'number' ? rawValue : Number(rawValue)
  if (!Number.isFinite(numericValue)) {
    return null
  }
  const numericRichting =
    typeof rawRichting === 'number' ? rawRichting : Number(rawRichting)

  return {
    timestamp: rawTimestamp,
    value: numericValue,
    richting: Number.isFinite(numericRichting) ? numericRichting : null,
  }
}
