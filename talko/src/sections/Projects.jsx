import { useEffect, useRef, useState } from 'react'
import Lottie from 'lottie-react'
import { projects } from '../data/projects'
import { Container } from '../components/Container'
import { ArrowRightIcon } from '../components/Icons'
import { HighlightedText } from '../components/HighlightedText'
import { Reveal } from '../components/Reveal'
import { track } from '../lib/analytics'
import heart1Lottie from '../assets/lottie/heart1.json'
import heart2Lottie from '../assets/lottie/heart2.json'
import heart3Lottie from '../assets/lottie/heart3.json'
import heartFallbackSvg from '../assets/emojies/heart.svg'
import startIcon from '../assets/icons/start.svg'

const LOTTIE_BY_KEY = {
  heart1: heart1Lottie,
  heart2: heart2Lottie,
  heart3: heart3Lottie,
}

function FloatingLottie({ lottieKey, style }) {
  const animationData = LOTTIE_BY_KEY[lottieKey]
  const [isReady, setIsReady] = useState(false)
  const [showFallback, setShowFallback] = useState(!animationData)
  const [isFailed, setIsFailed] = useState(!animationData)

  useEffect(() => {
    if (!animationData || isReady || isFailed) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      setShowFallback(true)
    }, 120)

    return () => window.clearTimeout(timer)
  }, [animationData, isFailed, isReady])

  const showHeartFallback = isFailed || showFallback

  return (
    <div
      className={`avatar-lottie avatar-lottie--floating ${isReady && !isFailed ? 'avatar-lottie--ready' : ''}`}
      style={style}
      aria-hidden="true"
    >
      {animationData ? (
        <Lottie
          animationData={animationData}
          loop={false}
          autoplay
          className="avatar-lottie-canvas"
          onDOMLoaded={() => {
            setIsReady(true)
            setShowFallback(false)
          }}
          onDataFailed={() => {
            setIsFailed(true)
            setShowFallback(true)
          }}
        />
      ) : null}
      {showHeartFallback ? (
        <img src={heartFallbackSvg} alt="" className="avatar-lottie-fallback avatar-lottie-fallback-img" />
      ) : null}
    </div>
  )
}

function Card({ title, description, image, glow, highlights, href, lottieKeys = ['heart1', 'heart2', 'heart3'] }) {
  const [isAvatarBursting, setIsAvatarBursting] = useState(false)
  const [floatingStickers, setFloatingStickers] = useState([])
  const burstTimeoutRef = useRef(null)
  const stickersCleanupRef = useRef(new Map())

  useEffect(() => {
    const timeoutsMap = stickersCleanupRef.current
    return () => {
      if (burstTimeoutRef.current) window.clearTimeout(burstTimeoutRef.current)
      for (const timeoutId of timeoutsMap.values()) {
        window.clearTimeout(timeoutId)
      }
      timeoutsMap.clear()
    }
  }, [])

  const triggerAvatarBurst = () => {
    setIsAvatarBursting(false)
    window.requestAnimationFrame(() => setIsAvatarBursting(true))
    if (burstTimeoutRef.current) window.clearTimeout(burstTimeoutRef.current)
    burstTimeoutRef.current = window.setTimeout(() => setIsAvatarBursting(false), 520)

    if (lottieKeys.length) {
      const messageId = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      const nextIndex = Math.floor(Math.random() * lottieKeys.length)
      const xOffset = (Math.random() - 0.5) * 36
      const sway = (Math.random() - 0.5) * 28
      const tilt = (Math.random() - 0.5) * 28
      const duration = 2100 + Math.round(Math.random() * 550)

      setFloatingStickers((prev) => [
        ...prev,
        { id: messageId, lottieKey: lottieKeys[nextIndex], xOffset, sway, tilt, duration },
      ])

      const timeoutId = window.setTimeout(() => {
        setFloatingStickers((prev) => prev.filter((item) => item.id !== messageId))
        stickersCleanupRef.current.delete(messageId)
      }, duration + 120)
      stickersCleanupRef.current.set(messageId, timeoutId)
    }
  }

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[32px] bg-[var(--card)] text-left shadow-[0_22px_70px_rgba(105,102,255,.10)] ring-1 ring-[var(--ring)] transition duration-300 will-change-transform hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(105,102,255,.16)]">
      <button
        type="button"
        className={`avatar-gloss relative block w-full appearance-none border-0 bg-transparent p-0 ${isAvatarBursting ? 'avatar-gloss--burst' : ''}`}
        style={{ '--avatar-glow': glow }}
        aria-label={`Показать анимированные эмодзи проекта ${title}`}
        onClick={triggerAvatarBurst}
      >
        {floatingStickers.map((item) => (
          <FloatingLottie
            key={item.id}
            lottieKey={item.lottieKey}
            style={{
              '--sticker-x': `${item.xOffset}px`,
              '--sticker-sway': `${item.sway}px`,
              '--sticker-tilt': `${item.tilt}deg`,
              '--sticker-duration': `${item.duration}ms`,
            }}
          />
        ))}
        <div className="avatar-media relative z-[1] aspect-square w-full bg-[var(--surface)]">
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      </button>

      <div className="flex h-full min-w-0 flex-col px-4 pb-4 pt-4">
        <h3 className="project-card-title clamp-2 break-words font-display text-[20px] font-semibold leading-[22px] text-[var(--ink)] sm:text-[22px] sm:leading-[24px] lg:text-[24px] lg:leading-[26px]">
          {title}
        </h3>
        <p className="clamp-4 mt-2 break-words text-[14px] font-normal leading-[1.55] text-[var(--body-ink)] opacity-70 sm:text-[15px] lg:text-[16px]">
          <HighlightedText text={description} highlights={highlights} />
        </p>

        <div className="mt-auto pt-4">
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="btn-accent font-body inline-flex h-[47px] w-full items-center justify-center gap-2 rounded-[9999px] px-4 py-3 text-[14px] font-semibold leading-none text-white shadow-[0_18px_40px_rgba(120,88,255,.25)] transition hover:brightness-95 active:translate-y-px active:scale-[0.99]"
          onClick={() => track('project_cta', { title, href })}
        >
          <span aria-hidden="true" className="grid h-5 w-5 place-items-center">
            <img src={startIcon} alt="" className="h-5 w-5" />
          </span>
          <span>Запустить</span>
        </a>
      </div>
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
          <h2 className="font-display text-center text-[48px] font-bold leading-[48px] text-[var(--ink)] sm:text-[56px] sm:leading-[56px] lg:text-[80px] lg:leading-[80px]">
            Наши проекты
          </h2>
        </Reveal>

        <div className="grid grid-cols-2 justify-center gap-4 sm:grid-cols-2 lg:grid-cols-[repeat(4,230px)] xl:grid-cols-[repeat(5,230px)]">
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
