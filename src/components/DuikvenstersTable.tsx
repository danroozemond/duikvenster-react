import { getDuikvensters } from '../utils/duikvensters'

type Props = {
  events: unknown[]
  badgeLabel: string
}

function DuikvenstersTable({ events, badgeLabel }: Props) {
  const duikvensters = getDuikvensters(events)

  return (
    <section className="chart-card mt-4">
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
                  <td>{duikvenster.van}</td>
                  <td>{duikvenster.tot}</td>
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
