function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function HighlightedText({
  text,
  highlights = [],
  className = '',
  highlightClassName = 'accent-word',
}) {
  const clean = (highlights || []).filter(Boolean)
  if (!clean.length) return <span className={className}>{text}</span>

  // Longest first to avoid partial matches stealing longer phrases.
  const sorted = [...clean].sort((a, b) => b.length - a.length)
  const re = new RegExp(`(${sorted.map(escapeRegExp).join('|')})`, 'gi')
  const parts = String(text).split(re)

  const set = new Set(sorted.map((s) => s.toLowerCase()))

  return (
    <span className={className}>
      {parts.map((p, idx) => {
        const isHit = set.has(p.toLowerCase())
        if (!isHit) return <span key={idx}>{p}</span>
        return (
          <span key={idx} className={highlightClassName}>
            {p}
          </span>
        )
      })}
    </span>
  )
}

