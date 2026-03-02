import Container from 'react-bootstrap/Container'
import { useState } from 'react'
import AppNavbar from '../components/AppNavbar'
import diveSites from '../data/diveSites.json'

function HomePage() {
  const diveSitesRecord: Record<string, string> = diveSites
  const [selectedSiteId, setSelectedSiteId] = useState('')

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
