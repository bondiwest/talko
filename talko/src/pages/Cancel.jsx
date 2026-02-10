import { useMemo, useState } from 'react'
import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'

function onlyDigits(s) {
  return s.replace(/\D/g, '')
}

function clampLen(s, n) {
  return s.slice(0, n)
}

function formatCardNumber(digits) {
  const groups = []
  for (let i = 0; i < digits.length; i += 4) groups.push(digits.slice(i, i + 4))
  return groups.join(' ')
}

function isMonthValid(mm) {
  if (mm.length !== 2) return false
  const m = Number(mm)
  return Number.isInteger(m) && m >= 1 && m <= 12
}

function isYearValid(yy) {
  if (yy.length !== 2) return false
  const y = Number(yy)
  return Number.isInteger(y) && y >= 0 && y <= 99
}

function isCvvValid(cvv) {
  return cvv.length === 3 || cvv.length === 4
}

function Field({ label, hint, value, onChange, placeholder, widthClass = '' }) {
  return (
    <label className={['block', widthClass].join(' ')}>
      <div className="font-body text-[16px] font-semibold text-[var(--body-ink)] opacity-80 sm:text-[18px]">
        {label}
      </div>
      {hint ? (
        <div className="mt-2 font-body text-[14px] font-medium text-[var(--muted)] sm:text-[16px]">
          {hint}
        </div>
      ) : null}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode="numeric"
        className="mt-3 w-full rounded-[20px] bg-[var(--field)] px-5 py-4 text-[18px] font-semibold tracking-[0.12em] text-[var(--ink)] shadow-[0_12px_40px_rgba(20,20,40,.06)] ring-1 ring-[var(--ring)] outline-none placeholder:text-[var(--muted)] placeholder:opacity-60 focus:bg-[var(--surface)] focus:ring-2 focus:ring-[rgba(105,102,255,.22)] sm:mt-4 sm:rounded-[22px] sm:px-6 sm:py-5 sm:text-[20px]"
      />
    </label>
  )
}

function CardNumberField({ value, onChange }) {
  return (
    <label className="block">
      <div className="font-body text-[16px] font-semibold text-[var(--body-ink)] opacity-80 sm:text-[18px]">
        Номер карты
      </div>
      <div className="mt-3 flex items-center gap-4 rounded-[20px] bg-[var(--field)] px-5 py-4 shadow-[0_18px_50px_rgba(20,20,40,.06)] ring-1 ring-[var(--ring)] focus-within:bg-[var(--surface)] focus-within:ring-2 focus-within:ring-[rgba(105,102,255,.22)] sm:mt-4 sm:rounded-[22px] sm:px-6 sm:py-5">
        <div className="grid h-10 w-10 place-items-center rounded-[14px] bg-[var(--surface-2)] ring-1 ring-[var(--ring)] sm:h-12 sm:w-12 sm:rounded-[16px]">
          <svg
            width="26"
            height="20"
            viewBox="0 0 26 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="text-[var(--muted)]"
          >
            <rect
              x="1.5"
              y="1.5"
              width="23"
              height="17"
              rx="4"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M2.5 7.25H23.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M6.25 13.25H11.25"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode="numeric"
          placeholder="0000 0000 0000 0000"
          className="min-w-0 flex-1 bg-transparent text-[18px] font-semibold tracking-[0.12em] text-[var(--ink)] outline-none placeholder:text-[var(--muted)] placeholder:opacity-60 sm:text-[20px] sm:tracking-[0.14em] md:text-[22px]"
        />
      </div>
    </label>
  )
}

function ExpiryField({ mm, yy, onMm, onYy }) {
  return (
    <div>
      <div className="font-body text-[16px] font-semibold text-[var(--body-ink)] opacity-80 sm:text-[18px]">
        Срок действия
      </div>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:mt-4">
        <input
          value={mm}
          onChange={(e) => onMm(e.target.value)}
          inputMode="numeric"
          placeholder="MM"
          className="w-full rounded-[20px] bg-[var(--field)] px-5 py-4 text-[18px] font-semibold tracking-[0.12em] text-[var(--ink)] shadow-[0_12px_40px_rgba(20,20,40,.06)] ring-1 ring-[var(--ring)] outline-none placeholder:text-[var(--muted)] placeholder:opacity-60 focus:bg-[var(--surface)] focus:ring-2 focus:ring-[rgba(105,102,255,.22)] sm:rounded-[22px] sm:px-6 sm:py-5 sm:text-[20px] md:text-[22px]"
        />
        <input
          value={yy}
          onChange={(e) => onYy(e.target.value)}
          inputMode="numeric"
          placeholder="YY"
          className="w-full rounded-[20px] bg-[var(--field)] px-5 py-4 text-[18px] font-semibold tracking-[0.12em] text-[var(--ink)] shadow-[0_12px_40px_rgba(20,20,40,.06)] ring-1 ring-[var(--ring)] outline-none placeholder:text-[var(--muted)] placeholder:opacity-60 focus:bg-[var(--surface)] focus:ring-2 focus:ring-[rgba(105,102,255,.22)] sm:rounded-[22px] sm:px-6 sm:py-5 sm:text-[20px] md:text-[22px]"
        />
      </div>
    </div>
  )
}

