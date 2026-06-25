export const THEME_STORAGE_KEY = 'blueprintai-theme' as const

export type ThemeMode = 'light' | 'dark' | 'system'

export const MOTION = {
  fast: 'var(--motion-duration-fast)',
  normal: 'var(--motion-duration-normal)',
  slow: 'var(--motion-duration-slow)',
  ease: 'var(--motion-ease-default)',
  easeOut: 'var(--motion-ease-out)',
  easeSpring: 'var(--motion-ease-spring)',
} as const

export const SPACING = {
  0: 'var(--space-0)',
  1: 'var(--space-1)',
  2: 'var(--space-2)',
  3: 'var(--space-3)',
  4: 'var(--space-4)',
  5: 'var(--space-5)',
  6: 'var(--space-6)',
  8: 'var(--space-8)',
  10: 'var(--space-10)',
  12: 'var(--space-12)',
  16: 'var(--space-16)',
  20: 'var(--space-20)',
  24: 'var(--space-24)',
} as const

export const TYPOGRAPHY = {
  fontSans: 'var(--font-family-sans)',
  fontMono: 'var(--font-family-mono)',
  sizes: {
    xs: 'var(--font-size-xs)',
    sm: 'var(--font-size-sm)',
    base: 'var(--font-size-base)',
    lg: 'var(--font-size-lg)',
    xl: 'var(--font-size-xl)',
    '2xl': 'var(--font-size-2xl)',
    '3xl': 'var(--font-size-3xl)',
    '4xl': 'var(--font-size-4xl)',
    '5xl': 'var(--font-size-5xl)',
  },
} as const

export const ELEVATION = {
  1: 'var(--shadow-elevation-1)',
  2: 'var(--shadow-elevation-2)',
  3: 'var(--shadow-elevation-3)',
} as const

export const RADIUS = {
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  full: 'var(--radius-full)',
} as const
