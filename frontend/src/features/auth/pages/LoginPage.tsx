import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useLogin } from '@/features/auth/hooks/use-auth'
import { APP_NAME, ROUTES } from '@/shared/constants'
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
  Spinner,
} from '@/shared/ui'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const login = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginForm) => {
    login.mutate(data)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="shadow-[var(--shadow-elevation-3)]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3">
            <BrandLogo size="lg" asLink={false} />
          </div>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to {APP_NAME}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@company.com" {...register('email')} />
              {errors.email && <p className="text-error text-xs">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to={ROUTES.AUTH.FORGOT_PASSWORD}
                  className="text-xs text-[var(--color-brand)] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && <p className="text-error text-xs">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? <Spinner className="h-4 w-4" /> : 'Sign in'}
            </Button>
          </form>
          <p className="text-muted-foreground mt-4 text-center text-xs">
            No account?{' '}
            <Link
              to={ROUTES.AUTH.REGISTER}
              className="font-medium text-[var(--color-brand)] hover:underline"
            >
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
