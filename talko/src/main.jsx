import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Show focus rings only for keyboard navigation (avoid "purple outlines" after mouse clicks).
try {
  const root = document.documentElement
  const onKeyDown = (e) => {
    if (e.key === 'Tab') root.classList.add('user-is-tabbing')
  }
  const onPointer = () => root.classList.remove('user-is-tabbing')

  window.addEventListener('keydown', onKeyDown, true)
  window.addEventListener('pointerdown', onPointer, true)
  window.addEventListener('mousedown', onPointer, true)
  window.addEventListener('touchstart', onPointer, { passive: true, capture: true })
} catch {
  // no-op
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
