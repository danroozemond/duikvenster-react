import { toStromingEvent, type StromingEvent } from './stromingEvent'

export type Duikvenster = {
  van: string
  tot: string
}

export function getDuikvensters(stromingsdata: unknown[]): Duikvenster[] {
  // Placeholder logic to derive "van/tot" windows from the same raw data as the chart.
  // Replace with real duikvenster rules later.
  const orderedTimeStamps = stromingsdata
    .map(toStromingEvent)
    .filter((event): event is StromingEvent => event !== null)
    .sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )
    .map((event) => event.timestamp)

  const windows: Duikvenster[] = []

  for (let index = 0; index < orderedTimeStamps.length - 1; index += 2) {
    windows.push({
      van: orderedTimeStamps[index],
      tot: orderedTimeStamps[index + 1],
    })
  }

  return windows
}
