import { useState, useMemo } from 'react'
import { TasksSidebar } from './tasks-sidebar'
import {
    Clock, MoreHorizontal, Plus,
    Calendar as CalendarIcon, Search, AlertCircle, ChevronLeft, Bell,
    Eye, Trash2, CheckCircle, XCircle, UserPlus, Loader2, SortAsc, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link, useNavigate } from '@tanstack/react-router'
import { useReminders, useDeleteReminder, useCompleteReminder, useDismissReminder, useSnoozeReminder, useDelegateReminder, useReminderStats, useUpdateReminder } from '@/hooks/useRemindersAndEvents'
import { useTeamMembers } from '@/hooks/useCasesAndClients'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { StatCard } from '@/components/stat-card'
import { ProductivityHero } from '@/components/productivity-hero'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'

const SNOOZE_OPTIONS = [
    { value: 15, label: '15 دقيقة' },
    { value: 30, label: '30 دقيقة' },
    { value: 60, label: 'ساعة واحدة' },
    { value: 180, label: '3 ساعات' },
    { value: 1440, label: 'يوم واحد' },
    { value: 10080, label: 'أسبوع' },
]

export function RemindersView() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('upcoming')
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedReminderIds, setSelectedReminderIds] = useState<string[]>([])

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [priorityFilter, setPriorityFilter] = useState<string>('all')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('reminderDateTime')

    // API filters - use date-based filters that backend supports
    const filters = useMemo(() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayStr = today.toISOString().split('T')[0]
        const f: any = {}

        if (activeTab === 'upcoming') {
            f.startDate = todayStr
        } else if (activeTab === 'past') {
            f.endDate = todayStr
        }

        if (searchQuery.trim()) {
            f.search = searchQuery.trim()
        }

        if (priorityFilter !== 'all') {
            f.priority = priorityFilter
        }

        if (typeFilter !== 'all') {
            f.reminderType = typeFilter
        }

        if (sortBy) {
            f.sortBy = sortBy
            f.sortOrder = sortBy === 'priority' ? 'desc' : 'asc'
        }

        return f
    }, [activeTab, searchQuery, priorityFilter, typeFilter, sortBy])

    // Check if any filter is active
    const hasActiveFilters = searchQuery || priorityFilter !== 'all' || typeFilter !== 'all'

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('')
        setPriorityFilter('all')
        setTypeFilter('all')
    }

    // Helper function to format dates in both languages
    const formatDualDate = (dateString: string | null | undefined) => {
        if (!dateString) return { arabic: 'غير محدد', english: 'Not set' }
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return { arabic: 'غير محدد', english: 'Not set' }
        return {
            arabic: format(date, 'd MMMM', { locale: arSA }),
            english: format(date, 'MMM d, yyyy')
        }
    }

    // Fetch reminders
    const { data: remindersData, isLoading, isError, error, refetch } = useReminders(filters)
    const { data: stats } = useReminderStats()
    const { mutateAsync: deleteReminder } = useDeleteReminder()
    const completeReminderMutation = useCompleteReminder()
    const dismissReminderMutation = useDismissReminder()
    const snoozeReminderMutation = useSnoozeReminder()
    const delegateReminderMutation = useDelegateReminder()
    const updateReminderMutation = useUpdateReminder()

    // Team members for delegation
    const { data: teamMembers } = useTeamMembers()

    // Confirm dialog states
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)
    const [reminderToDelete, setReminderToDelete] = useState<string | null>(null)

    // Delegate dialog state
    const [delegateReminderId, setDelegateReminderId] = useState<string | null>(null)
    const [delegateTo, setDelegateTo] = useState('')
    const [delegateNote, setDelegateNote] = useState('')

    // Single reminder actions
    const handleViewReminder = (reminderId: string) => {
        navigate({ to: '/dashboard/tasks/reminders/$reminderId', params: { reminderId } })
    }

    const handleDeleteReminder = (reminderId: string) => {
        setReminderToDelete(reminderId)
        setShowDeleteConfirm(true)
    }

    const confirmDeleteReminder = async () => {
        if (reminderToDelete) {
            try {
                await deleteReminder(reminderToDelete)
                toast.success('تم حذف التذكير بنجاح')
                setShowDeleteConfirm(false)
                setReminderToDelete(null)
            } catch (error) {
                toast.error('فشل حذف التذكير')
            }
        }
    }

    const handleCompleteReminder = (reminderId: string) => {
        completeReminderMutation.mutate(reminderId)
    }

    const handleDismissReminder = (reminderId: string) => {
        dismissReminderMutation.mutate(reminderId)
    }

    const handleSnoozeReminder = (reminderId: string, duration: number) => {
        snoozeReminderMutation.mutate({ id: reminderId, duration })
    }

    const handleDelegateReminder = () => {
        if (!delegateReminderId || !delegateTo) return
        delegateReminderMutation.mutate(
            { id: delegateReminderId, delegateTo, note: delegateNote || undefined },
            {
                onSuccess: () => {
                    setDelegateReminderId(null)
                    setDelegateTo('')
                    setDelegateNote('')
                }
            }
        )
    }

    const handlePriorityChange = (reminderId: string, priority: string) => {
        updateReminderMutation.mutate({ id: reminderId, data: { priority: priority as 'low' | 'medium' | 'high' | 'critical' } })
    }

    // Transform API data
    const reminders = useMemo(() => {
        if (!remindersData?.data) return []

        return remindersData.data.map((reminder: any) => {
            const reminderDate = reminder.reminderDateTime || reminder.reminderDate
            return {
                id: reminder._id,
                title: reminder.title || reminder.description || 'تذكير بدون عنوان',
                date: reminderDate ? new Date(reminderDate).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'غير محدد',
                time: reminderDate ? new Date(reminderDate).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'غير محدد',
                priority: reminder.priority || 'medium',
                status: reminder.status || 'pending',
                reminderType: reminder.reminderType || reminder.type || 'general',
                createdAt: reminder.createdAt,
                reminderDateTime: reminderDate,
                reminderDateFormatted: formatDualDate(reminderDate),
                createdAtFormatted: formatDualDate(reminder.createdAt),
                _id: reminder._id,
            }
        })
    }, [remindersData])

    // Selection Handlers
    const handleToggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode)
        setSelectedReminderIds([])
    }

    const handleSelectReminder = (id: string) => {
        if (selectedReminderIds.includes(id)) {
            setSelectedReminderIds(selectedReminderIds.filter(itemId => itemId !== id))
        } else {
            setSelectedReminderIds([...selectedReminderIds, id])
        }
    }

    const handleDeleteSelected = () => {
        if (selectedReminderIds.length === 0) return
        setShowBulkDeleteConfirm(true)
    }

    const confirmBulkDelete = async () => {
        try {
            await Promise.all(selectedReminderIds.map(id => deleteReminder(id)))
            toast.success(`تم حذف ${selectedReminderIds.length} تذكير بنجاح`)
            setIsSelectionMode(false)
            setSelectedReminderIds([])
            setShowBulkDeleteConfirm(false)
        } catch (error) {
            console.error("Failed to delete reminders", error)
            toast.error("حدث خطأ أثناء حذف بعض التذكيرات")
        }
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'المهام', href: '/dashboard/tasks/list', isActive: false },
        { title: 'التذكيرات', href: '/dashboard/tasks/reminders', isActive: true },
        { title: 'الأحداث', href: '/dashboard/tasks/events', isActive: false },
    ]

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
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy" aria-hidden="true"></span>
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
                <ProductivityHero badge="التذكيرات" title="التذكيرات" type="reminders" />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* FILTERS BAR */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Search Input */}
                                <div className="relative flex-1 min-w-[200px] max-w-md">
                                    <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    <Input
                                        type="text"
                                        placeholder="بحث في التذكيرات..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pe-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                    />
                                </div>

                                {/* Status Filter */}
                                <Select value={activeTab} onValueChange={setActiveTab}>
                                    <SelectTrigger className="w-[130px] h-10 rounded-xl border-slate-200">
                                        <SelectValue placeholder="الحالة" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="upcoming">القادمة</SelectItem>
                                        <SelectItem value="past">السابقة</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Priority Filter */}
                                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                    <SelectTrigger className="w-[130px] h-10 rounded-xl border-slate-200">
                                        <SelectValue placeholder="الأولوية" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">كل الأولويات</SelectItem>
                                        <SelectItem value="critical">عاجلة جداً</SelectItem>
                                        <SelectItem value="high">عالية</SelectItem>
                                        <SelectItem value="medium">متوسطة</SelectItem>
                                        <SelectItem value="low">منخفضة</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Type Filter */}
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-[150px] h-10 rounded-xl border-slate-200">
                                        <SelectValue placeholder="النوع" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">كل الأنواع</SelectItem>
                                        <SelectItem value="general">عام</SelectItem>
                                        <SelectItem value="court_hearing">جلسة محكمة</SelectItem>
                                        <SelectItem value="filing_deadline">موعد تقديم</SelectItem>
                                        <SelectItem value="payment_due">دفع مالي</SelectItem>
                                        <SelectItem value="follow_up">متابعة</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Sort By */}
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-[160px] h-10 rounded-xl border-slate-200">
                                        <SortAsc className="h-4 w-4 ml-2 text-slate-400" />
                                        <SelectValue placeholder="ترتيب حسب" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="reminderDateTime">تاريخ التذكير</SelectItem>
                                        <SelectItem value="priority">الأولوية</SelectItem>
                                        <SelectItem value="createdAt">تاريخ الإنشاء</SelectItem>
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
                                        <X className="h-4 w-4 ml-2" />
                                        مسح الفلاتر
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* MAIN REMINDERS LIST */}
                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                            <div className="p-6 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-navy text-xl">
                                    {activeTab === 'upcoming' ? 'التذكيرات القادمة' : 'التذكيرات السابقة'}
                                </h3>
                                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                                    {reminders.length} تذكير
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
                                    <Alert className="border-red-200 bg-red-50">
                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                        <AlertDescription className="text-red-800">
                                            <div className="flex items-center justify-between">
                                                <span>حدث خطأ أثناء تحميل التذكيرات: {error?.message || 'خطأ غير معروف'}</span>
                                                <Button onClick={() => refetch()} variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                                                    إعادة المحاولة
                                                </Button>
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Empty State */}
                                {!isLoading && !isError && reminders.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-4">
                                            <Bell className="h-8 w-8 text-emerald-500" />
                                        </div>
                                        <h4 className="text-lg font-bold text-navy mb-2">لا توجد تذكيرات</h4>
                                        <p className="text-slate-500 mb-4">أنت جاهز تماماً! لا توجد تذكيرات في الوقت الحالي.</p>
                                        <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
                                            <Link to="/dashboard/tasks/reminders/new">
                                                <Plus className="ml-2 h-4 w-4" />
                                                إضافة تذكير جديد
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {/* Success State */}
                                {!isLoading && !isError && reminders.map((reminder) => (
                                    <div key={reminder.id} className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group ${selectedReminderIds.includes(reminder.id) ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-4 items-center">
                                                {isSelectionMode && (
                                                    <Checkbox
                                                        checked={selectedReminderIds.includes(reminder.id)}
                                                        onCheckedChange={() => handleSelectReminder(reminder.id)}
                                                        className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                    />
                                                )}
                                                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-emerald-600">
                                                    <Bell className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-navy text-lg">{reminder.title}</h4>
                                                    </div>
                                                    <p className="text-slate-500 text-sm flex items-center gap-2">
                                                        <Clock className="h-3 w-3" />
                                                        {reminder.time}
                                                    </p>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-navy" aria-label="خيارات التذكير">
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => handleViewReminder(reminder.id)}>
                                                        <Eye className="h-4 w-4 ml-2" />
                                                        عرض التفاصيل
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {reminder.status !== 'completed' && (
                                                        <DropdownMenuItem onClick={() => handleCompleteReminder(reminder.id)}>
                                                            <CheckCircle className="h-4 w-4 ml-2" />
                                                            إكمال
                                                        </DropdownMenuItem>
                                                    )}
                                                    {reminder.status !== 'dismissed' && (
                                                        <DropdownMenuItem onClick={() => handleDismissReminder(reminder.id)}>
                                                            <XCircle className="h-4 w-4 ml-2" />
                                                            تجاهل
                                                        </DropdownMenuItem>
                                                    )}
                                                    {reminder.status !== 'completed' && reminder.status !== 'dismissed' && (
                                                        <DropdownMenuSub>
                                                            <DropdownMenuSubTrigger>
                                                                <Clock className="h-4 w-4 ml-2" />
                                                                تأجيل
                                                            </DropdownMenuSubTrigger>
                                                            <DropdownMenuSubContent>
                                                                {SNOOZE_OPTIONS.map((option) => (
                                                                    <DropdownMenuItem
                                                                        key={option.value}
                                                                        onClick={() => handleSnoozeReminder(reminder.id, option.value)}
                                                                    >
                                                                        {option.label}
                                                                    </DropdownMenuItem>
                                                                ))}
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuSub>
                                                    )}
                                                    {reminder.status !== 'completed' && reminder.status !== 'dismissed' && (
                                                        <DropdownMenuItem onClick={() => setDelegateReminderId(reminder.id)}>
                                                            <UserPlus className="h-4 w-4 ml-2" />
                                                            تفويض
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteReminder(reminder.id)}
                                                        className="text-red-600 focus:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 ml-2" />
                                                        حذف
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                            <div className="flex items-center gap-4">
                                                {/* Priority Dropdown */}
                                                <div>
                                                    <div className="text-xs text-slate-500 mb-1">الأولوية</div>
                                                    <Select
                                                        value={reminder.priority}
                                                        onValueChange={(value) => handlePriorityChange(reminder.id, value)}
                                                    >
                                                        <SelectTrigger className={`w-[100px] h-8 text-xs font-bold rounded-lg border-0 ${
                                                            reminder.priority === 'critical' ? 'bg-red-100 text-red-700' :
                                                            reminder.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                                            reminder.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-green-100 text-green-700'
                                                        }`}>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="critical">عاجلة جداً</SelectItem>
                                                            <SelectItem value="high">عالية</SelectItem>
                                                            <SelectItem value="medium">متوسطة</SelectItem>
                                                            <SelectItem value="low">منخفضة</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                {/* Reminder Date - Dual Language */}
                                                <div className="text-center">
                                                    <div className="text-xs text-slate-500 mb-1">موعد التذكير</div>
                                                    <div className="font-bold text-navy text-sm">{reminder.reminderDateFormatted.arabic}</div>
                                                    <div className="text-xs text-slate-500">{reminder.reminderDateFormatted.english}</div>
                                                </div>
                                                {/* Creation Date - Dual Language */}
                                                <div className="text-center">
                                                    <div className="text-xs text-slate-500 mb-1">تاريخ الإنشاء</div>
                                                    <div className="font-bold text-slate-600 text-sm">{reminder.createdAtFormatted.arabic}</div>
                                                    <div className="text-xs text-slate-500">{reminder.createdAtFormatted.english}</div>
                                                </div>
                                            </div>
                                            <Link to={`/dashboard/tasks/reminders/${reminder.id}` as any}>
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
                                    عرض جميع التذكيرات
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* LEFT COLUMN (Widgets) */}
                    <TasksSidebar
                        context="reminders"
                        isSelectionMode={isSelectionMode}
                        onToggleSelectionMode={handleToggleSelectionMode}
                        selectedCount={selectedReminderIds.length}
                        onDeleteSelected={handleDeleteSelected}
                    />
                </div>
            </Main>

            {/* Delegate Reminder Dialog */}
            <Dialog open={!!delegateReminderId} onOpenChange={(open) => !open && setDelegateReminderId(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>تفويض التذكير</DialogTitle>
                        <DialogDescription>
                            اختر الشخص الذي تريد تفويض التذكير إليه
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">تفويض إلى</label>
                            <Select value={delegateTo} onValueChange={setDelegateTo}>
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue placeholder="اختر عضو الفريق" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teamMembers && teamMembers.length > 0 ? (
                                        teamMembers.map((member) => (
                                            <SelectItem key={member._id} value={member._id}>
                                                {member.firstName} {member.lastName}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 text-slate-500 text-sm">
                                            لا يوجد أعضاء فريق
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">ملاحظة (اختياري)</label>
                            <Textarea
                                placeholder="أضف ملاحظة للتفويض..."
                                value={delegateNote}
                                onChange={(e) => setDelegateNote(e.target.value)}
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDelegateReminderId(null)}>
                            إلغاء
                        </Button>
                        <Button
                            onClick={handleDelegateReminder}
                            disabled={!delegateTo || delegateReminderMutation.isPending}
                            className="bg-emerald-500 hover:bg-emerald-600"
                        >
                            {delegateReminderMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                                    جاري التفويض...
                                </>
                            ) : (
                                'تفويض'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Single Reminder Confirmation Dialog */}
            <ConfirmDialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
                title="حذف التذكير"
                desc="هل أنت متأكد من حذف هذا التذكير؟ لا يمكن التراجع عن هذا الإجراء."
                confirmText="حذف"
                cancelBtnText="إلغاء"
                destructive
                handleConfirm={confirmDeleteReminder}
            />

            {/* Bulk Delete Confirmation Dialog */}
            <ConfirmDialog
                open={showBulkDeleteConfirm}
                onOpenChange={setShowBulkDeleteConfirm}
                title="حذف التذكيرات المحددة"
                desc={`هل أنت متأكد من حذف ${selectedReminderIds.length} تذكير؟ لا يمكن التراجع عن هذا الإجراء.`}
                confirmText="حذف الكل"
                cancelBtnText="إلغاء"
                destructive
                handleConfirm={confirmBulkDelete}
            />
        </>
    )
}
