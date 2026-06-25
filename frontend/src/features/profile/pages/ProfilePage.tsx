import { motion } from 'framer-motion'
import { Calendar, Mail, MapPin } from 'lucide-react'

import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Separator,
} from '@/shared/ui'
import { toast } from '@/shared/stores/toast-store'

export function ProfilePage() {
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
              <AvatarFallback className="text-lg">EN</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>Engineer</CardTitle>
              <CardDescription>you@blueprintai.dev</CardDescription>
              <Badge variant="accent" className="mt-2">
                Pro Plan
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Display name</Label>
              <Input id="name" defaultValue="Engineer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="you@blueprintai.dev" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Input id="bio" placeholder="Systems thinker, architecture enthusiast" />
          </div>
          <div className="text-muted-foreground flex flex-wrap gap-4 text-xs">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Joined June 2026
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> San Francisco
            </span>
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" /> Public profile
            </span>
          </div>
          <Button
            onClick={() =>
              toast({
                title: 'Profile updated',
                description: 'Changes saved locally.',
                variant: 'success',
              })
            }
          >
            Save changes
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