function CvvField({ value, onChange }) {
  return (
    <label className="block">
      <div className="font-body text-[16px] font-semibold text-[var(--body-ink)] opacity-80 sm:text-[18px]">
        CVV
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="numeric"
        placeholder="CVC"
        className="mt-3 w-full rounded-[20px] bg-[var(--field)] px-5 py-4 text-[18px] font-semibold tracking-[0.12em] text-[var(--ink)] shadow-[0_12px_40px_rgba(20,20,40,.06)] ring-1 ring-[var(--ring)] outline-none placeholder:text-[var(--muted)] placeholder:opacity-60 focus:bg-[var(--surface)] focus:ring-2 focus:ring-[rgba(105,102,255,.22)] sm:mt-4 sm:rounded-[22px] sm:px-6 sm:py-5 sm:text-[20px] md:text-[22px]"
      />
    </label>
  )
}

export function CancelPage() {
  const [cardNumber, setCardNumber] = useState('')
  const [mm, setMm] = useState('')
  const [yy, setYy] = useState('')
  const [cvv, setCvv] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | done

  const cleaned = useMemo(() => {
    const digits = clampLen(onlyDigits(cardNumber), 19)
    const m = clampLen(onlyDigits(mm), 2)
    const y = clampLen(onlyDigits(yy), 2)
    const c = clampLen(onlyDigits(cvv), 4)
    return { digits, m, y, c }
  }, [cardNumber, mm, yy, cvv])

  const canSubmit =
    cleaned.digits.length >= 13 &&
    isMonthValid(cleaned.m) &&
    isYearValid(cleaned.y) &&
    isCvvValid(cleaned.c)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit || status === 'submitting') return

    setStatus('submitting')
    // UI-only: here you would call your backend.
    await new Promise((r) => setTimeout(r, 700))
    setStatus('done')
  }

  return (
    <div className="pb-24 pt-14 md:pt-20">
      <Container>
        <div className="mx-auto max-w-[920px]">
          <Reveal as="div" delay={0} className="flex flex-col items-center text-center">
            <h1 className="font-display text-balance text-[44px] font-bold leading-[42px] text-[var(--ink)] sm:text-[56px] sm:leading-[54px] md:text-[86px] md:leading-[83px]">
              Отмена подписки
            </h1>
            <p className="mt-4 max-w-[52ch] text-pretty font-body text-[18px] font-medium leading-relaxed text-[var(--body-ink)] opacity-70 sm:text-[20px] md:text-[24px]">
              Для отмены подписки подготовьте вашу банковскую карту, которая
              была привязана к Премиум-подписке.
            </p>
          </Reveal>

          <Reveal
            as="form"
            onSubmit={onSubmit}
            className="mt-12 rounded-[28px] bg-[var(--surface)] p-6 shadow-[0_22px_70px_rgba(20,20,40,.08)] ring-1 ring-[var(--ring)] md:mt-14 md:p-10"
          >
            <div className="space-y-8 sm:space-y-10">
              <CardNumberField
                value={formatCardNumber(cleaned.digits)}
                onChange={(v) => setCardNumber(formatCardNumber(clampLen(onlyDigits(v), 19)))}
              />

              <div className="grid grid-cols-1 gap-8 sm:gap-10 md:grid-cols-2">
                <ExpiryField
                  mm={cleaned.m}
                  yy={cleaned.y}
                  onMm={(v) => setMm(clampLen(onlyDigits(v), 2))}
                  onYy={(v) => setYy(clampLen(onlyDigits(v), 2))}
                />

                <CvvField
                  value={cleaned.c}
                  onChange={(v) => setCvv(clampLen(onlyDigits(v), 4))}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit || status === 'submitting'}
              className={[
                'font-body mt-10 inline-flex w-full items-center justify-center rounded-[20px] px-6 py-5 text-[18px] font-semibold text-white transition active:translate-y-px sm:py-6 sm:text-[20px] md:text-[24px]',
                canSubmit && status !== 'submitting'
                  ? 'btn-accent shadow-[0_22px_70px_rgba(105,102,255,.22)] hover:brightness-95'
                  : 'cursor-not-allowed bg-[var(--disabled-bg)] text-[var(--disabled-text)]',
              ].join(' ')}
            >
              {status === 'submitting'
                ? 'Ищем подписку...'
                : status === 'done'
                  ? 'Запрос отправлен'
                  : 'Найти и отменить подписку'}
            </button>

            <p className="mt-6 text-center font-body text-[16px] font-medium leading-relaxed text-[var(--muted)] sm:text-[18px]">
              Нажимая на кнопку «Найти и отменить подписку», вы даёте согласие
              на обработку персональных данных и соглашаетесь с{' '}
              <a
                href={`${import.meta.env.BASE_URL || '/'}legal#privacy`}
                className="font-semibold text-[var(--ink)] underline decoration-[var(--ring)] underline-offset-4 hover:decoration-[var(--ring-strong)]"
              >
                политикой конфиденциальности
              </a>
              .
            </p>
          </Reveal>
        </div>
      </Container>
    </div>
  )
}
