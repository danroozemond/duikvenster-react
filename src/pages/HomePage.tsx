import Container from 'react-bootstrap/Container'
import { lazy, Suspense, useEffect, useState } from 'react'
import AppNavbar from '../components/AppNavbar'
import Infotext from '../components/Infotext'
import DuikvenstersTable from '../components/DuikvenstersTable'
import diveSites from '../data/diveSites.json'
import { fetchStromingsdata } from '../utils/stromingsdata'

const SELECTED_SITE_STORAGE_KEY = 'duikvenster.selectedDiveSiteId'
const StromingLineChart = lazy(() => import('../components/StromingLineChart'))

function HomePage() {
  const diveSitesRecord: Record<string, string> = diveSites
  const [selectedSiteId, setSelectedSiteId] = useState(() => {
    if (typeof window === 'undefined') {
      return ''
    }

    const storedSiteId = window.localStorage.getItem(SELECTED_SITE_STORAGE_KEY)
    if (storedSiteId && storedSiteId in diveSitesRecord) {
      return storedSiteId
    }

    return ''
  })
  const [stromingsdata, setStromingsdata] = useState<unknown[] | null>(null)
  const [isLoadingStromingsdata, setIsLoadingStromingsdata] = useState(false)
  const [stromingsdataError, setStromingsdataError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedSiteId === '') {
      window.localStorage.removeItem(SELECTED_SITE_STORAGE_KEY)
      return
    }

    window.localStorage.setItem(SELECTED_SITE_STORAGE_KEY, selectedSiteId)
  }, [selectedSiteId])

  useEffect(() => {
    if (selectedSiteId === '') {
      setStromingsdata(null)
      setStromingsdataError(null)
      setIsLoadingStromingsdata(false)
      return
    }

    let isCancelled = false

    async function refreshStromingsdata() {
      setIsLoadingStromingsdata(true)
      setStromingsdataError(null)

      try {
        const result = await fetchStromingsdata(selectedSiteId)
        if (!isCancelled) {
          setStromingsdata(result)
        }
      } catch (error) {
        if (!isCancelled) {
          setStromingsdata(null)
          setStromingsdataError(
            error instanceof Error ? error.message : 'Onbekende fout bij ophalen data.',
          )
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingStromingsdata(false)
        }
      }
    }

    void refreshStromingsdata()

    return () => {
      isCancelled = true
    }
  }, [selectedSiteId])

  const selectedSiteName =
    selectedSiteId === '' ? '' : diveSitesRecord[selectedSiteId]
  const rwsStromingUrl =
    selectedSiteId === ''
      ? '#'
      : `https://rwsos.rws.nl/viewer/embed/chart/oosterschelde/stroming/location/${encodeURIComponent(selectedSiteId)}?pd=-1%3B2&timeslider&theme=light&components=current-maps2d`

  return (
    <div className="app-shell">
      <AppNavbar
        sites={diveSitesRecord}
        selectedSiteId={selectedSiteId}
        onSiteChange={setSelectedSiteId}
      />
      <Container className="app-main py-3 py-lg-4">
        <section className="chart-card mt-3 mt-lg-4">
          <div className="chart-card-header">
            <h2 className="chart-card-title mb-0">Stroming</h2>
            <span className="chart-badge">
              {selectedSiteName || 'Nog geen stek geselecteerd'}
            </span>
          </div>
          <div className="chart-placeholder mt-3">
            {selectedSiteId === '' ? (
              <p className="mb-0">
                Kies eerst een stek om stromingsdata op te halen.
              </p>
            ) : null}
            {selectedSiteId !== '' && isLoadingStromingsdata ? (
              <p className="mb-0">Stromingsdata wordt geladen...</p>
            ) : null}
            {selectedSiteId !== '' && stromingsdataError ? (
              <p className="mb-0">{stromingsdataError}</p>
            ) : null}
            {selectedSiteId !== '' &&
            !isLoadingStromingsdata &&
            !stromingsdataError ? (
              stromingsdata !== null && stromingsdata.length > 0 ? (
                <Suspense fallback={<p className="mb-0">Grafiek wordt geladen...</p>}>
                  <StromingLineChart events={stromingsdata} />
                </Suspense>
              ) : (
                <p className="mb-0">
                  Geen stromingsdata beschikbaar voor <strong>{selectedSiteName}</strong>.
                </p>
              )
            ) : null}
          </div>
          <div className="chart-links mt-3">
            <a
              className="btn btn-outline-primary"
              href="http://duikspotter.nl/getijden-kaart/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Getijdenkaart
            </a>
            <a
              className="btn btn-outline-primary"
              href={rwsStromingUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={selectedSiteId === ''}
              onClick={(event) => {
                if (selectedSiteId === '') {
                  event.preventDefault()
                }
              }}
            >
              Stroomsnelheid van RWS
            </a>
          </div>
        </section>
        {selectedSiteId !== '' &&
        !isLoadingStromingsdata &&
        !stromingsdataError &&
        stromingsdata !== null ? (
          <DuikvenstersTable
            events={stromingsdata}
            badgeLabel={selectedSiteName || 'Nog geen stek geselecteerd'}
          />
        ) : null}
        <section className="chart-card mt-4">
          <h2 className="chart-card-title mb-3">Meer informatie en let op!</h2>
          <Infotext />
        </section>
      </Container>
    </div>
  )
}

export default HomePage
