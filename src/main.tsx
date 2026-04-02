import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import mixpanel from 'mixpanel-browser'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/app.css'
import App from './App.tsx'

mixpanel.init(import.meta.env.VITE_MIXPANEL_TOKEN as string, {
  autocapture: true,
  record_sessions_percent: 100,
  api_host: 'https://api-eu.mixpanel.com',
})

mixpanel.identify(mixpanel.get_distinct_id())
mixpanel.people.set_once({ 'First Seen': new Date().toISOString() })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
