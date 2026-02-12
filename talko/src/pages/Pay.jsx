import { useEffect, useMemo, useState } from 'react'
import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'
import { PAY_CONSENTS } from '../config/payConsents'

const CLOUDPAYMENTS_SCRIPT_SRC = 'https://widget.cloudpayments.ru/bundles/cloudpayments.js'
const CLOUDPAYMENTS_SCRIPT_ID = 'cloudpayments-widget-script'
const PUBLIC_ID = (import.meta.env.VITE_CP_PUBLIC_ID || 'pk_test_xxxxxxxxxxxxx').trim()
const IS_DEV = import.meta.env.DEV
const VAT = Number.parseInt(import.meta.env.VITE_CP_VAT || '5', 10)
const PAYMENT_AMOUNT = 5.0
const PAYMENT_CURRENCY = 'RUB'
const PAYMENT_DESCRIPTION = 'Предоставление VIP-доступа'

function loadCloudPayments() {
  if (globalThis.cp?.CloudPayments) return Promise.resolve()
  if (globalThis.__cpWidgetPromise) return globalThis.__cpWidgetPromise

  globalThis.__cpWidgetPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(CLOUDPAYMENTS_SCRIPT_ID)
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener(
        'error',
        () => reject(new Error('Не удалось загрузить CloudPayments Widget')),
        { once: true },
      )
      return
    }

    const script = document.createElement('script')
    script.id = CLOUDPAYMENTS_SCRIPT_ID
    script.src = CLOUDPAYMENTS_SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Не удалось загрузить CloudPayments Widget'))
    document.head.appendChild(script)
  })

  return globalThis.__cpWidgetPromise
}

function isPositiveIntString(value) {
  return /^\d+$/.test(value) && Number(value) > 0
}

function normalizeVat(vat) {
  if (Number.isNaN(vat)) return 5
  return vat
}

