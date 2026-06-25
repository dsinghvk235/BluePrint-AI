import { motion } from 'framer-motion'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui'

export function SettingsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl px-5 py-8 sm:px-8"
    >
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <p className="text-muted-foreground mt-1 text-sm">Manage your workspace preferences.</p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>
            BlueprintAI currently uses a light theme aligned with our Rescale-inspired design
            system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="surface-solid flex items-center gap-3 rounded-[var(--radius-bento)] p-4">
            <div className="h-10 w-10 rounded-full bg-[var(--gradient-brand-cta)] shadow-[var(--shadow-cta)]" />
            <div>
              <p className="text-sm font-medium">Light theme</p>
              <p className="text-muted-foreground text-xs">
                Dark theme coming in a future release.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
