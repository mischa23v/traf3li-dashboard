import { useState, useMemo } from 'react'
import {
    Search, Filter, Plus, MoreHorizontal, Building2, AlertCircle, Loader2, Bell,
    Phone, Mail, MapPin, CreditCard, Edit, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Skeleton } from '@/components/ui/skeleton'
import { useVendors } from '@/hooks/useAccounting'
import { FinanceSidebar } from './finance-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import { formatCurrency } from '@/lib/currency'
import { VendorsActionDialog } from './vendors-action-dialog'
import { VendorsDeleteDialog } from './vendors-delete-dialog'
import { type Vendor } from '@/services/accountingService'

export default function VendorsDashboard() {
    const [activeTab, setActiveTab] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [currentVendor, setCurrentVendor] = useState<Vendor | undefined>(undefined)

    // Determine filters based on active tab
    const filters = useMemo(() => {
        if (activeTab === 'active') return { isActive: true }
        if (activeTab === 'inactive') return { isActive: false }
        return {}
    }, [activeTab])

    // Fetch vendors data
    const { data: vendorsData, isLoading, isError, error, refetch } = useVendors(filters)

    // Transform and filter vendors
    const vendors = useMemo(() => {
        if (!vendorsData?.vendors) return []

        let filtered = vendorsData.vendors

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter((vendor: Vendor) =>
                vendor.name?.toLowerCase().includes(query) ||
                vendor.nameAr?.toLowerCase().includes(query) ||
                vendor.email?.toLowerCase().includes(query) ||
                vendor.phone?.toLowerCase().includes(query) ||
                vendor.category?.toLowerCase().includes(query)
            )
        }

        return filtered
    }, [vendorsData, searchQuery])

    // Calculate statistics
    const stats = useMemo(() => {
        const allVendors = vendorsData?.vendors || []
        const totalVendors = allVendors.length
        const activeVendors = allVendors.filter((v: Vendor) => v.isActive).length
        const inactiveVendors = allVendors.filter((v: Vendor) => !v.isActive).length
        const totalBalance = allVendors.reduce((sum: number, v: Vendor) => sum + (v.balance || 0), 0)
        const totalBilled = allVendors.reduce((sum: number, v: Vendor) => sum + (v.totalBilled || 0), 0)
        const totalPaid = allVendors.reduce((sum: number, v: Vendor) => sum + (v.totalPaid || 0), 0)

        return {
            totalVendors,
            activeVendors,
            inactiveVendors,
            totalBalance,
            totalBilled,
            totalPaid,
        }
    }, [vendorsData])

    const handleEdit = (vendor: Vendor) => {
        setCurrentVendor(vendor)
        setIsActionDialogOpen(true)
    }

    const handleDelete = (vendor: Vendor) => {
        setCurrentVendor(vendor)
        setIsDeleteDialogOpen(true)
    }

    const handleCreate = () => {
        setCurrentVendor(undefined)
        setIsActionDialogOpen(true)
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'الموردين', href: '/dashboard/finance/vendors', isActive: true },
        { title: 'كشف الحساب', href: '/dashboard/finance/statements', isActive: false },
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
                            <Skeleton className="h-64 w-full rounded-2xl" />
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
                        <h3 className="text-xl font-bold text-slate-900 mb-2">فشل تحميل الموردين</h3>
                        <p className="text-slate-500 mb-6">{(error as Error)?.message || 'حدث خطأ أثناء تحميل البيانات'}</p>
                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                            <Loader2 className="ms-2 h-4 w-4" />
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

                <div className='ms-auto flex items-center gap-4'>
                    <div className="relative hidden md:block">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
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
                <ProductivityHero badge="الموردين" title="الموردين" type="vendors" />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">إجمالي الموردين</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#022c22]">{stats.totalVendors}</div>
                            <p className="text-xs text-slate-500 mt-1">
                                {stats.activeVendors} نشط • {stats.inactiveVendors} غير نشط
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">إجمالي المستحق</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats.totalBalance)}</div>
                            <p className="text-xs text-slate-500 mt-1">ما نستحقه للموردين</p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">إجمالي المصروفات</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalBilled)}</div>
                            <p className="text-xs text-slate-500 mt-1">مجموع الفواتير</p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">إجمالي المدفوع</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalPaid)}</div>
                            <p className="text-xs text-slate-500 mt-1">المبالغ المسددة</p>
                        </CardContent>
                    </Card>
                </div>

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">
                        {vendors.length === 0 && !searchQuery && activeTab === 'all' ? (
                            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Building2 className="h-8 w-8 text-brand-blue" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد موردين بعد</h3>
                                <p className="text-slate-500 mb-6">ابدأ بإضافة أول مورد</p>
                                <Button onClick={handleCreate} className="bg-brand-blue hover:bg-blue-600 text-white px-8">
                                    <Plus className="ms-2 h-4 w-4" />
                                    إضافة مورد جديد
                                </Button>
                            </div>
                        ) : (
                            <>
                                {/* Filters Bar */}
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
                                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                                        <TabsList className="justify-start bg-slate-50 p-1 rounded-xl border border-slate-200 h-auto">
                                            <TabsTrigger
                                                value="all"
                                                className="rounded-lg px-4 py-2 data-[state=active]:bg-[#022c22] data-[state=active]:text-white transition-all duration-300"
                                            >
                                                الكل
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="active"
                                                className="rounded-lg px-4 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all duration-300"
                                            >
                                                نشط
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="inactive"
                                                className="rounded-lg px-4 py-2 data-[state=active]:bg-slate-500 data-[state=active]:text-white transition-all duration-300"
                                            >
                                                غير نشط
                                            </TabsTrigger>
                                        </TabsList>
                                    </Tabs>

                                    <div className="flex items-center gap-3 flex-1 justify-end">
                                        <div className="relative w-full max-w-xs">
                                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="بحث في الموردين..."
                                                className="pe-10 rounded-xl border-slate-200 focus:ring-[#022c22] focus:border-[#022c22]"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <Button onClick={handleCreate} className="bg-[#022c22] hover:bg-[#033d2e] text-white rounded-xl px-4">
                                            <Plus className="ms-2 h-4 w-4" />
                                            إضافة مورد
                                        </Button>
                                    </div>
                                </div>

                                {/* Vendors List */}
                                {vendors.length === 0 ? (
                                    <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
                                        <p className="text-slate-500">لا توجد نتائج للبحث</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {vendors.map((vendor: Vendor) => (
                                            <div key={vendor._id} className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-emerald-200 transition-all group">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex gap-4 items-center flex-1">
                                                        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shadow-sm text-emerald-600">
                                                            <Building2 className="h-6 w-6" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-bold text-[#022c22] text-lg">
                                                                    {vendor.nameAr || vendor.name}
                                                                </h4>
                                                                <Badge className={vendor.isActive
                                                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 px-2 rounded-md"
                                                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-0 px-2 rounded-md"
                                                                }>
                                                                    {vendor.isActive ? 'نشط' : 'غير نشط'}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                                                {vendor.category && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Building2 className="h-3 w-3" />
                                                                        {vendor.category}
                                                                    </span>
                                                                )}
                                                                {vendor.email && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Mail className="h-3 w-3" />
                                                                        {vendor.email}
                                                                    </span>
                                                                )}
                                                                {vendor.phone && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Phone className="h-3 w-3" />
                                                                        {vendor.phone}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-[#022c22]">
                                                                <MoreHorizontal className="h-5 w-5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleEdit(vendor)}>
                                                                <Edit className="ms-2 h-4 w-4" />
                                                                تعديل
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(vendor)}
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="ms-2 h-4 w-4" />
                                                                حذف
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>

                                                <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                                    <div className="flex items-center gap-6">
                                                        <div className="text-center">
                                                            <div className="text-xs text-slate-400 mb-1">إجمالي الفواتير</div>
                                                            <div className="font-bold text-[#022c22] text-sm">{formatCurrency(vendor.totalBilled || 0)}</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-xs text-slate-400 mb-1">المدفوع</div>
                                                            <div className="font-bold text-emerald-600 text-sm">{formatCurrency(vendor.totalPaid || 0)}</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-xs text-slate-400 mb-1">المستحق للمورد</div>
                                                            <div className="font-bold text-orange-600 text-sm">{formatCurrency(vendor.balance || 0)}</div>
                                                        </div>
                                                    </div>
                                                    {vendor.city && (
                                                        <div className="flex items-center gap-1 text-slate-500 text-sm">
                                                            <MapPin className="h-4 w-4" />
                                                            {vendor.city}
                                                            {vendor.country && `, ${vendor.country}`}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* LEFT COLUMN (Widgets) */}
                    <FinanceSidebar context="vendors" />
                </div>
            </Main>

            {/* Dialogs */}
            <VendorsActionDialog
                open={isActionDialogOpen}
                onOpenChange={setIsActionDialogOpen}
                currentRow={currentVendor}
            />
            {currentVendor && (
                <VendorsDeleteDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                    currentRow={currentVendor}
                />
            )}
        </>
    )
}
