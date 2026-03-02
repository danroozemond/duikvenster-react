import {
  fetchStromingsdata,
  getDefaultDateFrom,
  getDefaultDateTo,
  STROMINGSDATA_STORAGE_KEY,
  toUtcDateTimeFromLocalDate,
} from './stromingsdata'

describe('fetchStromingsdata', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('uses mocked fetch only and converts default dates to UTC datetimes', async () => {
    vi.useFakeTimers()
    const now = new Date('2026-03-02T12:00:00.000Z')
    vi.setSystemTime(now)
    vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(-60)

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    } as Response)
    vi.stubGlobal('fetch', fetchMock)

    await fetchStromingsdata('zeeheks')

    const expectedDateFrom = getDefaultDateFrom(now)
    const expectedDateTo = getDefaultDateTo(now)
    const expectedDateTimeFrom = toUtcDateTimeFromLocalDate(
      expectedDateFrom,
      'start',
    )
    const expectedDateTimeTo = toUtcDateTimeFromLocalDate(
      expectedDateTo,
      'end',
    )

    expect(vi.isMockFunction(fetch)).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(
        `locationCode=zeeheks&&startTime=${encodeURIComponent(
          expectedDateTimeFrom,
        )}&endTime=${encodeURIComponent(expectedDateTimeTo)}`,
      ),
    )
  })

  it('stores fetched payload in localStorage as latest result with UTC datetimes', async () => {
    vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(-60)

    const payload = { values: [1, 2, 3] }
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => payload,
    } as Response)
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchStromingsdata(
      'zeeheks',
      '2026-03-01',
      '2026-03-04',
    )
    const expectedDateTimeFrom = toUtcDateTimeFromLocalDate(
      '2026-03-01',
      'start',
    )
    const expectedDateTimeTo = toUtcDateTimeFromLocalDate(
      '2026-03-04',
      'end',
    )

    expect(result).toEqual(payload)
    expect(window.localStorage.getItem(STROMINGSDATA_STORAGE_KEY)).toEqual(
      JSON.stringify({
        siteId: 'zeeheks',
        dateTimeFrom: expectedDateTimeFrom,
        dateTimeTo: expectedDateTimeTo,
        payload,
      }),
    )
  })

  it('always fetches, even if localStorage already contains prior data', async () => {
    vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(-60)

    window.localStorage.setItem(
      STROMINGSDATA_STORAGE_KEY,
      JSON.stringify({ siteId: 'old-site', payload: { cached: true } }),
    )

    const payload = { live: true }
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => payload,
    } as Response)
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchStromingsdata(
      'zeeheks',
      '2026-03-01',
      '2026-03-04',
    )

    expect(result).toEqual(payload)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('overwrites previously stored latest data with the new fetch result', async () => {
    vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(-60)

    window.localStorage.setItem(
      STROMINGSDATA_STORAGE_KEY,
      JSON.stringify({ siteId: 'old-site', payload: { old: true } }),
    )
    const payload = { refreshed: true }
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => payload,
    } as Response)
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchStromingsdata(
      'zeeheks',
      '2026-03-01',
      '2026-03-04',
    )
    const expectedDateTimeFrom = toUtcDateTimeFromLocalDate(
      '2026-03-01',
      'start',
    )
    const expectedDateTimeTo = toUtcDateTimeFromLocalDate(
      '2026-03-04',
      'end',
    )

    expect(result).toEqual(payload)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(window.localStorage.getItem(STROMINGSDATA_STORAGE_KEY)).toEqual(
      JSON.stringify({
        siteId: 'zeeheks',
        dateTimeFrom: expectedDateTimeFrom,
        dateTimeTo: expectedDateTimeTo,
        payload,
      }),
    )
  })
})

describe('toUtcDateTimeFromLocalDate', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('converts local date boundaries to UTC datetime strings', () => {
    vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(-60)

    expect(toUtcDateTimeFromLocalDate('2026-03-01', 'start')).toBe(
      '2026-02-28T23:00:00Z',
    )
    expect(toUtcDateTimeFromLocalDate('2026-03-01', 'end')).toBe(
      '2026-03-01T22:59:59Z',
    )
  })
})
