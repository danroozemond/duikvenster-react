import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the starter heading', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: /duikvenster dive planner/i }),
    ).toBeInTheDocument()
  })
})
