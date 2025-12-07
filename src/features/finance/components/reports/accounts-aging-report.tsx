import { useState, useMemo } from 'react'
import {
    Download, Filter, ChevronDown, ChevronUp,
    AlertCircle, Clock, FileText, Users, TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
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
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { useAccountsAgingReport, useExportReport } from '@/hooks/useFinance'
import { useClients } from '@/hooks/useCasesAndClients'

export function AccountsAgingReport() {
    const [selectedClient, setSelectedClient] = useState<string>('')
    const [expandedClients, setExpandedClients] = useState<string[]>([])

    const filters = useMemo(() => {
        const f: { clientId?: string } = {}
        if (selectedClient && selectedClient !== 'all') f.clientId = selectedClient
        return f
    }, [selectedClient])

    const { data: reportData, isLoading, isError, error, refetch } = useAccountsAgingReport(filters)
    const { data: clientsData } = useClients()
    const { mutate: exportReport, isPending: isExporting } = useExportReport()

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const toggleClientExpansion = (clientId: string) => {
        setExpandedClients(prev =>
            prev.includes(clientId)
                ? prev.filter(id => id !== clientId)
                : [...prev, clientId]
        )
    }

    const handleExport = (format: 'csv' | 'pdf') => {
        exportReport({ reportType: 'accounts-aging', format, filters })
    }

    // Calculate percentages for the summary
    const summaryPercentages = useMemo(() => {
        if (!reportData?.summary) return { current: 0, early: 0, mid: 0, late: 0 }
        const total = reportData.summary.totalOutstanding || 1
        return {
            current: (reportData.summary.zeroToThirtyDays / total) * 100,
            early: (reportData.summary.thirtyOneToSixtyDays / total) * 100,
            mid: (reportData.summary.sixtyOneToNinetyDays / total) * 100,
            late: (reportData.summary.ninetyPlusDays / total) * 100,
        }
    }, [reportData])

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
        totalOutstanding: 245000,
        zeroToThirtyDays: 85000,
        thirtyOneToSixtyDays: 62000,
        sixtyOneToNinetyDays: 48000,
        ninetyPlusDays: 50000
    }

    const mockClients = reportData?.clients || [
        {
            clientId: '1',
            clientName: 'شركة المستقبل للتجارة',
            zeroToThirtyDays: 35000,
            thirtyOneToSixtyDays: 22000,
            sixtyOneToNinetyDays: 0,
            ninetyPlusDays: 15000,
            total: 72000,
            invoices: [
                { invoiceNumber: 'INV-2025-001', amount: 35000, dueDate: '2025-11-20', daysOverdue: 7 },
                { invoiceNumber: 'INV-2025-002', amount: 22000, dueDate: '2025-10-15', daysOverdue: 42 },
                { invoiceNumber: 'INV-2024-088', amount: 15000, dueDate: '2024-08-10', daysOverdue: 109 },
            ]
        },
        {
            clientId: '2',
            clientName: 'مؤسسة الأمان للمقاولات',
            zeroToThirtyDays: 25000,
            thirtyOneToSixtyDays: 18000,
            sixtyOneToNinetyDays: 28000,
            ninetyPlusDays: 0,
            total: 71000,
            invoices: [
                { invoiceNumber: 'INV-2025-015', amount: 25000, dueDate: '2025-11-10', daysOverdue: 17 },
                { invoiceNumber: 'INV-2025-008', amount: 18000, dueDate: '2025-10-05', daysOverdue: 52 },
                { invoiceNumber: 'INV-2025-003', amount: 28000, dueDate: '2025-09-15', daysOverdue: 72 },
            ]
        },
        {
            clientId: '3',
            clientName: 'شركة التقنية المتقدمة',
            zeroToThirtyDays: 25000,
            thirtyOneToSixtyDays: 22000,
            sixtyOneToNinetyDays: 20000,
            ninetyPlusDays: 35000,
            total: 102000,
            invoices: [
                { invoiceNumber: 'INV-2025-020', amount: 25000, dueDate: '2025-11-25', daysOverdue: 2 },
                { invoiceNumber: 'INV-2025-012', amount: 22000, dueDate: '2025-10-20', daysOverdue: 37 },
                { invoiceNumber: 'INV-2025-005', amount: 20000, dueDate: '2025-09-05', daysOverdue: 82 },
                { invoiceNumber: 'INV-2024-095', amount: 35000, dueDate: '2024-07-20', daysOverdue: 129 },
            ]
        }
    ]

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
                    <div className="bg-gradient-to-br from-amber-600 to-orange-700 rounded-3xl p-8 relative overflow-hidden text-white shadow-xl">
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-[100px]"></div>
                            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-300/20 rounded-full blur-[100px]"></div>
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                                        <Clock className="w-3 h-3 ms-2" aria-hidden="true" />
                                        تقرير الأعمار
                                    </Badge>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
                                    تقرير أعمار الحسابات
                                </h1>
                                <p className="text-amber-100/80">تحليل المستحقات حسب فترات التأخير</p>
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
                                    className="bg-white text-amber-700 hover:bg-amber-50 rounded-xl shadow-lg"
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
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Filter className="w-5 h-5 text-slate-600" aria-hidden="true" />
                            <span className="text-sm font-medium text-slate-600">تصفية حسب:</span>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <span className="text-sm text-slate-500">إجمالي المستحقات</span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{formatCurrency(mockSummary.totalOutstanding)}</div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-emerald-50 border-emerald-100">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-emerald-700">0-30 يوم</span>
                                </div>
                                <div className="text-2xl font-bold text-emerald-700">{formatCurrency(mockSummary.zeroToThirtyDays)}</div>
                                <Progress value={summaryPercentages.current} className="h-1.5 mt-2 bg-emerald-200" indicatorClassName="bg-emerald-500" />
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-yellow-50 border-yellow-100">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-yellow-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-yellow-700">31-60 يوم</span>
                                </div>
                                <div className="text-2xl font-bold text-yellow-700">{formatCurrency(mockSummary.thirtyOneToSixtyDays)}</div>
                                <Progress value={summaryPercentages.early} className="h-1.5 mt-2 bg-yellow-200" indicatorClassName="bg-yellow-500" />
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-orange-50 border-orange-100">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-orange-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-orange-700">61-90 يوم</span>
                                </div>
                                <div className="text-2xl font-bold text-orange-700">{formatCurrency(mockSummary.sixtyOneToNinetyDays)}</div>
                                <Progress value={summaryPercentages.mid} className="h-1.5 mt-2 bg-orange-200" indicatorClassName="bg-orange-500" />
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-red-50 border-red-100">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                                        <AlertCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-red-700">+90 يوم</span>
                                </div>
                                <div className="text-2xl font-bold text-red-700">{formatCurrency(mockSummary.ninetyPlusDays)}</div>
                                <Progress value={summaryPercentages.late} className="h-1.5 mt-2 bg-red-200" indicatorClassName="bg-red-500" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Clients Table */}
                    <Card className="border-0 shadow-sm rounded-3xl">
                        <CardHeader className="border-b border-slate-100 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-bold text-navy flex items-center gap-2">
                                    <Users className="w-5 h-5 text-amber-500" />
                                    تفاصيل العملاء
                                </CardTitle>
                                <Badge variant="outline" className="border-slate-200">
                                    {mockClients.length} عميل
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead className="text-right font-bold text-slate-700 w-8"></TableHead>
                                        <TableHead className="text-right font-bold text-slate-700">العميل</TableHead>
                                        <TableHead className="text-center font-bold text-slate-700">0-30 يوم</TableHead>
                                        <TableHead className="text-center font-bold text-slate-700">31-60 يوم</TableHead>
                                        <TableHead className="text-center font-bold text-slate-700">61-90 يوم</TableHead>
                                        <TableHead className="text-center font-bold text-slate-700">+90 يوم</TableHead>
                                        <TableHead className="text-left font-bold text-slate-700">الإجمالي</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockClients.map((client) => (
                                        <Collapsible key={client.clientId} asChild>
                                            <>
                                                <CollapsibleTrigger asChild>
                                                    <TableRow
                                                        className="cursor-pointer hover:bg-slate-50 transition-colors"
                                                        onClick={() => toggleClientExpansion(client.clientId)}
                                                    >
                                                        <TableCell className="w-8">
                                                            {expandedClients.includes(client.clientId) ? (
                                                                <ChevronUp className="w-4 h-4 text-slate-600" />
                                                            ) : (
                                                                <ChevronDown className="w-4 h-4 text-slate-600" />
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="font-medium text-navy">{client.clientName}</TableCell>
                                                        <TableCell className="text-center">
                                                            <span className={client.zeroToThirtyDays > 0 ? 'text-emerald-600 font-medium' : 'text-slate-600'}>
                                                                {formatCurrency(client.zeroToThirtyDays)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <span className={client.thirtyOneToSixtyDays > 0 ? 'text-yellow-600 font-medium' : 'text-slate-600'}>
                                                                {formatCurrency(client.thirtyOneToSixtyDays)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <span className={client.sixtyOneToNinetyDays > 0 ? 'text-orange-600 font-medium' : 'text-slate-600'}>
                                                                {formatCurrency(client.sixtyOneToNinetyDays)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <span className={client.ninetyPlusDays > 0 ? 'text-red-600 font-medium' : 'text-slate-600'}>
                                                                {formatCurrency(client.ninetyPlusDays)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-left font-bold text-navy">{formatCurrency(client.total)}</TableCell>
                                                    </TableRow>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent asChild>
                                                    <TableRow className="bg-slate-50/50">
                                                        <TableCell colSpan={7} className="p-0">
                                                            <div className="p-4 pe-12">
                                                                <div className="text-sm font-medium text-slate-600 mb-3">الفواتير المستحقة:</div>
                                                                <div className="space-y-2">
                                                                    {client.invoices.map((invoice) => (
                                                                        <div key={invoice.invoiceNumber} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100">
                                                                            <div className="flex items-center gap-3">
                                                                                <FileText className="w-4 h-4 text-slate-600" aria-hidden="true" />
                                                                                <span className="font-medium text-navy">{invoice.invoiceNumber}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-6">
                                                                                <span className="text-sm text-slate-500">
                                                                                    تاريخ الاستحقاق: {new Date(invoice.dueDate).toLocaleDateString('ar-SA')}
                                                                                </span>
                                                                                <Badge className={`
                                                                                    ${invoice.daysOverdue <= 30 ? 'bg-emerald-100 text-emerald-700' :
                                                                                        invoice.daysOverdue <= 60 ? 'bg-yellow-100 text-yellow-700' :
                                                                                        invoice.daysOverdue <= 90 ? 'bg-orange-100 text-orange-700' :
                                                                                        'bg-red-100 text-red-700'}
                                                                                    border-0
                                                                                `}>
                                                                                    متأخر {invoice.daysOverdue} يوم
                                                                                </Badge>
                                                                                <span className="font-bold text-navy">{formatCurrency(invoice.amount)}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                </CollapsibleContent>
                                            </>
                                        </Collapsible>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                </div>
            </Main>
        </>
    )
}
