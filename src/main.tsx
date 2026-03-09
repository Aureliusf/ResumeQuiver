import './instrument'

import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const LazySpeedInsights = lazy(() =>
  import('@vercel/speed-insights/react').then((module) => ({
    default: module.SpeedInsights,
  }))
)

const LazyAnalytics = lazy(() =>
  import('@vercel/analytics/react').then((module) => ({
    default: module.Analytics,
  }))
)

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
    <Suspense fallback={null}>
      <LazySpeedInsights />
      <LazyAnalytics />
    </Suspense>
  </React.StrictMode>,
)
