import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Scale, Calendar, Users } from 'lucide-react'
import { Link } from '@tanstack/react-router'

function ActiveCasesPage() {
  const activeCases = [
    { id: 1, caseNumber: 'CASE-2025-001', title: 'Commercial Contract Dispute', client: 'Ahmed Al-Rashid', type: 'Commercial', nextHearing: '2025-11-25', priority: 'high' },
    { id: 2, caseNumber: 'CASE-2025-002', title: 'Employment Termination', client: 'Sarah Al-Saud', type: 'Labor', nextHearing: '2025-11-30', priority: 'medium' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">القضايا الحالية - Active Cases</h1>
          <p className="text-muted-foreground mt-2">
            Cases currently in progress
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="default" asChild>
          <Link to="/cases/active">Active Cases</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/cases">All Cases</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCases.length}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Scale className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {activeCases.filter(c => c.priority === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground">Urgent cases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Hearings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCases.length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {activeCases.map((caseItem) => (
          <Card key={caseItem.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle>{caseItem.title}</CardTitle>
                    <Badge>Active</Badge>
                    <Badge variant="outline">{caseItem.type}</Badge>
                    <Badge variant={caseItem.priority === 'high' ? 'destructive' : 'secondary'}>
                      {caseItem.priority}
                    </Badge>
                  </div>
                  <CardDescription className="space-y-1">
                    <p className="font-mono text-xs">{caseItem.caseNumber}</p>
                    <p className="flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      Client: {caseItem.client}
                    </p>
                    <p className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      Next Hearing: {caseItem.nextHearing}
                    </p>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button size="sm">View Details</Button>
                <Button size="sm" variant="outline">Documents</Button>
                <Button size="sm" variant="outline">Timeline</Button>
                <Button size="sm" variant="outline">Add Note</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/cases/active')({
  component: ActiveCasesPage,
})
