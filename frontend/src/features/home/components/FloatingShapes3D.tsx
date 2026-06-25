import { motion } from 'framer-motion'

const shapes = [
  {
    type: 'x' as const,
    className: 'text-[var(--color-mesh-blue)]',
    style: { top: '52%', left: '2%', width: 120, height: 120 },
    animate: { y: [0, -18, 0], rotate: [0, 8, 0], scale: [1, 1.05, 1] },
    duration: 8,
    delay: 0,
  },
  {
    type: 'x' as const,
    className: 'text-[var(--color-mesh-lavender)]',
    style: { top: '58%', right: '3%', width: 100, height: 100 },
    animate: { y: [0, 15, 0], rotate: [0, -10, 0], scale: [1, 1.08, 1] },
    duration: 9,
    delay: 1,
  },
  {
    type: 'crystal' as const,
    className: 'from-[var(--color-mesh-blue)] to-[var(--color-mesh-lavender)]',
    style: { top: '48%', right: '12%', width: 64, height: 64 },
    animate: { y: [0, -12, 0], rotate: [45, 55, 45], scale: [1, 1.1, 1] },
    duration: 7,
    delay: 0.5,
  },
  {
    type: 'crystal' as const,
    className: 'from-[var(--color-mesh-pink)] to-[var(--color-mesh-peach)]',
    style: { bottom: '8%', left: '8%', width: 48, height: 48 },
    animate: { y: [0, 10, 0], rotate: [30, 40, 30], scale: [1, 1.06, 1] },
    duration: 6,
    delay: 1.5,
  },
]

function ShapeX({ className, size }: { className: string; size: number }) {
  return (
    <div className={`relative opacity-50 ${className}`} style={{ width: size, height: size }}>
      <div className="absolute top-1/2 left-1/2 h-2.5 w-full -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-current" />
      <div className="absolute top-1/2 left-1/2 h-2.5 w-full -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-current" />
    </div>
  )
}

function ShapeCrystal({ className, size }: { className: string; size: number }) {
  return (
    <div
      className={`bg-gradient-to-br opacity-50 blur-[0.5px] ${className}`}
      style={{
        width: size,
        height: size,
        clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
      }}
    />
  )
}

export function FloatingShapes3D() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden" aria-hidden>
      {shapes.map((shape, i) => (
        <motion.div
          key={i}
          className="absolute hidden sm:block"
          style={shape.style}
          animate={shape.animate}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: shape.delay,
          }}
        >
          {shape.type === 'x' ? (
            <ShapeX className={shape.className} size={shape.style.width as number} />
          ) : (
            <ShapeCrystal className={shape.className} size={shape.style.width as number} />
          )}
        </motion.div>
      ))}
    </div>
  )
}
