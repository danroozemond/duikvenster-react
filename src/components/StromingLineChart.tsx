import { lazy, Suspense, useMemo } from 'react'
import type { ApexOptions } from 'apexcharts'
import {
  buildSixHourAnnotations,
  buildSixHourAxisBounds,
  formatLocalAxisDateTime,
  formatLocalTooltipDateTime,
  toTimestampMs,
} from '../utils/stromingChartTime'

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

function stripTrailingZeroValues(points: ApexPoint[]): ApexPoint[] {
  let endIndex = points.length

  while (endIndex > 0 && points[endIndex - 1].y === 0) {
    endIndex -= 1
  }

  return points.slice(0, endIndex)
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

  const timestamps = useMemo(() => points.map((point) => point.x), [points])
  const axisBounds = useMemo(() => buildSixHourAxisBounds(timestamps), [timestamps])
  const xAxisAnnotations = useMemo(
    () => buildSixHourAnnotations(timestamps),
    [timestamps],
  )

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
        xaxis: xAxisAnnotations,
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
    [axisBounds, points, xAxisAnnotations],
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
