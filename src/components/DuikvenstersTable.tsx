import { getDuikvensters } from '../utils/duikvensters'

type Props = {
  events: unknown[]
  badgeLabel: string
}

function toDate(value: string): Date | null {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatVanLocal(value: string): string {
  const date = toDate(value)
  if (date === null) {
    return value
  }

  const weekday = date.toLocaleString('en-US', { weekday: 'short' })
  const month = date.toLocaleString('en-US', { month: 'short' })
  const day = date.toLocaleString('en-US', { day: '2-digit' })
  const time = date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  return `${weekday} ${month} ${day}, ${time}`
}

function formatTotLocal(value: string): string {
  const date = toDate(value)
  if (date === null) {
    return value
  }

  return date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function DuikvenstersTable({ events, badgeLabel }: Props) {
  const duikvensters = getDuikvensters(events)

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
              <th scope="col">Van</th>
              <th scope="col">Tot</th>
            </tr>
          </thead>
          <tbody>
            {duikvensters.length > 0 ? (
              duikvensters.map((duikvenster, index) => (
                <tr key={`${duikvenster.van}-${duikvenster.tot}-${index}`}>
                  <td>{formatVanLocal(duikvenster.van)}</td>
                  <td>{formatTotLocal(duikvenster.tot)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="text-center text-muted py-3">
                  Geen duikvensters beschikbaar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default DuikvenstersTable
