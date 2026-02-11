import { useEffect, useState } from 'react'
import { Container } from '../components/Container'
import privacyPolicyRaw from '../data/legal/privacy_pd.txt?raw'
import userAgreementRaw from '../data/legal/user_agreement.txt?raw'
import publicOfferRaw from '../data/legal/public_offer.txt?raw'
import { Reveal } from '../components/Reveal'
import { ArrowRightIcon } from '../components/Icons'

const DOC_TITLES = [
  { id: 'privacy', title: 'Политика обработки персональных данных', date: 'Редакция от 11 февраля 2026 г.' },
  { id: 'agreement', title: 'Пользовательское соглашение', date: 'Редакция от 11 февраля 2026 г.' },
  { id: 'offer', title: 'Публичная оферта', date: 'Редакция от 11 февраля 2026 г.' },
]

function normalizeText(text) {
  return text
    .replace(/\uFEFF/g, '')
    .replace(/[\u200B-\u200D\u2060]/g, '')
    .replace(/\f/g, '\n')
    .replace(/\u2028|\u2029/g, '\n')
    .replace(/\r\n?/g, '\n')
    .trim()
}

function splitDocLines(raw, title) {
  const normalized = normalizeText(raw)
  const lines = normalized.split('\n').map((l) => l.trimEnd())
  const isRevisionLine = (line) => {
    const compact = line
      .trim()
      .toLowerCase()
      .replace(/[«»"'`]/g, '')
      .replace(/\s+/g, ' ')
    return compact.startsWith('редакция от ')
  }

  const cleaned = lines
    .filter((line) => {
      const trimmed = line.trim()
      if (!trimmed) return true
      if (trimmed.toLowerCase() === 'talko') return false
      if (trimmed.toLowerCase() === title.toLowerCase()) return false
      if (isRevisionLine(trimmed)) return false
      return true
    })

  // Defensive cleanup for docx quirks: strip any leading "Редакция от ..."
  // lines that may survive after conversion due to hidden separators.
  while (cleaned.length && isRevisionLine(cleaned[0])) {
    cleaned.shift()
  }

  return cleaned
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
    const trimmed = line.trim()
    const isTopLevelHeading = /^\d+\.\s+\S/.test(trimmed)

    if (trimmed === '') {
      flush()
      continue
    }

    // Start a new visual block for each "N. Заголовок" section
    // even when source text has no blank lines between sections.
    if (isTopLevelHeading && buf.length) flush()

    buf.push(line)
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
    <p className="legal-text text-pretty text-[16px] leading-[1.9] text-[var(--body-ink)] opacity-80 sm:text-[18px]">
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
    <div className="space-y-2.5">
      {items.map((it, idx) => (
        <div key={idx} className="sm:grid sm:grid-cols-[92px_minmax(0,1fr)] sm:gap-3">
          <div className="mb-1 text-[14px] font-bold tracking-[-0.02em] text-[var(--muted)] sm:mb-0 sm:pt-[2px] sm:text-right sm:text-[15px]">
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
  const numberedLineRe = /^\d+(?:\.\d+)*\./
  const isTopLevelSection = /^\d+\.\s+\S/.test(lines[0]?.trim() || '')
  const hasSubItems = lines.slice(1).some((l) => /^\d+\.\d+/.test(l.trim()))

  if (lines.length >= 2 && isTopLevelSection && hasSubItems) {
    const heading = lines[0].trim()
    const rest = lines.slice(1)
    const numbered = rest.filter((l) => numberedLineRe.test(l.trim())).length

    return (
      <div key={key}>
        <h3 className="font-display mt-8 text-[22px] font-bold leading-[1.1] text-[var(--ink)] sm:text-[26px] md:text-[28px]">
          {heading}
        </h3>
        <div className="mt-4">
          {rest.some((l) => numberedLineRe.test(l.trim())) && (rest.length === 1 || numbered / rest.length >= 0.6) ? (
            <NumberedList lines={rest} />
          ) : (
            <Paragraph text={rest.map((l) => l.trim()).join(' ')} />
          )}
        </div>
      </div>
    )
  }

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

  const numbered = lines.filter((l) => numberedLineRe.test(l.trim())).length
  const singleSubItem = lines.length === 1 && /^\d+\.\d+\./.test(lines[0].trim())
  if (singleSubItem || (lines.length >= 2 && numbered / lines.length >= 0.6)) {
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

function LegalDoc({ id, title, lines, date }) {
  const paras = splitParagraphs(lines)
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-[26px] bg-[var(--surface)] p-6 shadow-[0_22px_70px_rgba(105,102,255,.08)] ring-1 ring-[var(--ring)] backdrop-blur sm:p-8"
    >
      <p className="font-body mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)] sm:mb-4">
        Юридический документ
      </p>
      <h2 className="font-display text-[28px] font-bold leading-[28px] text-[var(--ink)] sm:text-[34px] sm:leading-[34px] md:text-[44px] md:leading-[44px]">
        {title}
      </h2>
      {date ? (
        <p className="mt-2 font-body text-[14px] font-medium text-[var(--muted)]">
          {date}
        </p>
      ) : null}

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
      date: DOC_TITLES[0].date,
      lines: splitDocLines(privacyPolicyRaw, 'ПОЛИТИКА ОБРАБОТКИ ПЕРСОНАЛЬНЫХ ДАННЫХ'),
    },
    {
      id: 'agreement',
      title: DOC_TITLES[1].title,
      date: DOC_TITLES[1].date,
      lines: splitDocLines(userAgreementRaw, 'ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ'),
    },
    {
      id: 'offer',
      title: DOC_TITLES[2].title,
      date: DOC_TITLES[2].date,
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
            <p className="font-body text-[15px] font-medium leading-relaxed text-[var(--body-ink)] opacity-75 sm:text-[17px]">
              Ниже размещены официальные документы Talko в актуальной редакции.
              Используйте содержание для быстрого перехода к нужному разделу.
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
            <Reveal as="aside" delay={140} className="lg:sticky lg:top-28">
              <div className="rounded-[22px] bg-[var(--card)] p-5 shadow-[0_22px_70px_rgba(105,102,255,.08)] ring-1 ring-[var(--ring)]">
                <p className="font-body text-[13px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                  Содержание
                </p>
                <div className="mt-4 grid grid-cols-1 gap-3">
                  {DOC_TITLES.map((t) => (
                    <a
                      key={t.id}
                      href={`#${t.id}`}
                      className="group rounded-[16px] bg-[var(--surface-2)] px-4 py-3 text-[15px] font-semibold text-[var(--ink)] shadow-[0_12px_40px_rgba(20,20,40,.06)] ring-1 ring-[var(--ring)] transition hover:bg-[var(--surface)]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-body">{t.title}</span>
                        <ArrowRightIcon className="h-4 w-4 opacity-35 transition group-hover:opacity-55" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>

            <div className="space-y-16">
              {docs.map((doc, idx) => (
                <Reveal key={doc.id} delay={120 + idx * 90}>
                  <LegalDoc {...doc} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </Container>

      <ScrollToTopButton />
    </div>
  )
}
