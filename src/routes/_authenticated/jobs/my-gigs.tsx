import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Briefcase, Plus, Clock, DollarSign } from 'lucide-react'

function MyGigsPage() {
  const gigs = [
    { id: 1, title: 'Contract Review Service', price: '500 SAR', status: 'active', orders: 12 },
    { id: 2, title: 'Legal Consultation - 1 Hour', price: '800 SAR', status: 'active', orders: 28 },
    { id: 3, title: 'Document Drafting', price: '1200 SAR', status: 'paused', orders: 5 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">خدماتي - My Gigs</h1>
          <p className="text-muted-foreground mt-2">
            Manage your legal service offerings
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create New Gig
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Gigs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">1 paused</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32,500 SAR</div>
            <p className="text-xs text-muted-foreground">From gigs</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {gigs.map((gig) => (
          <Card key={gig.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{gig.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {gig.orders} orders completed
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={gig.status === 'active' ? 'default' : 'secondary'}>
                    {gig.status}
                  </Badge>
                  <p className="text-lg font-bold">{gig.price}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Edit</Button>
                <Button size="sm" variant="outline">View Stats</Button>
                <Button size="sm" variant="outline">{gig.status === 'active' ? 'Pause' : 'Activate'}</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/jobs/my-gigs')({
  component: MyGigsPage,
})
