import { useEffect, useState } from 'react'
import { Container } from '../components/Container'
import privacyPolicyRaw from '../data/legal/privacy_pd.txt?raw'
import userAgreementRaw from '../data/legal/user_agreement.txt?raw'
import publicOfferRaw from '../data/legal/public_offer.txt?raw'
import { Reveal } from '../components/Reveal'
import { ArrowRightIcon } from '../components/Icons'

const DOC_TITLES = [
  { id: 'privacy', title: 'Политика обработки персональных данных' },
  { id: 'agreement', title: 'Пользовательское соглашение' },
  { id: 'offer', title: 'Публичная оферта' },
]

function normalizeText(text) {
  return text
    .replace(/\uFEFF/g, '')
    .replace(/\f/g, '\n')
    .replace(/\u2028|\u2029/g, '\n')
    .replace(/\r\n?/g, '\n')
    .trim()
}

function splitDocLines(raw, title) {
  const normalized = normalizeText(raw)
  const lines = normalized.split('\n').map((l) => l.trimEnd())

  return lines
    .filter((line) => {
      const trimmed = line.trim()
      if (!trimmed) return true
      if (trimmed.toLowerCase() === 'talko') return false
      if (trimmed.toLowerCase() === title.toLowerCase()) return false
      return true
    })
}

function splitParagraphs(lines) {
  const paras = []
  let buf = []

  const flush = () => {
    const trimmed = buf.map((l) => l.trimEnd())
    while (trimmed.length && trimmed[0].trim() === '') trimmed.shift()
    while (trimmed.length && trimmed[trimmed.length - 1].trim() === '') trimmed.pop()
    if (trimmed.length) paras.push(trimmed)
    buf = []
  }

  for (const line of lines) {
    if (line.trim() === '') flush()
    else buf.push(line)
  }
  flush()
  return paras
}

function looksLikeSmallHeading(line) {
  const s = line.trim()
  if (!s) return false
  if (/^\d+\.\s+/.test(s)) return true
  // Short, punctuation-free lines often act as subheadings in the source text.
  if (s.length <= 80 && !/[.!?]$/.test(s) && !/:$/.test(s) && !/,/.test(s)) return true
  return false
}

function linkify(text) {
  const parts = []
  const re = /(\bhttps?:\/\/[^\s)]+)|(\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b)/gi
  let last = 0
  let m
  while ((m = re.exec(text))) {
    const start = m.index
    if (start > last) parts.push({ type: 'text', value: text.slice(last, start) })
    const value = m[0]
    parts.push({
      type: 'link',
      value,
      href: value.includes('@') ? `mailto:${value}` : value,
    })
    last = start + value.length
  }
  if (last < text.length) parts.push({ type: 'text', value: text.slice(last) })
  return parts
}

function Paragraph({ text }) {
  return (
    <p className="legal-text text-[16px] leading-[1.9] text-[var(--body-ink)] opacity-80 sm:text-[18px]">
      {linkify(text).map((p, idx) =>
        p.type === 'link' ? (
          <a
            key={`${p.href}-${idx}`}
            href={p.href}
            className="font-semibold text-[var(--accent)] underline decoration-[var(--ring)] underline-offset-4 hover:decoration-[var(--ring-strong)]"
            target={p.href.startsWith('http') ? '_blank' : undefined}
            rel={p.href.startsWith('http') ? 'noreferrer' : undefined}
          >
            {p.value}
          </a>
        ) : (
          <span key={idx}>{p.value}</span>
        ),
      )}
    </p>
  )
}

function NumberedList({ lines }) {
  const items = []
  const re = /^(\d+(?:\.\d+)*\.)\s*(.*)$/
  for (const raw of lines) {
    const s = raw.trim()
    if (!s) continue
    const m = s.match(re)
    if (m) {
      items.push({ n: m[1], text: m[2] })
      continue
    }
    if (items.length) items[items.length - 1].text += ` ${s}`
    else items.push({ n: '', text: s })
  }

  return (
    <div className="space-y-2">
      {items.map((it, idx) => (
          <div key={idx} className="flex gap-3">
          <div className="w-[52px] shrink-0 pt-[2px] text-right text-[14px] font-bold tracking-[-0.02em] text-[var(--muted)] sm:w-[72px] sm:text-[15px] md:w-[92px]">
            {it.n}
          </div>
          <div className="min-w-0">
            <Paragraph text={it.text} />
          </div>
        </div>
      ))}
    </div>
  )
}

