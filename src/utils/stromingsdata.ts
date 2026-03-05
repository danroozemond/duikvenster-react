export const STROMINGSDATA_STORAGE_KEY = 'duikvenster.stromingsdata.latest'

export const STROMINGSDATA_URL_TEMPLATE =
    'https://rwsos.rws.nl/wb-api/dd/2.0/timeseries?observationTypeId=SG_SOF_6.1.ms&sourceName=compute&locationCode={siteId}&startTime={dateTimeFrom}&endTime={dateTimeTo}'

export const STROMINGSRICHTING_URL_TEMPLATE =
    'https://rwsos.rws.nl/wb-api/dd/2.0/timeseries?observationTypeId=SG.2&sourceName=SOF_6&locationCode={siteId}&startTime={dateTimeFrom}&endTime={dateTimeTo}'


// note voorbeeld stroomsnelheid
// https://rwsos.rws.nl/wb-api/dd/2.0/timeseries?observationTypeId=SG_SOF_6.1.ms&sourceName=compute&locationCode=znp2&startTime=2026-03-03T23%3A00%3A00Z&endTime=2026-03-07T22%3A59%3A59Z

// note voorbeeld richting
// https://rwsos.rws.nl/wb-api/dd/2.0/timeseries?observationTypeId=SG.2&sourceName=SOF_6&locationCode=znp2&startTime=2026-03-03T23%3A00%3A00Z&endTime=2026-03-07T22%3A59%3A59Z

// note voorbeeld waterhoogte, dit zijn andere locaties, dus onhandig.
// https://rwsos.rws.nl/wb-api/dd/2.0/timeseries?observationTypeId=WT&sourceName=h_6&locationCode=zn&startTime=2026-03-03T23%3A00%3A00Z&endTime=2026-03-07T22%3A59%3A59Z


type DateInput = Date | string

function padNumber(value: number): string {
  return value.toString().padStart(2, '0')
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = padNumber(date.getMonth() + 1)
  const day = padNumber(date.getDate())
  return `${year}-${month}-${day}`
}

function formatUtcDateTime(date: Date): string {
  const year = date.getUTCFullYear()
  const month = padNumber(date.getUTCMonth() + 1)
  const day = padNumber(date.getUTCDate())
  const hour = padNumber(date.getUTCHours())
  const minute = padNumber(date.getUTCMinutes())
  const second = padNumber(date.getUTCSeconds())
  return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`
}

function resolveDateInput(input: DateInput | undefined, fallback: string): string {
  if (input === undefined) {
    return fallback
  }

  if (input instanceof Date) {
    return formatDate(input)
  }

  const trimmedInput = input.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedInput)) {
    return trimmedInput
  }

  const parsedDate = new Date(trimmedInput)
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error(`Invalid date value: "${input}"`)
  }

  return formatDate(parsedDate)
}

function parseLocalDate(value: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) {
    throw new Error(`Invalid local date format: "${value}"`)
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  }
}

export function getDefaultDateFrom(baseDate: Date = new Date()): string {
  const yesterday = new Date(baseDate)
  yesterday.setDate(yesterday.getDate() - 1)
  return formatDate(yesterday)
}

export function getDefaultDateTo(baseDate: Date = new Date()): string {
  const dayAfterTomorrow = new Date(baseDate)
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
  return formatDate(dayAfterTomorrow)
}

export function toUtcDateTimeFromLocalDate(
  localDate: string,
  boundary: 'start' | 'end',
): string {
  const { year, month, day } = parseLocalDate(localDate)
  const hour = boundary === 'start' ? 0 : 23
  const minute = boundary === 'start' ? 0 : 59
  const second = boundary === 'start' ? 0 : 59

  // Convert local wall-clock time to UTC using browser timezone offset.
  const localDateTime = new Date(year, month - 1, day, hour, minute, second)
  const offsetMinutes = localDateTime.getTimezoneOffset()
  const utcMs =
    Date.UTC(year, month - 1, day, hour, minute, second) +
    offsetMinutes * 60_000

  return formatUtcDateTime(new Date(utcMs))
}

export function buildStromingsdataUrl(
  url: string,
  siteId: string,
  dateTimeFrom: string,
  dateTimeTo: string,
): string {
  return url
    .replace('{siteId}', encodeURIComponent(siteId))
    .replace('{dateTimeFrom}', encodeURIComponent(dateTimeFrom))
    .replace('{dateTimeTo}', encodeURIComponent(dateTimeTo))
}

async function fetchEventsFromUrl(url: string): Promise<unknown[]> {
  let events: unknown[] = []

  try {
    const response = await fetch(url)

    if (response.ok) {
      const payload: unknown = await response.json()
      if (
        typeof payload === 'object' &&
        payload !== null &&
        'results' in payload &&
        Array.isArray((payload as { results: unknown[] }).results)
      ) {
        const firstResult = (payload as { results: unknown[] }).results[0]
        if (
          typeof firstResult === 'object' &&
          firstResult !== null &&
          'events' in firstResult &&
          Array.isArray((firstResult as { events: unknown[] }).events)
        ) {
          events = (firstResult as { events: unknown[] }).events
        }
      }
    }
  } catch {
    events = []
  }

  return events
}

export async function fetchStromingsdata(
  siteId: string,
  dateFrom?: DateInput,
  dateTo?: DateInput,
): Promise<unknown[]> {
  if (siteId.trim() === '') {
    throw new Error('siteId is required')
  }

  const normalizedDateFrom = resolveDateInput(dateFrom, getDefaultDateFrom())
  const normalizedDateTo = resolveDateInput(dateTo, getDefaultDateTo())
  const normalizedDateTimeFrom = toUtcDateTimeFromLocalDate(
    normalizedDateFrom,
    'start',
  )
  const normalizedDateTimeTo = toUtcDateTimeFromLocalDate(
    normalizedDateTo,
    'end',
  )

  const url_stroming = buildStromingsdataUrl(
      STROMINGSDATA_URL_TEMPLATE,
      siteId,
      normalizedDateTimeFrom,
      normalizedDateTimeTo,
  )
  const url_richting = buildStromingsdataUrl(
      STROMINGSRICHTING_URL_TEMPLATE,
      siteId,
      normalizedDateTimeFrom,
      normalizedDateTimeTo,
  )

  const events = await fetchEventsFromUrl(url_stroming)
  const events_richting = await fetchEventsFromUrl(url_richting)

  console.log(events_richting)

  window.localStorage.setItem(
    STROMINGSDATA_STORAGE_KEY,
    JSON.stringify({
      siteId,
      dateTimeFrom: normalizedDateTimeFrom,
      dateTimeTo: normalizedDateTimeTo,
      events,
    }),
  )
  return events
}
