const toPayload = (props) => {
  if (!props) return {}
  try {
    // Ensure serializable payload.
    return JSON.parse(JSON.stringify(props))
  } catch {
    return {}
  }
}

// Lightweight analytics hook point.
// If you add GA/GTM/Plausible later, wire it here.
export function track(event, props) {
  const payload = { event, ...toPayload(props) }

  // Google Tag Manager / dataLayer convention.
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push(payload)
    return
  }

  // Optional: allow manual listener
  if (typeof window.talkoTrack === 'function') {
    window.talkoTrack(payload)
  }
}

export function trackPageView(path) {
  track('page_view', { path })
}

