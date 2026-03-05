import { toStromingEvent, type StromingEvent } from './stromingEvent'

export type Duikvenster = {
  van: string
  tot: string
  kentering: string
  kentering_value: number
}

const DUIKVENSTER_THRESHOLD = 0.2 //=20 cm/s, suggested by NOB
const MIN_DUIKVENSTER_DURATION_MS = 30 * 60 * 1000

export const Duikvenster = {
  hasMinimumDuration(window: Duikvenster): boolean {
    const fromMs = new Date(window.van).getTime()
    const toMs = new Date(window.tot).getTime()

    if (!Number.isFinite(fromMs) || !Number.isFinite(toMs)) {
      return false
    }

    return toMs - fromMs >= MIN_DUIKVENSTER_DURATION_MS
  },
}

export function getDuikvensters(stromingsdata: unknown[]): Duikvenster[] {
  const orderedData: StromingEvent[] = stromingsdata
    .map(toStromingEvent)
    .filter((event): event is StromingEvent => event !== null)
    .sort((left, right) => left.timestamp.localeCompare(right.timestamp))

  const windows: Duikvenster[] = []
  let currentWindow: Duikvenster | null = null

  for (const se of orderedData) {
    if (se.value <= DUIKVENSTER_THRESHOLD) {
      // open new window, or extend existing window
      if (currentWindow === null) {
        currentWindow = { van: se.timestamp, tot: se.timestamp,
          kentering: se.timestamp, kentering_value: se.value}
      }
      // open/extend end of window
      currentWindow.tot = se.timestamp
      // update minimum
      if ( currentWindow.kentering_value < se.value ) {
        currentWindow.kentering = se.timestamp
        currentWindow.kentering_value = se.value
      }
    } else if (currentWindow !== null) {
      // close window (and store)
      if (Duikvenster.hasMinimumDuration(currentWindow)) {
        windows.push(currentWindow)
      }
      currentWindow = null
    }
  }

  // windows at the end of the horizon are ignored on purpose

  return windows
}
