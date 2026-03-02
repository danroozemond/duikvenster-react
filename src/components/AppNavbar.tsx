import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'

type AppNavbarProps = {
  sites: Record<string, string>
  selectedSiteId: string
  onSiteChange: (siteId: string) => void
}

function AppNavbar({ sites, selectedSiteId, onSiteChange }: AppNavbarProps) {
  const siteEntries = Object.entries(sites)

  return (
    <Navbar bg="primary" data-bs-theme="dark" expand="lg">
      <Container>
        <Navbar.Brand href="#">Duikvenster</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto">
            <Form.Select
              aria-label="Select dive site"
              value={selectedSiteId}
              onChange={(event) => onSiteChange(event.target.value)}
              disabled={siteEntries.length === 0}
            >
              <option value="" disabled>
                Selecteer een stek
              </option>
              {siteEntries.map(([siteId, siteName]) => (
                <option key={siteId} value={siteId}>
                  {siteName}
                </option>
              ))}
            </Form.Select>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default AppNavbar
