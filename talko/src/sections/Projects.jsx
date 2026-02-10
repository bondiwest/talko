import { projects } from '../data/projects'
import { Container } from '../components/Container'
import { ArrowRightIcon } from '../components/Icons'
import { HighlightedText } from '../components/HighlightedText'
import { Reveal } from '../components/Reveal'
import { track } from '../lib/analytics'

function Card({ title, description, image, glow, highlights, href }) {
  return (
    <article className="group flex h-full flex-col rounded-[22px] bg-[var(--card)] p-9 text-center shadow-[0_22px_70px_rgba(105,102,255,.10)] ring-1 ring-[var(--ring)] transition duration-300 will-change-transform hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(105,102,255,.16)] sm:p-10 sm:text-left">
      <div
        className="avatar-gloss mx-auto mb-6 h-[120px] w-[120px] sm:mx-0"
        style={{ '--avatar-glow': glow }}
      >
        <div className="relative z-[1] h-full w-full overflow-hidden rounded-2xl bg-[var(--surface)] shadow-[0_12px_40px_rgba(20,20,40,.08)] ring-1 ring-[var(--ring)]">
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <h3 className="project-card-title font-display text-[26px] font-bold leading-[26px] text-[var(--ink)] sm:text-[30px] sm:leading-[30px] md:text-[40px] md:leading-[40px] lg:text-[46px] lg:leading-[44px]">
        {title}
      </h3>
      <p className="clamp-4 mt-4 text-[16px] font-normal leading-[1.75] text-[var(--body-ink)] opacity-70 sm:text-[18px]">
        <HighlightedText text={description} highlights={highlights} />
      </p>

      <div className="mt-auto pt-8">
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="btn-accent font-body inline-flex w-full items-center justify-center gap-2 rounded-[20px] px-5 py-4 text-[18px] font-semibold text-white shadow-[0_18px_40px_rgba(120,88,255,.25)] transition hover:brightness-95 active:translate-y-px active:scale-[0.99] sm:text-[20px]"
          onClick={() => track('project_cta', { title, href })}
        >
          Перейти в бота
          <span aria-hidden="true" className="grid h-6 w-6 place-items-center">
            <ArrowRightIcon className="h-5 w-5 opacity-95" />
          </span>
        </a>
      </div>
    </article>
  )
}

export function Projects() {
  return (
    <section id="projects" className="pb-16 pt-6">
      <Container>
        <Reveal
          as="div"
          delay={0}
          className="flex items-center justify-center gap-3 pb-8 pt-2"
        >
          <h2 className="font-display text-center text-[32px] font-bold leading-[32px] text-[var(--ink)] sm:text-[40px] sm:leading-[40px] md:text-[64px] md:leading-[64px] lg:text-[86px] lg:leading-[83px]">
            Наши проекты
          </h2>
          <button
            type="button"
            aria-label="Открыть каталог"
            className="grid h-10 w-10 place-items-center rounded-full bg-[var(--ink)] text-white shadow-[0_16px_40px_rgba(20,20,40,.12)] transition hover:brightness-110 active:translate-y-px active:scale-[0.99]"
          >
            <ArrowRightIcon className="h-5 w-5 -rotate-45 opacity-95" />
          </button>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, idx) => (
            <Reveal key={p.title} className="h-full" delay={Math.min(40 + idx * 35, 220)}>
              <Card {...p} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
