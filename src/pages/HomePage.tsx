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
    <>
      <AppNavbar
        sites={diveSitesRecord}
        selectedSiteId={selectedSiteId}
        onSiteChange={setSelectedSiteId}
      />
      <Container className="py-5">
        <h1 className="mb-3">Duikvenster Dive Planner</h1>
        <p className="lead mb-0">
          Frontend starter application with React, TypeScript, Bootstrap, and
          unit tests.
        </p>
        {selectedSiteName ? (
          <p className="mt-4 mb-0">
            Selected dive site: <strong>{selectedSiteName}</strong>
          </p>
        ) : null}
      </Container>
    </>
  )
}

export default HomePage
