import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import type { ApexOptions } from 'apexcharts'
import ApexCharts from 'apexcharts'
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

type XAxisRange = {
  min?: number
  max?: number
}

const STROMING_CHART_ID = 'stroming-line-chart'
const ZOOM_TOLERANCE_MS = 1_000

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

function isZoomedRange(
  min: number,
  max: number,
  defaultMin: number,
  defaultMax: number,
): boolean {
  return (
    Math.abs(min - defaultMin) > ZOOM_TOLERANCE_MS ||
    Math.abs(max - defaultMax) > ZOOM_TOLERANCE_MS
  )
}

function StromingLineChart({ events }: Props) {
  const [isZoomed, setIsZoomed] = useState(false)

  const points = useMemo<ApexPoint[]>(() => {
    const mappedPoints = events
      .map(toStromingEvent)
      .filter((event): event is StromingEvent => event !== null)
      .map((event) => {
        const timestampMs = toTimestampMs(event.timestamp)
        if (timestampMs === null) {
          return null
        }

        return { x: timestampMs, y: 100.0*event.value }
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
  const nowAnnotation = useMemo(
    () => ({
      x: Date.now(),
      borderColor: '#d9534f',
      borderWidth: 1,
      strokeDashArray: 4,
      label: {
        text: 'nu',
        style: {
          background: '#d9534f',
          color: '#ffffff',
        },
      },
    }),
    [axisBounds?.min, axisBounds?.max],
  )

  useEffect(() => {
    setIsZoomed(false)
  }, [axisBounds?.min, axisBounds?.max])

  const handleViewportChange = useCallback(
    (xaxis?: XAxisRange) => {
      if (!axisBounds) {
        setIsZoomed(false)
        return
      }

      setIsZoomed(
        isZoomedRange(
          xaxis?.min ?? axisBounds.min,
          xaxis?.max ?? axisBounds.max,
          axisBounds.min,
          axisBounds.max,
        ),
      )
    },
    [axisBounds],
  )

  const options = useMemo<ApexOptions>(
    () => ({
      chart: {
        id: STROMING_CHART_ID,
        type: 'line',
        toolbar: { show: false },
        events: {
          zoomed: (_, { xaxis }) => {
            handleViewportChange(xaxis)
          },
          scrolled: (_, { xaxis }) => {
            handleViewportChange(xaxis)
          },
        },
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
        xaxis: [...xAxisAnnotations, nowAnnotation],
      },
      yaxis: {
        title: {
          text: 'Stroomsnelheid (cm/s)',
        },
        labels: {
          formatter: (value) => Number(value).toFixed(0),
        },
      },
      noData: {
        text: 'Geen data beschikbaar.',
      },
    }),
    [axisBounds, nowAnnotation, points, xAxisAnnotations],
  )

  const resetZoom = useCallback(() => {
    if (!axisBounds) {
      return
    }

    void ApexCharts.exec(
      STROMING_CHART_ID,
      'zoomX',
      axisBounds.min,
      axisBounds.max,
    )
  }, [axisBounds])

  return (
    <Suspense fallback={<p className="mb-0">Chart wordt geladen...</p>}>
      <div className="stroming-line-chart">
        <div className="stroming-line-chart-actions">
          {isZoomed ? (
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={resetZoom}
              disabled={axisBounds === null}
              aria-label="Reset zoom"
              title="Reset zoom"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                fill="currentColor"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 2 8h1v6a.5.5 0 0 0 .5.5H6a.5.5 0 0 0 .5-.5V10h3v4a.5.5 0 0 0 .5.5h2.5a.5.5 0 0 0 .5-.5V8h1a.5.5 0 0 0 .354-.854z" />
              </svg>
            </button>
          ) : null}
        </div>
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
