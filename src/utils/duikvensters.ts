export type Duikvenster = {
  van: string
  tot: string
}

type StromingEvent = {
  timeStamp: string
  value: number
}

function toStromingEvent(event: unknown): StromingEvent | null {
  if (typeof event !== 'object' || event === null) {
    return null
  }

  const rawTimeStamp = (event as { timeStamp?: unknown }).timeStamp
  const rawValue = (event as { value?: unknown }).value

  if (typeof rawTimeStamp !== 'string' || rawTimeStamp.trim() === '') {
    return null
  }

  const numericValue =
    typeof rawValue === 'number' ? rawValue : Number(rawValue)
  if (!Number.isFinite(numericValue)) {
    return null
  }

  return {
    timeStamp: rawTimeStamp,
    value: numericValue,
  }
}

export function getDuikvensters(stromingsdata: unknown[]): Duikvenster[] {
  // Placeholder logic to derive "van/tot" windows from the same raw data as the chart.
  // Replace with real duikvenster rules later.
  const orderedTimeStamps = stromingsdata
    .map(toStromingEvent)
    .filter((event): event is StromingEvent => event !== null)
    .sort(
      (a, b) =>
        new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime(),
    )
    .map((event) => event.timeStamp)

  const windows: Duikvenster[] = []

  for (let index = 0; index < orderedTimeStamps.length - 1; index += 2) {
    windows.push({
      van: orderedTimeStamps[index],
      tot: orderedTimeStamps[index + 1],
    })
  }

  return windows
}
