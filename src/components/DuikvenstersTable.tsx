import { useEffect, useMemo, useState } from 'react'
import type { Duikvenster } from '../utils/Duikvenster'
import { APP_LOCALE } from '../utils/locale'

type Props = {
  duikvensters: Duikvenster[]
  badgeLabel: string
}

function toDate(value: string): Date | null {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatTimeLocal(value: string): string {
  const date = toDate(value)
  if (date === null) {
    return value
  }

  return date.toLocaleString(APP_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function formatDateLocal(value: string): string {
  const date = toDate(value)
  if (date === null) {
    return value
  }

  const weekday = date.toLocaleString(APP_LOCALE, { weekday: 'short' })
  const day = date.toLocaleString(APP_LOCALE, { day: '2-digit' })
  const month = date.toLocaleString(APP_LOCALE, { month: 'short' })
  return `${weekday} ${day} ${month}`
}

function DuikvenstersTable({ duikvensters, badgeLabel }: Props) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])

  const processedRows = useMemo(
    () =>
      duikvensters.map((duikvenster, index) => {
        const vanDate = toDate(duikvenster.van)
        return {
          duikvenster,
          index,
          dateLabel: formatDateLocal(duikvenster.van),
          isPast: vanDate !== null && vanDate.getTime() < now,
        }
      }),
    [duikvensters, now],
  )
  const firstUpcomingIndex = processedRows.findIndex((row) => !row.isPast)
  const pastRowsAtTop =
    firstUpcomingIndex === -1 ? processedRows.length : firstUpcomingIndex
  const hasCollapsiblePastRows =
    pastRowsAtTop > 0 && pastRowsAtTop < processedRows.length
  const [showPastRows, setShowPastRows] = useState(!hasCollapsiblePastRows)

  useEffect(() => {
    setShowPastRows(!hasCollapsiblePastRows)
  }, [hasCollapsiblePastRows, pastRowsAtTop, processedRows.length])

  const visibleRows = showPastRows
    ? processedRows
    : processedRows.slice(pastRowsAtTop)

  return (
    <section className="chart-card duikvensters-card mt-4">
      <div className="chart-card-header">
        <h2 className="chart-card-title mb-0">Duikvensters</h2>
        <span className="chart-badge">{badgeLabel}</span>
      </div>
      <div className="duikvensters-table-wrapper">
        <table className="table table-sm mb-0 duikvensters-table">
          <thead>
            <tr>
              <th scope="col">Datum</th>
              <th scope="col">Van</th>
              <th scope="col">Kentering</th>
              <th scope="col">Tot</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.length > 0 ? (
              visibleRows.map((row, rowIndex) => {
                const previousDate =
                  rowIndex > 0 ? visibleRows[rowIndex - 1].dateLabel : null
                const showDate = row.dateLabel !== previousDate

                return (
                  <tr
                    key={`${row.duikvenster.van}-${row.duikvenster.tot}-${row.index}`}
                    className={row.isPast ? 'duikvenster-row-past' : undefined}
                  >
                    <td>{showDate ? row.dateLabel : ''}</td>
                    <td>{formatTimeLocal(row.duikvenster.van)}</td>
                    <td>
                      {formatTimeLocal(row.duikvenster.kentering)}
                      {row.duikvenster.kentering_type !== null &&
                      row.duikvenster.kentering_type.trim() !== ''
                        ? ` [${row.duikvenster.kentering_type}]`
                        : ''}
                    </td>
                    <td>{formatTimeLocal(row.duikvenster.tot)}</td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={4} className="text-center text-muted py-3">
                  Geen duikvensters beschikbaar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {hasCollapsiblePastRows ? (
          <button
              type="button"
              className="btn btn-sm btn-outline-secondary duikvensters-toggle mt-3"
              onClick={() => {
                setShowPastRows((current) => !current)
              }}
          >
            {showPastRows
                ? `Verberg ${pastRowsAtTop} verlopen vensters`
                : `Toon ${pastRowsAtTop} verlopen vensters`}
          </button>
      ) : null}
    </section>
  )
}

export default DuikvenstersTable
