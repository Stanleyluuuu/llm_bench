import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Design-system tokens (from handoff/) — load before app styles so the token
// CSS variables (colors, fonts, spacing, shadows) are defined when index.css
// and components reference them. Tokens are the single source of truth.
import './styles/styles.css'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallbackMessage="應用程式發生非預期錯誤">
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
