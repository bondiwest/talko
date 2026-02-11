import { useEffect, useMemo, useState } from 'react'
import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'

const CLOUDPAYMENTS_SCRIPT_SRC = 'https://widget.cloudpayments.ru/bundles/cloudpayments.js'
const CLOUDPAYMENTS_SCRIPT_ID = 'cloudpayments-widget-script'
const PUBLIC_ID = (import.meta.env.VITE_CP_PUBLIC_ID || 'pk_test_xxxxxxxxxxxxx').trim()
const IS_DEV = import.meta.env.DEV
const VAT = Number.parseInt(import.meta.env.VITE_CP_VAT || '5', 10)

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

function onlyDigits(value) {
  return value.replace(/\D/g, '')
}

function formatCardNumber(value) {
  const digits = onlyDigits(value).slice(0, 19)
  const parts = []
  for (let i = 0; i < digits.length; i += 4) parts.push(digits.slice(i, i + 4))
  return parts.join(' ')
}

function isCardValid(number) {
  const len = onlyDigits(number).length
  return len >= 13 && len <= 19
}

function isMonthValid(mm) {
  if (!/^\d{2}$/.test(mm)) return false
  const month = Number(mm)
  return month >= 1 && month <= 12
}

function isYearValid(yy) {
  return /^\d{2}$/.test(yy)
}

function isCvvValid(cvv) {
  return /^\d{3,4}$/.test(cvv)
}

function isPositiveIntString(value) {
  return /^\d+$/.test(value) && Number(value) > 0
}

function normalizeVat(vat) {
  if (Number.isNaN(vat)) return 5
  return vat
}

