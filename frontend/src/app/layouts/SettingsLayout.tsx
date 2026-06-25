import { Outlet } from 'react-router-dom'

import { PageTransition } from '@/shared/ui'

export function SettingsLayout() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <PageTransition>
        <Outlet />
      </PageTransition>
    </div>
  )
}
