import { useMemo, useState } from 'react'
import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'
import { track } from '../lib/analytics'

const SUPPORT_EMAIL = 'hello@anonimnoe.moscow'
const DEVICE_KEY = 'talko-support-device'

function getDeviceId() {
  try {
    const saved = localStorage.getItem(DEVICE_KEY)
    if (saved) return saved
    const id =
      (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function'
        ? globalThis.crypto.randomUUID()
        : `dev_${Math.random().toString(16).slice(2)}_${Date.now()}`).slice(0, 64)
    localStorage.setItem(DEVICE_KEY, id)
    return id
  } catch {
    return 'unknown'
  }
}

function encodeMailto(s) {
  return encodeURIComponent(s).replace(/%20/g, '+')
}

function buildMailto({ email, message, deviceId }) {
  const subject = `Поддержка Talko: ${email || 'сообщение'}`
  const body = [
    `Device: ${deviceId || 'unknown'}`,
    `Email: ${email || '-'}`,
    `Page: ${window.location.href}`,
    '',
    message || '',
  ].join('\n')

  return `mailto:${SUPPORT_EMAIL}?subject=${encodeMailto(subject)}&body=${encodeMailto(body)}`
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = 'text',
  inputMode,
  autoComplete,
}) {
  return (
    <label className="block">
      <div className="font-body text-[16px] font-semibold text-[var(--body-ink)] opacity-80 sm:text-[18px]">
        {label}{' '}
        {required ? <span className="text-[var(--muted)] opacity-70">*</span> : null}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className="mt-3 w-full rounded-[20px] bg-[var(--field)] px-5 py-4 text-[18px] font-semibold text-[var(--ink)] shadow-[0_12px_40px_rgba(20,20,40,.06)] ring-1 ring-[var(--ring)] outline-none placeholder:text-[var(--muted)] placeholder:opacity-60 focus:bg-[var(--surface)] focus:ring-2 focus:ring-[rgba(105,102,255,.22)] sm:mt-4 sm:rounded-[22px] sm:px-6 sm:py-5 sm:text-[20px]"
      />
    </label>
  )
}

function Textarea({ label, value, onChange, placeholder, required = false }) {
  return (
    <label className="block">
      <div className="font-body text-[16px] font-semibold text-[var(--body-ink)] opacity-80 sm:text-[18px]">
        {label}{' '}
        {required ? <span className="text-[var(--muted)] opacity-70">*</span> : null}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={5}
        className="mt-3 w-full resize-none rounded-[20px] bg-[var(--field)] px-5 py-4 text-[18px] font-semibold leading-relaxed text-[var(--ink)] shadow-[0_12px_40px_rgba(20,20,40,.06)] ring-1 ring-[var(--ring)] outline-none placeholder:text-[var(--muted)] placeholder:opacity-60 focus:bg-[var(--surface)] focus:ring-2 focus:ring-[rgba(105,102,255,.22)] sm:mt-4 sm:rounded-[22px] sm:px-6 sm:py-5 sm:text-[20px]"
      />
    </label>
  )
}

export function SupportPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('idle') // idle | done
  const deviceId = useMemo(() => getDeviceId(), [])

  const trimmed = useMemo(() => {
    const e = email.trim()
    const m = message.trim()
    return { e, m }
  }, [email, message])

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed.e)
  const canSubmit = emailOk && trimmed.m.length >= 10

  const onSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return

    track('support_submit', { deviceId, hasEmail: true, messageLen: trimmed.m.length })
    window.location.href = buildMailto({
      email: trimmed.e,
      message: trimmed.m,
      deviceId,
    })
    setStatus('done')
  }

  return (
    <div className="pb-20 pt-12 md:pb-24 md:pt-20">
      <Container>
        <div className="mx-auto max-w-[920px]">
          <Reveal as="div" delay={0} className="flex flex-col items-center text-center">
            <h1 className="font-display text-balance text-[44px] font-bold leading-[42px] text-[var(--ink)] sm:text-[56px] sm:leading-[54px] md:text-[86px] md:leading-[83px]">
              Чат поддержки
            </h1>
            <p className="mt-4 max-w-[56ch] text-pretty font-body text-[18px] font-medium leading-relaxed text-[var(--body-ink)] opacity-70 sm:text-[20px] md:text-[24px]">
              Напиши нам, и мы ответим. Сообщение откроется в вашем почтовом
              клиенте и отправится на <span className="font-semibold">{SUPPORT_EMAIL}</span>.
            </p>
          </Reveal>

          <Reveal
            as="form"
            onSubmit={onSubmit}
            className="mt-10 rounded-[22px] bg-[var(--card)] p-6 shadow-[0_22px_70px_rgba(105,102,255,.10)] sm:mt-12 sm:p-9 md:mt-14 md:p-10"
          >
            <div className="grid grid-cols-1 gap-8">
              <Field
                label="Email"
                required
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={setEmail}
                placeholder="name@example.com"
              />
            </div>

            <div className="mt-8">
              <Textarea
                label="Сообщение"
                required
                value={message}
                onChange={setMessage}
                placeholder="Опишите проблему или вопрос. Чем больше деталей, тем быстрее поможем."
              />
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className={[
                'font-body mt-8 inline-flex w-full items-center justify-center rounded-[20px] px-6 py-5 text-[18px] font-semibold text-white transition active:translate-y-px sm:mt-10 sm:py-6 sm:text-[20px] md:text-[24px]',
                canSubmit
                  ? 'btn-accent shadow-[0_22px_70px_rgba(105,102,255,.22)] hover:brightness-95'
                  : 'cursor-not-allowed bg-[var(--disabled-bg)] text-[var(--disabled-text)]',
              ].join(' ')}
            >
              {status === 'done' ? 'Открыли письмо' : 'Отправить сообщение'}
            </button>

            <p className="mt-5 text-center font-body text-[16px] font-medium leading-relaxed text-[var(--muted)] sm:mt-6 sm:text-[18px]">
              Отправляя сообщение, вы соглашаетесь с{' '}
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
