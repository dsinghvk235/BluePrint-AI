import { useQuery } from '@tanstack/react-query'

import { api, queryKeys } from '@/shared/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from '@/shared/ui'

interface HealthStatus {
  status: string
  service: string
}

export function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.health,
    queryFn: () => api.get<HealthStatus>('/health'),
    retry: false,
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Workspace</h1>
        <p className="text-muted-foreground mt-2">
          Foundation dashboard — business features arrive in upcoming phases.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>API Status</CardTitle>
            <CardDescription>Backend health check via shared API layer</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && <Skeleton className="h-6 w-32" />}
            {isError && (
              <p className="text-muted-foreground text-sm">
                Backend offline — start with{' '}
                <code className="bg-muted rounded px-1.5 py-0.5 text-xs">docker compose up</code>
              </p>
            )}
            {data && (
              <p className="text-sm">
                <span className="text-success font-medium">{data.status}</span>
                <span className="text-muted-foreground"> · {data.service}</span>
              </p>
            )}
          </CardContent>
        </Card>

        {['Projects', 'Canvas', 'AI Chat'].map((module) => (
          <Card key={module} className="opacity-60">
            <CardHeader>
              <CardTitle>{module}</CardTitle>
              <CardDescription>Coming in a future phase</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
