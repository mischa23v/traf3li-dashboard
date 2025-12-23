import { SalesSidebar } from './sales-sidebar'
import { useState, useMemo } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link } from '@tanstack/react-router'
import { Checkbox } from '@/components/ui/checkbox'
import { ProductivityHero } from '@/components/productivity-hero'
import { useEmailCampaigns, useCampaignAnalytics, useSendCampaign, usePauseCampaign, useResumeCampaign } from '@/hooks/useCrmAdvanced'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Search, Bell, AlertCircle, Mail, Plus, MoreHorizontal, ChevronLeft, Eye, Trash2, Edit3, SortAsc, X, Send, Calendar, BarChart3, Users, TrendingUp, Clock, Pause, Play } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'
import { Input } from '@/components/ui/input'
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
import type { CampaignStatus } from '@/types/crm-advanced'

export function EmailMarketingListView() {
    const navigate = useNavigate()
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('createdAt')

    // Mutations
    const { mutate: sendCampaign } = useSendCampaign()
    const { mutate: pauseCampaign } = usePauseCampaign()
    const { mutate: resumeCampaign } = useResumeCampaign()

    // API Filters
    const filters = useMemo(() => {
        const f: any = {}

        // Status filter
        if (statusFilter !== 'all') {
            f.status = statusFilter
        }

        // Search
        if (searchQuery.trim()) {
            f.search = searchQuery.trim()
        }

        return f
    }, [statusFilter, searchQuery])

    // Check if any filter is active
    const hasActiveFilters = searchQuery || statusFilter !== 'all'

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('')
        setStatusFilter('all')
    }

    // Fetch campaigns
    const { data: campaignsData, isLoading, isError, error, refetch } = useEmailCampaigns(filters)

    // Helper function to format dates in both languages
    const formatDualDate = (dateString: string | null | undefined) => {
        if (!dateString) return { arabic: 'غير محدد', english: 'Not set' }
        const date = new Date(dateString)
        return {
            arabic: format(date, 'd MMMM yyyy', { locale: arSA }),
            english: format(date, 'MMM d, yyyy')
        }
    }

    // Transform API data
    const campaigns = useMemo(() => {
        if (!campaignsData?.data) return []

        return campaignsData.data.map((campaign: any) => ({
            id: campaign._id,
            name: campaign.name,
            subject: campaign.subject,
            status: campaign.status || 'draft',
            sentAt: campaign.sentAt,
            sentAtFormatted: formatDualDate(campaign.sentAt),
            scheduledFor: campaign.scheduledFor,
            scheduledForFormatted: formatDualDate(campaign.scheduledFor),
            recipientCount: campaign.recipientCount || 0,
            analytics: campaign.analytics || {
                sent: 0,
                delivered: 0,
                opened: 0,
                clicked: 0,
                bounced: 0,
                unsubscribed: 0,
            },
            _id: campaign._id,
        }))
    }, [campaignsData])

    // Selection Handlers
    const handleToggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode)
        setSelectedIds([])
    }

    const handleSelectCampaign = (campaignId: string) => {
        if (selectedIds.includes(campaignId)) {
            setSelectedIds(selectedIds.filter(id => id !== campaignId))
        } else {
            setSelectedIds([...selectedIds, campaignId])
        }
    }

    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) return

        if (confirm(`هل أنت متأكد من حذف ${selectedIds.length} حملة؟`)) {
            // TODO: [BACKEND-PENDING] Implement bulk delete campaign endpoint
            // Backend needs DELETE /api/crm/campaigns/bulk endpoint
            // Expected payload: { campaignIds: string[] }
            // Track in: [Add JIRA/GitHub issue reference here]
            console.warn('Bulk delete not implemented: Backend endpoint not ready')
            alert('عذراً، ميزة الحذف الجماعي غير متوفرة حالياً. جاري العمل على تطويرها.')
            setIsSelectionMode(false)
            setSelectedIds([])
        }
    }

    // Single campaign actions
    const handleViewCampaign = (campaignId: string) => {
        navigate({ to: '/dashboard/crm/email-marketing/$campaignId', params: { campaignId } })
    }

    const handleEditCampaign = (campaignId: string) => {
        navigate({ to: '/dashboard/crm/email-marketing/new', search: { editId: campaignId } })
    }

    const handleDeleteCampaign = (campaignId: string) => {
        if (confirm('هل أنت متأكد من حذف هذه الحملة؟')) {
            // TODO: [BACKEND-PENDING] Implement single campaign delete endpoint
            // Backend needs DELETE /api/crm/campaigns/:id endpoint
            // Expected behavior: Delete campaign and return success/error status
            // Track in: [Add JIRA/GitHub issue reference here]
            console.warn(`Delete campaign ${campaignId} not implemented: Backend endpoint not ready`)
            alert('عذراً، ميزة الحذف غير متوفرة حالياً. جاري العمل على تطويرها.')
        }
    }

    const handleSendCampaign = (campaignId: string) => {
        if (confirm('هل تريد إرسال هذه الحملة الآن؟')) {
            sendCampaign(campaignId)
        }
    }

    const handlePauseCampaign = (campaignId: string) => {
        pauseCampaign(campaignId)
    }

    const handleResumeCampaign = (campaignId: string) => {
        resumeCampaign(campaignId)
    }

    // Status badge styling
    const getStatusBadge = (status: CampaignStatus) => {
        const styles: Record<CampaignStatus, string> = {
            draft: 'bg-slate-100 text-slate-700 border-slate-200',
            scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
            sending: 'bg-amber-100 text-amber-700 border-amber-200',
            sent: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            paused: 'bg-orange-100 text-orange-700 border-orange-200',
            cancelled: 'bg-red-100 text-red-700 border-red-200',
        }
        const labels: Record<CampaignStatus, string> = {
            draft: 'مسودة',
            scheduled: 'مجدولة',
            sending: 'جارٍ الإرسال',
            sent: 'تم الإرسال',
            paused: 'متوقفة',
            cancelled: 'ملغاة',
        }
        return <Badge className={`${styles[status]} border-0 rounded-md px-2`}>{labels[status]}</Badge>
    }

    // Calculate stats for hero
    const heroStats = useMemo(() => {
        if (!campaignsData?.data) return undefined

        const totalCampaigns = campaignsData.data.length
        const sentCampaigns = campaignsData.data.filter((c: any) => c.status === 'sent').length
        const scheduledCampaigns = campaignsData.data.filter((c: any) => c.status === 'scheduled').length

        // Calculate average open rate
        const campaignsWithAnalytics = campaignsData.data.filter((c: any) => c.analytics?.sent > 0)
        const avgOpenRate = campaignsWithAnalytics.length > 0
            ? Math.round(campaignsWithAnalytics.reduce((acc: number, c: any) => {
                const openRate = c.analytics?.sent > 0 ? (c.analytics.opened / c.analytics.sent) * 100 : 0
                return acc + openRate
            }, 0) / campaignsWithAnalytics.length)
            : 0

        return [
            { label: 'إجمالي الحملات', value: totalCampaigns || 0, icon: Mail, status: 'normal' as const },
            { label: 'تم الإرسال', value: sentCampaigns || 0, icon: Send, status: 'normal' as const },
            { label: 'مجدولة', value: scheduledCampaigns || 0, icon: Calendar, status: scheduledCampaigns > 0 ? 'attention' as const : 'zero' as const },
            { label: 'معدل الفتح', value: `${avgOpenRate}%`, icon: TrendingUp, status: 'normal' as const },
        ]
    }, [campaignsData])

    const topNav = [
        { title: 'العملاء المحتملين', href: '/dashboard/crm/leads', isActive: false },
        { title: 'خط المبيعات', href: '/dashboard/crm/pipeline', isActive: false },
        { title: 'التسويق عبر البريد', href: '/dashboard/crm/email-marketing', isActive: true },
        { title: 'الأنشطة', href: '/dashboard/crm/activities', isActive: false },
    ]

    return (
        <>
            {/* Header */}
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

                {/* Dynamic Island - Centered */}
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
                        <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                </div>
                {/* Bottom Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* HERO CARD & STATS */}
                <ProductivityHero badge="CRM" title="التسويق عبر البريد الإلكتروني" type="email-marketing" stats={heroStats} />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* FILTERS BAR */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <div className="flex flex-col gap-4">
                                {/* Row 1: Search and primary filters */}
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Search Input */}
                                    <div className="relative flex-1 min-w-[200px] max-w-md">
                                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                                        <Input
                                            type="text"
                                            placeholder="بحث بالاسم أو الموضوع..." aria-label="بحث بالاسم أو الموضوع"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pe-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                        />
                                    </div>

                                    {/* Status Filter */}
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[140px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="الحالة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">كل الحالات</SelectItem>
                                            <SelectItem value="draft">مسودة</SelectItem>
                                            <SelectItem value="scheduled">مجدولة</SelectItem>
                                            <SelectItem value="sending">جارٍ الإرسال</SelectItem>
                                            <SelectItem value="sent">تم الإرسال</SelectItem>
                                            <SelectItem value="paused">متوقفة</SelectItem>
                                            <SelectItem value="cancelled">ملغاة</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Row 2: Sort and clear */}
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Sort By */}
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="w-[160px] h-10 rounded-xl border-slate-200">
                                            <SortAsc className="h-4 w-4 ms-2 text-slate-500" aria-hidden="true" />
                                            <SelectValue placeholder="ترتيب حسب" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="createdAt">تاريخ الإنشاء</SelectItem>
                                            <SelectItem value="sentAt">تاريخ الإرسال</SelectItem>
                                            <SelectItem value="scheduledFor">الموعد المجدول</SelectItem>
                                            <SelectItem value="name">الاسم</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Clear Filters Button */}
                                    {hasActiveFilters && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearFilters}
                                            className="h-10 px-4 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                        >
                                            <X className="h-4 w-4 ms-2" aria-hidden="true" />
                                            مسح الفلاتر
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* MAIN CAMPAIGNS LIST */}
                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                            <div className="p-6 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-navy text-xl">قائمة الحملات</h3>
                                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                                    {campaigns.length} حملة
                                </Badge>
                            </div>

                            <div className="p-4 space-y-4">
                                {/* Loading State */}
                                {isLoading && (
                                    <>
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100">
                                                <div className="flex gap-4 mb-4">
                                                    <Skeleton className="w-14 h-14 rounded-xl" />
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
                                                <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل الحملات</h3>
                                        <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
                                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                                            إعادة المحاولة
                                        </Button>
                                    </div>
                                )}

                                {/* Empty State */}
                                {!isLoading && !isError && campaigns.length === 0 && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                                <Mail className="w-8 h-8 text-emerald-500" aria-hidden="true" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد حملات</h3>
                                        <p className="text-slate-500 mb-4">ابدأ بإنشاء حملة تسويقية جديدة</p>
                                        <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                                            <Link to="/dashboard/crm/email-marketing/new">
                                                <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                                                إنشاء حملة
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {/* Success State - Campaigns List */}
                                {!isLoading && !isError && campaigns.map((campaign) => (
                                    <div key={campaign.id} className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group ${selectedIds.includes(campaign.id) ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-4 items-center">
                                                {isSelectionMode && (
                                                    <Checkbox
                                                        checked={selectedIds.includes(campaign.id)}
                                                        onCheckedChange={() => handleSelectCampaign(campaign.id)}
                                                        className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                    />
                                                )}
                                                <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm text-emerald-600 font-bold text-lg">
                                                    <Mail className="h-7 w-7" aria-hidden="true" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-navy text-lg">{campaign.name}</h4>
                                                        {getStatusBadge(campaign.status)}
                                                    </div>
                                                    <p className="text-slate-500 text-sm">{campaign.subject}</p>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-navy" aria-label="خيارات">
                                                        <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => handleViewCampaign(campaign.id)}>
                                                        <Eye className="h-4 w-4 ms-2" aria-hidden="true" />
                                                        عرض التفاصيل
                                                    </DropdownMenuItem>
                                                    {campaign.status === 'draft' && (
                                                        <>
                                                            <DropdownMenuItem onClick={() => handleEditCampaign(campaign.id)}>
                                                                <Edit3 className="h-4 w-4 ms-2 text-blue-500" aria-hidden="true" />
                                                                تعديل الحملة
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleSendCampaign(campaign.id)}>
                                                                <Send className="h-4 w-4 ms-2 text-emerald-500" aria-hidden="true" />
                                                                إرسال الآن
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    {campaign.status === 'sending' && (
                                                        <DropdownMenuItem onClick={() => handlePauseCampaign(campaign.id)}>
                                                            <Pause className="h-4 w-4 ms-2 text-orange-500" aria-hidden="true" />
                                                            إيقاف مؤقت
                                                        </DropdownMenuItem>
                                                    )}
                                                    {campaign.status === 'paused' && (
                                                        <DropdownMenuItem onClick={() => handleResumeCampaign(campaign.id)}>
                                                            <Play className="h-4 w-4 ms-2 text-emerald-500" aria-hidden="true" />
                                                            استئناف
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    {/* NOTE: Delete functionality shows in UI but alerts user it's not ready (backend pending) */}
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteCampaign(campaign.id)}
                                                        className="text-red-600 focus:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 ms-2" aria-hidden="true" />
                                                        حذف الحملة
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                            <div className="flex items-center gap-6">
                                                {/* Campaign Stats */}
                                                <div className="flex items-center gap-4 text-sm">
                                                    <div className="text-center">
                                                        <div className="text-xs text-slate-500 mb-1">المستلمين</div>
                                                        <div className="font-bold text-navy flex items-center gap-1">
                                                            <Users className="h-3 w-3 text-emerald-500" aria-hidden="true" />
                                                            {campaign.recipientCount}
                                                        </div>
                                                    </div>
                                                    {campaign.analytics.sent > 0 && (
                                                        <>
                                                            <div className="text-center">
                                                                <div className="text-xs text-slate-500 mb-1">معدل الفتح</div>
                                                                <div className="font-bold text-emerald-600 flex items-center gap-1">
                                                                    <TrendingUp className="h-3 w-3" aria-hidden="true" />
                                                                    {campaign.analytics.sent > 0 ? Math.round((campaign.analytics.opened / campaign.analytics.sent) * 100) : 0}%
                                                                </div>
                                                            </div>
                                                            <div className="text-center">
                                                                <div className="text-xs text-slate-500 mb-1">معدل النقر</div>
                                                                <div className="font-bold text-blue-600 flex items-center gap-1">
                                                                    <BarChart3 className="h-3 w-3" aria-hidden="true" />
                                                                    {campaign.analytics.sent > 0 ? Math.round((campaign.analytics.clicked / campaign.analytics.sent) * 100) : 0}%
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                {/* Date Info */}
                                                {(campaign.sentAt || campaign.scheduledFor) && (
                                                    <div className="text-center">
                                                        <div className="text-xs text-slate-500 mb-1">
                                                            {campaign.sentAt ? 'تاريخ الإرسال' : 'موعد الإرسال'}
                                                        </div>
                                                        <div className="font-medium text-navy text-sm flex items-center gap-1">
                                                            {campaign.sentAt ? <Send className="h-3 w-3" aria-hidden="true" /> : <Clock className="h-3 w-3" aria-hidden="true" />}
                                                            {campaign.sentAt ? campaign.sentAtFormatted.arabic : campaign.scheduledForFormatted.arabic}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <Link to={`/dashboard/crm/email-marketing/${campaign.id}`}>
                                                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20">
                                                    عرض التفاصيل
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 pt-0 text-center">
                                <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-full rounded-xl py-6">
                                    عرض جميع الحملات
                                    <ChevronLeft className="h-4 w-4 me-2" aria-hidden="true" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* LEFT COLUMN (Widgets) */}
                    <SalesSidebar
                        context="email-marketing"
                        isSelectionMode={isSelectionMode}
                        onToggleSelectionMode={handleToggleSelectionMode}
                        selectedCount={selectedIds.length}
                        onDeleteSelected={handleDeleteSelected}
                    />
                </div>
            </Main>
        </>
    )
}
