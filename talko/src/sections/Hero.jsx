import { Container } from '../components/Container'
import { HighlightedText } from '../components/HighlightedText'
import { Reveal } from '../components/Reveal'
import heroImg from '../assets/images/hero-image.png'

export function Hero() {
  return (
    <section id="top" className="pt-12">
      <Container className="grid grid-cols-1 items-center gap-10 pb-10 md:grid-cols-[1.05fr_.95fr]">
        <Reveal as="div" delay={0} className="text-center md:text-left">
          <h1 className="font-display text-balance text-[62px] font-bold leading-[60px] text-[var(--ink)] sm:text-[72px] sm:leading-[70px] md:text-[96px] md:leading-[92px] lg:text-[130px] lg:leading-[125px]">
            Проекты
            <br />
            от Талко
          </h1>
          <p className="mt-5 mx-auto max-w-[42ch] text-pretty text-[18px] font-normal leading-relaxed text-[var(--body-ink)] opacity-75 sm:text-[20px] md:mx-0">
            <HighlightedText
              text="Развлекательные боты для знакомства и совместного времяпровождения."
              highlights={['Развлекательные боты', 'знакомства', 'совместного времяпровождения']}
            />
          </p>
        </Reveal>

        <Reveal
          as="div"
          delay={120}
          className="relative mx-auto w-full max-w-[620px] md:mx-0 md:justify-self-end md:-mr-10 md:max-w-[760px] lg:-mr-16 lg:max-w-[860px] xl:-mr-24 xl:max-w-[980px]"
        >
          <img
            src={heroImg}
            alt=""
            aria-hidden="true"
            className="aspect-[5/3] w-full origin-center object-contain transform-gpu md:-translate-x-8 md:scale-[1.30] lg:-translate-x-14 lg:scale-[1.45]"
          />
        </Reveal>
      </Container>
    </section>
  )
}
