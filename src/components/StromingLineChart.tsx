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
import { toStromingEvent, type StromingEvent } from '../utils/stromingEvent'
import type { Duikvenster } from '../utils/Duikvenster'

const ReactApexChart = lazy(() => import('react-apexcharts'))

type ApexPoint = {
  x: number
  y: number
}

type Props = {
  events: unknown[]
  duikvensters: Duikvenster[]
}

type XAxisRange = {
  min?: number
  max?: number
}

const STROMING_CHART_ID = 'stroming-line-chart'
const ZOOM_TOLERANCE_MS = 1_000
const MOBILE_MEDIA_QUERY = '(max-width: 991.98px)'
const SIX_HOURS_MS = 6 * 60 * 60 * 1000
const MOBILE_DEFAULT_PAST_WINDOW_MS = SIX_HOURS_MS
const MOBILE_DEFAULT_FUTURE_WINDOW_MS = 24 * 60 * 60 * 1000

function stripTrailingZeroValues(points: ApexPoint[]): ApexPoint[] {
  let endIndex = points.length

  while (endIndex > 0 && points[endIndex - 1].y === 0) {
    endIndex -= 1
  }

  return points.slice(0, endIndex)
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

function StromingLineChart({ events, duikvensters }: Props) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [isChartMounted, setIsChartMounted] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.matchMedia(MOBILE_MEDIA_QUERY).matches
  })

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY)
    const onChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
    }

    setIsMobile(mediaQuery.matches)

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', onChange)
      return () => {
        mediaQuery.removeEventListener('change', onChange)
      }
    }

    mediaQuery.addListener(onChange)
    return () => {
      mediaQuery.removeListener(onChange)
    }
  }, [])

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
  const fullAxisBounds = useMemo(() => buildSixHourAxisBounds(timestamps), [timestamps])
  const defaultAxisBounds = useMemo(() => {
    if (!fullAxisBounds) {
      return null
    }

    if (!isMobile) {
      return fullAxisBounds
    }

    const min = now - MOBILE_DEFAULT_PAST_WINDOW_MS
    const max = now + MOBILE_DEFAULT_FUTURE_WINDOW_MS

    return {
      min,
      max,
      tickAmount: Math.max(1, Math.floor((max - min) / SIX_HOURS_MS)),
    }
  }, [fullAxisBounds, isMobile, now])
  const xAxisAnnotations = useMemo(
    () => buildSixHourAnnotations(timestamps),
    [timestamps],
  )
  const kenteringAnnotations = useMemo(() => {
    const KENTERING_COLOR = '#6c757d'
    return duikvensters
      .filter((dv) => dv.kentering_type === 'HW' || dv.kentering_type === 'LW')
      .flatMap((dv) => {
        const x = toTimestampMs(dv.kentering)
        if (x === null) return []
        return [{
          x,
          borderColor: KENTERING_COLOR,
          borderWidth: 1,
          strokeDashArray: 3,
          label: {
            text: dv.kentering_type,
            borderColor: KENTERING_COLOR,
            style: {
              background: KENTERING_COLOR,
              color: '#ffffff',
              fontSize: '11px',
            },
          },
        }]
      })
  }, [duikvensters])
  const nowAnnotation = useMemo(
    () => ({
      x: now,
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
    [now],
  )

  useEffect(() => {
    setIsZoomed(false)
  }, [defaultAxisBounds?.min, defaultAxisBounds?.max])

  useEffect(() => {
    if (!isChartMounted || !isMobile || !defaultAxisBounds || !fullAxisBounds) {
      return
    }

    void ApexCharts.exec(
      STROMING_CHART_ID,
      'zoomX',
      defaultAxisBounds.min,
      defaultAxisBounds.max,
    )
  }, [defaultAxisBounds, fullAxisBounds, isChartMounted, isMobile])

  const handleViewportChange = useCallback(
    (xaxis?: XAxisRange) => {
      if (!defaultAxisBounds) {
        setIsZoomed(false)
        return
      }

      setIsZoomed(
        isZoomedRange(
          xaxis?.min ?? defaultAxisBounds.min,
          xaxis?.max ?? defaultAxisBounds.max,
          fullAxisBounds?.min ?? defaultAxisBounds.min,
          fullAxisBounds?.max ?? defaultAxisBounds.max,
        ),
      )
    },
    [defaultAxisBounds],
  )

  const options = useMemo<ApexOptions>(
    () => ({
      chart: {
        id: STROMING_CHART_ID,
        type: 'line',
        toolbar: { show: false },
        events: {
          mounted: () => {
            setIsChartMounted(true)
          },
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
        min: fullAxisBounds?.min,
        max: fullAxisBounds?.max,
        tickAmount: fullAxisBounds?.tickAmount,
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
        xaxis: [...xAxisAnnotations, ...kenteringAnnotations, nowAnnotation],
        yaxis: [
          {
            y: 20,
            borderColor: '#1f3b6f',
            borderWidth: 2,
            strokeDashArray: 4,
          },
        ],
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
    [fullAxisBounds, nowAnnotation, points, xAxisAnnotations, kenteringAnnotations],
  )

  const resetZoom = useCallback(() => {
    if (!defaultAxisBounds) {
      return
    }

    void ApexCharts.exec(
      STROMING_CHART_ID,
      'zoomX',
      fullAxisBounds!.min,
      fullAxisBounds!.max,
    )
  }, [fullAxisBounds])

  return (
    <Suspense fallback={<p className="mb-0">Chart wordt geladen...</p>}>
      <div className="stroming-line-chart">
        <div className="stroming-line-chart-actions">
          {isZoomed ? (
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={resetZoom}
              disabled={defaultAxisBounds === null}
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
