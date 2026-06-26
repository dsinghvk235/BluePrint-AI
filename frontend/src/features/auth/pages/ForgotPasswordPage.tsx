import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'

import { ROUTES } from '@/shared/constants'
import {
  BrandLogo,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@/shared/ui'
import { toast } from '@/shared/stores/toast-store'

export function ForgotPasswordPage() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    toast({
      title: 'Password reset',
      description: 'Password recovery will be available in a future release.',
      variant: 'info',
    })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="shadow-[var(--shadow-elevation-3)]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3">
            <BrandLogo size="lg" asLink={false} />
          </div>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a reset link when this feature launches.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@company.com" required />
            </div>
            <Button type="submit" className="w-full">
              <Mail className="h-4 w-4" />
              Send reset link
            </Button>
          </form>
          <p className="text-muted-foreground mt-4 text-center text-xs">
            <Link to={ROUTES.AUTH.LOGIN} className="text-[var(--color-brand)] hover:underline">
              Back to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
