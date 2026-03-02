import Container from 'react-bootstrap/Container'
import AppNavbar from '../components/AppNavbar'

function HomePage() {
  return (
    <>
      <AppNavbar />
      <Container className="py-5">
        <h1 className="mb-3">Duikvenster Dive Planner</h1>
        <p className="lead mb-0">
          Frontend starter application with React, TypeScript, Bootstrap, and
          unit tests.
        </p>
      </Container>
    </>
  )
}

export default HomePage
