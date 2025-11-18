import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Plus, Clock } from 'lucide-react'

function RemindersPage() {
  const reminders = [
    { id: 1, title: 'Court hearing preparation', time: '2025-11-19 09:00', priority: 'high', status: 'pending' },
    { id: 2, title: 'Client meeting follow-up', time: '2025-11-19 14:00', priority: 'medium', status: 'pending' },
    { id: 3, title: 'Document submission deadline', time: '2025-11-20 12:00', priority: 'high', status: 'pending' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">التذكيرات - Reminders</h1>
          <p className="text-muted-foreground mt-2">
            Manage your reminders and notifications
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Reminder
        </Button>
      </div>

      <div className="grid gap-4">
        {reminders.map((reminder) => (
          <Card key={reminder.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-4">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-lg">{reminder.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3" />
                    {reminder.time}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={reminder.priority === 'high' ? 'destructive' : 'default'}>
                  {reminder.priority}
                </Badge>
                <Badge variant="outline">{reminder.status}</Badge>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/tasks/reminders')({
  component: RemindersPage,
})
