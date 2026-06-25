import { Link } from 'react-router-dom'

import { ROUTES } from '@/shared/constants'
import { Button } from '@/shared/ui'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-muted-foreground text-6xl font-bold">404</h1>
      <p className="text-muted-foreground text-lg">This page does not exist.</p>
      <Button asChild>
        <Link to={ROUTES.HOME}>Back to Home</Link>
      </Button>
    </div>
  )
}
