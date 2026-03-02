import {
  fetchStromingsdata,
  getDefaultDateFrom,
  getDefaultDateTo,
  STROMINGSDATA_STORAGE_KEY,
} from './stromingsdata'

describe('fetchStromingsdata', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('uses yesterday/day-after-tomorrow defaults when no dates are provided', async () => {
    vi.useFakeTimers()
    const now = new Date('2026-03-02T12:00:00.000Z')
    vi.setSystemTime(now)

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    } as Response)
    vi.stubGlobal('fetch', fetchMock)

    await fetchStromingsdata('zeeheks')

    const expectedDateFrom = getDefaultDateFrom(now)
    const expectedDateTo = getDefaultDateTo(now)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(
        `siteId=zeeheks&dateFrom=${expectedDateFrom}&dateTo=${expectedDateTo}`,
      ),
    )
  })

  it('stores fetched payload in localStorage as latest result', async () => {
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

    expect(result).toEqual(payload)
    expect(window.localStorage.getItem(STROMINGSDATA_STORAGE_KEY)).toEqual(
      JSON.stringify({
        siteId: 'zeeheks',
        dateFrom: '2026-03-01',
        dateTo: '2026-03-04',
        payload,
      }),
    )
  })

  it('always fetches, even if localStorage already contains prior data', async () => {
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

    expect(result).toEqual(payload)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(window.localStorage.getItem(STROMINGSDATA_STORAGE_KEY)).toEqual(
      JSON.stringify({
        siteId: 'zeeheks',
        dateFrom: '2026-03-01',
        dateTo: '2026-03-04',
        payload,
      }),
    )
  })
})
