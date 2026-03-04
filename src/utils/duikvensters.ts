import { toStromingEvent, type StromingEvent } from './stromingEvent'

export type Duikvenster = {
  van: string
  tot: string
}

export function getDuikvensters(stromingsdata: unknown[]): Duikvenster[] {
  // Logic to derive "van/tot" windows
  const orderedData:StromingEvent[] = stromingsdata
    .map(toStromingEvent)
    .filter((event): event is StromingEvent => event !== null)
    .sort()

  const windows: Duikvenster[] = []

  orderedData.forEach(strev => {
    windows.push({
      van: strev.timestamp,
      tot: strev.timestamp
    })
  })

  return windows
}
