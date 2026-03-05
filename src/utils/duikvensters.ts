import { toStromingEvent, type StromingEvent } from './stromingEvent'

export type Duikvenster = {
  van: string
  tot: string
}

const DUIKVENSTER_THRESHOLD = 0.2 //=20 cm/s, suggested by NOB
const MIN_DUIKVENSTER_DURATION_MS = 30 * 60 * 1000

function hasMinimumDuration(van: string, tot: string): boolean {
  const fromMs = new Date(van).getTime()
  const toMs = new Date(tot).getTime()

  if (!Number.isFinite(fromMs) || !Number.isFinite(toMs)) {
    return false
  }

  return toMs - fromMs >= MIN_DUIKVENSTER_DURATION_MS
}

export function getDuikvensters(stromingsdata: unknown[]): Duikvenster[] {
  const orderedData: StromingEvent[] = stromingsdata
    .map(toStromingEvent)
    .filter((event): event is StromingEvent => event !== null)
    .sort((left, right) => left.timestamp.localeCompare(right.timestamp))

  const windows: Duikvenster[] = []
  let currentVan: string | null = null
  let currentTot: string | null = null

  for (const se of orderedData) {
    if (se.value <= DUIKVENSTER_THRESHOLD) {
      // open new window, or extend existing window
      if (currentVan === null) {
        currentVan = se.timestamp
      }
      currentTot = se.timestamp
    } else if (currentVan !== null && currentTot !== null) {
      // close window (and store)
      if (hasMinimumDuration(currentVan, currentTot)) {
        windows.push({ van: currentVan, tot: currentTot })
      }
      currentVan = null
      currentTot = null
    }
  }

  // windows at the end of the horizon are ignored on purpose

  return windows
}
