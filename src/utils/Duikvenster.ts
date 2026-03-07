const MIN_DUIKVENSTER_DURATION_MS = 30 * 60 * 1000

export class Duikvenster {
  van: string
  tot: string
  kentering: string
  kentering_value: number
  kentering_type: string

  constructor(
    van: string,
    tot: string,
    kentering: string,
    kenteringValue: number,
    kenteringType: string = '',
  ) {
    this.van = van
    this.tot = tot
    this.kentering = kentering
    this.kentering_value = kenteringValue
    this.kentering_type = kenteringType
  }

  hasMinimumDuration(): boolean {
    const fromMs = new Date(this.van).getTime()
    const toMs = new Date(this.tot).getTime()

    if (!Number.isFinite(fromMs) || !Number.isFinite(toMs)) {
      return false
    }

    return toMs - fromMs >= MIN_DUIKVENSTER_DURATION_MS
  }

  updateKenteringTypeAtOpenWindow(stroomrichting: number | null) {
    // Set; stroomrichting < 180 -> oostwaarts -> de kentering *wordt* HW
    if (stroomrichting != null) {
      this.kentering_type = stroomrichting < 180.0 ? 'HW' : 'LW'
    } else {
      this.kentering_type = ''
    }
  }

  updateKenteringTypeAtClosingWindow(stroomrichting: number | null) {
    // Check; stroomrichting < 180 -> oostwaarts -> de kentering *was* LW
    // If it doesn't match, reset (apparently we're not sure)
    if (stroomrichting == null) {
      return
    }

    const kt = stroomrichting < 180.0 ? 'LW' : 'HW'
    if (this.kentering_type != kt) {
      this.kentering_type = ''
    }
  }
}
