export const STROMINGSDATA_STORAGE_KEY = 'duikvenster.stromingsdata.latest'

export const STROMINGSDATA_URL_TEMPLATE =
  'https://example.com/stromingsdata?siteId={siteId}&dateFrom={dateFrom}&dateTo={dateTo}'

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

export function buildStromingsdataUrl(
  siteId: string,
  dateFrom: string,
  dateTo: string,
): string {
  return STROMINGSDATA_URL_TEMPLATE
    .replace('{siteId}', encodeURIComponent(siteId))
    .replace('{dateFrom}', encodeURIComponent(dateFrom))
    .replace('{dateTo}', encodeURIComponent(dateTo))
}

export async function fetchStromingsdata(
  siteId: string,
  dateFrom?: DateInput,
  dateTo?: DateInput,
): Promise<unknown> {
  if (siteId.trim() === '') {
    throw new Error('siteId is required')
  }

  const normalizedDateFrom = resolveDateInput(dateFrom, getDefaultDateFrom())
  const normalizedDateTo = resolveDateInput(dateTo, getDefaultDateTo())

  const url = buildStromingsdataUrl(siteId, normalizedDateFrom, normalizedDateTo)
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `Failed to fetch stromingsdata for "${siteId}" (${normalizedDateFrom} to ${normalizedDateTo}): HTTP ${response.status}`,
    )
  }

  const payload: unknown = await response.json()
  window.localStorage.setItem(
    STROMINGSDATA_STORAGE_KEY,
    JSON.stringify({
      siteId,
      dateFrom: normalizedDateFrom,
      dateTo: normalizedDateTo,
      payload,
    }),
  )
  return payload
}
