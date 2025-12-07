import { useState, useMemo } from 'react'
import {
    Download, Filter, Calendar, TrendingUp,
    Users, DollarSign, AlertCircle, CheckCircle,
    BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { useRevenueByClientReport, useExportReport } from '@/hooks/useFinance'
import { useClients } from '@/hooks/useCasesAndClients'

export function RevenueByClientReport() {
    // Get first day of year and today for default dates
    const today = new Date()
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1)

    const [startDate, setStartDate] = useState(firstDayOfYear.toISOString().split('T')[0])
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0])
    const [selectedClient, setSelectedClient] = useState<string>('')

    const filters = useMemo(() => {
        const f: { startDate?: string; endDate?: string; clientId?: string } = {}
        if (startDate) f.startDate = startDate
        if (endDate) f.endDate = endDate
        if (selectedClient && selectedClient !== 'all') f.clientId = selectedClient
        return f
    }, [startDate, endDate, selectedClient])

    const { data: reportData, isLoading, isError, error, refetch } = useRevenueByClientReport(filters)
    const { data: clientsData } = useClients()
    const { mutate: exportReport, isPending: isExporting } = useExportReport()

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const handleExport = (format: 'csv' | 'pdf') => {
        exportReport({ reportType: 'revenue-by-client', format, filters })
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'كشف الحساب', href: '/dashboard/finance/statements', isActive: false },
        { title: 'المعاملات', href: '/dashboard/finance/transactions', isActive: false },
        { title: 'تتبع الوقت', href: '/dashboard/finance/time-tracking', isActive: false },
        { title: 'التقارير', href: '/dashboard/finance/reports', isActive: true },
    ]

    if (isLoading) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8">
                    <Skeleton className="h-32 w-full rounded-3xl" />
                    <div className="grid grid-cols-4 gap-4">
                        <Skeleton className="h-24 rounded-2xl" />
                        <Skeleton className="h-24 rounded-2xl" />
                        <Skeleton className="h-24 rounded-2xl" />
                        <Skeleton className="h-24 rounded-2xl" />
                    </div>
                    <Skeleton className="h-96 w-full rounded-3xl" />
                </Main>
            </>
        )
    }

    if (isError) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8">
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-red-500" aria-hidden="true" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">فشل تحميل التقرير</h3>
                        <p className="text-slate-500 mb-6">{error?.message || 'حدث خطأ أثناء تحميل البيانات'}</p>
                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                            إعادة المحاولة
                        </Button>
                    </div>
                </Main>
            </>
        )
    }

    // Mock data for development - will be replaced by API
    const mockSummary = reportData?.summary || {
        totalRevenue: 1250000,
        totalPaid: 980000,
        totalOutstanding: 270000,
        clientCount: 15
    }

    const mockClients = reportData?.clients || [
        {
            clientId: '1',
            clientName: 'شركة المستقبل للتجارة',
            totalRevenue: 320000,
            paidAmount: 248000,
            outstandingAmount: 72000,
            invoiceCount: 8,
            lastPaymentDate: '2025-11-15'
        },
        {
            clientId: '2',
            clientName: 'مؤسسة الأمان للمقاولات',
            totalRevenue: 285000,
            paidAmount: 214000,
            outstandingAmount: 71000,
            invoiceCount: 6,
            lastPaymentDate: '2025-11-10'
        },
        {
            clientId: '3',
            clientName: 'شركة التقنية المتقدمة',
            totalRevenue: 225000,
            paidAmount: 123000,
            outstandingAmount: 102000,
            invoiceCount: 5,
            lastPaymentDate: '2025-10-28'
        },
        {
            clientId: '4',
            clientName: 'مجموعة الخليج الاستثمارية',
            totalRevenue: 180000,
            paidAmount: 180000,
            outstandingAmount: 0,
            invoiceCount: 4,
            lastPaymentDate: '2025-11-20'
        },
        {
            clientId: '5',
            clientName: 'شركة النور للإعلام',
            totalRevenue: 120000,
            paidAmount: 95000,
            outstandingAmount: 25000,
            invoiceCount: 3,
            lastPaymentDate: '2025-11-05'
        },
        {
            clientId: '6',
            clientName: 'مؤسسة الرياض التجارية',
            totalRevenue: 120000,
            paidAmount: 120000,
            outstandingAmount: 0,
            invoiceCount: 3,
            lastPaymentDate: '2025-11-18'
        }
    ]

    // Sort clients by revenue (highest first)
    const sortedClients = [...mockClients].sort((a, b) => b.totalRevenue - a.totalRevenue)

    // Calculate max revenue for bar chart scaling
    const maxRevenue = Math.max(...mockClients.map(c => c.totalRevenue))

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Hero Header */}
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 relative overflow-hidden text-white shadow-xl">
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-[100px]"></div>
                            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-300/20 rounded-full blur-[100px]"></div>
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                                        <BarChart3 className="w-3 h-3 ms-2" />
                                        تقرير الإيرادات
                                    </Badge>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
                                    إيرادات العملاء
                                </h1>
                                <p className="text-emerald-100/80">تحليل الإيرادات والمدفوعات حسب العميل</p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                                    onClick={() => handleExport('csv')}
                                    disabled={isExporting}
                                >
                                    <Download className="w-4 h-4 ms-2" aria-hidden="true" />
                                    تصدير CSV
                                </Button>
                                <Button
                                    className="bg-white text-emerald-700 hover:bg-emerald-50 rounded-xl shadow-lg"
                                    onClick={() => handleExport('pdf')}
                                    disabled={isExporting}
                                >
                                    <Download className="w-4 h-4 ms-2" aria-hidden="true" />
                                    تصدير PDF
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-slate-600" aria-hidden="true" />
                                <span className="text-sm font-medium text-slate-600">الفترة:</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-600" aria-hidden="true" />
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-[150px] rounded-xl border-slate-200"
                                />
                                <span className="text-slate-600">إلى</span>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-[150px] rounded-xl border-slate-200"
                                />
                            </div>
                            <Select value={selectedClient} onValueChange={setSelectedClient}>
                                <SelectTrigger className="w-[200px] rounded-xl border-slate-200">
                                    <SelectValue placeholder="جميع العملاء" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">جميع العملاء</SelectItem>
                                    {clientsData?.data?.map((client: any) => (
                                        <SelectItem key={client._id} value={client._id}>
                                            {client.fullName || client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="text-sm text-slate-500">
                            آخر تحديث: {reportData?.generatedAt ? new Date(reportData.generatedAt).toLocaleString('ar-SA') : 'الآن'}
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <span className="text-sm text-slate-500">إجمالي الإيرادات</span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{formatCurrency(mockSummary.totalRevenue)}</div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-slate-500">المبالغ المحصلة</span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{formatCurrency(mockSummary.totalPaid)}</div>
                                <div className="mt-2">
                                    <Progress
                                        value={(mockSummary.totalPaid / mockSummary.totalRevenue) * 100}
                                        className="h-1.5 bg-blue-100"
                                        indicatorClassName="bg-blue-500"
                                    />
                                    <span className="text-xs text-slate-500 mt-1">
                                        {((mockSummary.totalPaid / mockSummary.totalRevenue) * 100).toFixed(1)}% من الإجمالي
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <span className="text-sm text-slate-500">المبالغ المستحقة</span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{formatCurrency(mockSummary.totalOutstanding)}</div>
                                <div className="mt-2">
                                    <Progress
                                        value={(mockSummary.totalOutstanding / mockSummary.totalRevenue) * 100}
                                        className="h-1.5 bg-amber-100"
                                        indicatorClassName="bg-amber-500"
                                    />
                                    <span className="text-xs text-slate-500 mt-1">
                                        {((mockSummary.totalOutstanding / mockSummary.totalRevenue) * 100).toFixed(1)}% من الإجمالي
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-purple-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-slate-500">عدد العملاء</span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{mockSummary.clientCount}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Revenue Chart */}
                        <Card className="border-0 shadow-sm rounded-3xl lg:col-span-1">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-emerald-500" />
                                    توزيع الإيرادات
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {sortedClients.slice(0, 6).map((client, index) => (
                                        <div key={client.clientId} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium text-slate-700 truncate max-w-[150px]">
                                                    {index + 1}. {client.clientName}
                                                </span>
                                                <span className="font-bold text-navy">{formatCurrency(client.totalRevenue)}</span>
                                            </div>
                                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                                                    style={{ width: `${(client.totalRevenue / maxRevenue) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Clients Table */}
                        <Card className="border-0 shadow-sm rounded-3xl lg:col-span-2">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Users className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                        تفاصيل العملاء
                                    </CardTitle>
                                    <Badge variant="outline" className="border-slate-200">
                                        {sortedClients.length} عميل
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50">
                                            <TableHead className="text-right font-bold text-slate-700">العميل</TableHead>
                                            <TableHead className="text-center font-bold text-slate-700">الفواتير</TableHead>
                                            <TableHead className="text-center font-bold text-slate-700">الإيرادات</TableHead>
                                            <TableHead className="text-center font-bold text-slate-700">المحصل</TableHead>
                                            <TableHead className="text-center font-bold text-slate-700">المستحق</TableHead>
                                            <TableHead className="text-center font-bold text-slate-700">آخر دفعة</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sortedClients.map((client) => (
                                            <TableRow key={client.clientId} className="hover:bg-slate-50">
                                                <TableCell className="font-medium text-navy">{client.clientName}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline" className="border-slate-200">
                                                        {client.invoiceCount}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center font-bold text-navy">
                                                    {formatCurrency(client.totalRevenue)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="text-emerald-600 font-medium">
                                                        {formatCurrency(client.paidAmount)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className={client.outstandingAmount > 0 ? 'text-amber-600 font-medium' : 'text-slate-600'}>
                                                        {formatCurrency(client.outstandingAmount)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center text-sm text-slate-500">
                                                    {client.lastPaymentDate ? new Date(client.lastPaymentDate).toLocaleDateString('ar-SA') : '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                    </div>

                </div>
            </Main>
        </>
    )
}
