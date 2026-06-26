import { create } from 'zustand'

export type AuthDialogView = 'login' | 'register'

interface AuthDialogState {
  isOpen: boolean
  view: AuthDialogView
  openLogin: () => void
  openRegister: () => void
  close: () => void
  setView: (view: AuthDialogView) => void
}

export const useAuthDialogStore = create<AuthDialogState>((set) => ({
  isOpen: false,
  view: 'login',
  openLogin: () => set({ isOpen: true, view: 'login' }),
  openRegister: () => set({ isOpen: true, view: 'register' }),
  close: () => set({ isOpen: false }),
  setView: (view) => set({ view }),
}))

export function openAuthLoginDialog(): void {
  useAuthDialogStore.getState().openLogin()
}

export function openAuthRegisterDialog(): void {
  useAuthDialogStore.getState().openRegister()
}

export function closeAuthDialog(): void {
  useAuthDialogStore.getState().close()
}
