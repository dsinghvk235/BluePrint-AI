# BlueprintAI — UI System Documentation (Phase 1)

Complete reference for the BlueprintAI Version 1 user interface foundation. Future developers should be able to understand the UI architecture from this document alone.

---

## 1. Design System

### Philosophy

BlueprintAI's visual identity is **premium, minimal, and intelligent** — inspired by engineering tools (Cursor, Vercel, Figma) without copying any single product. Every color, spacing value, and motion duration is defined as a **CSS custom property** in `frontend/src/shared/theme/tokens.css`. Components reference tokens only — never hardcoded hex/rgb values.

### Color Palette

| Token | Purpose |
|-------|---------|
| `--color-primary` | Brand actions, links, focus rings |
| `--color-secondary` | Subtle backgrounds, secondary buttons |
| `--color-accent` | Highlights, cyan-teal engineering accent |
| `--color-success` | Positive states, connection status |
| `--color-warning` | Caution states |
| `--color-error` / `--color-destructive` | Errors, destructive actions |
| `--color-info` | Informational badges and states |
| `--color-neutral-50` … `--color-neutral-950` | Full neutral scale |
| `--color-surface` | Page sections, alternate backgrounds |
| `--color-surface-raised` | Elevated cards and panels |
| `--color-canvas` / `--color-canvas-grid` | Architecture workspace background |
| `--color-sidebar` | Navigation panel backgrounds |
| `--color-border` / `--color-border-subtle` / `--color-border-strong` | Border hierarchy |

Each semantic color has companion tokens: `-foreground`, `-muted`, `-hover` where applicable.

### Typography

- **Font family:** Inter (`--font-family-sans`), system fallbacks
- **Mono:** `--font-family-mono` for code and technical labels
- **Scale:** `--font-size-xs` (0.75rem) through `--font-size-6xl` (3.75rem)
- **Weights:** 400, 500, 600, 700
- **Line heights:** tight (1.25), snug (1.375), normal (1.5), relaxed (1.75)

### Spacing

4px base grid: `--space-1` (4px) through `--space-32` (128px), including half-steps (`--space-0-5`, `--space-1-5`, etc.).

### Radius

`--radius-sm` (6px) → `--radius-3xl` (24px), plus `--radius-full` for pills/avatars.

### Shadows

| Token | Use |
|-------|-----|
| `--shadow-elevation-0` | Flat |
| `--shadow-elevation-1` | Cards at rest |
| `--shadow-elevation-2` | Hover cards, controls |
| `--shadow-elevation-3` | Modals, dropdowns |
| `--shadow-elevation-4` | Drawers |
| `--shadow-glow-primary` | Hero CTA focus, brand emphasis |

### Layout Constants

```css
--sidebar-width: 16rem;
--sidebar-width-collapsed: 4rem;
--navbar-height: 3.5rem;
--toolbar-height: 2.75rem;
--statusbar-height: 2rem;
--panel-width: 20rem;
```

### Z-Index Scale

`--z-dropdown` (1000) → `--z-tooltip` (1600). Use these instead of arbitrary z-index values.

---

## 2. Theme System

### Architecture

```
tokens.css          → CSS variables (light + .dark)
globals.css         → Tailwind @theme inline mapping
ThemeProvider       → Applies .dark class to <html>
theme-store.ts      → Zustand: light | dark | system
use-theme.ts        → Hook for components
```

### Light Theme

Clean white surfaces, indigo-violet primary (`oklch(0.52 0.19 265)`), subtle warm neutrals. Designed for daytime engineering work.

### Dark Theme

Deep blue-gray backgrounds (`oklch(0.13 0.015 260)`), brighter primary for contrast. Inspired by Cursor/Vercel dark modes.

### High Contrast

`@media (prefers-contrast: more)` strengthens borders and muted text in `tokens.css`.

### Usage

```tsx
import { useTheme } from '@/shared/hooks'

const { theme, resolvedTheme, setTheme } = useTheme()
setTheme('dark') // 'light' | 'dark' | 'system'
```

Never toggle classes manually — always go through `setTheme`.

---

## 3. Navigation Architecture

### Route Map

| Route | Layout | Purpose |
|-------|--------|---------|
| `/` | `LandingLayout` | Marketing homepage |
| `/auth/login` | `AuthLayout` | Sign in |
| `/auth/register` | `AuthLayout` | Registration |
| `/dashboard` | `AppShellLayout` | User hub |
| `/workspace` | None (fullscreen) | Architecture canvas |
| `/projects` | `AppShellLayout` | Project list |
| `/search` | `AppShellLayout` | Global search |
| `/settings` | `AppShellLayout` | Preferences |
| `/profile` | `AppShellLayout` | User profile |

