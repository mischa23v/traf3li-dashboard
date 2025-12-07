import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  Download,
  FileText,
  Filter,
  AlertTriangle,
  Clock,
  Send,
  Eye,
} from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useOutstandingInvoicesReport, useExportReport } from '@/hooks/useFinance'
import { useCasesAndClients } from '@/hooks/useCasesAndClients'

export function OutstandingInvoicesReport() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    clientId: '',
    minDaysOverdue: 0,
    startDate: '',
    endDate: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  const { data: report, isLoading } = useOutstandingInvoicesReport(filters)
  const { data: casesAndClients } = useCasesAndClients()
  const exportReport = useExportReport()

  const handleExport = (format: 'csv' | 'pdf') => {
    exportReport.mutate({ type: 'outstanding-invoices', format, filters })
  }

  const getDaysOverdueColor = (days: number) => {
    if (days <= 0) return 'bg-green-100 text-green-800'
    if (days <= 30) return 'bg-yellow-100 text-yellow-800'
    if (days <= 60) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'overdue':
        return <Badge variant="destructive">متأخرة</Badge>
      case 'due_soon':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">قريبة الاستحقاق</Badge>
      case 'sent':
        return <Badge variant="secondary">مرسلة</Badge>
      default:
        return <Badge variant="outline">مسودة</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Mock data for demonstration
  const mockReport = {
    summary: {
      totalOutstanding: 245000,
      totalOverdue: 125000,
      totalDueSoon: 75000,
      invoiceCount: 15,
      overdueCount: 8,
    },
    invoices: [
      { id: '1', invoiceNumber: 'INV-001', clientName: 'شركة النور للتجارة', amount: 45000, dueDate: '2024-01-15', daysOverdue: 45, status: 'overdue' },
      { id: '2', invoiceNumber: 'INV-002', clientName: 'مؤسسة الأمل', amount: 32000, dueDate: '2024-01-20', daysOverdue: 40, status: 'overdue' },
      { id: '3', invoiceNumber: 'INV-003', clientName: 'شركة المستقبل', amount: 28000, dueDate: '2024-02-01', daysOverdue: 28, status: 'overdue' },
      { id: '4', invoiceNumber: 'INV-004', clientName: 'مجموعة الرياض', amount: 20000, dueDate: '2024-02-10', daysOverdue: 19, status: 'overdue' },
      { id: '5', invoiceNumber: 'INV-005', clientName: 'شركة البناء الحديث', amount: 55000, dueDate: '2024-03-05', daysOverdue: -5, status: 'due_soon' },
      { id: '6', invoiceNumber: 'INV-006', clientName: 'مؤسسة التقنية', amount: 20000, dueDate: '2024-03-10', daysOverdue: -10, status: 'sent' },
    ],
  }

  const data = report || mockReport

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-foreground/70">
          <span>المالية</span>
          <ArrowRight className="h-4 w-4 rotate-180" />
          <span>التقارير</span>
          <ArrowRight className="h-4 w-4 rotate-180" />
          <span className="text-foreground">الفواتير المستحقة</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 ms-2" aria-hidden="true" />
            فلترة
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 ms-2" aria-hidden="true" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
            <FileText className="h-4 w-4 ms-2" aria-hidden="true" />
            PDF
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>العميل</Label>
                <Select
                  value={filters.clientId}
                  onValueChange={(value) => setFilters({ ...filters, clientId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="جميع العملاء" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع العملاء</SelectItem>
                    {casesAndClients?.clients?.map((client: { id: string; name: string }) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الحد الأدنى للتأخير (أيام)</Label>
                <Input
                  type="number"
                  min="0"
                  value={filters.minDaysOverdue}
                  onChange={(e) => setFilters({ ...filters, minDaysOverdue: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>من تاريخ</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>إلى تاريخ</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-slate-600">إجمالي المستحق</p>
                <p className="text-2xl font-bold">{data.summary.totalOutstanding.toLocaleString('ar-SA')} ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">إجمالي المتأخر</p>
                <p className="text-2xl font-bold text-red-600">{data.summary.totalOverdue.toLocaleString('ar-SA')} ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-slate-600">قريبة الاستحقاق</p>
                <p className="text-2xl font-bold text-yellow-600">{data.summary.totalDueSoon.toLocaleString('ar-SA')} ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <FileText className="h-6 w-6 text-gray-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-slate-600">عدد الفواتير</p>
                <p className="text-2xl font-bold">{data.summary.invoiceCount}</p>
                <p className="text-xs text-red-600">{data.summary.overdueCount} متأخرة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>الفواتير المستحقة</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الفاتورة</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>تاريخ الاستحقاق</TableHead>
                <TableHead>أيام التأخير</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.invoices.map((invoice: {
                id: string
                invoiceNumber: string
                clientName: string
                amount: number
                dueDate: string
                daysOverdue: number
                status: string
              }) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.clientName}</TableCell>
                  <TableCell>{invoice.amount.toLocaleString('ar-SA')} ر.س</TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString('ar-SA')}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDaysOverdueColor(invoice.daysOverdue)}`}>
                      {invoice.daysOverdue > 0 ? `${invoice.daysOverdue} يوم` : invoice.daysOverdue === 0 ? 'اليوم' : `${Math.abs(invoice.daysOverdue)} يوم متبقي`}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate({ to: '/dashboard/finance/invoices/$invoiceId', params: { invoiceId: invoice.id } })}
                      >
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Send className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary by Client */}
      <Card>
        <CardHeader>
          <CardTitle>ملخص حسب العميل</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['شركة النور للتجارة', 'مؤسسة الأمل', 'شركة المستقبل'].map((client, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">{client}</p>
                  <p className="text-sm text-slate-600">
                    {index + 1} فاتورة {index < 2 ? 'متأخرة' : 'مستحقة'}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-bold">{((index + 1) * 25000).toLocaleString('ar-SA')} ر.س</p>
                  {index < 2 && (
                    <p className="text-sm text-red-600">متأخر {(index + 1) * 15} يوم</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
