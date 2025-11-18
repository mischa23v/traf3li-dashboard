import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Mail, Phone } from 'lucide-react'
import { Link } from '@tanstack/react-router'

function CurrentClientsPage() {
  const currentClients = [
    { id: 1, name: 'Ahmed Al-Rashid', email: 'ahmed@example.com', phone: '+966 50 123 4567', cases: 3, lastContact: '2 days ago' },
    { id: 2, name: 'Sarah Al-Saud', email: 'sarah@example.com', phone: '+966 55 987 6543', cases: 1, lastContact: '1 week ago' },
    { id: 3, name: 'Mohammed Al-Qahtani', email: 'mohammed@example.com', phone: '+966 50 555 1234', cases: 2, lastContact: '3 days ago' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">العملاء الحاليون - Current Clients</h1>
          <p className="text-muted-foreground mt-2">
            Clients with active cases
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="default" asChild>
          <Link to="/clients/current">Current Clients</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/clients">All Clients</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentClients.length}</div>
            <p className="text-xs text-muted-foreground">With active cases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentClients.reduce((sum, c) => sum + c.cases, 0)}</div>
            <p className="text-xs text-muted-foreground">Active cases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Cases/Client</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(currentClients.reduce((sum, c) => sum + c.cases, 0) / currentClients.length).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Per client</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {currentClients.map((client) => (
          <Card key={client.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{client.name}</CardTitle>
                  <CardDescription className="mt-2 space-y-1">
                    <p className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      {client.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      {client.phone}
                    </p>
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge>Active</Badge>
                  <p className="text-sm text-muted-foreground">{client.cases} active cases</p>
                  <p className="text-xs text-muted-foreground">Last contact: {client.lastContact}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">View Profile</Button>
                <Button size="sm" variant="outline">View Cases</Button>
                <Button size="sm">Contact</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/clients/current')({
  component: CurrentClientsPage,
})