### Layout Hierarchy

```
AppProviders
└── Router (Suspense + lazy routes)
    ├── LandingLayout     → LandingHeader + Outlet + AppFooter
    ├── AuthLayout        → Centered card on gradient hero
    ├── AppShellLayout    → Navbar + Sidebar + Outlet
    └── WorkspacePage     → Full-screen Figma-style workspace
```

### Global Command Palette

`⌘K` / `Ctrl+K` opens `AppCommandPalette` from any `AppShellLayout` page. Implemented via `useCommandPalette` hook + `cmdk` library.

### Wayfinding Principles

1. **Navbar** — always shows logo, search trigger, theme toggle, user menu
2. **Sidebar** — persistent on desktop (lg+), collapsible with animation
3. **Breadcrumbs** — workspace toolbar shows parent context ("← Dashboard")
4. **Active states** — `aria-current="page"` on sidebar nav items

---

## 4. Component Library

All components live in `frontend/src/shared/ui/`. Import from `@/shared/ui`.

| Component | File | Notes |
|-----------|------|-------|
| Button | `button.tsx` | CVA variants: default, destructive, outline, secondary, ghost, link |
| Input | `input.tsx` | Standard text input with focus ring |
| Textarea | `textarea.tsx` | Multi-line input |
| Card | `card.tsx` | Header, Title, Description, Content, Footer |
| Dialog / Modal | `dialog.tsx`, `modal.tsx` | Radix Dialog primitives |
| Drawer | `drawer.tsx` | Framer Motion slide panel (left/right/bottom) |
| Dropdown | `dropdown.tsx` | Radix Dropdown Menu |
| Tabs | `tabs.tsx` | Radix Tabs |
| Accordion | `accordion.tsx` | Radix Accordion — used in learning panel |
| Tooltip | `tooltip.tsx` | Radix Tooltip — requires TooltipProvider |
| Badge | `badge.tsx` | Status and category labels |
| Avatar | `avatar.tsx` | Radix Avatar with fallback |
| Skeleton | `skeleton.tsx` | Shimmer loading placeholder |
| Spinner | `spinner.tsx` | Animated Loader2 icon |
| EmptyState | `empty-state.tsx` | Zero-data placeholder |
| ErrorState | `error-state.tsx` | Error with optional retry |
| Toast | `toast.tsx` | Framer Motion notifications via Zustand store |
| CommandPalette | `command-palette.tsx` | cmdk + Dialog |
| ContextMenu | `context-menu.tsx` | Radix right-click menu |
| Sidebar | `sidebar.tsx` | Collapsible app navigation |
| Navbar | `navbar.tsx` | Top app bar |
| PageTransition | `page-transition.tsx` | Framer Motion page enter |
| ThemeToggle | `theme-toggle.tsx` | Animated sun/moon switch |
| Separator | `separator.tsx` | Visual divider |
| Label | `label.tsx` | Form labels |

### Toast API

```tsx
import { toast } from '@/shared/stores/toast-store'

toast({
  title: 'Saved',
  description: 'Your changes were saved.',
  variant: 'success', // default | success | warning | error | info
  duration: 4000,
})
```

---

## 5. Layout Architecture

### Landing Page (`HomePage`)

Sections in order:
1. Hero with AI prompt input + example chips
2. Interactive preview (static canvas mockup)
3. Feature highlights (4 cards)
4. Product benefits (progressive disclosure messaging)
5. How it works (3 steps)
6. FAQ (accordion)
7. CTA + Footer

### Dashboard (`DashboardPage`)

Progressive disclosure layout:
- Header with search + "New project"
- Quick action chips
- Recent projects (primary, 2/3 width)
- AI suggestions (sidebar column)
- Templates grid
- Continue learning progress cards

### Workspace (`WorkspacePage`)

Figma-inspired three-panel layout:

```
┌─────────────────────────────────────────────────────────┐
│ Toolbar: Generate | Search | Save | Export | Undo | ... │
├──────────┬──────────────────────────────┬───────────────┤
│ Left     │                              │ Right         │
│ Explorer │     React Flow Canvas        │ Learning      │
│ Component│     (infinite, grid bg)      │ AI Explain    │
│ Templates│                              │ Properties    │
├──────────┴──────────────────────────────┴───────────────┤
│ Status: Zoom | Cursor | Theme | Connection              │
└─────────────────────────────────────────────────────────┘
```

Left panel tabs: Project Explorer, Component Library, Templates.
Right panel tabs: Learn (progressive layers), AI, Properties.

---

## 6. Progressive Disclosure (Learning UX)

The learning panel implements a **7-layer exploration model**:

