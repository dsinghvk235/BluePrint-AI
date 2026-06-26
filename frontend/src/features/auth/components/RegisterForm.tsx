import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useRegister } from '@/features/auth/hooks/use-auth'
import { APP_NAME } from '@/shared/constants'
import { useAuthDialogStore } from '@/shared/stores/auth-dialog-store'
import { Button, CardDescription, CardTitle, Input, Label, Spinner } from '@/shared/ui'

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

type RegisterFormValues = z.infer<typeof registerSchema>

interface RegisterFormProps {
  idPrefix?: string
}

export function RegisterForm({ idPrefix = 'auth' }: RegisterFormProps) {
  const registerMutation = useRegister()
  const openLogin = useAuthDialogStore((s) => s.openLogin)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  return (
    <>
      <div className="text-center">
        <CardTitle>Create your account</CardTitle>
        <CardDescription className="mt-1.5">Join {APP_NAME} and start learning</CardDescription>
      </div>
      <form
        onSubmit={handleSubmit(({ fullName, email, password }) =>
          registerMutation.mutate({ fullName, email, password }),
        )}
        className="mt-6 space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-fullName`}>Full name</Label>
          <Input
            id={`${idPrefix}-fullName`}
            placeholder="Jane Engineer"
            {...register('fullName')}
          />
          {errors.fullName && <p className="text-error text-xs">{errors.fullName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-email`}>Email</Label>
          <Input
            id={`${idPrefix}-email`}
            type="email"
            placeholder="you@company.com"
            {...register('email')}
          />
          {errors.email && <p className="text-error text-xs">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-password`}>Password</Label>
          <Input id={`${idPrefix}-password`} type="password" {...register('password')} />
          {errors.password && <p className="text-error text-xs">{errors.password.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-confirmPassword`}>Confirm password</Label>
          <Input
            id={`${idPrefix}-confirmPassword`}
            type="password"
            {...register('confirmPassword')}
          />
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
        <button
          type="button"
          className="font-medium text-[var(--color-brand)] hover:underline"
          onClick={openLogin}
        >
          Sign in
        </button>
      </p>
    </>
  )
}
