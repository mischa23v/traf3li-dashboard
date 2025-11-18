import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, Inbox, Send, Archive, Trash2 } from 'lucide-react'

function EmailPage() {
  const emails = [
    { id: 1, from: 'client@example.com', subject: 'Case Update Request', time: '2 hours ago', unread: true },
    { id: 2, from: 'court@justice.sa', subject: 'Hearing Schedule Confirmation', time: '5 hours ago', unread: true },
    { id: 3, from: 'colleague@firm.com', subject: 'Document Review', time: '1 day ago', unread: false },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">البريد الإلكتروني - Email</h1>
          <p className="text-muted-foreground mt-2">
            Manage your email communications
          </p>
        </div>
        <Button>
          <Send className="mr-2 h-4 w-4" />
          Compose Email
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inbox</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">2 unread</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archive</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">892</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trash</CardTitle>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">43</div>
            <p className="text-xs text-muted-foreground">To be deleted</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Emails</CardTitle>
          <CardDescription>Your latest email messages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {emails.map((email) => (
              <div key={email.id} className={`flex items-center justify-between p-4 border rounded-lg ${email.unread ? 'bg-muted/50' : ''}`}>
                <div className="flex items-center gap-4">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className={`font-medium ${email.unread ? 'font-bold' : ''}`}>{email.subject}</p>
                    <p className="text-sm text-muted-foreground">{email.from}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {email.unread && <Badge>New</Badge>}
                  <span className="text-sm text-muted-foreground">{email.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/messages/email')({
  component: EmailPage,
})
