import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Scale, CheckCircle, Clock, BarChart } from 'lucide-react'

function CasesReportPage() {
  const caseStats = [
    { category: 'Commercial', total: 45, active: 12, closed: 30, pending: 3, successRate: 92 },
    { category: 'Labor', total: 28, active: 8, closed: 18, pending: 2, successRate: 88 },
    { category: 'Real Estate', total: 15, active: 5, closed: 9, pending: 1, successRate: 95 },
    { category: 'Family', total: 12, active: 3, closed: 8, pending: 1, successRate: 90 },
  ]

  const totalCases = caseStats.reduce((sum, cat) => sum + cat.total, 0)
  const totalActive = caseStats.reduce((sum, cat) => sum + cat.active, 0)
  const totalClosed = caseStats.reduce((sum, cat) => sum + cat.closed, 0)
  const avgSuccessRate = (caseStats.reduce((sum, cat) => sum + cat.successRate, 0) / caseStats.length).toFixed(1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">تقرير القضايا - Cases Report</h1>
        <p className="text-muted-foreground mt-2">
          Case statistics and performance analytics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCases}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalActive}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed Cases</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalClosed}</div>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <BarChart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{avgSuccessRate}%</div>
            <p className="text-xs text-muted-foreground">Average</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cases by Category</CardTitle>
          <CardDescription>Breakdown of cases by legal category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {caseStats.map((stat, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">{stat.category}</h3>
                  </div>
                  <Badge>
                    {stat.successRate}% Success Rate
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="text-lg font-bold">{stat.total}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Active</p>
                    <p className="text-lg font-bold text-blue-600">{stat.active}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Closed</p>
                    <p className="text-lg font-bold text-green-600">{stat.closed}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pending</p>
                    <p className="text-lg font-bold text-yellow-600">{stat.pending}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/reports/cases')({
  component: CasesReportPage,
})
