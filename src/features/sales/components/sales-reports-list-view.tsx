import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  FileBarChart,
  Plus,
  Search,
  Filter,
  Calendar,
  Eye,
  Download,
  Trash2,
  MoreHorizontal,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useReports, useDeleteReport, useGenerateReport } from '@/hooks/useReports'
import { toast } from 'sonner'
import {
  ReportSection,
  ReportStatus,
  ReportCategory,
  reportCategoryLabels,
  reportStatusLabels,
  categoriesBySection,
} from '@/services/reportsService'

const salesCategories = categoriesBySection[ReportSection.SALES]

const categoryIcons: Partial<Record<ReportCategory, React.ElementType>> = {
  [ReportCategory.SALES_OVERVIEW]: TrendingUp,
  [ReportCategory.REVENUE_ANALYSIS]: DollarSign,
  [ReportCategory.SALES_BY_PRODUCT]: ShoppingCart,
  [ReportCategory.SALES_BY_REGION]: Users,
  [ReportCategory.SALES_BY_SALESPERSON]: Users,
  [ReportCategory.SALES_PIPELINE]: TrendingUp,
  [ReportCategory.SALES_FORECAST]: TrendingUp,
  [ReportCategory.CONVERSION_RATES]: TrendingUp,
  [ReportCategory.DEAL_ANALYSIS]: DollarSign,
  [ReportCategory.SALES_TARGETS]: TrendingUp,
}

export function SalesReportsListView() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data, isLoading, refetch } = useReports({
    reportSection: ReportSection.SALES
  })
  const deleteReport = useDeleteReport()
  const generateReport = useGenerateReport()

  const reports = data?.data || []

  const filteredReports = reports.filter((report: any) => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التقرير؟')) {
      try {
        await deleteReport.mutateAsync(id)
        toast.success('تم حذف التقرير بنجاح')
      } catch {
        toast.error('فشل في حذف التقرير')
      }
    }
  }

  const handleGenerate = async (id: string) => {
    try {
      await generateReport.mutateAsync(id)
      toast.success('تم إنشاء التقرير بنجاح')
    } catch {
      toast.error('فشل في إنشاء التقرير')
    }
  }

  const getStatusBadge = (status: ReportStatus) => {
    const variants: Record<ReportStatus, string> = {
      [ReportStatus.DRAFT]: 'bg-slate-100 text-slate-700',
      [ReportStatus.PENDING]: 'bg-yellow-100 text-yellow-700',
      [ReportStatus.GENERATING]: 'bg-blue-100 text-blue-700',
      [ReportStatus.COMPLETED]: 'bg-green-100 text-green-700',
      [ReportStatus.FAILED]: 'bg-red-100 text-red-700',
      [ReportStatus.SCHEDULED]: 'bg-purple-100 text-purple-700',
    }
    return (
      <Badge className={`${variants[status]} border-0`}>
        {reportStatusLabels[status]?.ar || status}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">تقارير المبيعات</h1>
          <p className="text-slate-500 mt-1">إدارة وتحليل تقارير المبيعات والإيرادات</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="rounded-xl"
          >
            <RefreshCw className="h-4 w-4 ms-2" />
            تحديث
          </Button>
          <Button asChild className="bg-emerald-500 hover:bg-emerald-600 rounded-xl">
            <Link to="/dashboard/sales/reports/new">
              <Plus className="h-4 w-4 ms-2" aria-hidden="true" />
              تقرير جديد
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <FileBarChart className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">إجمالي التقارير</p>
              <p className="text-xl font-bold text-navy">{reports.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">تقارير مكتملة</p>
              <p className="text-xl font-bold text-navy">
                {reports.filter((r: any) => r.status === ReportStatus.COMPLETED).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-slate-500">تقارير مجدولة</p>
              <p className="text-xl font-bold text-navy">
                {reports.filter((r: any) => r.status === ReportStatus.SCHEDULED).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
              <RefreshCw className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">قيد الإنشاء</p>
              <p className="text-xl font-bold text-navy">
                {reports.filter((r: any) => r.status === ReportStatus.GENERATING).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] max-w-md">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
              <Input
                placeholder="بحث في التقارير..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pe-10 rounded-xl"
              />
            </div>
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] rounded-xl">
              <Filter className="h-4 w-4 ms-2" aria-hidden="true" />
              <SelectValue placeholder="الفئة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفئات</SelectItem>
              {salesCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {reportCategoryLabels[cat]?.ar || cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] rounded-xl">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              {Object.entries(reportStatusLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label.ar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center">
            <FileBarChart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">لا توجد تقارير</h3>
            <p className="text-slate-500 mb-4">ابدأ بإنشاء تقرير جديد لتحليل بيانات المبيعات</p>
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600 rounded-xl">
              <Link to="/dashboard/sales/reports/new">
                <Plus className="h-4 w-4 ms-2" aria-hidden="true" />
                إنشاء تقرير
              </Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="text-right">التقرير</TableHead>
                <TableHead className="text-right">الفئة</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                <TableHead className="text-right">آخر تحديث</TableHead>
                <TableHead className="text-center w-[100px]">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report: any) => {
                const Icon = categoryIcons[report.category as ReportCategory] || FileBarChart
                return (
                  <TableRow key={report._id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <Link
                            to={`/dashboard/sales/reports/${report._id}`}
                            className="font-medium text-navy hover:text-emerald-600 transition-colors"
                          >
                            {report.name}
                          </Link>
                          {report.description && (
                            <p className="text-sm text-slate-500 line-clamp-1">
                              {report.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">
                        {reportCategoryLabels[report.category as ReportCategory]?.ar || report.category}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="text-slate-600">
                      {new Date(report.createdAt).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {new Date(report.updatedAt).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/dashboard/sales/reports/${report._id}`}>
                              <Eye className="h-4 w-4 ms-2" />
                              عرض التقرير
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleGenerate(report._id)}>
                            <RefreshCw className="h-4 w-4 ms-2" />
                            إعادة إنشاء
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 ms-2" aria-hidden="true" />
                            تحميل PDF
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(report._id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 ms-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
