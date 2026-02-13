import { useEffect, useRef, useState } from 'react'
import { Container } from './Container'
import { ArrowRightIcon, BurgerIcon, MoonIcon, SunIcon } from './Icons'
import { UI_FLAGS } from '../config/ui'
import { track } from '../lib/analytics'
import logoNav from '../assets/logo-nav.svg'

const BASE_URL = import.meta.env.BASE_URL || '/'

function withBase(href) {
  if (!href) return BASE_URL
  if (href.startsWith('#')) return `${BASE_URL}${href}`
  const base = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`
  const clean = href.startsWith('/') ? href.slice(1) : href
  return `${base}${clean}`
}

const nav = [
  { label: 'Каталог ботов', href: withBase('#projects') },
  { label: 'Чат поддержки', href: withBase('support') },
  { label: 'Отмена подписки', href: withBase('cancel') },
  { label: 'Юридическая информация', href: withBase('legal') },
]

const THEME_KEY = 'talko-theme'

function CloseSvg({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden="true"
      className={className}
      fill="none"
    >
      <path
        d="M6.5 6.5L17.5 17.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M17.5 6.5L6.5 17.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function isActiveHref(itemHref, currentHref) {
  const cur = new URL(currentHref)
  const target = new URL(itemHref, cur.origin)

  // If link targets a hash, only treat it as active on the same path.
  if (target.hash) return cur.pathname === target.pathname && cur.hash === target.hash
  // Path-only links are active when path matches.
  return cur.pathname === target.pathname
}

export function Header() {
  const [href, setHref] = useState(() => window.location.href)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState(() => {
    const t = document.documentElement.dataset.theme
    return t === 'dark' ? 'dark' : 'light'
  })
  const themeTimerRef = useRef(0)
  const burgerBtnRef = useRef(null)
  const mobileNavRef = useRef(null)
  const lastFocusRef = useRef(null)

  useEffect(() => {
    const onChange = () => {
      setHref(window.location.href)
      setMenuOpen(false)
    }
    window.addEventListener('hashchange', onChange)
    window.addEventListener('popstate', onChange)
    return () => {
      window.removeEventListener('hashchange', onChange)
      window.removeEventListener('popstate', onChange)
    }
  }, [])

  const applyTheme = (next) => {
    if (themeTimerRef.current) {
      window.clearTimeout(themeTimerRef.current)
      themeTimerRef.current = 0
    }

    document.documentElement.classList.add('theme-tx')
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch (err) {
      // Ignore (private mode / storage disabled).
      void err
    }
    setTheme(next)
    track('theme_toggle', { theme: next })

    themeTimerRef.current = window.setTimeout(() => {
      document.documentElement.classList.remove('theme-tx')
      themeTimerRef.current = 0
    }, 420)
  }

  const toggleTheme = () => applyTheme(theme === 'dark' ? 'light' : 'dark')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Prevent background scrolling on mobile without changing body positioning.
  // This avoids iOS Safari jank when toggling scroll lock after the page is scrolled.
  useEffect(() => {
    if (!menuOpen) return
    const prevent = (e) => e.preventDefault()
    document.addEventListener('touchmove', prevent, { passive: false })
    document.addEventListener('wheel', prevent, { passive: false })
    return () => {
      document.removeEventListener('touchmove', prevent)
      document.removeEventListener('wheel', prevent)
    }
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  // Focus trap for mobile menu.
  useEffect(() => {
    if (!menuOpen) return

    lastFocusRef.current = document.activeElement

    const root = mobileNavRef.current
    if (!root) return

    const getFocusable = () =>
      Array.from(
        root.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true')

    const focusFirst = () => {
      const preferred = root.querySelector('[data-focus-first]')
      if (preferred && preferred instanceof HTMLElement) {
        preferred.focus()
        return
      }

      const items = getFocusable()
      if (items[0]) items[0].focus()
    }

    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return
      const items = getFocusable()
      if (!items.length) return

      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement

      if (e.shiftKey) {
        if (active === first || active === root) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (active === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    // Wait a tick so the menu is "open" before focusing.
    const t = window.setTimeout(focusFirst, 0)
    root.addEventListener('keydown', onKeyDown)
    return () => {
      window.clearTimeout(t)
      root.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  // Restore focus when menu closes.
  useEffect(() => {
    if (menuOpen) return
    const prev = lastFocusRef.current
    if (prev && prev instanceof HTMLElement) {
      prev.focus()
      return
    }
    if (burgerBtnRef.current) burgerBtnRef.current.focus()
  }, [menuOpen])

  return (
    <header className="glass-nav">
      <Container className="py-4">
        <div
          className={[
            'glass-bar flex items-center justify-between gap-3 px-3 py-3 sm:px-4',
            scrolled ? 'glass-bar-scrolled' : '',
          ].join(' ')}
        >
          <span aria-hidden="true" className="glass-zoom" />
          <span aria-hidden="true" className="glass-sheen" />
          <a
            className="inline-flex items-center justify-center rounded-full px-3 py-2 transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(105,102,255,.25)]"
            href={BASE_URL}
            aria-label="Talko"
          >
            <img src={logoNav} alt="" className="h-7 w-7 sm:h-8 sm:w-8" />
          </a>

          <nav
            aria-label="Основная навигация"
            className="nav-desktop items-center gap-2"
          >
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={[
                  'font-body glass-link',
                  isActiveHref(item.href, href) ? 'glass-link-active' : '',
                ].join(' ')}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:contents">
            {UI_FLAGS.showThemeToggle ? (
              <button
                type="button"
                className="glass-btn grid h-11 w-11 place-items-center transition hover:brightness-95 active:translate-y-px"
                aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
                title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
                onClick={toggleTheme}
              >
                {theme === 'dark' ? (
                  <SunIcon className="h-6 w-6" />
                ) : (
                  <MoonIcon className="h-6 w-6" />
                )}
              </button>
            ) : null}

            <button
              type="button"
              className="glass-btn nav-burger grid h-11 w-11 place-items-center transition hover:brightness-95 active:translate-y-px"
              ref={burgerBtnRef}
              aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => {
                setMenuOpen((v) => {
                  const next = !v
                  track('mobile_menu', { open: next })
                  return next
                })
              }}
            >
              <span className="relative grid h-6 w-6 place-items-center">
                <BurgerIcon
                  className={[
                    'absolute h-6 w-6 transition duration-200 motion-reduce:transition-none',
                    menuOpen ? 'scale-90 opacity-0' : 'scale-100 opacity-100',
                  ].join(' ')}
                />
                <CloseSvg
                  className={[
                    'absolute transition duration-200 motion-reduce:transition-none',
                    menuOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0',
                  ].join(' ')}
                />
              </span>
            </button>
          </div>
        </div>
      </Container>

      <div
        id="mobile-nav"
        aria-hidden={!menuOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Мобильное меню"
        className={[
          'nav-mobile fixed inset-0 z-50',
          // Avoid animating backdrop-filter on Safari (can flicker).
          'bg-[var(--overlay)]',
          'transition-opacity duration-300 ease-out motion-reduce:transition-none',
          menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        style={{ willChange: 'opacity' }}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) setMenuOpen(false)
        }}
        onTouchMove={(e) => e.preventDefault()}
        ref={mobileNavRef}
      >
        <Container className="py-4">
          {/* Mirror the header bar so the close button is perfectly aligned with the burger. */}
          <div className="glass-bar flex items-center justify-between gap-3 px-3 py-3 sm:px-4">
            <span aria-hidden="true" className="glass-zoom" />
            <span aria-hidden="true" className="glass-sheen" />
            <a
              className="inline-flex items-center justify-center rounded-full px-3 py-2 transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(105,102,255,.25)]"
              href={BASE_URL}
              aria-label="Talko"
            >
              <img src={logoNav} alt="" className="h-7 w-7 sm:h-8 sm:w-8" />
            </a>

            <div className="flex items-center gap-2">
              {UI_FLAGS.showThemeToggle ? (
                <button
                  type="button"
                  className="glass-btn grid h-11 w-11 place-items-center transition hover:brightness-95 active:translate-y-px motion-reduce:transition-none"
                  aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
                  title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
                  onClick={toggleTheme}
                >
                  {theme === 'dark' ? (
                    <SunIcon className="h-6 w-6" />
                  ) : (
                    <MoonIcon className="h-6 w-6" />
                  )}
                </button>
              ) : null}

              <button
                type="button"
                className="glass-btn grid h-11 w-11 place-items-center transition hover:brightness-95 active:translate-y-px motion-reduce:transition-none"
                aria-label="Закрыть меню"
                data-focus-first
                onClick={() => setMenuOpen(false)}
              >
                <CloseSvg />
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-[24px] bg-[var(--surface)] p-3 shadow-[0_22px_70px_rgba(105,102,255,.12)] ring-1 ring-[var(--ring)]">
            {nav.map((item, idx) => (
              <a
                key={item.href}
                href={item.href}
                className={[
                  'font-body flex items-center justify-between rounded-[18px] px-4 py-4 text-[18px] font-semibold transition motion-reduce:transition-none',
                  isActiveHref(item.href, href)
                    ? 'bg-[var(--pill)] text-[var(--accent-ink)]'
                    : 'text-[var(--ink)] hover:bg-[var(--hover)]',
                ].join(' ')}
                style={{
                  transitionDelay: menuOpen ? `${70 + idx * 45}ms` : '0ms',
                  transform: menuOpen ? 'translate3d(0,0,0)' : 'translate3d(0,8px,0)',
                  opacity: menuOpen ? 1 : 0,
                }}
                onClick={() => setMenuOpen(false)}
              >
                <span>{item.label}</span>
                <span aria-hidden="true" className="grid h-6 w-6 place-items-center">
                  <ArrowRightIcon className="h-5 w-5 opacity-40" />
                </span>
              </a>
            ))}
          </div>
        </Container>
      </div>
    </header>
  )
}
