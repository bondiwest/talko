import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'

export function PaySuccessPage() {
  return (
    <div className="pb-20 pt-12 md:pb-24 md:pt-20">
      <Container>
        <div className="mx-auto max-w-[760px]">
          <Reveal as="section" className="rounded-[24px] bg-[var(--card)] p-8 text-center shadow-[0_22px_70px_rgba(105,102,255,.10)] ring-1 ring-[var(--ring)] sm:p-10">
            <p className="font-body text-[14px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
              CloudPayments
            </p>
            <h1 className="font-display mt-3 text-[42px] font-bold leading-[1] text-[var(--ink)] sm:text-[56px]">
              Оплата прошла
            </h1>
            <p className="mt-4 font-body text-[18px] leading-relaxed text-[var(--body-ink)] opacity-80 sm:text-[20px]">
              Спасибо! Доступ будет активирован автоматически.
            </p>
          </Reveal>
        </div>
      </Container>
    </div>
  )
}

