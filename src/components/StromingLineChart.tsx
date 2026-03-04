import { lazy, Suspense, useMemo } from 'react'
import type { ApexOptions } from 'apexcharts'

const ReactApexChart = lazy(() => import('react-apexcharts'))

type StromingEvent = {
  timestamp: string
  value: number
}

type ApexPoint = {
  x: string
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
      .map((event) => ({ x: event.timestamp, y: event.value }))

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
    [],
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