function SpinnerIcon() {
  return (
    <svg
      className="h-5 w-5 animate-spin"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.28" strokeWidth="2.5" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function PayPage() {
  const [isWidgetReady, setIsWidgetReady] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [status, setStatus] = useState('idle') // idle | success | fail
  const [errorText, setErrorText] = useState('')
  const [consentsState, setConsentsState] = useState(() => {
    const initial = {}
    for (const item of PAY_CONSENTS.items) initial[item.id] = Boolean(item.defaultChecked)
    return initial
  })

  const params = useMemo(() => {
    const search = new URLSearchParams(window.location.search)
    const uid = (search.get('uid') || '').trim()
    const invoice = (search.get('invoice') || '').trim()
    const midRaw = (search.get('mid') || '').trim()
    const parsedMid = midRaw ? Number.parseInt(midRaw, 10) : null

    return {
      uid,
      invoice,
      mid: Number.isInteger(parsedMid) ? parsedMid : null,
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    loadCloudPayments()
      .then(() => {
        if (cancelled) return
        if (!globalThis.cp?.CloudPayments) {
          throw new Error('CloudPayments Widget загружен некорректно')
        }
        setIsWidgetReady(true)
      })
      .catch((err) => {
        if (cancelled) return
        setErrorText(err?.message || 'Ошибка загрузки платежного виджета')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const uidValid = isPositiveIntString(params.uid)
  const invoiceValid = isPositiveIntString(params.invoice)
  const hasRequiredParams = uidValid && invoiceValid
  const checkboxesEnabled = Boolean(PAY_CONSENTS.enabled)
  const requiredItems = PAY_CONSENTS.items.filter((item) => item.required)
  const checkboxesValid = !checkboxesEnabled
    || !PAY_CONSENTS.requireAll
    || requiredItems.every((item) => consentsState[item.id])
  const canPay = isWidgetReady && !isPaying && hasRequiredParams && checkboxesValid

  const resolveLink = (href) => {
    if (!href) return '#'
    if (/^https?:\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')) return href
    const base = import.meta.env.BASE_URL || '/'
    const normalizedBase = base.endsWith('/') ? base : `${base}/`
    if (href.startsWith('/')) return `${normalizedBase}${href.slice(1)}`
    return `${normalizedBase}${href}`
  }

  const renderConsentText = (text, id) => {
    const parts = []
    const re = /\[([^\]]+)\]\(([^)]+)\)/g
    let lastIndex = 0
    let match
    let chunkIndex = 0
    while ((match = re.exec(text))) {
      if (match.index > lastIndex) parts.push(<span key={`${id}-t-${chunkIndex++}`}>{text.slice(lastIndex, match.index)}</span>)
      parts.push(
        <a
          key={`${id}-l-${chunkIndex++}`}
          href={resolveLink(match[2])}
          className="font-semibold text-[var(--ink)] underline decoration-[var(--ring)] underline-offset-4"
          target={/^https?:\/\//i.test(match[2]) ? '_blank' : undefined}
          rel={/^https?:\/\//i.test(match[2]) ? 'noreferrer' : undefined}
        >
          {match[1]}
        </a>,
      )
      lastIndex = re.lastIndex
    }
    if (lastIndex < text.length) parts.push(<span key={`${id}-t-${chunkIndex++}`}>{text.slice(lastIndex)}</span>)
    return parts
  }

  const onPay = () => {
    if (!uidValid) {
      setErrorText('Параметр uid обязателен и должен быть числом')
      return
    }
    if (!invoiceValid) {
      setErrorText('Параметр invoice обязателен и должен быть числом')
      return
    }
    if (!globalThis.cp?.CloudPayments) {
      setErrorText('Платежный виджет недоступен. Обновите страницу.')
      return
    }
    if (!PUBLIC_ID) {
      setErrorText('Не настроен VITE_CP_PUBLIC_ID')
      return
    }
    if (checkboxesEnabled && !checkboxesValid) {
      setErrorText('Подтвердите согласие с условиями перед оплатой')
      return
    }
    setErrorText('')
    setStatus('idle')
    setIsPaying(true)

    const widget = new globalThis.cp.CloudPayments()
    const payload = {
      publicId: PUBLIC_ID,
      description: PAYMENT_DESCRIPTION,
      amount: PAYMENT_AMOUNT,
      currency: PAYMENT_CURRENCY,
      accountId: String(Number(params.uid)),
      invoiceId: String(Number(params.invoice)),
      data: {
        CloudPayments: {
          CustomerReceipt: {
            Items: [
                {
                  label: 'VIP подписка',
                  price: PAYMENT_AMOUNT,
                  quantity: 1,
                  amount: PAYMENT_AMOUNT,
                  vat: normalizeVat(VAT),
                  method: 0,
                  object: 0,
                  measurementUnit: 'шт',
                },
            ],
          },
          amounts: {
            electronic: PAYMENT_AMOUNT,
            advancePayment: 0.0,
            credit: 0.0,
            provision: 0.0,
          },
          mailing_id: params.mid,
        },
        consent: {
          version: PAY_CONSENTS.version,
          ui_visible: checkboxesEnabled,
          ui_mode: checkboxesEnabled ? 'checkbox' : 'hidden_auto',
          checked_at: new Date().toISOString(),
          account_id: String(Number(params.uid)),
          invoice_id: String(Number(params.invoice)),
          items: PAY_CONSENTS.items.map((item) => ({
            id: item.id,
            required: Boolean(item.required),
            checked: checkboxesEnabled ? Boolean(consentsState[item.id]) : true,
            text: item.text,
          })),
        },
      },
    }

    if (IS_DEV) {
      // Frontend debug only: helps verify what is sent to CloudPayments widget.
      console.group('[CloudPayments] pay payload')
      console.log('uid:', params.uid)
      console.log('invoice:', params.invoice)
      console.log('mid:', params.mid)
      console.log('payload:', payload)
      console.groupEnd()
    }

    widget.pay(
      'charge',
      payload,
      {
        onSuccess: () => {
          if (IS_DEV) console.log('[CloudPayments] onSuccess')
          setIsPaying(false)
          setStatus('success')
          const base = import.meta.env.BASE_URL || '/'
          const normalizedBase = base.endsWith('/') ? base : `${base}/`
          window.location.assign(`${normalizedBase}pay/success`)
        },
        onFail: () => {
          if (IS_DEV) console.log('[CloudPayments] onFail')
          setIsPaying(false)
          setStatus('fail')
        },
      },
    )
  }

  return (
    <div className="pb-20 pt-12 md:pb-24 md:pt-20">
      <Container>
        <div className="mx-auto max-w-[760px]">
          <Reveal as="div" delay={0} className="text-center">
            <h1 className="font-display text-[44px] font-bold leading-[42px] text-[var(--ink)] sm:text-[56px] sm:leading-[54px] md:text-[72px] md:leading-[70px]">
              Оплата VIP
            </h1>
            <p className="mt-4 font-body text-[18px] font-medium leading-relaxed text-[var(--body-ink)] opacity-75 sm:text-[20px]">
              Подтвердите оплату в защищённом виджете CloudPayments.
            </p>
          </Reveal>

          <Reveal
            as="section"
            className="mt-10 rounded-[24px] bg-[var(--card)] p-6 shadow-[0_22px_70px_rgba(105,102,255,.10)] ring-1 ring-[var(--ring)] sm:mt-12 sm:p-8"
          >
            {hasRequiredParams ? (
              <>
                <div className="rounded-[18px] bg-[var(--surface)] p-4 ring-1 ring-[var(--ring)]">
                  <p className="font-body text-[14px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
                    К оплате
                  </p>
                  <p className="mt-2 font-body text-[20px] font-semibold text-[var(--ink)] sm:text-[24px]">
                    {PAYMENT_AMOUNT.toFixed(2)} ₽
                  </p>
                  <p className="mt-1 font-body text-[16px] font-medium text-[var(--body-ink)] opacity-80 sm:text-[18px]">
                    {PAYMENT_DESCRIPTION}
                  </p>
                </div>

                <p className="mt-6 font-body text-[16px] font-medium leading-relaxed text-[var(--body-ink)] opacity-80 sm:text-[18px]">
                  После нажатия на кнопку откроется защищённое окно CloudPayments, где вы
                  сможете ввести данные карты и подтвердить оплату.
                </p>

                {checkboxesEnabled ? (
                  <div className="mt-6 space-y-4 rounded-[18px] bg-[var(--surface)] p-4 ring-1 ring-[var(--ring)]">
                    {PAY_CONSENTS.items.map((item) => (
                      <label key={item.id} className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={Boolean(consentsState[item.id])}
                          onChange={(e) =>
                            setConsentsState((prev) => ({
                              ...prev,
                              [item.id]: e.target.checked,
                            }))}
                          className="mt-1 h-5 w-5 shrink-0 rounded border-[var(--ring-strong)] text-[var(--accent)]"
                        />
                        <span className="font-body text-[14px] leading-relaxed text-[var(--body-ink)] sm:text-[16px]">
                          {renderConsentText(item.text, item.id)}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="mt-8 rounded-[18px] bg-[var(--surface)] p-4 font-body text-[16px] font-semibold text-[var(--body-ink)] ring-1 ring-[var(--ring)]">
                Оплата заблокирована: в ссылке должны быть корректные параметры
                <span className="mx-1 font-bold">uid</span> и
                <span className="mx-1 font-bold">invoice</span> (оба только числовые).
              </div>
            )}

            {hasRequiredParams ? (
              <button
                type="button"
                onClick={onPay}
                disabled={!canPay}
                className={[
                  'font-body mt-8 inline-flex w-full items-center justify-center rounded-[20px] px-6 py-5 text-[18px] font-semibold text-white transition sm:text-[20px]',
                  canPay
                    ? 'btn-accent shadow-[0_22px_70px_rgba(105,102,255,.22)] hover:brightness-95 active:translate-y-px'
                    : 'cursor-not-allowed bg-[var(--disabled-bg)] text-[var(--disabled-text)]',
                ].join(' ')}
              >
                {isPaying ? (
                  <span className="inline-flex items-center gap-3">
                    <SpinnerIcon />
                    Ожидание оплаты...
                  </span>
                ) : (
                  'Оплатить'
                )}
              </button>
            ) : null}

            {errorText ? (
              <p className="mt-4 font-body text-[16px] font-semibold text-[var(--body-ink)]">
                {errorText}
              </p>
            ) : null}
            {status === 'success' ? (
              <p className="mt-4 font-body text-[16px] font-semibold text-[var(--body-ink)]">
                Оплата прошла успешно.
              </p>
            ) : null}
            {status === 'fail' ? (
              <p className="mt-4 font-body text-[16px] font-semibold text-[var(--body-ink)]">
                Оплата не завершена. Попробуйте снова.
              </p>
            ) : null}
          </Reveal>
        </div>
      </Container>
    </div>
  )
}
