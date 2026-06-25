import { motion } from 'framer-motion'
import {
  ArrowRight,
  Brain,
  Layers,
  MessageSquare,
  Rocket,
  Sparkles,
  Workflow,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { AnimatedMeshBackground } from '@/features/home/components/AnimatedMeshBackground'
import { BentoCard } from '@/features/home/components/BentoCard'
import {
  FloatingCta,
  ScrollPerspectiveDashboard,
} from '@/features/home/components/HeroDashboardPreview'
import { FloatingNav } from '@/features/home/components/FloatingNav'
import { FloatingShapes3D } from '@/features/home/components/FloatingShapes3D'
import { SectionLabel } from '@/features/home/components/SectionLabel'
import { APP_TAGLINE, EXAMPLE_PROMPTS, ROUTES } from '@/shared/constants'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Input,
} from '@/shared/ui'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5, ease: [0, 0, 0.2, 1] },
} as const

const steps = [
  {
    step: 'Step 1',
    title: 'Describe your system',
    desc: 'Enter a prompt or pick an example — Netflix, Uber, Smart Hospital, and more.',
  },
  {
    step: 'Step 2',
    title: 'Explore the canvas',
    desc: 'Interact with a generated architecture on an infinite, Figma-style workspace.',
  },
  {
    step: 'Step 3',
    title: 'Learn every layer',
    desc: 'Progressive disclosure reveals components, principles, trade-offs, and interview prep.',
  },
  {
    step: 'Step 4',
    title: 'Master system design',
    desc: 'Build intuition for distributed systems through guided, AI-native explanations.',
  },
] as const

const stats = [
  { value: '50', suffix: 'K+', label: 'Architectures explored' },
  { value: '12', suffix: 'K+', label: 'Engineers learning' },
  { value: '200', suffix: '+', label: 'System templates' },
  { value: '98', suffix: '%', label: 'Would recommend' },
] as const

const testimonials = [
  {
    quote:
      'BlueprintAI transformed how I prepare for system design interviews. The progressive learning layers are brilliant.',
    name: 'Sarah Chen',
    role: 'Senior Engineer',
    company: 'Stripe',
  },
  {
    quote:
      'Finally a tool that explains why, not just what. The trade-off analysis alone is worth it.',
    name: 'Marcus Webb',
    role: 'Staff Engineer',
    company: 'Notion',
  },
] as const

const faqItems = [
  {
    q: 'What is BlueprintAI?',
    a: 'BlueprintAI is an AI-native engineering platform that helps you understand how systems work through interactive architecture design and guided learning.',
  },
  {
    q: 'Do I need backend experience?',
    a: 'No. BlueprintAI explains concepts at every level — from high-level architecture down to individual components and engineering principles.',
  },
  {
    q: 'Can I design any system?',
    a: 'Yes. From Netflix-scale streaming platforms to Mars colonies — describe any system and BlueprintAI will help you architect and understand it.',
  },
  {
    q: 'How does progressive disclosure work?',
    a: 'Instead of overwhelming you with everything at once, you explore Architecture → Component → Why → Principle → Trade-offs → Alternatives → Interview Questions, one layer at a time.',
  },
  {
    q: 'Is this for interview prep?',
    a: 'Absolutely. Every architecture includes interview questions, trade-off analysis, and alternative approaches commonly asked in system design interviews.',
  },
] as const

