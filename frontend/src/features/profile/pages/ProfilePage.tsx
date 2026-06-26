import { motion } from 'framer-motion'
import { Calendar, Mail } from 'lucide-react'

import { useSession } from '@/features/auth/hooks/use-auth'
import {
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Separator,
  Skeleton,
} from '@/shared/ui'

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function ProfilePage() {
  const { data: user, isLoading } = useSession()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-8 h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl px-4 py-8 sm:px-6"
    >
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
      <p className="text-muted-foreground mt-1 text-sm">Manage your personal information.</p>

      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {user ? getInitials(user.fullName) : '??'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user?.fullName}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
              <Badge variant="accent" className="mt-2">
                {user?.role ?? 'USER'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" defaultValue={user?.fullName} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user?.email} readOnly />
            </div>
          </div>
          <div className="text-muted-foreground flex flex-wrap gap-4 text-xs">
            {user?.createdAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user?.emailVerified ? 'Email verified' : 'Email not verified'}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
