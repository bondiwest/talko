import oceniMenyaImg from '../assets/images/oceni_menya.jpg'
import testarsImg from '../assets/images/testars.jpg'
import valentinkaImg from '../assets/images/valentinka.jpg'
import anonimnieVoprosyImg from '../assets/images/anonimnie_voprosy.jpg'
import anonimniyChatImg from '../assets/images/anonimniy_chat.jpg'

export const projects = [
  {
    title: 'Оцени\u00A0меня',
    description:
      'Поможет тебе узнать мнения твоих знакомых о тебе: они отвечают на вопросы анонимно, а ты видишь честные оценки. Узнай свои сильные стороны и то, что можно прокачать.',
    image: oceniMenyaImg,
    href: 'https://t.me/LoveAnons_bot',
    glow: 'rgba(105,102,255,.38)',
    highlights: ['анонимно', 'честные оценки', 'сильные стороны'],
  },
  {
    title: 'Тестарс',
    description:
      'Проходи тесты от друзей и знакомых или создай свой, чтобы узнать насколько тебя хорошо знают! Тесты о любви, дружбе и совместимости.',
    image: testarsImg,
    href: 'https://t.me/Testarsrobot',
    glow: 'rgba(0,210,255,.30)',
    highlights: ['тесты', 'любви', 'дружбе', 'совместимости'],
  },
  {
    title: 'Валентинка',
    description:
      'Делает признания простыми: выбираешь получателя, пишешь послание и отправляешь валентинку так, что он может гадать, но не знает, от кого она.',
    image: valentinkaImg,
    href: 'https://t.me/ValentinesRubot',
    glow: 'rgba(186,24,93,.24)',
    highlights: ['признания', 'послание', 'валентинку'],
  },
  {
    title: 'Анонимные вопросы',
    description:
      'Постишь ссылку и получаешь волну откровенных вопросов, от лёгких и милых до смешных, а люди не боятся спрашивать лишнее.',
    image: anonimnieVoprosyImg,
    href: 'https://t.me/CoAnon_bot',
    glow: 'rgba(105,102,255,.30)',
    highlights: ['откровенных вопросов', 'не боятся'],
  },
  {
    title: 'Анонимный чат',
    description:
      'Пространство для анонимного общения: общайся с рандомными собеседниками, выговаривайся, знакомься и шути, никто не узнает, кто ты.',
    image: anonimniyChatImg,
    href: 'https://t.me/AnonTl_BOT',
    glow: 'rgba(140,120,255,.26)',
    highlights: ['анонимного общения', 'никто не узнает'],
  },
]
