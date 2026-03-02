import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders navbar brand and dive site selector', () => {
    render(<App />)
    expect(screen.getByRole('link', { name: /duikvenster/i })).toBeInTheDocument()
    expect(
      screen.getByRole('combobox', { name: /select dive site/i }),
    ).toBeInTheDocument()
  })
})
