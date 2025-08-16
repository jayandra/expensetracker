import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './services/axios.defaults'
import './index.css'
import App from './App.tsx'
import { ErrorProvider } from './contexts/ErrorContext'
import GlobalErrorBanner from './components/GlobalErrorBanner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorProvider>
      <GlobalErrorBanner />
      <App />
    </ErrorProvider>
  </StrictMode>,
)
