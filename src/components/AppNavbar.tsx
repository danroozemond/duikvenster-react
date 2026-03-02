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
    <Navbar className="app-navbar" expand="lg">
      <Container className="app-navbar-container">
        <Navbar.Brand href="#" className="app-navbar-brand">
          Duikvenster
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav" className="app-navbar-collapse">
          <div className="site-selector-shell">
            <Form.Label className="site-selector-label mb-1">
              Duikstek
            </Form.Label>
            <Form.Select
              aria-label="Select dive site"
              className="site-selector"
              value={selectedSiteId}
              onChange={(event) => onSiteChange(event.target.value)}
              disabled={siteEntries.length === 0}
            >
              <option value="">
                Selecteer een stek
              </option>
              {siteEntries.map(([siteId, siteName]) => (
                <option key={siteId} value={siteId}>
                  {siteName}
                </option>
              ))}
            </Form.Select>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default AppNavbar
