import { useEffect, useState } from 'react'
import { Header } from './components/Header'
import { CancelPage } from './pages/Cancel'
import { LegalPage } from './pages/Legal'
import { SupportPage } from './pages/Support'
import { Hero } from './sections/Hero'
import { Projects } from './sections/Projects'
import { trackPageView } from './lib/analytics'

function upsertMeta(selector, attrs) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    document.head.appendChild(el)
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
}

function setMeta({ title, description, urlPath, imagePath }) {
  const origin = window.location.origin
  const base = import.meta.env.BASE_URL || '/'
  const baseNoTrail = base === '/' ? '' : base.replace(/\/$/, '')
  const url = `${origin}${baseNoTrail}${urlPath}`
  const image = `${origin}${baseNoTrail}${imagePath}`

  document.title = title

  upsertMeta('meta[name="description"]', { name: 'description', content: description })
  upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title })
  upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description })
  upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
  upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url })
  upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image })
  upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
  upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
  upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image })
}

function useLocationTick() {
  const [, setTick] = useState(0)

  useEffect(() => {
    const onChange = () => setTick((t) => t + 1)
    window.addEventListener('popstate', onChange)
    window.addEventListener('hashchange', onChange)
    return () => {
      window.removeEventListener('popstate', onChange)
      window.removeEventListener('hashchange', onChange)
    }
  }, [])

  return null
}

function App() {
  useLocationTick()

  const base = import.meta.env.BASE_URL || '/'
  const baseNoTrail = base === '/' ? '' : base.replace(/\/$/, '')
  const rawPath = window.location.pathname
  const pathname =
    baseNoTrail && rawPath.startsWith(baseNoTrail)
      ? rawPath.slice(baseNoTrail.length) || '/'
      : rawPath
  const titleBase = 'Talko'

  useEffect(() => {
    const meta =
      pathname === '/legal'
        ? {
            title: `${titleBase} · Юридическая информация`,
            description: 'Юридические документы и политика конфиденциальности Talko.',
            urlPath: '/legal',
          }
        : pathname === '/cancel'
          ? {
              title: `${titleBase} · Отмена подписки`,
              description: 'Форма для поиска и отмены подписки Talko.',
              urlPath: '/cancel',
            }
          : pathname === '/support'
            ? {
                title: `${titleBase} · Поддержка`,
                description: 'Свяжитесь с поддержкой Talko.',
                urlPath: '/support',
              }
            : {
                title: titleBase,
                description: 'Проекты от Talko: развлекательные боты для знакомства и общения.',
                urlPath: '/',
              }

    setMeta({ ...meta, imagePath: '/og.png' })
    trackPageView(meta.urlPath)
  }, [pathname])

  return (
    <div className="min-h-dvh overflow-x-clip text-[var(--ink)]">
      <Header />

      <main>
        {pathname === '/legal' ? <LegalPage /> : null}
        {pathname === '/cancel' ? <CancelPage /> : null}
        {pathname === '/support' ? <SupportPage /> : null}
        {pathname === '/' ? (
          <>
            <Hero />
            <Projects />
          </>
        ) : null}
      </main>
    </div>
  )
}

export default App
