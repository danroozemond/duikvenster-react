import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import mixpanel from 'mixpanel-browser'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/app.css'
import App from './App.tsx'

mixpanel.init('f8a6ea3a609c46c5187b7d7ce76fcd91', {
  autocapture: true,
  record_sessions_percent: 100,
  api_host: 'https://api-eu.mixpanel.com',
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
