import { toStromingEvent, type StromingEvent } from './stromingEvent'
import { Duikvenster } from './Duikvenster'

const DUIKVENSTER_THRESHOLD = 0.2 //=20 cm/s, suggested by NOB

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
          se.value
        )
        currentWindow.updateKenteringTypeAtOpenWindow(se.richting)
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
        currentWindow.updateKenteringTypeAtClosingWindow(se.richting)
        windows.push(currentWindow)
      }
      currentWindow = null
    }
  }

  // windows at the end of the horizon are ignored on purpose

  return windows
}
