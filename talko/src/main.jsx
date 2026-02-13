import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const PRELOADER_MIN_VISIBLE_MS = 260
let preloaderShownAt = null

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

// Hide the HTML preloader after React mounts.
try {
  // If index.html scheduled showing the preloader, cancel it now.
  window.clearTimeout(window.__talkoPreloaderTimer)
  const el = document.getElementById('preloader')
  if (el) {
    const shownAtMs = Number.parseInt(el.dataset.shownAt || '', 10)
    preloaderShownAt = Number.isFinite(shownAtMs) ? shownAtMs : null
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    const shownAt = preloaderShownAt
    const visibleFor = shownAt ? Math.max(0, now - shownAt) : 0
    const wait = shownAt ? Math.max(0, PRELOADER_MIN_VISIBLE_MS - visibleFor) : 0

    window.setTimeout(() => {
      el.classList.add('preloader--hide')
      window.setTimeout(() => el.remove(), 320)
    }, wait)
  }
} catch {
  // no-op
}
