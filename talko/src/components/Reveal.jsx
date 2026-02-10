import { useEffect, useRef, useState } from 'react'

export function Reveal({
  as = 'div',
  className = '',
  delay = 0,
  children,
  style,
  ...props
}) {
  const Tag = as
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      // Trigger a bit earlier than default so the animation starts before you "hit" the block.
      { root: null, threshold: 0.01, rootMargin: '120px 0px -12% 0px' },
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      {...props}
      className={['reveal', visible ? 'is-visible' : '', className].join(' ')}
      style={{ ...style, '--reveal-delay': `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}
