import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

import { RootLayout } from '@/app/layouts/RootLayout'
import { ROUTES } from '@/shared/constants'

const HomePage = lazy(() =>
  import('@/features/home/pages/HomePage').then((m) => ({ default: m.HomePage })),
)

const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  })),
)

const NotFoundPage = lazy(() =>
  import('@/features/not-found/pages/NotFoundPage').then((m) => ({
    default: m.NotFoundPage,
  })),
)

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      { path: ROUTES.HOME, element: <HomePage /> },
      { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
      { path: ROUTES.NOT_FOUND, element: <NotFoundPage /> },
    ],
  },
]
