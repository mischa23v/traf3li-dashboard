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
import { useWhatsAppConversations, useWhatsAppTemplates } from '@/hooks/useCrmAdvanced'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Search, Bell, AlertCircle, MessageSquare, Plus, MoreHorizontal, ChevronLeft, Eye, Trash2, SortAsc, Filter, X, MessageCircle, Clock, CheckCheck, Check, Phone, Mail, User } from 'lucide-react'
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

export function WhatsAppListView() {
    const navigate = useNavigate()
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [assignedFilter, setAssignedFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('lastMessage')

    // API Filters
    const filters = useMemo(() => {
        const f: any = {}

        // Status filter
        if (statusFilter !== 'all') {
            f.status = statusFilter
        }

        // Assigned filter
        if (assignedFilter !== 'all') {
            f.assigned = assignedFilter === 'assigned'
        }

        // Search
        if (searchQuery.trim()) {
            f.search = searchQuery.trim()
        }

        // Sort
        if (sortBy === 'lastMessage') {
            f.sortBy = 'lastMessageAt'
            f.sortOrder = 'desc'
        } else if (sortBy === 'unread') {
            f.sortBy = 'unreadCount'
            f.sortOrder = 'desc'
        }

        return f
    }, [statusFilter, assignedFilter, searchQuery, sortBy])

    // Check if any filter is active
    const hasActiveFilters = searchQuery || statusFilter !== 'all' || assignedFilter !== 'all'

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('')
        setStatusFilter('all')
        setAssignedFilter('all')
    }

    // Fetch data
    const { data: conversationsData, isLoading, isError, error, refetch } = useWhatsAppConversations(filters)
    const { data: templatesData } = useWhatsAppTemplates()

    // Helper function to format dates in both languages
    const formatDualDate = (dateString: string | null | undefined) => {
        if (!dateString) return { arabic: 'غير محدد', english: 'Not set' }
        const date = new Date(dateString)
        return {
            arabic: format(date, 'd MMMM yyyy - h:mm a', { locale: arSA }),
            english: format(date, 'MMM d, yyyy - h:mm a')
        }
    }

    // Transform API data
    const conversations = useMemo(() => {
        if (!conversationsData?.conversations) return []

        return conversationsData.conversations.map((conversation: any) => ({
            id: conversation._id,
            clientName: conversation.contact?.name || conversation.phoneNumber || 'غير محدد',
            phoneNumber: conversation.phoneNumber,
            lastMessage: conversation.lastMessage?.content || 'لا توجد رسائل',
            lastMessageAt: conversation.lastMessageAt,
            lastMessageFormatted: formatDualDate(conversation.lastMessageAt),
            unreadCount: conversation.unreadCount || 0,
            status: conversation.status || 'open',
            assignedTo: conversation.assignedTo?.name || null,
            tags: conversation.tags || [],
        }))
    }, [conversationsData])

    // Transform templates data
    const templates = useMemo(() => {
        if (!templatesData?.templates) return []
        return templatesData.templates.slice(0, 5).map((template: any) => ({
            id: template._id,
            name: template.name,
            category: template.category,
            status: template.status,
            language: template.language,
        }))
    }, [templatesData])

    // Selection Handlers
    const handleToggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode)
        setSelectedIds([])
    }

    const handleSelectConversation = (conversationId: string) => {
        if (selectedIds.includes(conversationId)) {
            setSelectedIds(selectedIds.filter(id => id !== conversationId))
        } else {
            setSelectedIds([...selectedIds, conversationId])
        }
    }

    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) return

        if (confirm(`هل أنت متأكد من حذف ${selectedIds.length} محادثة؟`)) {
            // TODO: Implement bulk delete
            setIsSelectionMode(false)
            setSelectedIds([])
        }
    }

    // Single conversation actions
    const handleViewConversation = (conversationId: string) => {
        navigate({ to: '/dashboard/crm/whatsapp/$conversationId', params: { conversationId } })
    }

    const handleDeleteConversation = (conversationId: string) => {
        if (confirm('هل أنت متأكد من حذف هذه المحادثة؟')) {
            // TODO: Implement delete
        }
    }

    // Status badge styling
    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            open: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            pending: 'bg-amber-100 text-amber-700 border-amber-200',
            resolved: 'bg-blue-100 text-blue-700 border-blue-200',
            closed: 'bg-slate-100 text-slate-700 border-slate-200',
        }
        const labels: Record<string, string> = {
            open: 'مفتوح',
            pending: 'قيد الانتظار',
            resolved: 'محلول',
            closed: 'مغلق',
        }
        return <Badge className={`${styles[status] || styles.open} border-0 rounded-md px-2`}>{labels[status] || status}</Badge>
    }

    // Message status icon
    const getMessageStatusIcon = (unreadCount: number) => {
        if (unreadCount > 0) {
            return <MessageCircle className="h-4 w-4 text-emerald-500" aria-hidden="true" />
        }
        return <CheckCheck className="h-4 w-4 text-slate-400" aria-hidden="true" />
    }

    // Stats for hero
    const heroStats = useMemo(() => {
        if (!conversationsData) return undefined
        const total = conversationsData.total || 0
        const unread = conversations.filter(c => c.unreadCount > 0).length
        const open = conversations.filter(c => c.status === 'open').length
        const templates = templatesData?.templates?.length || 0

        return [
            { label: 'إجمالي المحادثات', value: total, icon: MessageSquare, status: 'normal' as const },
            { label: 'غير مقروءة', value: unread, icon: MessageCircle, status: unread > 0 ? 'attention' as const : 'zero' as const },
            { label: 'مفتوحة', value: open, icon: Clock, status: 'normal' as const },
            { label: 'القوالب', value: templates, icon: MessageSquare, status: 'normal' as const },
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
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

                {/* Dynamic Island - Centered */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>

                <div className='ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0'>
                    <div className="relative hidden md:block min-w-0">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                        <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                </div>
                {/* Bottom Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* HERO CARD & STATS */}
                <ProductivityHero badge="المبيعات" title="تكامل واتساب" type="whatsapp" stats={heroStats} />

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
                                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                                        <Input
                                            type="text"
                                            placeholder="بحث بالاسم أو رقم الهاتف..."
                                            aria-label="بحث بالاسم أو رقم الهاتف"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pe-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                        />
                                    </div>

                                    {/* Status Filter */}
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[130px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="الحالة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">كل الحالات</SelectItem>
                                            <SelectItem value="open">مفتوح</SelectItem>
                                            <SelectItem value="pending">قيد الانتظار</SelectItem>
                                            <SelectItem value="resolved">محلول</SelectItem>
                                            <SelectItem value="closed">مغلق</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Assigned Filter */}
                                    <Select value={assignedFilter} onValueChange={setAssignedFilter}>
                                        <SelectTrigger className="w-[140px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="التعيين" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">الكل</SelectItem>
                                            <SelectItem value="assigned">معين</SelectItem>
                                            <SelectItem value="unassigned">غير معين</SelectItem>
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
                                            <SelectItem value="lastMessage">آخر رسالة</SelectItem>
                                            <SelectItem value="unread">غير مقروءة</SelectItem>
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

                        {/* MAIN CONVERSATIONS LIST */}
                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                            <div className="p-6 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-navy text-xl">قائمة المحادثات</h3>
                                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                                    {conversations.length} محادثة
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
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل المحادثات</h3>
                                        <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
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
                                        <p className="text-slate-500 mb-4">ابدأ محادثة جديدة مع عميل</p>
                                        <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                                            <Link to="/dashboard/crm/whatsapp/new">
                                                <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                                                محادثة جديدة
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {/* Success State - Conversations List */}
                                {!isLoading && !isError && conversations.map((conversation) => (
                                    <div key={conversation.id} className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group ${selectedIds.includes(conversation.id) ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-4 items-center">
                                                {isSelectionMode && (
                                                    <Checkbox
                                                        checked={selectedIds.includes(conversation.id)}
                                                        onCheckedChange={() => handleSelectConversation(conversation.id)}
                                                        className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                    />
                                                )}
                                                <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm text-emerald-600 font-bold text-lg">
                                                    <MessageCircle className="w-7 h-7" aria-hidden="true" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-navy text-lg">{conversation.clientName}</h4>
                                                        {getStatusBadge(conversation.status)}
                                                        {conversation.unreadCount > 0 && (
                                                            <Badge className="bg-emerald-500 text-white border-0 rounded-full px-2 py-0.5 text-xs">
                                                                {conversation.unreadCount}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-500 text-sm flex items-center gap-1">
                                                        <Phone className="h-3 w-3" aria-hidden="true" />
                                                        {conversation.phoneNumber}
                                                    </p>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-navy" aria-label="خيارات">
                                                        <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => handleViewConversation(conversation.id)}>
                                                        <Eye className="h-4 w-4 ms-2" aria-hidden="true" />
                                                        عرض المحادثة
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteConversation(conversation.id)}
                                                        className="text-red-600 focus:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 ms-2" aria-hidden="true" />
                                                        حذف المحادثة
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                            <div className="flex items-center gap-6">
                                                {/* Last Message */}
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    {getMessageStatusIcon(conversation.unreadCount)}
                                                    <span className="max-w-[300px] truncate">{conversation.lastMessage}</span>
                                                </div>
                                                {/* Time */}
                                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                                    <Clock className="h-3 w-3" aria-hidden="true" />
                                                    {conversation.lastMessageFormatted.arabic}
                                                </div>
                                            </div>
                                            <Link to={`/dashboard/crm/whatsapp/${conversation.id}` as any}>
                                                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20">
                                                    فتح المحادثة
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 pt-0 text-center">
                                <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-full rounded-xl py-6">
                                    عرض جميع المحادثات
                                    <ChevronLeft className="h-4 w-4 me-2" aria-hidden="true" />
                                </Button>
                            </div>
                        </div>

                        {/* TEMPLATES SECTION */}
                        {templates.length > 0 && (
                            <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                                <div className="p-6 pb-2 flex justify-between items-center">
                                    <h3 className="font-bold text-navy text-xl">قوالب الرسائل</h3>
                                    <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                                        {templates.length} قالب
                                    </Badge>
                                </div>

                                <div className="p-4 space-y-3">
                                    {templates.map((template) => (
                                        <div key={template.id} className="bg-[#F8F9FA] rounded-xl p-4 border border-slate-100 hover:border-emerald-200 transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm text-emerald-600">
                                                        <MessageSquare className="w-5 h-5" aria-hidden="true" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-navy text-sm">{template.name}</h4>
                                                        <p className="text-xs text-slate-500">{template.category}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                    {template.status === 'approved' ? 'موافق عليه' : template.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-4 pt-0 text-center">
                                    <Button asChild variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-full rounded-xl py-4">
                                        <Link to="/dashboard/crm/whatsapp/templates">
                                            عرض جميع القوالب
                                            <ChevronLeft className="h-4 w-4 me-2" aria-hidden="true" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* LEFT COLUMN (Widgets) */}
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
