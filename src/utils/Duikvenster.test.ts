import { describe, expect, it } from 'vitest'
import { Duikvenster } from './Duikvenster'

describe('Duikvenster.interpolateTime', () => {
  it('interpolates linearly between two points', () => {
    const result = Duikvenster.interpolateTime(
      '2026-03-07T10:00:00Z',
      0.1,
      '2026-03-07T11:00:00Z',
      0.3,
      0.2,
    )

    expect(result).toBe('2026-03-07T10:30:00Z')
  })

  it('supports extrapolation outside the endpoint value range', () => {
    const result = Duikvenster.interpolateTime(
      '2026-03-07T10:00:00Z',
      0.1,
      '2026-03-07T11:00:00Z',
      0.3,
      0.4,
    )

    expect(result).toBe('2026-03-07T11:30:00Z')
  })

  it('returns timeA when endpoint values are equal', () => {
    const result = Duikvenster.interpolateTime(
      '2026-03-07T10:00:00Z',
      0.2,
      '2026-03-07T11:00:00Z',
      0.2,
      0.3,
    )

    expect(result).toBe('2026-03-07T10:00:00Z')
  })
})