export function PayPage() {
  const [isWidgetReady, setIsWidgetReady] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [status, setStatus] = useState('idle') // idle | success | fail
  const [errorText, setErrorText] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expMonth, setExpMonth] = useState('')
  const [expYear, setExpYear] = useState('')
  const [cvv, setCvv] = useState('')

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

  const cardValid = isCardValid(cardNumber)
  const expValid = isMonthValid(expMonth) && isYearValid(expYear)
  const cvvValid = isCvvValid(cvv)
  const uidValid = isPositiveIntString(params.uid)
  const invoiceValid = isPositiveIntString(params.invoice)
  const hasRequiredParams = uidValid && invoiceValid
  const canPay =
    isWidgetReady &&
    !isPaying &&
    hasRequiredParams &&
    cardValid &&
    expValid &&
    cvvValid

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
    if (!cardValid || !expValid || !cvvValid) {
      setErrorText('Проверьте номер карты, срок действия и CVV')
      return
    }

    setErrorText('')
    setStatus('idle')
    setIsPaying(true)

    const widget = new globalThis.cp.CloudPayments()
    const payload = {
      publicId: PUBLIC_ID,
      description: 'Предоставление VIP-доступа',
      amount: 7.0,
      currency: 'RUB',
      accountId: String(Number(params.uid)),
      invoiceId: String(Number(params.invoice)),
      data: {
        CloudPayments: {
          CustomerReceipt: {
            Items: [
              {
                label: 'VIP подписка',
                price: 7.0,
                quantity: 1,
                amount: 7.0,
                vat: normalizeVat(VAT),
                method: 0,
                object: 0,
                measurementUnit: 'шт',
              },
            ],
          },
          amounts: {
            electronic: 7.0,
            advancePayment: 0.0,
            credit: 0.0,
            provision: 0.0,
          },
          mailing_id: params.mid,
        },
      },
    }

    if (IS_DEV) {
      // Frontend debug only: helps verify what is sent to CloudPayments widget.
      console.group('[CloudPayments] pay payload')
      console.log('uid:', params.uid)
      console.log('invoice:', params.invoice)
      console.log('mid:', params.mid)
      console.log('card form:', {
        cardNumberMasked: `${onlyDigits(cardNumber).slice(0, 6)}******${onlyDigits(cardNumber).slice(-4)}`,
        expMonth,
        expYear,
        cvvLen: cvv.length,
      })
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
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-[18px] bg-[var(--surface)] p-4 ring-1 ring-[var(--ring)]">
                <dt className="font-body text-[14px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
                  UID
                </dt>
                <dd className="mt-2 break-all font-body text-[17px] font-semibold text-[var(--ink)]">
                  {params.uid || '— (обязательно)'}
                </dd>
              </div>
              <div className="rounded-[18px] bg-[var(--surface)] p-4 ring-1 ring-[var(--ring)]">
                <dt className="font-body text-[14px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
                  INVOICE
                </dt>
                <dd className="mt-2 break-all font-body text-[17px] font-semibold text-[var(--ink)]">
                  {params.invoice || '— (обязательно)'}
                </dd>
              </div>
              <div className="rounded-[18px] bg-[var(--surface)] p-4 ring-1 ring-[var(--ring)] sm:col-span-2">
                <dt className="font-body text-[14px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
                  MAILING ID
                </dt>
                <dd className="mt-2 font-body text-[17px] font-semibold text-[var(--ink)]">
                  {params.mid ?? 'null'}
                </dd>
              </div>
            </dl>

            {hasRequiredParams ? (
              <div className="mt-8 grid grid-cols-1 gap-4">
                <label className="block">
                  <span className="font-body text-[15px] font-semibold text-[var(--body-ink)] opacity-80 sm:text-[16px]">
                    Номер карты
                  </span>
                  <input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="0000 0000 0000 0000"
                    className="mt-2 w-full rounded-[16px] bg-[var(--field)] px-4 py-4 font-body text-[18px] font-semibold tracking-[0.08em] text-[var(--ink)] ring-1 ring-[var(--ring)] outline-none placeholder:text-[var(--muted)] focus:ring-2 focus:ring-[rgba(105,102,255,.22)]"
                  />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="font-body text-[15px] font-semibold text-[var(--body-ink)] opacity-80 sm:text-[16px]">
                      MM/ГГ
                    </span>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <input
                        value={expMonth}
                        onChange={(e) => setExpMonth(onlyDigits(e.target.value).slice(0, 2))}
                        inputMode="numeric"
                        autoComplete="cc-exp-month"
                        placeholder="MM"
                        className="w-full rounded-[16px] bg-[var(--field)] px-4 py-4 font-body text-[18px] font-semibold tracking-[0.08em] text-[var(--ink)] ring-1 ring-[var(--ring)] outline-none placeholder:text-[var(--muted)] focus:ring-2 focus:ring-[rgba(105,102,255,.22)]"
                      />
                      <input
                        value={expYear}
                        onChange={(e) => setExpYear(onlyDigits(e.target.value).slice(0, 2))}
                        inputMode="numeric"
                        autoComplete="cc-exp-year"
                        placeholder="ГГ"
                        className="w-full rounded-[16px] bg-[var(--field)] px-4 py-4 font-body text-[18px] font-semibold tracking-[0.08em] text-[var(--ink)] ring-1 ring-[var(--ring)] outline-none placeholder:text-[var(--muted)] focus:ring-2 focus:ring-[rgba(105,102,255,.22)]"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="font-body text-[15px] font-semibold text-[var(--body-ink)] opacity-80 sm:text-[16px]">
                      CVV
                    </span>
                    <input
                      value={cvv}
                      onChange={(e) => setCvv(onlyDigits(e.target.value).slice(0, 4))}
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder="123"
                      className="mt-2 w-full rounded-[16px] bg-[var(--field)] px-4 py-4 font-body text-[18px] font-semibold tracking-[0.08em] text-[var(--ink)] ring-1 ring-[var(--ring)] outline-none placeholder:text-[var(--muted)] focus:ring-2 focus:ring-[rgba(105,102,255,.22)]"
                    />
                  </label>
                </div>
              </div>
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
                {isPaying ? 'Ожидание оплаты...' : 'Оплатить'}
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
