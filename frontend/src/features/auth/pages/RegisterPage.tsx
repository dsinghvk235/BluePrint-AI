import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useRegister } from '@/features/auth/hooks/use-auth'
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

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Name is required'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterForm = z.infer<typeof registerSchema>

export function RegisterPage() {
  const registerMutation = useRegister()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = ({ fullName, email, password }: RegisterForm) => {
    registerMutation.mutate({ fullName, email, password })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="shadow-[var(--shadow-elevation-3)]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3">
            <BrandLogo size="lg" asLink={false} />
          </div>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Join {APP_NAME} and start learning</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" placeholder="Jane Engineer" {...register('fullName')} />
              {errors.fullName && <p className="text-error text-xs">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@company.com" {...register('email')} />
              {errors.email && <p className="text-error text-xs">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && <p className="text-error text-xs">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
              {errors.confirmPassword && (
                <p className="text-error text-xs">{errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? <Spinner className="h-4 w-4" /> : 'Create account'}
            </Button>
          </form>
          <p className="text-muted-foreground mt-4 text-center text-xs">
            Already have an account?{' '}
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="font-medium text-[var(--color-brand)] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
