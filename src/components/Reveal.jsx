import { motion, useReducedMotion } from 'framer-motion'

const easeOut = [0.19, 1, 0.22, 1]

export default function Reveal({
  children,
  className = '',
  delay = 0,
  y = 24,
  amount = 0.18,
  variant = 'rise',
  duration = 0.72,
}) {
  const shouldReduceMotion = useReducedMotion()
  const hidden = {
    rise: { opacity: 0, y, scale: 0.99 },
    fade: { opacity: 0 },
    zoom: { opacity: 0, y: y * 0.45, scale: 0.94 },
    clip: { opacity: 1, clipPath: 'inset(0 0 100% 0)' },
  }[variant]
  const visible = {
    opacity: 1,
    y: 0,
    scale: 1,
    ...(variant === 'clip' ? { clipPath: 'inset(0 0 0% 0)' } : {}),
    transition: { duration, delay, ease: easeOut },
  }

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? false : 'hidden'}
      whileInView={shouldReduceMotion ? undefined : 'visible'}
      viewport={{ once: true, amount }}
      variants={{ hidden: hidden ?? {}, visible }}
    >
      {children}
    </motion.div>
  )
}
