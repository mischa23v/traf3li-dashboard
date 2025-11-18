import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Award, Star, TrendingUp, Users, Clock, Target } from 'lucide-react'

function BadgesPage() {
  const badges = [
    { id: 1, name: 'Top Rated', description: 'Maintained 4.8+ rating for 6 months', icon: Star, earned: true, date: '2025-10-01' },
    { id: 2, name: 'Quick Responder', description: 'Respond to clients within 2 hours', icon: Clock, earned: true, date: '2025-09-15' },
    { id: 3, name: 'Case Master', description: 'Successfully closed 50+ cases', icon: Target, earned: true, date: '2025-08-20' },
    { id: 4, name: 'Client Favorite', description: 'Received 100+ 5-star reviews', icon: Users, earned: false, progress: 75 },
    { id: 5, name: 'Rising Star', description: '10 consecutive 5-star reviews', icon: TrendingUp, earned: false, progress: 60 },
    { id: 6, name: 'Excellence', description: 'Maintain 5.0 rating for 3 months', icon: Award, earned: false, progress: 40 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">شاراتي - My Badges</h1>
        <p className="text-muted-foreground mt-2">
          Achievements and professional milestones
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Earned Badges</CardTitle>
            <CardDescription>{badges.filter(b => b.earned).length} achievements unlocked</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {badges.filter(b => b.earned).map((badge) => {
              const Icon = badge.icon
              return (
                <div key={badge.id} className="flex items-start gap-4 p-4 border rounded-lg bg-muted/50">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{badge.name}</h3>
                      <Badge>Earned</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">Earned on {badge.date}</p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>In Progress</CardTitle>
            <CardDescription>{badges.filter(b => !b.earned).length} badges to unlock</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {badges.filter(b => !b.earned).map((badge) => {
              const Icon = badge.icon
              return (
                <div key={badge.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="p-3 rounded-full bg-muted">
                    <Icon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-muted-foreground">{badge.name}</h3>
                      <Badge variant="outline">{badge.progress}%</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/reviews/badges')({
  component: BadgesPage,
})
