import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

import { AppShellLayout } from '@/app/layouts/AppShellLayout'
import { AuthLayout } from '@/app/layouts/LandingLayout'
import { LandingLayout } from '@/app/layouts/LandingLayout'
import { ROUTES } from '@/shared/constants'

const HomePage = lazy(() =>
  import('@/features/home/pages/HomePage').then((m) => ({ default: m.HomePage })),
)

const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  })),
)

const WorkspacePage = lazy(() =>
  import('@/features/canvas/pages/WorkspacePage').then((m) => ({
    default: m.WorkspacePage,
  })),
)

const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)

const RegisterPage = lazy(() =>
  import('@/features/auth/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })),
)

const SettingsPage = lazy(() =>
  import('@/features/settings/pages/SettingsPage').then((m) => ({
    default: m.SettingsPage,
  })),
)

const ProfilePage = lazy(() =>
  import('@/features/profile/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)

const SearchPage = lazy(() =>
  import('@/features/search/pages/SearchPage').then((m) => ({ default: m.SearchPage })),
)

const ProjectsPage = lazy(() =>
  import('@/features/projects/pages/ProjectsPage').then((m) => ({
    default: m.ProjectsPage,
  })),
)

const NotFoundPage = lazy(() =>
  import('@/features/not-found/pages/NotFoundPage').then((m) => ({
    default: m.NotFoundPage,
  })),
)

export const routes: RouteObject[] = [
  {
    element: <LandingLayout />,
    children: [{ path: ROUTES.HOME, element: <HomePage /> }],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: ROUTES.AUTH.LOGIN, element: <LoginPage /> },
      { path: ROUTES.AUTH.REGISTER, element: <RegisterPage /> },
    ],
  },
  {
    element: <AppShellLayout />,
    children: [
      { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
      { path: ROUTES.PROJECTS, element: <ProjectsPage /> },
      { path: ROUTES.SEARCH, element: <SearchPage /> },
      { path: ROUTES.SETTINGS, element: <SettingsPage /> },
      { path: ROUTES.PROFILE, element: <ProfilePage /> },
    ],
  },
  {
    path: ROUTES.WORKSPACE,
    element: <WorkspacePage />,
  },
  {
    path: ROUTES.WORKSPACE_PROJECT,
    element: <WorkspacePage />,
  },
  { path: ROUTES.NOT_FOUND, element: <NotFoundPage /> },
]
