import { motion } from 'framer-motion'

const blobs = [
  {
    className: 'bg-[var(--color-mesh-lavender)]',
    style: { top: '-20%', left: '-15%', width: '60vw', height: '60vw' },
    animate: {
      x: [0, 50, -30, 0],
      y: [0, -40, 30, 0],
      scale: [1, 1.08, 0.95, 1],
      rotate: [0, 15, -10, 0],
    },
    duration: 24,
  },
  {
    className: 'bg-[var(--color-mesh-blue)]',
    style: { top: '0%', right: '-20%', width: '55vw', height: '55vw' },
    animate: {
      x: [0, -45, 35, 0],
      y: [0, 35, -25, 0],
      scale: [1, 0.94, 1.06, 1],
      rotate: [0, -12, 8, 0],
    },
    duration: 28,
  },
  {
    className: 'bg-[var(--color-mesh-cyan)]',
    style: { top: '35%', left: '25%', width: '40vw', height: '40vw' },
    animate: {
      x: [0, 25, -20, 0],
      y: [0, -20, 25, 0],
      scale: [1, 1.05, 1, 1],
      rotate: [0, 20, -15, 0],
    },
    duration: 20,
  },
  {
    className: 'bg-[var(--color-mesh-pink)]',
    style: { bottom: '5%', left: '-5%', width: '50vw', height: '50vw' },
    animate: {
      x: [0, 35, -25, 0],
      y: [0, -15, 20, 0],
      scale: [1, 1.03, 0.97, 1],
      rotate: [0, -8, 12, 0],
    },
    duration: 26,
  },
  {
    className: 'bg-[var(--color-mesh-peach)]',
    style: { bottom: '0%', right: '5%', width: '35vw', height: '35vw' },
    animate: {
      x: [0, -20, 15, 0],
      y: [0, 20, -10, 0],
      scale: [1, 1.04, 1, 1],
      rotate: [0, 10, -5, 0],
    },
    duration: 22,
  },
]

export function AnimatedMeshBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#fafbfc]"
      aria-hidden
    >
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className={`mesh-blob absolute rounded-full opacity-60 blur-[90px] sm:blur-[110px] ${blob.className}`}
          style={blob.style}
          animate={blob.animate}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(139,124,246,0.08),transparent_60%)]" />
    </div>
  )
}
