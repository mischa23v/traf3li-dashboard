import { useState, useMemo } from 'react'
import {
    Search, Filter, Plus, MoreHorizontal,
    FileText, AlertCircle, CheckCircle, Bell, Loader2,
    Calendar, ChevronLeft, ChevronRight, Download, X, Check, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Link } from '@tanstack/react-router'
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
    useBills,
    useCreateBill,
    useApproveBill,
    usePayBill,
    usePostBillToGL,
    useDeleteBill,
    useVendors
} from '@/hooks/useAccounting'
import { FinanceSidebar } from './finance-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import { formatSAR } from '@/lib/currency'
import type { BillStatus, CreateBillData } from '@/services/accountingService'

interface BillLine {
    description: string
    quantity: number
    unitCost: number
}

export default function BillsDashboard() {
    const [activeTab, setActiveTab] = useState<BillStatus | 'all'>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [selectedVendor, setSelectedVendor] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [showNewBillDialog, setShowNewBillDialog] = useState(false)

    // New Bill Form State
    const [newBillVendorId, setNewBillVendorId] = useState('')
    const [newBillDate, setNewBillDate] = useState(new Date().toISOString().split('T')[0])
    const [newBillDueDate, setNewBillDueDate] = useState('')
    const [newBillLines, setNewBillLines] = useState<BillLine[]>([
        { description: '', quantity: 1, unitCost: 0 }
    ])
    const [newBillVatRate, setNewBillVatRate] = useState(15)
    const [newBillNotes, setNewBillNotes] = useState('')

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
    const { data: billsData, isLoading, isError, error, refetch } = useBills(filters)
    const { mutate: createBill, isPending: isCreating } = useCreateBill()
    const { mutate: approveBill } = useApproveBill()
    const { mutate: payBill } = usePayBill()
    const { mutate: postToGL } = usePostBillToGL()
    const { mutate: deleteBill } = useDeleteBill()

    // Transform API data to component format
    const bills = useMemo(() => {
        if (!billsData) return []
        return billsData.map((bill: any) => ({
            id: bill.billNumber || bill._id,
            vendor: typeof bill.vendorId === 'object' ? (bill.vendorId.nameAr || bill.vendorId.name) : 'مورد غير محدد',
            amount: bill.totalAmount || 0,
            balance: bill.balanceDue || 0,
            date: new Date(bill.billDate).toLocaleDateString('ar-SA'),
            status: bill.status,
            dueDate: new Date(bill.dueDate).toLocaleDateString('ar-SA'),
            isPostedToGL: bill.isPostedToGL,
            _id: bill._id,
        }))
    }, [billsData])

    // Filter Logic (client-side search)
    const filteredBills = useMemo(() => {
        return bills.filter(bill => {
            if (searchQuery && !bill.vendor.includes(searchQuery) && !bill.id.includes(searchQuery)) {
                return false
            }
            return true
        })
    }, [bills, searchQuery])

    // Calculate line item total
    const calculateLineTotal = (line: BillLine) => {
        return line.quantity * line.unitCost
    }

    // Calculate new bill totals
    const newBillTotals = useMemo(() => {
        const subtotal = newBillLines.reduce((sum, line) => sum + calculateLineTotal(line), 0)
        const vatAmount = subtotal * (newBillVatRate / 100)
        const total = subtotal + vatAmount
        return { subtotal, vatAmount, total }
    }, [newBillLines, newBillVatRate])

    // Add line item
    const addLineItem = () => {
        setNewBillLines([...newBillLines, { description: '', quantity: 1, unitCost: 0 }])
    }

    // Remove line item
    const removeLineItem = (index: number) => {
        if (newBillLines.length > 1) {
            setNewBillLines(newBillLines.filter((_, i) => i !== index))
        }
    }

    // Update line item
    const updateLineItem = (index: number, field: keyof BillLine, value: any) => {
        const updated = [...newBillLines]
        updated[index] = { ...updated[index], [field]: value }
        setNewBillLines(updated)
    }

    // Handle create bill
    const handleCreateBill = () => {
        if (!newBillVendorId || !newBillDueDate || newBillLines.some(l => !l.description)) {
            return
        }

        const data: CreateBillData = {
            vendorId: newBillVendorId,
            billDate: newBillDate,
            dueDate: newBillDueDate,
            lines: newBillLines.map(l => ({
                description: l.description,
                quantity: l.quantity,
                unitCost: l.unitCost
            })),
            vatRate: newBillVatRate,
            notes: newBillNotes
        }

        createBill(data, {
            onSuccess: () => {
                setShowNewBillDialog(false)
                resetNewBillForm()
            }
        })
    }

    // Reset new bill form
    const resetNewBillForm = () => {
        setNewBillVendorId('')
        setNewBillDate(new Date().toISOString().split('T')[0])
        setNewBillDueDate('')
        setNewBillLines([{ description: '', quantity: 1, unitCost: 0 }])
        setNewBillVatRate(15)
        setNewBillNotes('')
    }

    // Status badge helper
    const getStatusBadge = (status: string) => {
        const statusMap = {
            draft: { label: 'مسودة', className: 'bg-slate-100 text-slate-600' },
            pending: { label: 'معلقة', className: 'bg-amber-100 text-amber-700' },
            approved: { label: 'معتمدة', className: 'bg-blue-100 text-blue-700' },
            paid: { label: 'مدفوعة', className: 'bg-emerald-100 text-emerald-700' },
            partial: { label: 'مدفوعة جزئياً', className: 'bg-cyan-100 text-cyan-700' },
            overdue: { label: 'متأخرة', className: 'bg-rose-100 text-rose-700' },
            cancelled: { label: 'ملغاة', className: 'bg-slate-100 text-slate-700' }
        }
        const config = statusMap[status as keyof typeof statusMap] || statusMap.pending
        return <Badge className={`${config.className} border-0 px-2 py-0.5`}>{config.label}</Badge>
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'فواتير الموردين', href: '/dashboard/finance/bills', isActive: true },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'كشف الحساب', href: '/dashboard/finance/statements', isActive: false },
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
                    <div className='ms-auto flex items-center space-x-4'>
                        <div className="relative hidden md:block">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pr-9 pl-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                        </div>
                        <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
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
                            <Skeleton className="h-32 w-full rounded-3xl" />
                        </div>
                        <div className="lg:col-span-4 space-y-6">
                            <Skeleton className="h-32 w-full rounded-2xl" />
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
                    <div className='ms-auto flex items-center space-x-4'>
                        <div className="relative hidden md:block">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pr-9 pl-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                        </div>
                        <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
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
                            <AlertCircle className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">فشل تحميل فواتير الموردين</h3>
                        <p className="text-slate-500 mb-6">{error?.message || 'حدث خطأ أثناء تحميل البيانات'}</p>
                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                            <Loader2 className="ml-2 h-4 w-4" />
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

                {/* Dynamic Island - Centered */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>

                <div className='ms-auto flex items-center space-x-4'>
                    <div className="relative hidden md:block">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pr-9 pl-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>
                {/* Bottom Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* HERO CARD & STATS */}
                <ProductivityHero badge="فواتير الموردين" title="فواتير الموردين" type="bills" />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Bills List */}
                    <div className="lg:col-span-2 space-y-6">
                        {filteredBills.length === 0 && !searchQuery && activeTab === 'all' ? (
                            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="h-8 w-8 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد فواتير موردين بعد</h3>
                                <p className="text-slate-500 mb-6">ابدأ بإنشاء أول فاتورة مورد</p>
                                <Button onClick={() => setShowNewBillDialog(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-8">
                                    <Plus className="ml-2 h-4 w-4" />
                                    إنشاء فاتورة مورد
                                </Button>
                            </div>
                        ) : (
                            <>
                                {/* Filters Bar */}
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as any); setCurrentPage(1); }} className="w-full md:w-auto">
                                            <TabsList className="justify-start bg-slate-50 p-1 rounded-xl border border-slate-200 h-auto">
                                                <TabsTrigger
                                                    value="all"
                                                    className="rounded-lg px-4 py-2 data-[state=active]:bg-[#022c22] data-[state=active]:text-white transition-all duration-300"
                                                >
                                                    الكل
                                                </TabsTrigger>
                                                <TabsTrigger
                                                    value="pending"
                                                    className="rounded-lg px-4 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all duration-300"
                                                >
                                                    معلقة
                                                </TabsTrigger>
                                                <TabsTrigger
                                                    value="approved"
                                                    className="rounded-lg px-4 py-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300"
                                                >
                                                    معتمدة
                                                </TabsTrigger>
                                                <TabsTrigger
                                                    value="paid"
                                                    className="rounded-lg px-4 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all duration-300"
                                                >
                                                    مدفوعة
                                                </TabsTrigger>
                                                <TabsTrigger
                                                    value="overdue"
                                                    className="rounded-lg px-4 py-2 data-[state=active]:bg-red-500 data-[state=active]:text-white transition-all duration-300"
                                                >
                                                    متأخرة
                                                </TabsTrigger>
                                            </TabsList>
                                        </Tabs>

                                        <div className="flex items-center gap-3">
                                            <div className="relative w-full max-w-xs">
                                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    placeholder="بحث في الفواتير..."
                                                    className="pr-10 rounded-xl border-slate-200 focus:ring-[#022c22] focus:border-[#022c22]"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                            </div>
                                            <Button onClick={() => setShowNewBillDialog(true)} className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white">
                                                <Plus className="w-4 h-4 ml-2" />
                                                إنشاء
                                            </Button>
                                            <Popover open={showFilters} onOpenChange={setShowFilters}>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="rounded-xl border-slate-200 relative">
                                                        <Filter className="w-4 h-4 ml-2" />
                                                        تصفية
                                                        {activeFilterCount > 0 && (
                                                            <Badge className="absolute -top-2 -left-2 h-5 w-5 p-0 flex items-center justify-center bg-purple-600 text-white text-xs">
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
                                                                    <X className="w-4 h-4 ml-1" />
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
                                                                    {vendorsData?.map((vendor: any) => (
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
                                                                    <Calendar className="w-3 h-3" />
                                                                    من تاريخ
                                                                </label>
                                                                <Input
                                                                    type="date"
                                                                    value={startDate}
                                                                    onChange={(e) => setStartDate(e.target.value)}
                                                                    className="rounded-xl"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    إلى تاريخ
                                                                </label>
                                                                <Input
                                                                    type="date"
                                                                    value={endDate}
                                                                    onChange={(e) => setEndDate(e.target.value)}
                                                                    className="rounded-xl"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>

                                    {/* Active Filters Display */}
                                    {activeFilterCount > 0 && (
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm text-slate-500">الفلاتر النشطة:</span>
                                            {selectedVendor && selectedVendor !== 'all' && (
                                                <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700 gap-1">
                                                    المورد
                                                    <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedVendor('')} />
                                                </Badge>
                                            )}
                                            {startDate && (
                                                <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 gap-1">
                                                    من: {new Date(startDate).toLocaleDateString('ar-SA')}
                                                    <X className="w-3 h-3 cursor-pointer" onClick={() => setStartDate('')} />
                                                </Badge>
                                            )}
                                            {endDate && (
                                                <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 gap-1">
                                                    إلى: {new Date(endDate).toLocaleDateString('ar-SA')}
                                                    <X className="w-3 h-3 cursor-pointer" onClick={() => setEndDate('')} />
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* List Items */}
                                <div className="space-y-4">
                                    {filteredBills.length === 0 ? (
                                        <div className="bg-white p-12 rounded-3xl text-center border border-slate-100">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Search className="h-8 w-8 text-slate-400" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد نتائج</h3>
                                            <p className="text-slate-500 mb-4">لم نجد فواتير تطابق البحث أو الفلاتر المحددة</p>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setSearchQuery('')
                                                    setActiveTab('all')
                                                }}
                                                className="border-slate-200 hover:bg-slate-50"
                                            >
                                                مسح الفلاتر
                                            </Button>
                                        </div>
                                    ) : filteredBills.map((bill) => (
                                        <div key={bill.id} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                                                    <FileText className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-navy text-lg">{bill.id}</h4>
                                                        {getStatusBadge(bill.status)}
                                                        {bill.isPostedToGL && (
                                                            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 px-2 py-0.5">
                                                                <CheckCircle className="w-3 h-3 ml-1" />
                                                                مرحل للقيود
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-500 font-medium">{bill.vendor}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                                                <div className="text-center md:text-right">
                                                    <div className="text-xs text-slate-400 mb-1">تاريخ الاستحقاق</div>
                                                    <div className="font-bold text-navy">{bill.dueDate}</div>
                                                </div>
                                                <div className="text-center md:text-right">
                                                    <div className="text-xs text-slate-400 mb-1">المبلغ</div>
                                                    <div className="font-bold text-xl text-navy">{formatSAR(bill.amount)}</div>
                                                </div>
                                                {bill.balance > 0 && (
                                                    <div className="text-center md:text-right">
                                                        <div className="text-xs text-slate-400 mb-1">الرصيد المتبقي</div>
                                                        <div className="font-bold text-lg text-amber-600">{formatSAR(bill.balance)}</div>
                                                    </div>
                                                )}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-50">
                                                            <MoreHorizontal className="w-5 h-5 text-slate-400" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {bill.status === 'pending' && (
                                                            <DropdownMenuItem onClick={() => approveBill(bill._id)}>
                                                                <Check className="w-4 h-4 ml-2" />
                                                                اعتماد الفاتورة
                                                            </DropdownMenuItem>
                                                        )}
                                                        {(bill.status === 'approved' || bill.status === 'partial') && (
                                                            <DropdownMenuItem onClick={() => {
                                                                const amount = parseFloat(prompt('أدخل المبلغ المدفوع:', bill.balance.toString()) || '0')
                                                                if (amount > 0) {
                                                                    payBill({ id: bill._id, data: { amount, paymentMethod: 'bank_transfer' } })
                                                                }
                                                            }}>
                                                                تسجيل دفعة
                                                            </DropdownMenuItem>
                                                        )}
                                                        {(bill.status === 'approved' || bill.status === 'paid') && !bill.isPostedToGL && (
                                                            <DropdownMenuItem onClick={() => postToGL(bill._id)}>
                                                                ترحيل للقيود
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem className="text-red-600" onClick={() => {
                                                            if (confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
                                                                deleteBill(bill._id)
                                                            }
                                                        }}>
                                                            <Trash2 className="w-4 h-4 ml-2" />
                                                            حذف
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {filteredBills.length > 0 && (
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
                                            <span className="text-sm text-slate-500">من {filteredBills.length} فاتورة</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                                className="rounded-lg h-9 w-9"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: Math.min(5, Math.ceil(filteredBills.length / itemsPerPage)) }, (_, i) => i + 1).map((page) => (
                                                    <Button
                                                        key={page}
                                                        variant={currentPage === page ? "default" : "outline"}
                                                        size="icon"
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`rounded-lg h-9 w-9 ${currentPage === page ? 'bg-purple-600 text-white' : ''}`}
                                                    >
                                                        {page}
                                                    </Button>
                                                ))}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => setCurrentPage(p => p + 1)}
                                                disabled={currentPage >= Math.ceil(filteredBills.length / itemsPerPage)}
                                                className="rounded-lg h-9 w-9"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* RIGHT COLUMN (Sidebar) */}
                    <FinanceSidebar context="invoices" />
                </div>
            </Main>

            {/* New Bill Dialog */}
            <Dialog open={showNewBillDialog} onOpenChange={setShowNewBillDialog}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-navy">إنشاء فاتورة مورد جديدة</DialogTitle>
                        <DialogDescription>
                            أدخل تفاصيل الفاتورة من المورد
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Vendor Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="vendor" className="text-sm font-medium text-slate-700">
                                المورد <span className="text-red-500">*</span>
                            </Label>
                            <Select value={newBillVendorId} onValueChange={setNewBillVendorId}>
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue placeholder="اختر المورد" />
                                </SelectTrigger>
                                <SelectContent>
                                    {vendorsData?.map((vendor: any) => (
                                        <SelectItem key={vendor._id} value={vendor._id}>
                                            {vendor.nameAr || vendor.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="billDate" className="text-sm font-medium text-slate-700">
                                    تاريخ الفاتورة
                                </Label>
                                <Input
                                    id="billDate"
                                    type="date"
                                    value={newBillDate}
                                    onChange={(e) => setNewBillDate(e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dueDate" className="text-sm font-medium text-slate-700">
                                    تاريخ الاستحقاق <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={newBillDueDate}
                                    onChange={(e) => setNewBillDueDate(e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium text-slate-700">البنود</Label>
                            {newBillLines.map((line, index) => (
                                <div key={index} className="flex gap-3 items-end">
                                    <div className="flex-1 space-y-2">
                                        <Input
                                            placeholder="الوصف"
                                            value={line.description}
                                            onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="w-24 space-y-2">
                                        <Input
                                            type="number"
                                            placeholder="الكمية"
                                            value={line.quantity}
                                            onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                            className="rounded-xl"
                                            min="0"
                                        />
                                    </div>
                                    <div className="w-32 space-y-2">
                                        <Input
                                            type="number"
                                            placeholder="سعر الوحدة"
                                            value={line.unitCost}
                                            onChange={(e) => updateLineItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                                            className="rounded-xl"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="w-32 text-right font-bold text-navy">
                                        {formatSAR(calculateLineTotal(line))}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeLineItem(index)}
                                        disabled={newBillLines.length === 1}
                                        className="rounded-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                onClick={addLineItem}
                                className="w-full rounded-xl border-dashed"
                            >
                                <Plus className="w-4 h-4 ml-2" />
                                إضافة بند
                            </Button>
                        </div>

                        {/* VAT Rate */}
                        <div className="space-y-2">
                            <Label htmlFor="vatRate" className="text-sm font-medium text-slate-700">
                                نسبة الضريبة (%)
                            </Label>
                            <Input
                                id="vatRate"
                                type="number"
                                value={newBillVatRate}
                                onChange={(e) => setNewBillVatRate(parseFloat(e.target.value) || 0)}
                                className="rounded-xl"
                                min="0"
                                max="100"
                                step="0.5"
                            />
                        </div>

                        {/* Totals Summary */}
                        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">المجموع الفرعي:</span>
                                <span className="font-bold">{formatSAR(newBillTotals.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">الضريبة ({newBillVatRate}%):</span>
                                <span className="font-bold">{formatSAR(newBillTotals.vatAmount)}</span>
                            </div>
                            <div className="flex justify-between text-lg border-t pt-2">
                                <span className="font-bold text-navy">الإجمالي:</span>
                                <span className="font-bold text-navy">{formatSAR(newBillTotals.total)}</span>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-sm font-medium text-slate-700">
                                ملاحظات
                            </Label>
                            <Textarea
                                id="notes"
                                placeholder="ملاحظات إضافية..."
                                value={newBillNotes}
                                onChange={(e) => setNewBillNotes(e.target.value)}
                                className="rounded-xl min-h-[100px]"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowNewBillDialog(false)
                                resetNewBillForm()
                            }}
                            className="rounded-xl"
                        >
                            إلغاء
                        </Button>
                        <Button
                            onClick={handleCreateBill}
                            disabled={isCreating || !newBillVendorId || !newBillDueDate || newBillLines.some(l => !l.description)}
                            className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                    جاري الإنشاء...
                                </>
                            ) : (
                                'إنشاء الفاتورة'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
