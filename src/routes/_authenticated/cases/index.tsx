import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Scale, Plus, Calendar, Users } from 'lucide-react'

function AllCasesPage() {
  const cases = [
    { id: 1, caseNumber: 'CASE-2025-001', title: 'Commercial Contract Dispute', client: 'Ahmed Al-Rashid', status: 'active', type: 'Commercial', nextHearing: '2025-11-25' },
    { id: 2, caseNumber: 'CASE-2025-002', title: 'Employment Termination', client: 'Sarah Al-Saud', status: 'active', type: 'Labor', nextHearing: '2025-11-30' },
    { id: 3, caseNumber: 'CASE-2025-003', title: 'Property Ownership', client: 'Mohammed Al-Qahtani', status: 'pending', type: 'Real Estate', nextHearing: 'TBD' },
    { id: 4, caseNumber: 'CASE-2024-045', title: 'Partnership Dissolution', client: 'Fatima Al-Otaibi', status: 'closed', type: 'Commercial', nextHearing: null },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">جميع القضايا - All Cases</h1>
          <p className="text-muted-foreground mt-2">
            Manage all your legal cases
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Case
        </Button>
      </div>


      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cases.length}</div>
            <p className="text-xs text-muted-foreground">{cases.filter(c => c.status === 'active').length} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Scale className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{cases.filter(c => c.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Scale className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{cases.filter(c => c.status === 'pending').length}</div>
            <p className="text-xs text-muted-foreground">Waiting</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed</CardTitle>
            <Scale className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{cases.filter(c => c.status === 'closed').length}</div>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {cases.map((caseItem) => (
          <Card key={caseItem.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle>{caseItem.title}</CardTitle>
                    <Badge variant={
                      caseItem.status === 'active' ? 'default' :
                      caseItem.status === 'pending' ? 'secondary' :
                      'outline'
                    }>
                      {caseItem.status}
                    </Badge>
                    <Badge variant="outline">{caseItem.type}</Badge>
                  </div>
                  <CardDescription className="space-y-1">
                    <p className="font-mono text-xs">{caseItem.caseNumber}</p>
                    <p className="flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      Client: {caseItem.client}
                    </p>
                    {caseItem.nextHearing && (
                      <p className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        Next Hearing: {caseItem.nextHearing}
                      </p>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">View Details</Button>
                <Button size="sm" variant="outline">Documents</Button>
                <Button size="sm" variant="outline">Timeline</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/cases/')({
  component: AllCasesPage,
})
