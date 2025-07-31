import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log('🔧 main.jsx: Starting application...')

try {
  const rootElement = document.getElementById('root')
  console.log('🔧 main.jsx: Root element found:', !!rootElement)

  if (!rootElement) {
    throw new Error('Root element not found')
  }

  const root = createRoot(rootElement)
  console.log('🔧 main.jsx: React root created')

  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )

  console.log('🔧 main.jsx: App rendered successfully')
} catch (error) {
  console.error('❌ main.jsx: Error rendering app:', error)
  document.body.innerHTML = `
    <div style="padding: 2rem; text-align: center; background: #fee; color: #c00;">
      <h1>Error Loading Application</h1>
      <p>${error.message}</p>
      <pre>${error.stack}</pre>
    </div>
  `
}
