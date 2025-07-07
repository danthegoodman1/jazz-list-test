import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { JazzReactProvider } from 'jazz-tools/react'
import './index.css'
import App from './App.tsx'

// Main wrapper component
function AppWithJazz() {
  return (
    <JazzReactProvider
      sync={{ peer: "wss://cloud.jazz.tools/?key=jazz-list-test@demo.app" }}
    >
      <App />
    </JazzReactProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithJazz />
  </StrictMode>,
)
