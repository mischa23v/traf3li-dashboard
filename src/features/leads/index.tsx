import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'
import {
    Search, Bell, Plus, MoreHorizontal, ChevronLeft, Eye, Trash2,
    Filter, TrendingUp, Phone, Mail, Building2, User, AlertCircle,
    ArrowUpRight, Calendar, SortAsc, X, DollarSign
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLeads, useDeleteLead, useConvertLead } from '@/hooks/useCrm'
import { SalesSidebar } from '@/features/crm/components/sales-sidebar'
import { cn } from '@/lib/utils'

// Lead status options with Arabic labels
const LEAD_STATUSES = [
    { value: 'new', label: 'جديد', labelEn: 'New', color: 'bg-blue-100 text-blue-700' },
    { value: 'contacted', label: 'تم التواصل', labelEn: 'Contacted', color: 'bg-purple-100 text-purple-700' },
    { value: 'qualified', label: 'مؤهل', labelEn: 'Qualified', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'proposal', label: 'عرض سعر', labelEn: 'Proposal', color: 'bg-orange-100 text-orange-700' },
    { value: 'negotiation', label: 'تفاوض', labelEn: 'Negotiation', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'won', label: 'تم الكسب', labelEn: 'Won', color: 'bg-green-100 text-green-700' },
    { value: 'lost', label: 'خسارة', labelEn: 'Lost', color: 'bg-red-100 text-red-700' },
]

const LEAD_SOURCES = [
    { value: 'website', label: 'الموقع الإلكتروني', labelEn: 'Website' },
    { value: 'referral', label: 'إحالة', labelEn: 'Referral' },
    { value: 'social_media', label: 'وسائل التواصل', labelEn: 'Social Media' },
    { value: 'advertising', label: 'إعلان', labelEn: 'Advertising' },
    { value: 'cold_call', label: 'اتصال مباشر', labelEn: 'Cold Call' },
    { value: 'walk_in', label: 'زيارة شخصية', labelEn: 'Walk-in' },
    { value: 'other', label: 'أخرى', labelEn: 'Other' },
]

