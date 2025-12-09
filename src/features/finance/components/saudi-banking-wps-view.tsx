import { useState, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Search, Bell, AlertCircle, FileText, Plus, MoreHorizontal, ChevronLeft,
    Eye, Download, Trash2, Upload, CheckCircle, XCircle, Clock, Users,
    Building2, Banknote, Calendar, Filter, X, RefreshCw, FileCheck
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useWPSFiles, useSARIEBanks, useDownloadWPS, type WPSFile } from '@/hooks/useSaudiBanking'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'

// Sidebar Component
function WPSSidebar() {
    return (
        <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-navy">إجراءات سريعة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Link to="/dashboard/finance/saudi-banking/wps/new">
                        <Button className="w-full bg-blue-500 hover:bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                            <Plus className="h-4 w-4 ms-2" />
                            إنشاء ملف WPS جديد
                        </Button>
                    </Link>
                    <Button variant="outline" className="w-full rounded-xl">
                        <Upload className="h-4 w-4 ms-2" />
                        استيراد بيانات الموظفين
                    </Button>
                </CardContent>
            </Card>

            {/* WPS Info Widget */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-blue-600" />
                        نظام حماية الأجور
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                        <p className="text-sm text-blue-700">
                            نظام WPS (Wage Protection System) هو نظام إلكتروني لصرف رواتب العاملين في القطاع الخاص
                        </p>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                            <span className="text-slate-600">صرف الرواتب في الوقت المحدد</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                            <span className="text-slate-600">توثيق إلكتروني معتمد</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                            <span className="text-slate-600">امتثال لوزارة الموارد البشرية</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Widget */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-navy">إحصائيات الشهر</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-600">ملفات تم إنشاؤها</span>
                        <span className="font-bold text-navy">3</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-600">إجمالي المبالغ</span>
                        <span className="font-bold text-navy">450,000 ر.س</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-600">عدد الموظفين</span>
                        <span className="font-bold text-navy">45</span>
                    </div>
                </CardContent>
            </Card>

            {/* Help Widget */}
            <Card className="rounded-3xl shadow-sm border-slate-100 bg-gradient-to-br from-blue-500 to-blue-600">
                <CardContent className="p-6 text-white">
                    <FileText className="h-10 w-10 mb-4 text-white/80" />
                    <h3 className="font-bold text-lg mb-2">دليل WPS</h3>
                    <p className="text-sm text-white/80 mb-4">
                        تعرف على كيفية إنشاء وتحميل ملفات WPS بالتنسيق الصحيح
                    </p>
                    <Button variant="secondary" size="sm" className="w-full">
                        عرض الدليل
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

export function SaudiBankingWPSView() {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    // Fetch data
    const { data: filesData, isLoading, isError, error, refetch } = useWPSFiles()
    const downloadMutation = useDownloadWPS()

    // Mock data for demo
    const files: WPSFile[] = useMemo(() => {
        return filesData?.data || [
            {
                _id: '1',
                filename: 'WPS_1234567890_2025-12-01.txt',
                establishment: {
                    molId: '1234567890',
                    name: 'شركة الأمل للتقنية',
                    iban: 'SA0380000000608010167519',
                    bankCode: '80',
                },
                totalRecords: 45,
                totalAmount: 450000,
                paymentDate: '2025-12-01',
                batchReference: 'DEC2025-001',
                status: 'PROCESSED',
                createdAt: new Date().toISOString(),
            },
            {
                _id: '2',
                filename: 'WPS_1234567890_2025-11-01.txt',
                establishment: {
                    molId: '1234567890',
                    name: 'شركة الأمل للتقنية',
                    iban: 'SA0380000000608010167519',
                    bankCode: '80',
                },
                totalRecords: 42,
                totalAmount: 420000,
                paymentDate: '2025-11-01',
                batchReference: 'NOV2025-001',
                status: 'PROCESSED',
                createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
            },
            {
                _id: '3',
                filename: 'WPS_1234567890_2025-10-01.txt',
                establishment: {
                    molId: '1234567890',
                    name: 'شركة الأمل للتقنية',
                    iban: 'SA0380000000608010167519',
                    bankCode: '80',
                },
                totalRecords: 40,
                totalAmount: 400000,
                paymentDate: '2025-10-01',
                batchReference: 'OCT2025-001',
                status: 'PROCESSED',
                createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
            },
        ]
    }, [filesData])

    // Filter files
    const filteredFiles = useMemo(() => {
        return files.filter(file => {
            const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                file.batchReference.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesStatus = statusFilter === 'all' || file.status === statusFilter
            return matchesSearch && matchesStatus
        })
    }, [files, searchQuery, statusFilter])

    // Hero stats
    const heroStats = useMemo(() => {
        const totalFiles = files.length
        const totalAmount = files.reduce((sum, f) => sum + f.totalAmount, 0)
        const totalEmployees = files.reduce((sum, f) => sum + f.totalRecords, 0)
        const processedFiles = files.filter(f => f.status === 'PROCESSED').length

        return [
            { label: 'إجمالي الملفات', value: totalFiles, icon: FileText, status: 'normal' as const },
            { label: 'إجمالي المبالغ', value: `${(totalAmount / 1000).toFixed(0)}K`, icon: Banknote, status: 'normal' as const },
            { label: 'عدد الموظفين', value: totalEmployees, icon: Users, status: 'normal' as const },
            { label: 'ملفات معالجة', value: processedFiles, icon: CheckCircle, status: 'normal' as const },
        ]
    }, [files])

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'الخدمات المصرفية', href: '/dashboard/finance/saudi-banking', isActive: true },
    ]

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PROCESSED':
                return <Badge className="bg-emerald-100 text-emerald-700 border-0">تمت المعالجة</Badge>
            case 'UPLOADED':
                return <Badge className="bg-blue-100 text-blue-700 border-0">تم الرفع</Badge>
            case 'PENDING':
                return <Badge className="bg-yellow-100 text-yellow-700 border-0">معلق</Badge>
            case 'FAILED':
                return <Badge className="bg-red-100 text-red-700 border-0">فشل</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA').format(amount)
    }

    return (
        <>
            {/* Header */}
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>

                <div className='ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0'>
                    <div className="relative hidden md:block min-w-0">
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                        <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm">
                    <Link to="/dashboard/finance/saudi-banking" className="text-slate-500 hover:text-emerald-600">
                        الخدمات المصرفية
                    </Link>
                    <ChevronLeft className="h-4 w-4 text-slate-400" />
                    <span className="text-navy font-medium">نظام حماية الأجور (WPS)</span>
                </div>

                {/* HERO CARD & STATS */}
                <ProductivityHero badge="WPS" title="نظام حماية الأجور" type="finance" stats={heroStats} />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Filters */}
                        <Card className="rounded-2xl shadow-sm border-slate-100">
                            <CardContent className="p-4">
                                <div className="flex flex-wrap gap-3">
                                    <div className="relative flex-1 min-w-[200px]">
                                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <Input
                                            placeholder="بحث بالاسم أو المرجع..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pe-10 rounded-xl"
                                        />
                                    </div>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[150px] rounded-xl">
                                            <SelectValue placeholder="الحالة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">كل الحالات</SelectItem>
                                            <SelectItem value="PROCESSED">تمت المعالجة</SelectItem>
                                            <SelectItem value="UPLOADED">تم الرفع</SelectItem>
                                            <SelectItem value="PENDING">معلق</SelectItem>
                                            <SelectItem value="FAILED">فشل</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Link to="/dashboard/finance/saudi-banking/wps/new">
                                        <Button className="bg-blue-500 hover:bg-blue-600 rounded-xl">
                                            <Plus className="h-4 w-4 ms-2" />
                                            ملف جديد
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Files List */}
                        <Card className="rounded-3xl shadow-sm border-slate-100">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-bold text-navy">ملفات WPS</CardTitle>
                                    <Badge className="bg-slate-100 text-slate-600 border-0">
                                        {filteredFiles.length} ملف
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="bg-slate-50 rounded-2xl p-6">
                                                <Skeleton className="h-6 w-3/4 mb-2" />
                                                <Skeleton className="h-4 w-1/2" />
                                            </div>
                                        ))}
                                    </div>
                                ) : isError ? (
                                    <div className="text-center py-12">
                                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                                        <h3 className="text-lg font-bold text-navy mb-2">حدث خطأ</h3>
                                        <p className="text-slate-500 mb-4">{error?.message}</p>
                                        <Button onClick={() => refetch()} variant="outline">
                                            إعادة المحاولة
                                        </Button>
                                    </div>
                                ) : filteredFiles.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-bold text-navy mb-2">لا توجد ملفات</h3>
                                        <p className="text-slate-500 mb-4">ابدأ بإنشاء ملف WPS جديد</p>
                                        <Link to="/dashboard/finance/saudi-banking/wps/new">
                                            <Button className="bg-blue-500 hover:bg-blue-600">
                                                <Plus className="h-4 w-4 ms-2" />
                                                إنشاء ملف جديد
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredFiles.map((file) => (
                                            <div key={file._id} className="bg-slate-50 rounded-2xl p-6 hover:shadow-md transition-all">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex gap-4">
                                                        <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                                                            <FileText className="h-7 w-7 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-bold text-navy">{file.batchReference}</h4>
                                                                {getStatusBadge(file.status)}
                                                            </div>
                                                            <p className="text-sm text-slate-500">{file.establishment.name}</p>
                                                        </div>
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-5 w-5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>
                                                                <Eye className="h-4 w-4 ms-2" />
                                                                عرض التفاصيل
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => downloadMutation.mutate({
                                                                establishment: file.establishment,
                                                                employees: []
                                                            })}>
                                                                <Download className="h-4 w-4 ms-2" />
                                                                تحميل الملف
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-red-600">
                                                                <Trash2 className="h-4 w-4 ms-2" />
                                                                حذف
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4 mb-4">
                                                    <div className="bg-white rounded-xl p-3 text-center">
                                                        <p className="text-xs text-slate-500 mb-1">عدد الموظفين</p>
                                                        <p className="font-bold text-navy">{file.totalRecords}</p>
                                                    </div>
                                                    <div className="bg-white rounded-xl p-3 text-center">
                                                        <p className="text-xs text-slate-500 mb-1">إجمالي المبلغ</p>
                                                        <p className="font-bold text-navy">{formatCurrency(file.totalAmount)} ر.س</p>
                                                    </div>
                                                    <div className="bg-white rounded-xl p-3 text-center">
                                                        <p className="text-xs text-slate-500 mb-1">تاريخ الدفع</p>
                                                        <p className="font-bold text-navy">{format(new Date(file.paymentDate), 'd MMM', { locale: arSA })}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                                        <Clock className="h-4 w-4" />
                                                        تم الإنشاء: {format(new Date(file.createdAt), 'd MMM yyyy', { locale: arSA })}
                                                    </div>
                                                    <Button variant="outline" size="sm" className="rounded-lg">
                                                        <Download className="h-4 w-4 ms-2" />
                                                        تحميل
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* LEFT COLUMN (Sidebar) */}
                    <WPSSidebar />
                </div>
            </Main>
        </>
    )
}
