import Container from 'react-bootstrap/Container'
import { useEffect, useState } from 'react'
import AppNavbar from '../components/AppNavbar'
import diveSites from '../data/diveSites.json'

const SELECTED_SITE_STORAGE_KEY = 'duikvenster.selectedDiveSiteId'

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

  useEffect(() => {
    if (selectedSiteId === '') {
      window.localStorage.removeItem(SELECTED_SITE_STORAGE_KEY)
      return
    }

    window.localStorage.setItem(SELECTED_SITE_STORAGE_KEY, selectedSiteId)
  }, [selectedSiteId])

  const selectedSiteName =
    selectedSiteId === '' ? '' : diveSitesRecord[selectedSiteId]

  return (
    <div className="app-shell">
      <AppNavbar
        sites={diveSitesRecord}
        selectedSiteId={selectedSiteId}
        onSiteChange={setSelectedSiteId}
      />
      <Container className="app-main py-5 py-lg-6">
        <section className="chart-card mt-4 mt-lg-5">
          <div className="chart-card-header">
            <h2 className="chart-card-title mb-0">Stroming</h2>
            <span className="chart-badge">
              {selectedSiteName || 'Nog geen stek geselecteerd'}
            </span>
          </div>
          <div className="chart-placeholder mt-3">
            <p className="mb-0">
              Hier komt de chart voor{' '}
              <strong>{selectedSiteName || 'de gekozen duikstek'}</strong>.
            </p>
          </div>
        </section>
      </Container>
    </div>
  )
}

export default HomePage