export function Leads() {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const isRTL = i18n.language === 'ar'
    const dateLocale = isRTL ? arSA : enUS

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [sourceFilter, setSourceFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('createdAt')

    // Selection mode
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([])

    // Build filters
    const filters = useMemo(() => {
        const f: any = {}
        if (searchQuery.trim()) f.search = searchQuery.trim()
        if (statusFilter !== 'all') f.status = statusFilter
        if (sourceFilter !== 'all') f.sourceType = sourceFilter
        if (sortBy) {
            f.sortBy = sortBy
            f.sortOrder = sortBy === 'estimatedValue' ? 'desc' : 'desc'
        }
        return f
    }, [searchQuery, statusFilter, sourceFilter, sortBy])

    const hasActiveFilters = searchQuery || statusFilter !== 'all' || sourceFilter !== 'all'

    const clearFilters = () => {
        setSearchQuery('')
        setStatusFilter('all')
        setSourceFilter('all')
    }

    // API hooks
    const { data: leadsData, isLoading, isError, error, refetch } = useLeads(filters)
    const deleteLeadMutation = useDeleteLead()
    const convertLeadMutation = useConvertLead()

    const leads = leadsData?.data || []

    // Format date helper
    const formatDualDate = (dateString: string | null | undefined) => {
        if (!dateString) return { arabic: 'غير محدد', english: 'Not set' }
        const date = new Date(dateString)
        return {
            arabic: format(date, 'd MMMM', { locale: arSA }),
            english: format(date, 'MMM d, yyyy', { locale: enUS })
        }
    }

    // Selection handlers
    const handleToggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode)
        setSelectedLeadIds([])
    }

    const handleSelectLead = (leadId: string) => {
        if (selectedLeadIds.includes(leadId)) {
            setSelectedLeadIds(selectedLeadIds.filter(id => id !== leadId))
        } else {
            setSelectedLeadIds([...selectedLeadIds, leadId])
        }
    }

    const handleDeleteSelected = async () => {
        if (selectedLeadIds.length === 0) return
        if (confirm(`هل أنت متأكد من حذف ${selectedLeadIds.length} عميل محتمل؟`)) {
            // Delete leads one by one
            for (const leadId of selectedLeadIds) {
                deleteLeadMutation.mutate(leadId)
            }
            setIsSelectionMode(false)
            setSelectedLeadIds([])
        }
    }

    // Single lead actions
    const handleViewLead = (leadId: string) => {
        navigate({ to: '/dashboard/crm/leads/$leadId', params: { leadId } })
    }

    const handleDeleteLead = (leadId: string) => {
        if (confirm('هل أنت متأكد من حذف هذا العميل المحتمل؟')) {
            deleteLeadMutation.mutate(leadId)
        }
    }

    const handleConvertLead = (leadId: string) => {
        convertLeadMutation.mutate(leadId)
    }

    // Get status color
    const getStatusColor = (status: string) => {
        const statusObj = LEAD_STATUSES.find(s => s.value === status)
        return statusObj?.color || 'bg-slate-100 text-slate-700'
    }

    // Get status strip color
    const getStatusStripColor = (status: string) => {
        switch (status) {
            case 'new': return 'bg-blue-500'
            case 'contacted': return 'bg-purple-500'
            case 'qualified': return 'bg-emerald-500'
            case 'proposal': return 'bg-orange-500'
            case 'negotiation': return 'bg-yellow-500'
            case 'won': return 'bg-green-500'
            case 'lost': return 'bg-red-500'
            default: return 'bg-slate-400'
        }
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'العملاء المحتملين', href: '/dashboard/crm/leads', isActive: true },
        { title: 'خط المبيعات', href: '/dashboard/crm/pipeline', isActive: false },
        { title: 'العملاء', href: '/dashboard/clients', isActive: false },
    ]

    return (
        <>
            {/* Header */}
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className="ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0">
                    <div className="relative hidden md:block min-w-0">
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="بحث..."
                            className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            {/* Main Content */}
            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* Hero Card */}
                <ProductivityHero badge="إدارة المبيعات" title="العملاء المحتملين" type="leads" />

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content (col-span-2) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Filters Bar */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <div className="flex flex-col gap-4">
                                {/* Row 1: Search and primary filters */}
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="relative flex-1 min-w-[200px] max-w-md">
                                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <Input
                                            type="text"
                                            placeholder="ابحث عن عميل محتمل..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pe-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                        />
                                    </div>

                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[140px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="الحالة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">كل الحالات</SelectItem>
                                            {LEAD_STATUSES.map((status) => (
                                                <SelectItem key={status.value} value={status.value}>
                                                    {status.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={sourceFilter} onValueChange={setSourceFilter}>
                                        <SelectTrigger className="w-[150px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="المصدر" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">كل المصادر</SelectItem>
                                            {LEAD_SOURCES.map((source) => (
                                                <SelectItem key={source.value} value={source.value}>
                                                    {source.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Row 2: Sort and clear */}
                                <div className="flex flex-wrap items-center gap-3">
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="w-[160px] h-10 rounded-xl border-slate-200">
                                            <SortAsc className="h-4 w-4 ms-2 text-slate-500" />
                                            <SelectValue placeholder="ترتيب حسب" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="createdAt">تاريخ الإنشاء</SelectItem>
                                            <SelectItem value="estimatedValue">القيمة المتوقعة</SelectItem>
                                            <SelectItem value="probability">الاحتمالية</SelectItem>
                                            <SelectItem value="lastContactDate">آخر تواصل</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {hasActiveFilters && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearFilters}
                                            className="h-10 px-4 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                        >
                                            <X className="h-4 w-4 ms-2" />
                                            مسح الفلاتر
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Leads List Card */}
                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                            <div className="p-6 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-navy text-xl">قائمة العملاء المحتملين</h3>
                                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                                    {leads.length} عميل محتمل
                                </Badge>
                            </div>

                            <div className="p-4 space-y-4">
                                {/* Loading State */}
                                {isLoading && (
                                    <>
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100">
                                                <div className="flex gap-4 mb-4">
                                                    <Skeleton className="w-12 h-12 rounded-xl" />
                                                    <div className="flex-1 space-y-2">
                                                        <Skeleton className="h-6 w-3/4" />
                                                        <Skeleton className="h-4 w-1/2" />
                                                    </div>
                                                </div>
                                                <Skeleton className="h-16 w-full" />
                                            </div>
                                        ))}
                                    </>
                                )}

                                {/* Error State */}
                                {isError && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                                                <AlertCircle className="w-8 h-8 text-red-500" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ في تحميل البيانات</h3>
                                        <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
                                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                                            إعادة المحاولة
                                        </Button>
                                    </div>
                                )}

                                {/* Empty State */}
                                {!isLoading && !isError && leads.length === 0 && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                                <TrendingUp className="w-8 h-8 text-emerald-500" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">لا يوجد عملاء محتملين</h3>
                                        <p className="text-slate-500 mb-4">ابدأ بإضافة عميل محتمل جديد لتتبع فرص المبيعات</p>
                                        <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                                            <Link to="/dashboard/crm/leads/new">
                                                <Plus className="w-4 h-4 ms-2" />
                                                إضافة عميل محتمل
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {/* Success State - Leads List */}
                                {!isLoading && !isError && leads.map((lead: any, index: number) => {
                                    const displayName = lead.displayName || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'غير محدد'
                                    const status = lead.status || 'new'
                                    const statusColor = getStatusColor(status)
                                    const statusStripColor = getStatusStripColor(status)
                                    const createdDate = formatDualDate(lead.createdAt)
                                    const statusLabel = LEAD_STATUSES.find(s => s.value === status)?.label || status

                                    return (
                                        <div
                                            key={lead._id}
                                            style={{ animationDelay: `${index * 50}ms` }}
                                            className={cn(
                                                "bg-[#F8F9FA] rounded-2xl p-6 border transition-all group relative overflow-hidden",
                                                "animate-in fade-in slide-in-from-bottom-4",
                                                selectedLeadIds.includes(lead._id)
                                                    ? 'border-emerald-500 bg-emerald-50/30'
                                                    : 'border-slate-100 hover:border-emerald-200'
                                            )}
                                        >
                                            {/* Status Strip */}
                                            <div className={cn(
                                                "absolute top-0 bottom-0 w-1.5 rounded-s-2xl",
                                                isRTL ? "right-0" : "left-0",
                                                statusStripColor
                                            )} />

                                            <div className={cn("", isRTL ? "pe-4" : "ps-4")}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex gap-4 items-center">
                                                        {isSelectionMode && (
                                                            <Checkbox
                                                                checked={selectedLeadIds.includes(lead._id)}
                                                                onCheckedChange={() => handleSelectLead(lead._id)}
                                                                className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                            />
                                                        )}
                                                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-emerald-600">
                                                            <TrendingUp className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-bold text-navy text-lg">{displayName}</h4>
                                                                <Badge className={cn("border-0 rounded-md px-2", statusColor)}>
                                                                    {statusLabel}
                                                                </Badge>
                                                                {lead.convertedToClient && (
                                                                    <Badge className="bg-green-100 text-green-700 border-0 rounded-md px-2">
                                                                        تم التحويل
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                                                                {lead.source?.type && (
                                                                    <span>{LEAD_SOURCES.find(s => s.value === lead.source.type)?.label || lead.source.type}</span>
                                                                )}
                                                                {lead.estimatedValue > 0 && (
                                                                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                                                        <DollarSign className="h-3 w-3" />
                                                                        {lead.estimatedValue.toLocaleString()} ر.س
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-navy">
                                                                <MoreHorizontal className="h-5 w-5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuItem onClick={() => handleViewLead(lead._id)}>
                                                                <Eye className="h-4 w-4 ms-2" />
                                                                عرض التفاصيل
                                                            </DropdownMenuItem>
                                                            {!lead.convertedToClient && (
                                                                <DropdownMenuItem onClick={() => handleConvertLead(lead._id)}>
                                                                    <ArrowUpRight className="h-4 w-4 ms-2 text-emerald-500" />
                                                                    تحويل لعميل
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteLead(lead._id)}
                                                                className="text-red-600 focus:text-red-600"
                                                            >
                                                                <Trash2 className="h-4 w-4 ms-2" />
                                                                حذف
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>

                                                {/* Contact Info & Actions */}
                                                <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                                    <div className="flex items-center gap-4">
                                                        {lead.phone && (
                                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                                <Phone className="h-4 w-4 text-slate-400" />
                                                                <span dir="ltr">{lead.phone}</span>
                                                            </div>
                                                        )}
                                                        {lead.email && (
                                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                                <Mail className="h-4 w-4 text-slate-400" />
                                                                <span dir="ltr" className="truncate max-w-[150px]">{lead.email}</span>
                                                            </div>
                                                        )}
                                                        <div className="text-center">
                                                            <div className="text-xs text-slate-500 mb-1">تاريخ الإنشاء</div>
                                                            <div className="font-bold text-slate-600 text-sm">{createdDate.arabic}</div>
                                                        </div>
                                                    </div>
                                                    <Link to={`/dashboard/crm/leads/${lead._id}` as any}>
                                                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20">
                                                            عرض التفاصيل
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="p-4 pt-0 text-center">
                                <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-full rounded-xl py-6">
                                    عرض كل العملاء المحتملين
                                    <ChevronLeft className="h-4 w-4 me-2" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar (col-span-1) */}
                    <SalesSidebar
                        context="leads"
                        isSelectionMode={isSelectionMode}
                        onToggleSelectionMode={handleToggleSelectionMode}
                        selectedCount={selectedLeadIds.length}
                        onDeleteSelected={handleDeleteSelected}
                    />
                </div>
            </Main>
        </>
    )
}
