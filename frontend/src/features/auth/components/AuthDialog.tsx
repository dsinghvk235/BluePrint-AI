import { LoginForm } from '@/features/auth/components/LoginForm'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { BrandLogo, Dialog, DialogContent } from '@/shared/ui'
import { useAuthDialogStore } from '@/shared/stores/auth-dialog-store'

export function AuthDialog() {
  const { isOpen, view, close } = useAuthDialogStore()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent
        overlayClassName="bg-white/25 backdrop-blur-md dark:bg-black/35"
        className="border-border/60 shadow-[var(--shadow-elevation-3)] sm:max-w-md"
      >
        <div className="mx-auto mb-4 flex justify-center">
          <BrandLogo size="lg" asLink={false} />
        </div>
        {view === 'login' ? (
          <LoginForm idPrefix="dialog-login" />
        ) : (
          <RegisterForm idPrefix="dialog-register" />
        )}
      </DialogContent>
    </Dialog>
  )
}
