import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/shared/constants'
import { Button, ErrorState } from '@/shared/ui'

export function NotFoundPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-background flex min-h-[100dvh] flex-col"
    >
      <div className="flex flex-1 items-center justify-center">
        <ErrorState
          title="Page not found"
          description="The page you're looking for doesn't exist or has been moved."
        >
          <Button asChild className="mt-4">
            <Link to={ROUTES.HOME}>Back to home</Link>
          </Button>
        </ErrorState>
      </div>
    </motion.div>
  )
}
