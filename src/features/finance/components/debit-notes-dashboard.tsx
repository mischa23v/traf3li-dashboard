import { useState, useMemo } from 'react'
import {
    Search, Filter, Plus, MoreHorizontal,
    FileText, AlertCircle, CheckCircle, Bell, Loader2,
    Calendar, ChevronLeft, ChevronRight, Download, X, Check, Trash2, XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Link, useNavigate } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Skeleton } from '@/components/ui/skeleton'
import {
    useDebitNotes,
    useApproveDebitNote,
    useApplyDebitNote,
    useCancelDebitNote,
    useDeleteDebitNote,
    useVendors
} from '@/hooks/useAccounting'
import { FinanceSidebar } from './finance-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import { formatSAR } from '@/lib/currency'
import type { DebitNoteStatus } from '@/services/accountingService'

export default function DebitNotesDashboard() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<DebitNoteStatus | 'all'>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [selectedVendor, setSelectedVendor] = useState('')
    const [showFilters, setShowFilters] = useState(false)

    // Fetch vendors for dropdown
    const { data: vendorsData } = useVendors()

    // API Filters
    const filters = useMemo(() => {
        const f: any = { page: currentPage, limit: itemsPerPage }
        if (activeTab !== 'all') {
            f.status = activeTab
        }
        if (startDate) f.startDate = startDate
        if (endDate) f.endDate = endDate
        if (selectedVendor && selectedVendor !== 'all') f.vendorId = selectedVendor
        return f
    }, [activeTab, currentPage, itemsPerPage, startDate, endDate, selectedVendor])

    // Active filter count
    const activeFilterCount = useMemo(() => {
        let count = 0
        if (startDate) count++
        if (endDate) count++
        if (selectedVendor && selectedVendor !== 'all') count++
        return count
    }, [startDate, endDate, selectedVendor])

    // Clear all filters
    const clearFilters = () => {
        setStartDate('')
        setEndDate('')
        setSelectedVendor('')
        setCurrentPage(1)
    }

    // Fetch data
    const { data: debitNotesData, isLoading, isError, error, refetch } = useDebitNotes(filters)
    const { mutate: approveDebitNote } = useApproveDebitNote()
    const { mutate: applyDebitNote } = useApplyDebitNote()
    const { mutate: cancelDebitNote } = useCancelDebitNote()
    const { mutate: deleteDebitNote } = useDeleteDebitNote()

    // Transform API data to component format
    const debitNotes = useMemo(() => {
        if (!debitNotesData?.debitNotes) return []
        return debitNotesData.debitNotes.map((dn: any) => ({
            id: dn.debitNoteNumber || dn._id,
            billNumber: typeof dn.billId === 'object' ? dn.billId.billNumber : 'N/A',
            vendor: typeof dn.vendorId === 'object' ? (dn.vendorId.nameAr || dn.vendorId.name) : 'مورد غير محدد',
            amount: dn.totalAmount || 0,
            date: new Date(dn.debitNoteDate).toLocaleDateString('ar-SA'),
            status: dn.status,
            reasonType: dn.reasonType,
            reason: dn.reason,
            isPartial: dn.isPartial,
            _id: dn._id,
        }))
    }, [debitNotesData])

    // Filter Logic (client-side search)
    const filteredDebitNotes = useMemo(() => {
        return debitNotes.filter(dn => {
            if (searchQuery && !dn.vendor.includes(searchQuery) && !dn.id.includes(searchQuery) && !dn.billNumber.includes(searchQuery)) {
                return false
            }
            return true
        })
    }, [debitNotes, searchQuery])

    // Status badge helper
    const getStatusBadge = (status: string) => {
        const statusMap = {
            draft: { label: 'مسودة', className: 'bg-slate-100 text-slate-600' },
            pending: { label: 'معلق', className: 'bg-amber-100 text-amber-700' },
            approved: { label: 'معتمد', className: 'bg-blue-100 text-blue-700' },
            applied: { label: 'مطبق', className: 'bg-emerald-100 text-emerald-700' },
            cancelled: { label: 'ملغى', className: 'bg-rose-100 text-rose-700' }
        }
        const config = statusMap[status as keyof typeof statusMap] || statusMap.pending
        return <Badge className={`${config.className} border-0 px-2 py-0.5`}>{config.label}</Badge>
    }

    // Reason badge helper
    const getReasonBadge = (reasonType: string) => {
        const reasonMap = {
            goods_returned: { label: 'إرجاع بضاعة', className: 'bg-purple-50 text-purple-600' },
            damaged_goods: { label: 'بضاعة تالفة', className: 'bg-red-50 text-red-600' },
            pricing_error: { label: 'خطأ في السعر', className: 'bg-orange-50 text-orange-600' },
            quality_issue: { label: 'مشكلة في الجودة', className: 'bg-yellow-50 text-yellow-600' },
            overcharge: { label: 'تحصيل زائد', className: 'bg-pink-50 text-pink-600' },
            other: { label: 'أخرى', className: 'bg-slate-50 text-slate-600' }
        }
        const config = reasonMap[reasonType as keyof typeof reasonMap] || reasonMap.other
        return <Badge variant="outline" className={`${config.className} border-0 px-2 py-0.5 text-xs`}>{config.label}</Badge>
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'فواتير الموردين', href: '/dashboard/finance/bills', isActive: false },
        { title: 'إشعارات الخصم', href: '/dashboard/finance/debit-notes', isActive: true },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'المعاملات', href: '/dashboard/finance/transactions', isActive: false },
    ]

    // LOADING STATE
    if (isLoading) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className='ms-auto flex items-center gap-4'>
                        <div className="relative hidden md:block">
                            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                            <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                        </div>
                        <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
                            <Bell className="h-5 w-5" aria-hidden="true" />
                            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                        </Button>
                        <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8">
                    <Skeleton className="h-32 w-full rounded-3xl" />
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 space-y-6">
                            <Skeleton className="h-16 w-full rounded-2xl" />
                            <Skeleton className="h-32 w-full rounded-3xl" />
                            <Skeleton className="h-32 w-full rounded-3xl" />
                        </div>
                        <div className="lg:col-span-4 space-y-6">
                            <Skeleton className="h-32 w-full rounded-2xl" />
                            <Skeleton className="h-32 w-full rounded-2xl" />
                        </div>
                    </div>
                </Main>
            </>
        )
    }

    // ERROR STATE
    if (isError) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className='ms-auto flex items-center gap-4'>
                        <div className="relative hidden md:block">
                            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                            <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                        </div>
                        <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
                            <Bell className="h-5 w-5" aria-hidden="true" />
                        </Button>
                        <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8">
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-red-500" aria-hidden="true" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">فشل تحميل إشعارات الخصم</h3>
                        <p className="text-slate-500 mb-6">{error?.message || 'حدث خطأ أثناء تحميل البيانات'}</p>
                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                            <Loader2 className="ms-2 h-4 w-4" aria-hidden="true" />
                            إعادة المحاولة
                        </Button>
                    </div>
                </Main>
            </>
        )
    }

    // SUCCESS STATE
    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className='ms-auto flex items-center gap-4'>
                    <div className="relative hidden md:block">
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                        <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                <ProductivityHero badge="إشعارات الخصم" title="إشعارات الخصم" type="debit-notes" />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {filteredDebitNotes.length === 0 && !searchQuery && activeTab === 'all' ? (
                            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="h-8 w-8 text-indigo-600" aria-hidden="true" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد إشعارات خصم بعد</h3>
                                <p className="text-slate-500 mb-6">ابدأ بإنشاء أول إشعار خصم من فاتورة مورد</p>
                                <Button onClick={() => navigate({ to: '/dashboard/finance/debit-notes/new' })} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">
                                    <Plus className="ms-2 h-4 w-4" aria-hidden="true" />
                                    إنشاء إشعار خصم
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as any); setCurrentPage(1); }} className="w-full md:w-auto">
                                            <TabsList className="justify-start bg-slate-50 p-1 rounded-xl border border-slate-200 h-auto">
                                                <TabsTrigger value="all" className="rounded-lg px-4 py-2 data-[state=active]:bg-[#022c22] data-[state=active]:text-white">الكل</TabsTrigger>
                                                <TabsTrigger value="pending" className="rounded-lg px-4 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white">معلق</TabsTrigger>
                                                <TabsTrigger value="approved" className="rounded-lg px-4 py-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">معتمد</TabsTrigger>
                                                <TabsTrigger value="applied" className="rounded-lg px-4 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">مطبق</TabsTrigger>
                                            </TabsList>
                                        </Tabs>

                                        <div className="flex items-center gap-3">
                                            <div className="relative w-full max-w-xs">
                                                <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                                                <Input placeholder="بحث..." className="pe-10 rounded-xl border-slate-200 focus:ring-[#022c22] focus:border-[#022c22]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                            </div>
                                            <Button onClick={() => navigate({ to: '/dashboard/finance/debit-notes/new' })} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">
                                                <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                                                إنشاء
                                            </Button>
                                            <Popover open={showFilters} onOpenChange={setShowFilters}>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="rounded-xl border-slate-200 relative">
                                                        <Filter className="w-4 h-4 ms-2" aria-hidden="true" />
                                                        تصفية
                                                        {activeFilterCount > 0 && (
                                                            <Badge className="absolute -top-2 -left-2 h-5 w-5 p-0 flex items-center justify-center bg-indigo-600 text-white text-xs">
                                                                {activeFilterCount}
                                                            </Badge>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-80" align="end">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-bold text-navy">تصفية متقدمة</h4>
                                                            {activeFilterCount > 0 && (
                                                                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500 hover:text-red-500">
                                                                    <X className="w-4 h-4 ms-1" aria-hidden="true" />
                                                                    مسح
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-slate-700">المورد</label>
                                                            <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                                                                <SelectTrigger className="rounded-xl">
                                                                    <SelectValue placeholder="جميع الموردين" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="all">جميع الموردين</SelectItem>
                                                                    {vendorsData?.vendors?.map((vendor: any) => (
                                                                        <SelectItem key={vendor._id} value={vendor._id}>
                                                                            {vendor.nameAr || vendor.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" aria-hidden="true" />
                                                                    من تاريخ
                                                                </label>
                                                                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-xl" />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" aria-hidden="true" />
                                                                    إلى تاريخ
                                                                </label>
                                                                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-xl" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>

                                    {activeFilterCount > 0 && (
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm text-slate-500">الفلاتر النشطة:</span>
                                            {selectedVendor && selectedVendor !== 'all' && (
                                                <Badge variant="outline" className="bg-indigo-50 border-indigo-200 text-indigo-700 gap-1">
                                                    المورد
                                                    <X className="w-3 h-3 cursor-pointer" aria-label="إزالة" onClick={() => setSelectedVendor('')} />
                                                </Badge>
                                            )}
                                            {startDate && (
                                                <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 gap-1">
                                                    من: {new Date(startDate).toLocaleDateString('ar-SA')}
                                                    <X className="w-3 h-3 cursor-pointer" aria-label="إزالة" onClick={() => setStartDate('')} />
                                                </Badge>
                                            )}
                                            {endDate && (
                                                <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 gap-1">
                                                    إلى: {new Date(endDate).toLocaleDateString('ar-SA')}
                                                    <X className="w-3 h-3 cursor-pointer" aria-label="إزالة" onClick={() => setEndDate('')} />
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {filteredDebitNotes.length === 0 ? (
                                        <div className="bg-white p-12 rounded-3xl text-center border border-slate-100">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Search className="h-8 w-8 text-slate-600" aria-hidden="true" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد نتائج</h3>
                                            <p className="text-slate-500 mb-4">لم نجد إشعارات خصم تطابق البحث أو الفلاتر المحددة</p>
                                            <Button variant="outline" onClick={() => { setSearchQuery(''); setActiveTab('all'); }} className="border-slate-200 hover:bg-slate-50">
                                                مسح الفلاتر
                                            </Button>
                                        </div>
                                    ) : filteredDebitNotes.map((dn) => (
                                        <Link key={dn.id} to={`/dashboard/finance/debit-notes/${dn._id}`}>
                                            <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                        <FileText className="w-7 h-7" aria-hidden="true" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                            <h4 className="font-bold text-navy text-lg">{dn.id}</h4>
                                                            {getStatusBadge(dn.status)}
                                                            {getReasonBadge(dn.reasonType)}
                                                            {dn.isPartial && (
                                                                <Badge variant="outline" className="bg-cyan-50 text-cyan-600 border-cyan-200 px-2 py-0.5 text-xs">
                                                                    جزئي
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-slate-500 font-medium text-sm">
                                                            {dn.vendor} • فاتورة {dn.billNumber}
                                                        </p>
                                                        <p className="text-slate-400 text-xs mt-1">{dn.reason}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-8 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                                                    <div className="text-center md:text-end">
                                                        <div className="text-xs text-slate-600 mb-1">التاريخ</div>
                                                        <div className="font-bold text-navy">{dn.date}</div>
                                                    </div>
                                                    <div className="text-center md:text-end">
                                                        <div className="text-xs text-slate-600 mb-1">المبلغ</div>
                                                        <div className="font-bold text-xl text-indigo-600">{formatSAR(dn.amount)}</div>
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                                                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-50" aria-label="خيارات">
                                                                <MoreHorizontal className="w-5 h-5 text-slate-600" aria-hidden="true" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {dn.status === 'pending' && (
                                                                <DropdownMenuItem onClick={(e) => { e.preventDefault(); approveDebitNote({ id: dn._id }); }}>
                                                                    <Check className="w-4 h-4 ms-2" aria-hidden="true" />
                                                                    اعتماد الإشعار
                                                                </DropdownMenuItem>
                                                            )}
                                                            {dn.status === 'approved' && (
                                                                <DropdownMenuItem onClick={(e) => { e.preventDefault(); applyDebitNote(dn._id); }}>
                                                                    <CheckCircle className="w-4 h-4 ms-2" aria-hidden="true" />
                                                                    تطبيق الإشعار
                                                                </DropdownMenuItem>
                                                            )}
                                                            {(dn.status === 'draft' || dn.status === 'pending') && (
                                                                <DropdownMenuItem onClick={(e) => {
                                                                    e.preventDefault();
                                                                    const reason = prompt('سبب الإلغاء:');
                                                                    if (reason) cancelDebitNote({ id: dn._id, reason });
                                                                }} className="text-orange-600">
                                                                    <XCircle className="w-4 h-4 ms-2" aria-hidden="true" />
                                                                    إلغاء الإشعار
                                                                </DropdownMenuItem>
                                                            )}
                                                            {dn.status === 'draft' && (
                                                                <DropdownMenuItem className="text-red-600" onClick={(e) => {
                                                                    e.preventDefault();
                                                                    if (confirm('هل أنت متأكد من حذف إشعار الخصم؟')) {
                                                                        deleteDebitNote(dn._id);
                                                                    }
                                                                }}>
                                                                    <Trash2 className="w-4 h-4 ms-2" aria-hidden="true" />
                                                                    حذف
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {filteredDebitNotes.length > 0 && (
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-500">عرض</span>
                                            <Select value={itemsPerPage.toString()} onValueChange={(v) => { setItemsPerPage(parseInt(v)); setCurrentPage(1); }}>
                                                <SelectTrigger className="w-[70px] h-9 rounded-lg">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="5">5</SelectItem>
                                                    <SelectItem value="10">10</SelectItem>
                                                    <SelectItem value="20">20</SelectItem>
                                                    <SelectItem value="50">50</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <span className="text-sm text-slate-500">من {filteredDebitNotes.length} إشعار</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-lg h-9 w-9" aria-label="الصفحة السابقة">
                                                <ChevronRight className="w-4 h-4" aria-hidden="true" />
                                            </Button>
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: Math.min(5, Math.ceil(filteredDebitNotes.length / itemsPerPage)) }, (_, i) => i + 1).map((page) => (
                                                    <Button key={page} variant={currentPage === page ? "default" : "outline"} size="icon" onClick={() => setCurrentPage(page)} className={`rounded-lg h-9 w-9 ${currentPage === page ? 'bg-indigo-600 text-white' : ''}`}>
                                                        {page}
                                                    </Button>
                                                ))}
                                            </div>
                                            <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= Math.ceil(filteredDebitNotes.length / itemsPerPage)} className="rounded-lg h-9 w-9" aria-label="الصفحة التالية">
                                                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <FinanceSidebar context="debit-notes" />
                </div>
            </Main>
        </>
    )
}
