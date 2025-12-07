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
  Clock,
  Users,
  Briefcase,
  DollarSign,
} from 'lucide-react'
import { useTimeEntriesReport, useExportReport } from '@/hooks/useFinance'
import { useCasesAndClients } from '@/hooks/useCasesAndClients'

export function TimeEntriesReport() {
  const [filters, setFilters] = useState({
    clientId: '',
    userId: '',
    startDate: '',
    endDate: '',
    billable: '',
    groupBy: 'client',
  })
  const [showFilters, setShowFilters] = useState(false)

  const { data: report, isLoading } = useTimeEntriesReport(filters)
  const { data: casesAndClients } = useCasesAndClients()
  const exportReport = useExportReport()

  const handleExport = (format: 'csv' | 'pdf') => {
    exportReport.mutate({ type: 'time-entries', format, filters })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}:${mins.toString().padStart(2, '0')}`
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
      totalHours: 245.5,
      billableHours: 198.5,
      nonBillableHours: 47,
      totalRevenue: 198500,
      averageRate: 1000,
    },
    byClient: [
      { clientName: 'شركة النور للتجارة', hours: 85.5, billableHours: 72, amount: 72000, cases: 3 },
      { clientName: 'مؤسسة الأمل', hours: 62, billableHours: 55, amount: 55000, cases: 2 },
      { clientName: 'شركة المستقبل', hours: 48, billableHours: 41.5, amount: 41500, cases: 2 },
      { clientName: 'مجموعة الرياض', hours: 50, billableHours: 30, amount: 30000, cases: 1 },
    ],
    byUser: [
      { userName: 'أحمد محمد', hours: 95, billableHours: 85, amount: 85000 },
      { userName: 'سارة علي', hours: 78, billableHours: 68, amount: 68000 },
      { userName: 'محمد خالد', hours: 72.5, billableHours: 45.5, amount: 45500 },
    ],
    entries: [
      { id: '1', date: '2024-02-28', user: 'أحمد محمد', client: 'شركة النور للتجارة', case: 'قضية تجارية #123', description: 'مراجعة عقود', duration: 180, billable: true, rate: 1000 },
      { id: '2', date: '2024-02-28', user: 'سارة علي', client: 'مؤسسة الأمل', case: 'نزاع عمالي #456', description: 'إعداد مذكرة دفاع', duration: 240, billable: true, rate: 1000 },
      { id: '3', date: '2024-02-27', user: 'محمد خالد', client: 'شركة المستقبل', case: 'استشارة قانونية', description: 'اجتماع مع العميل', duration: 90, billable: true, rate: 1000 },
      { id: '4', date: '2024-02-27', user: 'أحمد محمد', client: 'مجموعة الرياض', case: 'قضية عقارية #789', description: 'بحث قانوني', duration: 150, billable: false, rate: 1000 },
    ],
  }

  const data = report || mockReport

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>المالية</span>
          <ArrowRight className="h-4 w-4 rotate-180" />
          <span>التقارير</span>
          <ArrowRight className="h-4 w-4 rotate-180" />
          <span className="text-foreground">تقرير الوقت</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 ms-2" />
            فلترة
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 ms-2" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
            <FileText className="h-4 w-4 ms-2" />
            PDF
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <div className="space-y-2">
                <Label>قابل للفوترة</Label>
                <Select
                  value={filters.billable}
                  onValueChange={(value) => setFilters({ ...filters, billable: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="الكل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="true">قابل للفوترة</SelectItem>
                    <SelectItem value="false">غير قابل للفوترة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>تجميع حسب</Label>
                <Select
                  value={filters.groupBy}
                  onValueChange={(value) => setFilters({ ...filters, groupBy: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">العميل</SelectItem>
                    <SelectItem value="user">الموظف</SelectItem>
                    <SelectItem value="case">القضية</SelectItem>
                    <SelectItem value="date">التاريخ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الساعات</p>
                <p className="text-2xl font-bold">{data.summary.totalHours}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ساعات قابلة للفوترة</p>
                <p className="text-2xl font-bold text-green-600">{data.summary.billableHours}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Clock className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ساعات غير قابلة للفوترة</p>
                <p className="text-2xl font-bold text-gray-600">{data.summary.nonBillableHours}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الإيرادات المتوقعة</p>
                <p className="text-2xl font-bold">{data.summary.totalRevenue.toLocaleString('ar-SA')} ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">متوسط السعر</p>
                <p className="text-2xl font-bold">{data.summary.averageRate.toLocaleString('ar-SA')} ر.س/ساعة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* By Client */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            حسب العميل
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العميل</TableHead>
                <TableHead>إجمالي الساعات</TableHead>
                <TableHead>ساعات قابلة للفوترة</TableHead>
                <TableHead>المبلغ المتوقع</TableHead>
                <TableHead>عدد القضايا</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.byClient.map((item: {
                clientName: string
                hours: number
                billableHours: number
                amount: number
                cases: number
              }, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.clientName}</TableCell>
                  <TableCell>{item.hours} ساعة</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.billableHours} ساعة
                      <span className="text-xs text-muted-foreground">
                        ({Math.round((item.billableHours / item.hours) * 100)}%)
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{item.amount.toLocaleString('ar-SA')} ر.س</TableCell>
                  <TableCell>{item.cases}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* By User */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            حسب الموظف
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الموظف</TableHead>
                <TableHead>إجمالي الساعات</TableHead>
                <TableHead>ساعات قابلة للفوترة</TableHead>
                <TableHead>نسبة الفوترة</TableHead>
                <TableHead>المبلغ المتوقع</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.byUser.map((item: {
                userName: string
                hours: number
                billableHours: number
                amount: number
              }, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.userName}</TableCell>
                  <TableCell>{item.hours} ساعة</TableCell>
                  <TableCell>{item.billableHours} ساعة</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-green-500 rounded-full"
                          style={{ width: `${(item.billableHours / item.hours) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm">{Math.round((item.billableHours / item.hours) * 100)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.amount.toLocaleString('ar-SA')} ر.س</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detailed Entries */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الإدخالات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>الموظف</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>القضية</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>المدة</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.entries.map((entry: {
                id: string
                date: string
                user: string
                client: string
                case: string
                description: string
                duration: number
                billable: boolean
                rate: number
              }) => (
                <TableRow key={entry.id}>
                  <TableCell>{new Date(entry.date).toLocaleDateString('ar-SA')}</TableCell>
                  <TableCell>{entry.user}</TableCell>
                  <TableCell>{entry.client}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{entry.case}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{entry.description}</TableCell>
                  <TableCell>{formatDuration(entry.duration)}</TableCell>
                  <TableCell>
                    <Badge variant={entry.billable ? 'default' : 'secondary'}>
                      {entry.billable ? 'قابل للفوترة' : 'غير قابل'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
