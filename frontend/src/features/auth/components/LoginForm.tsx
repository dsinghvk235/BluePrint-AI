import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useLogin } from '@/features/auth/hooks/use-auth'
import { APP_NAME } from '@/shared/constants'
import { useAuthDialogStore } from '@/shared/stores/auth-dialog-store'
import { Button, CardDescription, CardTitle, Input, Label, Spinner } from '@/shared/ui'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

interface LoginFormProps {
  idPrefix?: string
}

export function LoginForm({ idPrefix = 'auth' }: LoginFormProps) {
  const login = useLogin()
  const openRegister = useAuthDialogStore((s) => s.openRegister)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  return (
    <>
      <div className="text-center">
        <CardTitle>Welcome back</CardTitle>
        <CardDescription className="mt-1.5">Sign in to {APP_NAME}</CardDescription>
      </div>
      <form onSubmit={handleSubmit((data) => login.mutate(data))} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-email`}>Email</Label>
          <Input
            id={`${idPrefix}-email`}
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            {...register('email')}
          />
          {errors.email && <p className="text-error text-xs">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-password`}>Password</Label>
          <Input
            id={`${idPrefix}-password`}
            type="password"
            autoComplete="current-password"
            {...register('password')}
          />
          {errors.password && <p className="text-error text-xs">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={login.isPending}>
          {login.isPending ? <Spinner className="h-4 w-4" /> : 'Sign in'}
        </Button>
      </form>
      <p className="text-muted-foreground mt-4 text-center text-xs">
        No account?{' '}
        <button
          type="button"
          className="font-medium text-[var(--color-brand)] hover:underline"
          onClick={openRegister}
        >
          Create one
        </button>
      </p>
    </>
  )
}
