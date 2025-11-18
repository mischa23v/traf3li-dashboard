import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download } from 'lucide-react'

function StatementsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">كشوف الحساب - Financial Statements</h1>
          <p className="text-muted-foreground mt-2">
            View and download your financial statements
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Statement
        </Button>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Statements</CardTitle>
            <CardDescription>Download statements by month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">November 2025</p>
                  <p className="text-sm text-muted-foreground">Revenue: $12,450 | Expenses: $2,340</p>
                </div>
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">October 2025</p>
                  <p className="text-sm text-muted-foreground">Revenue: $15,230 | Expenses: $1,890</p>
                </div>
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/billing/statements')({
  component: StatementsPage,
})
