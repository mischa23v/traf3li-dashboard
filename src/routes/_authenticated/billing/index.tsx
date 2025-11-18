import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DollarSign, FileText, Receipt, CreditCard, TrendingUp } from 'lucide-react'
import { Link } from '@tanstack/react-router'

function BillingDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            لوحة الحسابات - Manage all your financial operations
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">$8,340 total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,845</div>
            <p className="text-xs text-muted-foreground">-4.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$42,386</div>
            <p className="text-xs text-muted-foreground">+24.3% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>الفواتير - Invoices</CardTitle>
            <CardDescription>Manage and track invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/billing/invoices">
              <Button className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                View Invoices
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>المصروفات - Expenses</CardTitle>
            <CardDescription>Track business expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/billing/expenses">
              <Button className="w-full">
                <Receipt className="mr-2 h-4 w-4" />
                View Expenses
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>كشوف الحساب - Statements</CardTitle>
            <CardDescription>Financial statements</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/billing/statements">
              <Button className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                View Statements
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/billing/')({
  component: BillingDashboard,
})