```
Architecture → Component → Why → Engineering Principle → Trade-offs → Alternatives → Interview Questions
```

Implementation in `LearningPanel.tsx`:
- Numbered steps with expand/collapse
- Only one layer expanded at a time (reduces cognitive load)
- "Continue to next layer →" navigation between steps
- Content placeholders (no AI logic in Phase 1)

Constants defined in `LEARNING_LAYERS` (`shared/constants/index.ts`).

---

## 7. Responsive Strategy

| Breakpoint | Behavior |
|------------|----------|
| Mobile (<640px) | Single column, hidden sidebar, drawer toggles on workspace |
| Tablet (640–1024px) | 2-column grids, collapsed nav labels |
| Desktop (1024px+) | Full sidebar, 3-column dashboard |
| Wide (1280px+) | Full workspace with both side panels |

### Mobile Workspace

- Left panel: toggle via Layers button (top-left)
- Right panel: toggle via BookOpen button (top-right)
- Toolbar: icon-only buttons with tooltips

### Touch Targets

Minimum 44×44px for interactive elements. Buttons use `h-9` (36px) minimum with padding.

---

## 8. Animation Guidelines

Powered by **Framer Motion**. Principles:

| Animation | Duration | Easing |
|-----------|----------|--------|
| Hover/focus color | 150ms | `--motion-ease-default` |
| Page enter | 250ms | ease-out |
| Drawer slide | spring (damping: 30) | natural |
| Theme icon swap | 200ms | rotate + fade |
| Toast enter/exit | 200ms | scale + slide |
| Card hover lift | 250ms | subtle translateY |

### Do

- Animate opacity + transform together
- Use `viewport={{ once: true }}` for scroll reveals on landing page
- Respect `prefers-reduced-motion` (future: add media query guard)

### Don't

- Animate layout properties (width/height) except sidebar collapse
- Chain more than 2 sequential animations
- Auto-animate canvas nodes without user action

---

## 9. Accessibility Decisions

| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | All Radix primitives are keyboard-first |
| Focus visible | Global `:focus-visible` ring via `globals.css` |
| Screen readers | `aria-label`, `aria-current`, `sr-only` labels |
| Color contrast | OKLCH tokens tuned for WCAG AA |
| High contrast | `prefers-contrast: more` overrides |
| Skip links | Future: add skip-to-main on landing |
| Form errors | Associated with inputs, `text-error` color |
| Live regions | Toast container uses `aria-live="polite"` |
| Dialog focus trap | Radix Dialog handles focus management |

---

## 10. UX Principles

1. **Reduce cognitive load** — Show one learning layer at a time
2. **Progressive disclosure** — Dashboard reveals detail on interaction, not on load
3. **Immediate action** — Hero prompt lets users start designing instantly
4. **Consistent wayfinding** — Navbar + sidebar + command palette always available
5. **Premium feel** — Generous whitespace, subtle shadows, purposeful motion
6. **Theme parity** — Every component tested in light and dark
7. **Engineering context** — UI language speaks to engineers, not generic "users"
8. **No dead ends** — Empty states always include a next action

---

## 11. File Structure

```
frontend/src/
├── app/
│   ├── components/       AppFooter, LandingHeader, AppCommandPalette
│   ├── layouts/          LandingLayout, AppShellLayout, AuthLayout
│   ├── providers/        AppProviders (Query, Theme, Tooltip, Toast)
│   └── router/           routes.tsx (lazy-loaded pages)
├── features/
│   ├── home/             Landing page
│   ├── dashboard/        Dashboard
│   ├── canvas/           Workspace + LearningPanel
│   ├── auth/             Login, Register
│   ├── settings/         Settings
│   ├── profile/          Profile
│   ├── search/           Search
│   └── projects/         Projects list
└── shared/
    ├── theme/            tokens.css, globals.css
    ├── ui/               Component library (30+ components)
    ├── hooks/            useTheme, useCommandPalette, useDebounce
    ├── stores/           theme-store, toast-store
    └── constants/        ROUTES, EXAMPLE_PROMPTS, LEARNING_LAYERS
```

---

## 12. Development Commands

```bash
npm run dev          # Start dev server (from repo root)
npm run build        # Production build
npm run lint         # ESLint
npm run format       # Prettier
```

---

## 13. What's NOT in Phase 1

Per scope requirements, the following are **UI shells only** (no business logic):

- AI generation (Generate button is visual only)
- Authentication (forms validate but don't call API)
- Project persistence (mock data in components)
- Real search indexing (client-side filter on static data)
- Backend health check removed from dashboard (replaced with product UI)

These integrate in Phases 2–4 without UI rewrites — the foundation is designed to accept real data via TanStack Query hooks.
