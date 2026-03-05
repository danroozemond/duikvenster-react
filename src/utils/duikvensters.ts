import { toStromingEvent, type StromingEvent } from './stromingEvent'

const DUIKVENSTER_THRESHOLD = 0.2 //=20 cm/s, suggested by NOB
const MIN_DUIKVENSTER_DURATION_MS = 30 * 60 * 1000

export class Duikvenster {
  van: string
  tot: string
  kentering: string
  kentering_value: number

  constructor(van: string, tot: string, kentering: string, kenteringValue: number) {
    this.van = van
    this.tot = tot
    this.kentering = kentering
    this.kentering_value = kenteringValue
  }

  hasMinimumDuration(): boolean {
    const fromMs = new Date(this.van).getTime()
    const toMs = new Date(this.tot).getTime()

    if (!Number.isFinite(fromMs) || !Number.isFinite(toMs)) {
      return false
    }

    return toMs - fromMs >= MIN_DUIKVENSTER_DURATION_MS
  }
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
        currentWindow = new Duikvenster(
          se.timestamp,
          se.timestamp,
          se.timestamp,
          se.value,
        )
      }
      // open/extend end of window
      currentWindow.tot = se.timestamp
      // update minimum
      if ( currentWindow.kentering_value > se.value ) {
        currentWindow.kentering = se.timestamp
        currentWindow.kentering_value = se.value
      }
    } else if (currentWindow !== null) {
      // close window (and store)
      if (currentWindow.hasMinimumDuration()) {
        windows.push(currentWindow)
      }
      currentWindow = null
    }
  }

  // windows at the end of the horizon are ignored on purpose

  return windows
}
