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
import { useWhatsAppConversations, useWhatsAppTemplates, useWhatsAppBroadcasts } from '@/hooks/useCrmAdvanced'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import {
    Search, Bell, AlertCircle, MessageSquare, Plus, MoreHorizontal,
    ChevronLeft, Eye, Trash2, SortAsc, X, MessageCircle, Clock,
    CheckCheck, Check, Phone, User, Filter, Archive, Tag, Megaphone,
    Send, Calendar, Users
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'
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
import { useTranslation } from 'react-i18next'

export function WhatsAppListView() {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const isRTL = i18n.language === 'ar'

    // State
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('lastMessage')

    // Build filters for API
    const filters = useMemo(() => {
        const f: any = {}
        if (searchQuery.trim()) f.search = searchQuery.trim()
        if (statusFilter !== 'all') f.status = statusFilter
        return f
    }, [searchQuery, statusFilter])

    // Check if any filter is active
    const hasActiveFilters = searchQuery || statusFilter !== 'all'

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('')
        setStatusFilter('all')
    }

    // Fetch data
    const { data: conversationsData, isLoading, isError, error, refetch } = useWhatsAppConversations(filters)
    const { data: templatesData } = useWhatsAppTemplates()
    const { data: broadcastsData } = useWhatsAppBroadcasts()

    // Helper function to format dates
    const formatDualDate = (dateString: string | null | undefined) => {
        if (!dateString) return { arabic: 'غير محدد', english: 'Not set' }
        const date = new Date(dateString)
        return {
            arabic: format(date, 'd MMMM yyyy - h:mm a', { locale: arSA }),
            english: format(date, 'MMM d, yyyy - h:mm a', { locale: enUS })
        }
    }

    // Format relative time
    const formatRelativeTime = (dateString: string | null | undefined) => {
        if (!dateString) return 'غير محدد'
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return isRTL ? 'الآن' : 'Just now'
        if (diffMins < 60) return isRTL ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`
        if (diffHours < 24) return isRTL ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`
        if (diffDays < 7) return isRTL ? `منذ ${diffDays} يوم` : `${diffDays}d ago`
        return format(date, 'd MMM', { locale: isRTL ? arSA : enUS })
    }

    // Transform API data
    const conversations = useMemo(() => {
        if (!conversationsData?.data) return []

        let items = conversationsData.data.map((conversation: any) => ({
            id: conversation._id,
            clientName: conversation.contact?.name || conversation.phoneNumber || 'غير محدد',
            phoneNumber: conversation.phoneNumber,
            lastMessage: conversation.lastMessage?.content || 'لا توجد رسائل',
            lastMessageAt: conversation.lastMessageAt,
            lastMessageFormatted: formatDualDate(conversation.lastMessageAt),
            relativeTime: formatRelativeTime(conversation.lastMessageAt),
            unreadCount: conversation.unreadCount || 0,
            status: conversation.status || 'open',
            assignedTo: conversation.assignedTo?.name || null,
            tags: conversation.tags || [],
            avatar: conversation.contact?.avatar || null,
        }))

        // Sort
        if (sortBy === 'lastMessage') {
            items.sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime())
        } else if (sortBy === 'unread') {
            items.sort((a, b) => b.unreadCount - a.unreadCount)
        } else if (sortBy === 'name') {
            items.sort((a, b) => a.clientName.localeCompare(b.clientName))
        }

        return items
    }, [conversationsData, sortBy, isRTL])

    // Transform templates data
    const templates = useMemo(() => {
        if (!templatesData) return []
        return templatesData.slice(0, 5).map((template: any) => ({
            id: template._id,
            name: template.name,
            category: template.category,
            status: template.status,
            language: template.language,
        }))
    }, [templatesData])

    // Transform broadcasts data
    const broadcasts = useMemo(() => {
        if (!broadcastsData) return []
        return broadcastsData.map((broadcast: any) => ({
            id: broadcast._id,
            broadcastId: broadcast.broadcastId,
            name: broadcast.name,
            type: broadcast.type,
            status: broadcast.status,
            stats: broadcast.stats || { totalRecipients: 0, pending: 0, sent: 0, delivered: 0, read: 0, failed: 0, skipped: 0 },
            scheduledAt: broadcast.scheduledAt,
            startedAt: broadcast.startedAt,
            completedAt: broadcast.completedAt,
            createdAt: broadcast.createdAt,
        }))
    }, [broadcastsData])

    // Get broadcast status badge
    const getBroadcastStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <Badge className="bg-slate-100 text-slate-600 border-0 rounded-lg px-2 py-0.5 text-xs font-bold">مسودة</Badge>
            case 'scheduled':
                return <Badge className="bg-purple-100 text-purple-700 border-0 rounded-lg px-2 py-0.5 text-xs font-bold">مجدول</Badge>
            case 'sending':
                return <Badge className="bg-blue-100 text-blue-700 border-0 rounded-lg px-2 py-0.5 text-xs font-bold">جاري الإرسال</Badge>
            case 'paused':
                return <Badge className="bg-amber-100 text-amber-700 border-0 rounded-lg px-2 py-0.5 text-xs font-bold">متوقف</Badge>
            case 'completed':
                return <Badge className="bg-emerald-100 text-emerald-700 border-0 rounded-lg px-2 py-0.5 text-xs font-bold">مكتمل</Badge>
            case 'cancelled':
                return <Badge className="bg-slate-100 text-slate-600 border-0 rounded-lg px-2 py-0.5 text-xs font-bold">ملغي</Badge>
            case 'failed':
                return <Badge className="bg-red-100 text-red-700 border-0 rounded-lg px-2 py-0.5 text-xs font-bold">فشل</Badge>
            default:
                return <Badge className="bg-slate-100 text-slate-600 border-0 rounded-lg px-2 py-0.5 text-xs font-bold">{status}</Badge>
        }
    }

    // Selection Handlers
    const handleToggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode)
        setSelectedIds([])
    }

    const handleSelectConversation = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id))
        } else {
            setSelectedIds([...selectedIds, id])
        }
    }

    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) return
        // TODO: Implement bulk delete
        console.log('Delete conversations:', selectedIds)
        setIsSelectionMode(false)
        setSelectedIds([])
    }

    const handleViewConversation = (conversationId: string) => {
        navigate({ to: '/dashboard/crm/whatsapp/$conversationId', params: { conversationId } })
    }

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 rounded-lg px-2 py-0.5 text-xs font-bold">مفتوحة</Badge>
            case 'pending':
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0 rounded-lg px-2 py-0.5 text-xs font-bold">قيد الانتظار</Badge>
            case 'closed':
                return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-0 rounded-lg px-2 py-0.5 text-xs font-bold">مغلقة</Badge>
            default:
                return null
        }
    }

    // Get message status icon
    const getMessageStatusIcon = (status?: string) => {
        switch (status) {
            case 'read':
                return <CheckCheck className="h-4 w-4 text-blue-500" aria-hidden="true" />
            case 'delivered':
                return <CheckCheck className="h-4 w-4 text-slate-400" aria-hidden="true" />
            case 'sent':
                return <Check className="h-4 w-4 text-slate-400" aria-hidden="true" />
            default:
                return <Clock className="h-4 w-4 text-slate-400" aria-hidden="true" />
        }
    }

    // Stats for hero
    const heroStats = useMemo(() => {
        if (!conversationsData) return undefined
        const total = conversationsData.pagination?.total || conversationsData.data?.length || 0
        const unread = conversations.filter(c => c.unreadCount > 0).length
        const open = conversations.filter(c => c.status === 'open').length
        const templatesCount = templatesData?.length || 0

        return [
            { label: 'إجمالي المحادثات', value: total, icon: MessageSquare, status: 'normal' as const },
            { label: 'غير مقروءة', value: unread, icon: MessageCircle, status: unread > 0 ? 'attention' as const : 'zero' as const },
            { label: 'مفتوحة', value: open, icon: Clock, status: 'normal' as const },
            { label: 'القوالب', value: templatesCount, icon: MessageSquare, status: 'normal' as const },
        ]
    }, [conversationsData, conversations, templatesData])

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'العملاء المحتملين', href: '/dashboard/crm/leads', isActive: false },
        { title: 'واتساب', href: '/dashboard/crm/whatsapp', isActive: true },
        { title: 'التسويق بالبريد', href: '/dashboard/crm/email-marketing', isActive: false },
    ]

    return (
        <>
            {/* Header */}
            <Header className="bg-navy shadow-none relative">
                <TopNav
                    links={topNav}
                    className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
                />

                {/* Dynamic Island - Centered */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>

                <div className="ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0">
                    <div className="relative hidden md:block min-w-0">
                        <Search
                            className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
                            aria-hidden="true"
                        />
                        <input
                            type="text"
                            placeholder="بحث..."
                            aria-label="بحث"
                            className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="التنبيهات"
                        className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0"
                    >
                        <Bell className="h-5 w-5" />
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

            <Main
                fluid={true}
                className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
            >
                {/* HERO CARD & STATS */}
                <ProductivityHero
                    badge="إدارة المحادثات"
                    title="واتساب"
                    type="whatsapp"
                    stats={heroStats}
                />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* FILTERS BAR */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Search Input */}
                                <div className="relative flex-1 min-w-[200px] max-w-md">
                                    <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                                    <Input
                                        type="text"
                                        placeholder="بحث في المحادثات..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pe-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                    />
                                </div>

                                {/* Status Filter */}
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[140px] h-10 rounded-xl border-slate-200">
                                        <Filter className="h-4 w-4 ms-2 text-slate-500" aria-hidden="true" />
                                        <SelectValue placeholder="الحالة" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">جميع الحالات</SelectItem>
                                        <SelectItem value="open">مفتوحة</SelectItem>
                                        <SelectItem value="pending">قيد الانتظار</SelectItem>
                                        <SelectItem value="closed">مغلقة</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Sort By */}
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-[160px] h-10 rounded-xl border-slate-200">
                                        <SortAsc className="h-4 w-4 ms-2 text-slate-500" aria-hidden="true" />
                                        <SelectValue placeholder="ترتيب حسب" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="lastMessage">آخر رسالة</SelectItem>
                                        <SelectItem value="unread">غير مقروءة</SelectItem>
                                        <SelectItem value="name">الاسم</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Clear Filters */}
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

                        {/* CONVERSATIONS LIST */}
                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                            <div className="p-6 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-navy text-xl">المحادثات</h3>
                                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                                    {conversations.length} محادثة
                                </Badge>
                            </div>

                            <div className="p-4 space-y-4">
                                {/* Loading State */}
                                {isLoading && (
                                    <>
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100 animate-pulse">
                                                <div className="flex gap-4 mb-4">
                                                    <Skeleton className="w-14 h-14 rounded-xl" />
                                                    <div className="flex-1 space-y-2">
                                                        <Skeleton className="h-5 w-1/3" />
                                                        <Skeleton className="h-4 w-2/3" />
                                                    </div>
                                                </div>
                                                <Skeleton className="h-12 w-full" />
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
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">خطأ في تحميل المحادثات</h3>
                                        <p className="text-slate-500 mb-4">{error?.message || 'حدث خطأ في الاتصال'}</p>
                                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                                            إعادة المحاولة
                                        </Button>
                                    </div>
                                )}

                                {/* Empty State */}
                                {!isLoading && !isError && conversations.length === 0 && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                                <MessageSquare className="w-8 h-8 text-emerald-500" aria-hidden="true" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد محادثات</h3>
                                        <p className="text-slate-500 mb-4">ابدأ محادثة جديدة مع عميل عبر واتساب</p>
                                        <Button asChild className="bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20">
                                            <Link to="/dashboard/crm/whatsapp/new">
                                                <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                                                محادثة جديدة
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {/* Success State - Conversations List */}
                                {!isLoading && !isError && conversations.map((conversation, index) => (
                                    <div
                                        key={conversation.id}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                        className={`
                                            bg-[#F8F9FA] rounded-2xl p-5 border transition-all duration-200 group cursor-pointer
                                            animate-in fade-in slide-in-from-bottom-2
                                            hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/5
                                            ${selectedIds.includes(conversation.id)
                                                ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20'
                                                : 'border-slate-100 hover:border-emerald-200'
                                            }
                                        `}
                                        onClick={() => !isSelectionMode && handleViewConversation(conversation.id)}
                                    >
                                        {/* Status Strip */}
                                        <div className={`absolute top-0 bottom-0 start-0 w-1.5 rounded-s-2xl ${
                                            conversation.unreadCount > 0 ? 'bg-emerald-500' :
                                            conversation.status === 'pending' ? 'bg-amber-500' :
                                            conversation.status === 'closed' ? 'bg-slate-400' :
                                            'bg-blue-500'
                                        }`} />

                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex gap-4 items-center">
                                                {isSelectionMode && (
                                                    <Checkbox
                                                        checked={selectedIds.includes(conversation.id)}
                                                        onCheckedChange={() => handleSelectConversation(conversation.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                    />
                                                )}
                                                {/* Avatar */}
                                                <div className="relative">
                                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold text-lg">
                                                        {conversation.clientName.charAt(0)}
                                                    </div>
                                                    {conversation.unreadCount > 0 && (
                                                        <div className="absolute -top-1 -end-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                                                            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-navy text-lg truncate">{conversation.clientName}</h4>
                                                        {getStatusBadge(conversation.status)}
                                                    </div>
                                                    <p className="text-slate-500 text-sm flex items-center gap-1.5">
                                                        <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                                                        {conversation.phoneNumber}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-400 font-medium">{conversation.relativeTime}</span>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-navy opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem onClick={() => handleViewConversation(conversation.id)}>
                                                            <Eye className="h-4 w-4 ms-2" aria-hidden="true" />
                                                            فتح المحادثة
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <User className="h-4 w-4 ms-2" aria-hidden="true" />
                                                            عرض بيانات العميل
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Tag className="h-4 w-4 ms-2" aria-hidden="true" />
                                                            إضافة وسم
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem>
                                                            <Archive className="h-4 w-4 ms-2 text-amber-500" aria-hidden="true" />
                                                            أرشفة المحادثة
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                                            <Trash2 className="h-4 w-4 ms-2" aria-hidden="true" />
                                                            حذف المحادثة
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>

                                        {/* Last Message Preview */}
                                        <div className="bg-white rounded-xl p-3 border border-slate-100">
                                            <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                                                {conversation.lastMessage}
                                            </p>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                                            <div className="flex items-center gap-3">
                                                {conversation.assignedTo && (
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        <User className="h-3.5 w-3.5" aria-hidden="true" />
                                                        <span>{conversation.assignedTo}</span>
                                                    </div>
                                                )}
                                                {conversation.tags.length > 0 && (
                                                    <div className="flex gap-1">
                                                        {conversation.tags.slice(0, 2).map((tag: string, i: number) => (
                                                            <Badge key={i} variant="secondary" className="text-xs px-2 py-0 bg-slate-100 text-slate-600 rounded-md">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                        {conversation.tags.length > 2 && (
                                                            <Badge variant="secondary" className="text-xs px-2 py-0 bg-slate-100 text-slate-600 rounded-md">
                                                                +{conversation.tags.length - 2}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* View Button - Desktop */}
                                            <Button
                                                size="sm"
                                                className="hidden sm:flex bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white rounded-lg px-4 h-8 transition-all shadow-none hover:shadow-lg hover:shadow-emerald-500/20"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleViewConversation(conversation.id)
                                                }}
                                            >
                                                <Eye className="h-4 w-4 ms-1.5" aria-hidden="true" />
                                                فتح
                                            </Button>

                                            {/* Chevron - Mobile */}
                                            <ChevronLeft className="h-5 w-5 text-slate-400 sm:hidden rtl:rotate-180" aria-hidden="true" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* View All Button */}
                            {conversations.length > 0 && (
                                <div className="p-4 pt-0 text-center">
                                    <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-full rounded-xl py-6">
                                        عرض جميع المحادثات
                                        <ChevronLeft className="h-4 w-4 me-2 rtl:rotate-180" aria-hidden="true" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* BROADCAST CAMPAIGNS */}
                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                            <div className="p-6 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-navy text-lg flex items-center gap-2">
                                    <Megaphone className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                                    حملات البث
                                </h3>
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-blue-100 text-blue-700 border-0 rounded-full px-3 py-0.5 text-xs">
                                        {broadcasts.length} حملة
                                    </Badge>
                                    <Button asChild size="sm" className="bg-emerald-500 hover:bg-emerald-600 rounded-lg h-8 px-3 text-xs">
                                        <Link to="/dashboard/crm/whatsapp/new">
                                            <Plus className="h-3.5 w-3.5 ms-1" aria-hidden="true" />
                                            حملة جديدة
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            <div className="p-4 space-y-3">
                                {broadcasts.length === 0 ? (
                                    <div className="text-center py-8 bg-[#F8F9FA] rounded-xl border border-slate-100">
                                        <Megaphone className="h-10 w-10 mx-auto mb-3 text-slate-300" aria-hidden="true" />
                                        <p className="text-slate-500 text-sm mb-2">لا توجد حملات بث</p>
                                        <p className="text-slate-400 text-xs mb-4">أنشئ حملة بث جديدة للتواصل مع عملائك</p>
                                        <Button asChild size="sm" className="bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20">
                                            <Link to="/dashboard/crm/whatsapp/new">
                                                <Plus className="h-4 w-4 ms-2" aria-hidden="true" />
                                                إنشاء حملة
                                            </Link>
                                        </Button>
                                    </div>
                                ) : (
                                    broadcasts.map((broadcast) => (
                                        <div
                                            key={broadcast.id}
                                            className="bg-[#F8F9FA] rounded-xl p-4 border border-slate-100 hover:border-emerald-200 transition-all"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                                        <Megaphone className="h-5 w-5 text-white" aria-hidden="true" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-navy text-sm">{broadcast.name}</h4>
                                                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                            <Users className="h-3 w-3" aria-hidden="true" />
                                                            {broadcast.stats?.totalRecipients || 0} مستلم
                                                        </p>
                                                    </div>
                                                </div>
                                                {getBroadcastStatusBadge(broadcast.status)}
                                            </div>

                                            {/* Stats */}
                                            {broadcast.stats && broadcast.status !== 'draft' && (
                                                <div className="grid grid-cols-4 gap-2 mb-3">
                                                    <div className="text-center p-2 bg-white rounded-lg">
                                                        <p className="text-sm font-bold text-navy">{broadcast.stats.sent}</p>
                                                        <p className="text-[10px] text-slate-500">مرسل</p>
                                                    </div>
                                                    <div className="text-center p-2 bg-white rounded-lg">
                                                        <p className="text-sm font-bold text-emerald-600">{broadcast.stats.delivered}</p>
                                                        <p className="text-[10px] text-slate-500">تم التسليم</p>
                                                    </div>
                                                    <div className="text-center p-2 bg-white rounded-lg">
                                                        <p className="text-sm font-bold text-blue-600">{broadcast.stats.read}</p>
                                                        <p className="text-[10px] text-slate-500">مقروء</p>
                                                    </div>
                                                    <div className="text-center p-2 bg-white rounded-lg">
                                                        <p className="text-sm font-bold text-red-500">{broadcast.stats.failed}</p>
                                                        <p className="text-[10px] text-slate-500">فشل</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Footer */}
                                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    {broadcast.scheduledAt ? (
                                                        <>
                                                            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                                                            <span>مجدول: {format(new Date(broadcast.scheduledAt), 'd MMM yyyy', { locale: isRTL ? arSA : enUS })}</span>
                                                        </>
                                                    ) : broadcast.createdAt ? (
                                                        <>
                                                            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                                                            <span>{format(new Date(broadcast.createdAt), 'd MMM yyyy', { locale: isRTL ? arSA : enUS })}</span>
                                                        </>
                                                    ) : null}
                                                </div>
                                                {broadcast.status === 'draft' && (
                                                    <Button size="sm" className="h-7 text-xs bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white rounded-lg">
                                                        <Send className="h-3 w-3 ms-1" aria-hidden="true" />
                                                        إرسال
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* TEMPLATES QUICK ACCESS */}
                        {templates.length > 0 && (
                            <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                                <div className="p-6 pb-2 flex justify-between items-center">
                                    <h3 className="font-bold text-navy text-lg">القوالب السريعة</h3>
                                    <Badge className="bg-emerald-100 text-emerald-700 border-0 rounded-full px-3 py-0.5 text-xs">
                                        {templates.length} قالب
                                    </Badge>
                                </div>

                                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {templates.map((template) => (
                                        <div
                                            key={template.id}
                                            className="bg-[#F8F9FA] rounded-xl p-4 border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="font-bold text-navy text-sm mb-1">{template.name}</h4>
                                                    <p className="text-xs text-slate-500">{template.category}</p>
                                                </div>
                                                <Badge className={`text-xs rounded-md ${
                                                    template.status === 'approved'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {template.status === 'approved' ? 'موافق عليه' : template.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* LEFT COLUMN (Sidebar) */}
                    <SalesSidebar
                        context="whatsapp"
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
