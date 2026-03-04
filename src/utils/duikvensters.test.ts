import { getDuikvensters } from './duikvensters'

describe('getDuikvensters', () => {
  it('builds van/tot windows from stromingsdata events', () => {
    const stromingsdata = [
      { timeStamp: '2026-03-04T09:00:00Z', value: 0.34 },
      { timeStamp: '2026-03-04T10:00:00Z', value: 0.21 },
      { timeStamp: '2026-03-04T11:00:00Z', value: 0.18 },
      { timeStamp: '2026-03-04T12:00:00Z', value: 0.26 },
    ]

    expect(getDuikvensters(stromingsdata)).toEqual([
      {
        van: '2026-03-04T09:00:00Z',
        tot: '2026-03-04T10:00:00Z',
      },
      {
        van: '2026-03-04T11:00:00Z',
        tot: '2026-03-04T12:00:00Z',
      },
    ])
  })

  it('ignores invalid events', () => {
    const stromingsdata = [
      null,
      { value: 0.34 },
      { timeStamp: '', value: 0.34 },
      { timeStamp: '2026-03-04T10:00:00Z', value: 'NaN' },
      { timeStamp: '2026-03-04T11:00:00Z', value: 0.21 },
      { timeStamp: '2026-03-04T12:00:00Z', value: 0.18 },
    ]

    expect(getDuikvensters(stromingsdata)).toEqual([
      {
        van: '2026-03-04T11:00:00Z',
        tot: '2026-03-04T12:00:00Z',
      },
    ])
  })
})
