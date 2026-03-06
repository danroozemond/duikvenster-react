import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Navbar from 'react-bootstrap/Navbar'

type AppNavbarProps = {
  sites: Record<string, string>
  selectedSiteId: string
  onSiteChange: (siteId: string) => void
}

function AppNavbar({ sites, selectedSiteId, onSiteChange }: AppNavbarProps) {
  const siteEntries = Object.entries(sites)

  return (
    <Navbar className="app-navbar">
      <Container className="app-navbar-container">
        <Navbar.Brand href="#" className="app-navbar-brand">
          Duikvenster
        </Navbar.Brand>
        <div className="site-selector-shell">
          <Form.Select
            aria-label="Select dive site"
            className="site-selector"
            value={selectedSiteId}
            onChange={(event) => onSiteChange(event.target.value)}
            disabled={siteEntries.length === 0}
          >
            <option value="">Selecteer een stek</option>
            {siteEntries.map(([siteId, siteName]) => {
              const isSeparator = siteId.startsWith('__separator_')

              return (
                <option key={siteId} value={isSeparator ? '' : siteId} disabled={isSeparator}>
                  {siteName}
                </option>
              )
            })}
          </Form.Select>
        </div>
      </Container>
    </Navbar>
  )
}

export default AppNavbar