function renderParagraphBlock(lines, key) {
  if (lines.length === 1 && looksLikeSmallHeading(lines[0])) {
    const s = lines[0].trim()
    return (
      <h3
        key={key}
        className="font-display mt-8 text-[22px] font-bold leading-[1.1] text-[var(--ink)] sm:text-[26px] md:text-[28px]"
      >
        {s}
      </h3>
    )
  }

  const numbered = lines.filter((l) => /^\d+(?:\.\d+)*\./.test(l.trim())).length
  if (lines.length >= 2 && numbered / lines.length >= 0.6) {
    return (
      <div key={key} className="mt-4">
        <NumberedList lines={lines} />
      </div>
    )
  }

  return (
    <div key={key} className="mt-4">
      <Paragraph text={lines.map((l) => l.trim()).join(' ')} />
    </div>
  )
}

function LegalDoc({ id, title, lines }) {
  const paras = splitParagraphs(lines)
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-[26px] bg-[var(--surface)] p-6 shadow-[0_22px_70px_rgba(105,102,255,.08)] ring-1 ring-[var(--ring)] backdrop-blur sm:p-8"
    >
      <h2 className="font-display text-[28px] font-bold leading-[28px] text-[var(--ink)] sm:text-[34px] sm:leading-[34px] md:text-[44px] md:leading-[44px]">
        {title}
      </h2>

      <div className="mt-6">
        {paras.map((p, idx) => renderParagraphBlock(p, `${id}-${idx}`))}
      </div>
    </section>
  )
}

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="font-body fixed bottom-6 right-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-[18px] bg-[var(--accent)] text-[20px] font-semibold text-white shadow-[0_22px_70px_rgba(105,102,255,.18)] transition hover:brightness-95 active:translate-y-px"
      aria-label="Наверх"
      title="Наверх"
    >
      ↑
    </button>
  )
}

export function LegalPage() {
  const docs = [
    {
      id: 'privacy',
      title: DOC_TITLES[0].title,
      lines: splitDocLines(privacyPolicyRaw, 'ПОЛИТИКА ОБРАБОТКИ ПЕРСОНАЛЬНЫХ ДАННЫХ'),
    },
    {
      id: 'agreement',
      title: DOC_TITLES[1].title,
      lines: splitDocLines(userAgreementRaw, 'ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ'),
    },
    {
      id: 'offer',
      title: DOC_TITLES[2].title,
      lines: splitDocLines(publicOfferRaw, 'ПУБЛИЧНАЯ ОФЕРТА'),
    },
  ]

  return (
    <div className="pb-20 pt-10">
      <Container>
        <div className="mx-auto max-w-[920px] lg:max-w-[1040px]">
          <Reveal as="div" delay={0} className="flex items-center justify-between gap-4">
            <div>
              <p className="font-body text-[16px] font-semibold tracking-wide text-[var(--muted)]">
                Talko
              </p>
              <h1 className="font-display mt-2 text-balance text-[40px] font-bold leading-[0.98] text-[var(--ink)] sm:text-[52px] md:text-[72px]">
                Юридическая информация
              </h1>
            </div>
          </Reveal>

          <Reveal
            as="div"
            delay={120}
            className="mt-8 rounded-[24px] bg-[var(--card)] p-6 shadow-[0_22px_70px_rgba(105,102,255,.10)]"
          >
            <p className="font-body text-[14px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              Содержание
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {DOC_TITLES.map((t) => (
                <a
                  key={t.id}
                  href={`#${t.id}`}
                  className="group rounded-[18px] bg-[var(--surface-2)] px-4 py-4 text-[16px] font-semibold text-[var(--ink)] shadow-[0_12px_40px_rgba(20,20,40,.06)] ring-1 ring-[var(--ring)] transition hover:bg-[var(--surface)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-body">{t.title}</span>
                    <ArrowRightIcon className="h-4 w-4 opacity-35 transition group-hover:opacity-55" />
                  </div>
                </a>
              ))}
            </div>
          </Reveal>

          <div className="mt-12 space-y-16">
            {docs.map((doc, idx) => (
              <Reveal key={doc.id} delay={100 + idx * 90}>
                <LegalDoc {...doc} />
              </Reveal>
            ))}
          </div>
        </div>
      </Container>

      <ScrollToTopButton />
    </div>
  )
}
