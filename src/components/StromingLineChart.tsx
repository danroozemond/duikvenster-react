import { lazy, Suspense, useMemo } from 'react'
import type { ApexOptions } from 'apexcharts'

const ReactApexChart = lazy(() => import('react-apexcharts'))

type StromingEvent = {
  timestamp: string
  value: number
}

type ApexPoint = {
  x: number
  y: number
}

type Props = {
  events: unknown[]
}

const SIX_HOURS_MS = 6 * 60 * 60 * 1000

function stripTrailingZeroValues(points: ApexPoint[]): ApexPoint[] {
  let endIndex = points.length

  while (endIndex > 0 && points[endIndex - 1].y === 0) {
    endIndex -= 1
  }

  return points.slice(0, endIndex)
}

function formatLocalAxisDateTime(valueMs: number): string {
  const date = new Date(valueMs)
  const dayMonth = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
  })
    .format(date)
    .replace(' ', '-')
  const time = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)

  return `${dayMonth} ${time}`
}

function formatLocalTooltipDateTime(valueMs: number): string {
  return new Intl.DateTimeFormat('nl-NL', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(valueMs))
}

function toTimestampMs(value: string): number | null {
  const timestampMs = Date.parse(value)
  if (Number.isNaN(timestampMs)) {
    return null
  }

  return timestampMs
}

function alignLocalFloorToSixHours(valueMs: number): number {
  const date = new Date(valueMs)
  date.setMinutes(0, 0, 0)
  date.setHours(Math.floor(date.getHours() / 6) * 6)
  return date.getTime()
}

function alignLocalCeilToSixHours(valueMs: number): number {
  const floorMs = alignLocalFloorToSixHours(valueMs)
  if (floorMs === valueMs) {
    return floorMs
  }

  return floorMs + SIX_HOURS_MS
}

function buildSixHourAxisBounds(points: ApexPoint[]): {
  min: number
  max: number
  tickAmount: number
} | null {
  if (points.length === 0) {
    return null
  }

  const minPointMs = Math.min(...points.map((point) => point.x))
  const maxPointMs = Math.max(...points.map((point) => point.x))
  const min = alignLocalFloorToSixHours(minPointMs)
  const max = alignLocalCeilToSixHours(maxPointMs)
  const tickAmount = Math.floor((max - min) / SIX_HOURS_MS) + 1

  return { min, max, tickAmount }
}

function buildSixHourAnnotations(points: ApexPoint[]): NonNullable<ApexOptions['annotations']>['xaxis'] {
  if (points.length === 0) {
    return []
  }

  const minMs = alignLocalFloorToSixHours(Math.min(...points.map((point) => point.x)))
  const maxMs = alignLocalCeilToSixHours(Math.max(...points.map((point) => point.x)))

  const annotations: NonNullable<ApexOptions['annotations']>['xaxis'] = []
  for (let markerMs = minMs; markerMs <= maxMs; markerMs += SIX_HOURS_MS) {
    annotations.push({
      x: markerMs,
      borderColor: '#d3d7df',
      strokeDashArray: 0,
    })
  }

  return annotations
}

function toStromingEvent(event: unknown): StromingEvent | null {
  if (typeof event !== 'object' || event === null) {
    return null
  }

  const rawTimestamp = (event as { timeStamp?: unknown }).timeStamp
  const rawValue = (event as { value?: unknown }).value

  if (typeof rawTimestamp !== 'string' || rawTimestamp.trim() === '') {
    return null
  }

  const numericValue =
    typeof rawValue === 'number' ? rawValue : Number(rawValue)
  if (!Number.isFinite(numericValue)) {
    return null
  }

  return { timestamp: rawTimestamp, value: numericValue }
}

function StromingLineChart({ events }: Props) {
  const points = useMemo<ApexPoint[]>(() => {
    const mappedPoints = events
      .map(toStromingEvent)
      .filter((event): event is StromingEvent => event !== null)
      .map((event) => {
        const timestampMs = toTimestampMs(event.timestamp)
        if (timestampMs === null) {
          return null
        }

        return { x: timestampMs, y: event.value }
      })
      .filter((point): point is ApexPoint => point !== null)
      .sort((a, b) => a.x - b.x)

    return stripTrailingZeroValues(mappedPoints)
  }, [events])

  const series = useMemo(
    () => [
      {
        name: 'Stroming',
        data: points,
      },
    ],
    [points],
  )

  const axisBounds = useMemo(() => buildSixHourAxisBounds(points), [points])

  const options = useMemo<ApexOptions>(
    () => ({
      chart: {
        type: 'line',
        toolbar: { show: false },
      },
      stroke: {
        curve: 'straight',
        width: 1.5,
      },
      xaxis: {
        type: 'datetime',
        min: axisBounds?.min,
        max: axisBounds?.max,
        tickAmount: axisBounds?.tickAmount,
        labels: {
          datetimeUTC: false,
          formatter: (_, timestamp) => {
            const valueMs =
              typeof timestamp === 'number' ? timestamp : Number(timestamp)
            if (!Number.isFinite(valueMs)) {
              return ''
            }

            return formatLocalAxisDateTime(valueMs)
          },
        },
      },
      tooltip: {
        x: {
          formatter: (value) => {
            const valueMs = Number(value)
            if (!Number.isFinite(valueMs)) {
              return ''
            }

            return formatLocalTooltipDateTime(valueMs)
          },
        },
      },
      annotations: {
        xaxis: buildSixHourAnnotations(points),
      },
      yaxis: {
        title: {
          text: 'Stroomsnelheid (m/s)',
        },
        labels: {
          formatter: (value) => Number(value).toFixed(2),
        },
      },
      noData: {
        text: 'Geen data beschikbaar.',
      },
    }),
    [axisBounds, points],
  )

  return (
    <Suspense fallback={<p className="mb-0">Chart wordt geladen...</p>}>
      <div className="stroming-line-chart">
        <ReactApexChart
          type="line"
          height={320}
          width="100%"
          options={options}
          series={series}
        />
      </div>
    </Suspense>
  )
}

export default StromingLineChart
