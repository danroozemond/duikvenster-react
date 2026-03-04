import {
  alignLocalCeilToSixHours,
  alignLocalFloorToSixHours,
  buildSixHourAnnotations,
  buildSixHourAxisBounds,
  formatLocalAxisDateTime,
  formatLocalTooltipDateTime,
  toTimestampMs,
} from './stromingChartTime'

describe('stromingChartTime', () => {
  it('parses valid timestamps and rejects invalid values', () => {
    expect(toTimestampMs('2026-03-04T06:00:00Z')).toBeTypeOf('number')
    expect(toTimestampMs('not-a-date')).toBeNull()
  })

  it('aligns floor/ceil to local 6-hour boundaries', () => {
    const valueMs = new Date(2026, 2, 4, 7, 23, 12).getTime()
    const floorMs = alignLocalFloorToSixHours(valueMs)
    const ceilMs = alignLocalCeilToSixHours(valueMs)

    const floorDate = new Date(floorMs)
    const ceilDate = new Date(ceilMs)

    expect(floorDate.getHours()).toBe(6)
    expect(floorDate.getMinutes()).toBe(0)
    expect(floorDate.getSeconds()).toBe(0)

    expect(ceilDate.getHours()).toBe(12)
    expect(ceilDate.getMinutes()).toBe(0)
    expect(ceilDate.getSeconds()).toBe(0)
  })

  it('does not move ceil when value is exactly on a 6-hour boundary', () => {
    const boundaryMs = new Date(2026, 2, 4, 18, 0, 0).getTime()
    expect(alignLocalCeilToSixHours(boundaryMs)).toBe(boundaryMs)
  })

  it('builds six-hour axis bounds from timestamps', () => {
    const timestamps = [
      new Date(2026, 2, 4, 1, 20, 0).getTime(),
      new Date(2026, 2, 4, 13, 1, 0).getTime(),
    ]

    expect(buildSixHourAxisBounds(timestamps)).toEqual({
      min: new Date(2026, 2, 4, 0, 0, 0).getTime(),
      max: new Date(2026, 2, 4, 18, 0, 0).getTime(),
      tickAmount: 3,
    })
  })

  it('returns null bounds and empty annotations for empty input', () => {
    expect(buildSixHourAxisBounds([])).toBeNull()
    expect(buildSixHourAnnotations([])).toEqual([])
  })

  it('builds 6-hour annotations with heavier midnight lines', () => {
    const timestamps = [
      new Date(2026, 2, 4, 1, 0, 0).getTime(),
      new Date(2026, 2, 4, 13, 0, 0).getTime(),
    ]

    expect(buildSixHourAnnotations(timestamps)).toEqual([
      {
        x: new Date(2026, 2, 4, 0, 0, 0).getTime(),
        borderColor: '#9aa3b2',
        borderWidth: 2,
      strokeDashArray: 0,
      },
      {
        x: new Date(2026, 2, 4, 6, 0, 0).getTime(),
        borderColor: '#d3d7df',
        borderWidth: 1,
        strokeDashArray: 0,
      },
      {
        x: new Date(2026, 2, 4, 12, 0, 0).getTime(),
        borderColor: '#d3d7df',
        borderWidth: 1,
        strokeDashArray: 0,
      },
      {
        x: new Date(2026, 2, 4, 18, 0, 0).getTime(),
        borderColor: '#d3d7df',
        borderWidth: 1,
        strokeDashArray: 0,
      },
    ])
  })

  it('formats axis label as ddd DD, HHu', () => {
    const valueMs = new Date(2026, 2, 4, 6, 5, 0).getTime()
    const formatted = formatLocalAxisDateTime(valueMs)

    expect(formatted).toMatch(/^[A-Za-z]{3} \d{2}, \d{2}u$/)
  })

  it('formats tooltip label with full local date and time', () => {
    const valueMs = new Date(2026, 2, 4, 6, 5, 7).getTime()
    const formatted = formatLocalTooltipDateTime(valueMs)

    expect(formatted).toContain('2026')
    expect(formatted).toMatch(/\d{2}:\d{2}:\d{2}/)
  })
})