export function HomePage() {
  const [prompt, setPrompt] = useState('')
  const navigate = useNavigate()

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(ROUTES.WORKSPACE, { state: { prompt: prompt || 'Design Netflix' } })
  }

  const handleExampleClick = (example: string) => {
    navigate(ROUTES.WORKSPACE, { state: { prompt: example } })
  }

  return (
    <>
      <AnimatedMeshBackground />
      <FloatingNav />
      <FloatingCta />

      {/* Hero copy */}
      <section className="relative overflow-hidden px-5 pt-24 pb-4 text-center sm:px-8 sm:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0, 0, 0.2, 1] }}
          className="relative z-10 mx-auto max-w-4xl"
        >
          {/* Split badge — Rescale style */}
          <div className="mb-6 inline-flex overflow-hidden rounded-[var(--radius-pill)] border border-[var(--color-border)] shadow-[var(--shadow-nav)]">
            <span className="btn-brand flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold sm:text-xs">
              <Rocket className="h-3.5 w-3.5" aria-hidden />
              12K+
            </span>
            <span className="text-foreground bg-white px-3 py-1.5 text-[11px] font-semibold tracking-wide sm:text-xs">
              ENGINEERS LEARNING
            </span>
          </div>

          <h1 className="hero-headline text-foreground mx-auto max-w-3xl text-balance">
            <span className="inline-flex items-center justify-center gap-2 sm:gap-3">
              <span className="flex flex-col gap-0.5 opacity-30" aria-hidden>
                <span className="bg-foreground h-px w-4 rotate-[50deg] sm:w-5" />
                <span className="bg-foreground h-px w-4 sm:w-5" />
                <span className="bg-foreground h-px w-4 -rotate-[50deg] sm:w-5" />
              </span>
              <span className="italic">Design</span>
            </span>{' '}
            <span className="font-bold not-italic">any system</span>
            <br className="hidden sm:block" />
            <span className="font-normal"> with </span>
            <span className="ai-pill">
              <span className="ai-pill-text text-[0.85em] font-bold sm:text-[0.9em]">Smart AI</span>
            </span>
            <br />
            <span className="font-bold">architecture</span>
          </h1>

          <p className="text-muted-foreground mx-auto mt-6 max-w-md text-sm leading-relaxed sm:mt-8 sm:text-base">
            {APP_TAGLINE}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
            <Button size="lg" asChild>
              <Link to={ROUTES.DASHBOARD}>Start free trial</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#how-it-works">How it works</a>
            </Button>
          </div>

          <p className="section-label mt-10 mb-4 sm:mt-12">Growing partnership around the world</p>
          <div className="flex flex-wrap items-center justify-center gap-6 opacity-45 sm:gap-10">
            {['tillo', 'spitfire', 'avocadoo', 'nanowise'].map((name) => (
              <span
                key={name}
                className="text-muted-foreground text-sm font-semibold tracking-wide lowercase sm:text-base"
              >
                {name}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 3D scroll perspective dashboard */}
      <div className="relative">
        <FloatingShapes3D />
        <ScrollPerspectiveDashboard />
      </div>

      {/* Scroll sections — solid backgrounds below hero */}
      <div className="relative z-10 bg-white">
        {/* AI Spotlight — Rescale "Ask AI anything" */}
        <section className="section-alt border-border border-y">
          <div className="mx-auto max-w-[var(--content-max)] px-5 py-16 sm:px-8 sm:py-20">
            <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
              <SectionLabel className="mb-4">Try it now</SectionLabel>
              <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                Ask AI to design any system
              </h2>
              <p className="text-muted-foreground mt-3 text-sm sm:text-base">
                Describe an architecture and open the workspace instantly.
              </p>

              <form onSubmit={handlePromptSubmit} className="mt-8">
                <div className="bento-card mx-auto flex max-w-2xl flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-2">
                  <div className="flex flex-1 items-center gap-2 px-2">
                    <Sparkles className="text-foreground h-5 w-5 shrink-0" aria-hidden />
                    <Input
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ask AI anything… e.g. Design Netflix"
                      className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                      aria-label="AI prompt input"
                    />
                  </div>
                  <Button type="submit" className="w-full shrink-0 sm:w-auto">
                    Generate
                  </Button>
                </div>
              </form>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                {EXAMPLE_PROMPTS.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => handleExampleClick(example)}
                    className="chip px-4 py-1.5 text-xs font-medium"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* How it works — Rescale 4-step process */}
        <section
          id="how-it-works"
          className="mx-auto max-w-[var(--content-max)] px-5 py-20 sm:px-8"
        >
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <SectionLabel className="mb-4">How it works</SectionLabel>
            <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-4xl">
              Explore our simple, guided process
            </h2>
            <p className="text-muted-foreground mt-4 text-sm sm:text-base">
              Start with a prompt and learn every layer of the system you design.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: index * 0.08 }}
              >
                <BentoCard className="h-full">
                  <p className="section-label mb-4">{item.step}</p>
                  <h3 className="text-foreground text-base font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{item.desc}</p>
                </BentoCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features — Rescale Integration bento grid */}
        <section id="features" className="section-alt border-border border-y">
          <div className="mx-auto max-w-[var(--content-max)] px-5 py-20 sm:px-8">
            <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
              <SectionLabel className="mb-4">Features</SectionLabel>
              <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-4xl">
                Powerful tools, thoughtfully designed
              </h2>
              <p className="text-muted-foreground mt-4 text-sm sm:text-base">
                Everything you need to understand, design, and master system architecture.
              </p>
            </motion.div>

            <div className="mt-14 grid auto-rows-fr gap-4 md:grid-cols-3">
              <motion.div {...fadeUp} className="md:col-span-2">
                <BentoCard className="flex h-full min-h-[280px] flex-col justify-between">
                  <div>
                    <Workflow className="text-foreground mb-4 h-8 w-8" aria-hidden />
                    <h3 className="text-foreground text-xl font-semibold tracking-tight">
                      Interactive architecture canvas
                    </h3>
                    <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
                      Design and edit system diagrams in a Figma-inspired workspace with infinite
                      canvas, smart components, and real-time exploration.
                    </p>
                  </div>
                  <div className="canvas-grid mt-6 h-32 rounded-[var(--radius-lg)] border border-[var(--color-border)]" />
                </BentoCard>
              </motion.div>

              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 }}>
                <BentoCard className="h-full">
                  <Brain className="text-foreground mb-4 h-7 w-7" aria-hidden />
                  <h3 className="text-foreground font-semibold">Learn by building</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    What, Why, Principles, Trade-offs, and Interview Questions at every step.
                  </p>
                </BentoCard>
              </motion.div>

              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
                <BentoCard className="h-full">
                  <Zap className="text-foreground mb-4 h-7 w-7" aria-hidden />
                  <h3 className="text-foreground font-semibold">AI-native workflow</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    Generate complete architectures from a single prompt.
                  </p>
                </BentoCard>
              </motion.div>

              <motion.div
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.15 }}
                className="md:col-span-2"
              >
                <BentoCard className="flex h-full flex-col justify-between sm:flex-row sm:items-center sm:gap-8">
                  <div className="flex-1">
                    <Layers className="text-foreground mb-4 h-7 w-7" aria-hidden />
                    <h3 className="text-foreground text-lg font-semibold">
                      Progressive disclosure
                    </h3>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                      Never overwhelmed. Explore Architecture → Component → Why → Principle →
                      Trade-offs → Alternatives → Interview Questions, one layer at a time.
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 sm:w-48">
                    {['Architecture', 'Component', 'Why', 'Principles'].map((layer, i) => (
                      <div
                        key={layer}
                        className="bg-secondary flex items-center gap-2 rounded-[var(--radius-pill)] px-3 py-1.5 text-xs font-medium"
                      >
                        <span className="bg-foreground text-background flex h-5 w-5 items-center justify-center rounded-full text-[10px]">
                          {i + 1}
                        </span>
                        {layer}
                      </div>
                    ))}
                  </div>
                </BentoCard>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Performance — Rescale stats section */}
        <section id="impact" className="mx-auto max-w-[var(--content-max)] px-5 py-20 sm:px-8">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <SectionLabel className="mb-4">Impact</SectionLabel>
            <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-4xl">
              Built for engineers who think deeply
            </h2>
          </motion.div>

          <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: index * 0.06 }}
              >
                <BentoCard className="text-center">
                  <p className="text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
                    {stat.value}
                    <span className="text-muted-foreground text-2xl">{stat.suffix}</span>
                  </p>
                  <p className="text-muted-foreground mt-2 text-xs sm:text-sm">{stat.label}</p>
                </BentoCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Interactive Preview — Rescale product visual */}
        <section id="preview" className="section-alt border-border border-y">
          <div className="mx-auto max-w-[var(--content-max)] px-5 py-20 sm:px-8">
            <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
              <SectionLabel className="mb-4">Preview</SectionLabel>
              <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-4xl">
                See the workspace in action
              </h2>
              <p className="text-muted-foreground mt-4 text-sm sm:text-base">
                A glimpse of the architecture canvas — interactive, intelligent, intuitive.
              </p>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 }}
              className="bento-card mt-12 overflow-hidden p-0"
            >
              <div className="border-border bg-secondary flex items-center gap-2 border-b px-5 py-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                </div>
                <span className="text-muted-foreground ml-2 text-xs">
                  Netflix Architecture — Workspace
                </span>
              </div>
              <div className="canvas-grid relative min-h-[320px] p-10 sm:min-h-[400px]">
                <div className="border-foreground/20 bg-card absolute top-[18%] left-[32%] rounded-xl border px-4 py-2 text-xs font-medium shadow-sm">
                  CDN Edge
                </div>
                <div className="bg-card border-border absolute top-[42%] left-[18%] rounded-xl border px-4 py-2 text-xs font-medium shadow-sm">
                  API Gateway
                </div>
                <div className="bg-card border-border absolute top-[42%] left-[52%] rounded-xl border px-4 py-2 text-xs font-medium shadow-sm">
                  Streaming Service
                </div>
                <div className="bg-card border-border absolute top-[68%] left-[35%] rounded-xl border px-4 py-2 text-xs font-medium shadow-sm">
                  Content Database
                </div>
                <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
                  <line
                    x1="40%"
                    y1="26%"
                    x2="26%"
                    y2="46%"
                    stroke="#1d1d1f"
                    strokeWidth="1"
                    strokeDasharray="4"
                    opacity="0.3"
                  />
                  <line
                    x1="40%"
                    y1="26%"
                    x2="58%"
                    y2="46%"
                    stroke="#1d1d1f"
                    strokeWidth="1"
                    strokeDasharray="4"
                    opacity="0.3"
                  />
                  <line x1="26%" y1="50%" x2="40%" y2="70%" stroke="#d1d1d6" strokeWidth="1" />
                  <line x1="58%" y1="50%" x2="40%" y2="70%" stroke="#d1d1d6" strokeWidth="1" />
                </svg>
              </div>
              <div className="border-border flex items-center justify-between border-t px-5 py-4">
                <p className="text-muted-foreground text-xs">Open the full workspace to explore</p>
                <Button size="sm" asChild>
                  <Link to={ROUTES.WORKSPACE}>
                    Open workspace
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Client insights — Rescale testimonials */}
        <section className="mx-auto max-w-[var(--content-max)] px-5 py-20 sm:px-8">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <SectionLabel className="mb-4">Client insights</SectionLabel>
            <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-4xl">
              What engineers are saying
            </h2>
          </motion.div>

          <div className="mt-14 grid gap-4 md:grid-cols-2">
            {testimonials.map((item, index) => (
              <motion.div
                key={item.name}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: index * 0.08 }}
              >
                <BentoCard className="h-full">
                  <MessageSquare className="text-muted-foreground mb-4 h-5 w-5" aria-hidden />
                  <p className="text-foreground text-sm leading-relaxed sm:text-base">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <div className="mt-6">
                    <p className="text-foreground text-sm font-semibold">{item.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {item.role} at {item.company}
                    </p>
                  </div>
                </BentoCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ — Rescale FAQ */}
        <section id="faq" className="section-alt border-border border-y">
          <div className="mx-auto max-w-[var(--content-max)] px-5 py-20 sm:px-8">
            <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
              <SectionLabel className="mb-4">FAQ</SectionLabel>
              <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-4xl">
                Questions about BlueprintAI
              </h2>
              <p className="text-muted-foreground mt-4 text-sm">
                Simple answers to make things clear.
              </p>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 }}
              className="mx-auto mt-12 max-w-2xl"
            >
              <Accordion type="single" collapsible className="space-y-2">
                {faqItems.map((item) => (
                  <AccordionItem key={item.q} value={item.q} className="bento-card border-0 px-4">
                    <AccordionTrigger className="text-foreground text-left text-sm font-medium hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* CTA — Rescale "Ready? Let's Talk!" */}
        <section className="mx-auto max-w-[var(--content-max)] px-5 py-24 text-center sm:px-8">
          <motion.div {...fadeUp}>
            <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-5xl">
              Ready? Let&apos;s build.
            </h2>
            <p className="text-muted-foreground mx-auto mt-4 max-w-md text-sm sm:text-base">
              Start with any system. Understand every layer. Master system design.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link to={ROUTES.WORKSPACE}>
                  Open workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to={ROUTES.DASHBOARD}>Go to dashboard</Link>
              </Button>
            </div>
          </motion.div>
        </section>
      </div>
    </>
  )
}
