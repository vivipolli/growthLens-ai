import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'


try {
  const rootElement = document.getElementById('root')

  if (!rootElement) {
    throw new Error('Root element not found')
  }

  const root = createRoot(rootElement)

  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )

} catch (error) {
  document.body.innerHTML = `
    <div style="padding: 2rem; text-align: center; background: #fee; color: #c00;">
      <h1>Error Loading Application</h1>
      <p>${error.message}</p>
      <pre>${error.stack}</pre>
    </div>
  `
}
