import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TasksSidebar } from './tasks-sidebar'
import {
    Calendar as CalendarIcon, MoreHorizontal, Plus,
    MapPin, Clock, Search, AlertCircle, ChevronLeft, Bell, Users,
    CalendarCheck, CalendarPlus, CalendarRange, Eye, Trash2, CheckCircle, XCircle, CalendarClock,
    SortAsc, X
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
import { useEvents, useDeleteEvent, useRSVPEvent, useCompleteEvent, useCancelEvent, usePostponeEvent, useEventStats } from '@/hooks/useRemindersAndEvents'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { StatCard } from '@/components/stat-card'
import { ProductivityHero } from '@/components/productivity-hero'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'

export function EventsView() {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('upcoming')
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedEventIds, setSelectedEventIds] = useState<string[]>([])

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('startDate')

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

        if (typeFilter !== 'all') {
            f.type = typeFilter
        }

        if (sortBy) {
            f.sortBy = sortBy
            f.sortOrder = 'asc'
        }

        return f
    }, [activeTab, searchQuery, typeFilter, sortBy])

    // Check if any filter is active
    const hasActiveFilters = searchQuery || typeFilter !== 'all'

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('')
        setTypeFilter('all')
    }

    // Helper function to format dates based on current locale
    const formatDualDate = (dateString: string | null | undefined) => {
        if (!dateString) return { arabic: t('events.list.notSet'), english: t('events.list.notSet') }
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return { arabic: t('events.list.notSet'), english: t('events.list.notSet') }
        return {
            arabic: format(date, 'd MMMM', { locale: arSA }),
            english: format(date, 'MMM d, yyyy', { locale: enUS })
        }
    }

    // Fetch events
    const { data: eventsData, isLoading, isError, error, refetch } = useEvents(filters)
    const { data: stats } = useEventStats()
    const { mutateAsync: deleteEvent } = useDeleteEvent()
    const { mutate: rsvpEvent } = useRSVPEvent()
    const completeEventMutation = useCompleteEvent()
    const cancelEventMutation = useCancelEvent()
    const postponeEventMutation = usePostponeEvent()

    // Postpone dialog state
    const [postponeEventId, setPostponeEventId] = useState<string | null>(null)
    const [postponeDate, setPostponeDate] = useState('')
    const [postponeTime, setPostponeTime] = useState('')
    const [postponeReason, setPostponeReason] = useState('')

    // Transform API data
    const events = useMemo(() => {
        if (!eventsData?.events) return []

        return eventsData.events.map((event: any) => {
            // Handle different date field names from API
            const eventDate = event.startDate || event.startDateTime || event.date
            const parsedDate = eventDate ? new Date(eventDate) : null

            return {
                id: event._id,
                title: event.title || 'حدث بدون عنوان',
                date: parsedDate ? parsedDate.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'غير محدد',
                time: parsedDate ? parsedDate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : (event.time || 'غير محدد'),
                location: typeof event.location === 'string' ? event.location : (event.location?.name || event.location?.address || 'عن بعد'),
                type: event.type || 'meeting',
                status: event.status || 'scheduled',
                attendees: event.attendees?.length || 0,
                startDateTime: eventDate,
                createdAt: event.createdAt,
                eventDateFormatted: formatDualDate(eventDate),
                createdAtFormatted: formatDualDate(event.createdAt),
                _id: event._id,
            }
        })
    }, [eventsData])

    // Single event actions
    const handleViewEvent = (eventId: string) => {
        navigate({ to: '/dashboard/tasks/events/$eventId', params: { eventId } })
    }

    const handleDeleteEvent = async (eventId: string) => {
        if (confirm('هل أنت متأكد من حذف هذا الحدث؟')) {
            try {
                await deleteEvent(eventId)
                toast.success('تم حذف الحدث بنجاح')
            } catch (error) {
                toast.error('فشل حذف الحدث')
            }
        }
    }

    const handleCompleteEvent = (eventId: string) => {
        completeEventMutation.mutate({ id: eventId })
    }

    const handleCancelEvent = (eventId: string) => {
        cancelEventMutation.mutate({ id: eventId })
    }

    const handlePostponeEvent = () => {
        if (!postponeEventId || !postponeDate || !postponeTime) return
        const newDateTime = new Date(`${postponeDate}T${postponeTime}:00`).toISOString()
        postponeEventMutation.mutate(
            { id: postponeEventId, newDateTime, reason: postponeReason || undefined },
            {
                onSuccess: () => {
                    setPostponeEventId(null)
                    setPostponeDate('')
                    setPostponeTime('')
                    setPostponeReason('')
                }
            }
        )
    }

    // Selection Handlers
    const handleToggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode)
        setSelectedEventIds([])
    }

    const handleSelectEvent = (id: string) => {
        if (selectedEventIds.includes(id)) {
            setSelectedEventIds(selectedEventIds.filter(itemId => itemId !== id))
        } else {
            setSelectedEventIds([...selectedEventIds, id])
        }
    }

    const handleDeleteSelected = async () => {
        if (selectedEventIds.length === 0) return

        if (confirm(t('events.list.deleteMultipleConfirm', { count: selectedEventIds.length }))) {
            try {
                await Promise.all(selectedEventIds.map(id => deleteEvent(id)))
                toast.success(t('events.toast.deleteSuccess', { count: selectedEventIds.length }))
                setIsSelectionMode(false)
                setSelectedEventIds([])
            } catch (error) {
                console.error("Failed to delete events", error)
                toast.error(t('events.toast.deleteError'))
            }
        }
    }

    const handleRSVP = (id: string, status: 'accepted' | 'declined') => {
        rsvpEvent({ id, status }, {
            onSuccess: () => {
                toast.success(status === 'accepted' ? t('events.toast.rsvpAccepted') : t('events.toast.rsvpDeclined'))
            }
        })
    }

    const topNav = [
        { title: t('events.nav.overview'), href: '/dashboard/overview', isActive: false },
        { title: t('events.nav.tasks'), href: '/dashboard/tasks/list', isActive: false },
        { title: t('events.nav.reminders'), href: '/dashboard/tasks/reminders', isActive: false },
        { title: t('events.nav.events'), href: '/dashboard/tasks/events', isActive: true },
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
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="text" placeholder={t('tasks.list.search')} className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
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
                <ProductivityHero badge={t('events.management')} title={t('events.title')} type="events" />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* FILTERS BAR */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Search Input */}
                                <div className="relative flex-1 min-w-[200px] max-w-md">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        type="text"
                                        placeholder={t('events.list.searchPlaceholder')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pe-10 h-10 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                                    />
                                </div>

                                {/* Status Filter */}
                                <Select value={activeTab} onValueChange={setActiveTab}>
                                    <SelectTrigger className="w-[130px] h-10 rounded-xl border-slate-200">
                                        <SelectValue placeholder={t('events.list.status')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="upcoming">{t('events.list.upcoming')}</SelectItem>
                                        <SelectItem value="past">{t('events.list.past')}</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Type Filter */}
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-[150px] h-10 rounded-xl border-slate-200">
                                        <SelectValue placeholder={t('events.list.type')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('events.list.allTypes')}</SelectItem>
                                        <SelectItem value="meeting">{t('events.list.meeting')}</SelectItem>
                                        <SelectItem value="court_hearing">{t('events.list.courtHearing')}</SelectItem>
                                        <SelectItem value="conference">{t('events.list.conference')}</SelectItem>
                                        <SelectItem value="webinar">{t('events.list.webinar')}</SelectItem>
                                        <SelectItem value="workshop">{t('events.list.workshop')}</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Sort By */}
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-[160px] h-10 rounded-xl border-slate-200">
                                        <SortAsc className="h-4 w-4 ms-2 text-slate-400" />
                                        <SelectValue placeholder={t('events.list.sortBy')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="startDate">{t('events.list.eventDate')}</SelectItem>
                                        <SelectItem value="createdAt">{t('events.list.creationDate')}</SelectItem>
                                        <SelectItem value="title">{t('events.list.name')}</SelectItem>
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
                                        <X className="h-4 w-4 ms-2" />
                                        {t('events.list.clearFilters')}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* MAIN EVENTS LIST */}
                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                            <div className="p-6 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-navy text-xl">
                                    {activeTab === 'upcoming' ? t('events.list.upcomingEvents') : t('events.list.pastEvents')}
                                </h3>
                                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                                    {t('events.list.eventCount', { count: events.length })}
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
                                                <span>{t('events.list.errorLoading')}: {error?.message || t('events.list.unknownError')}</span>
                                                <Button onClick={() => refetch()} variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                                                    {t('events.list.retry')}
                                                </Button>
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Empty State */}
                                {!isLoading && !isError && events.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                                            <CalendarIcon className="h-8 w-8 text-blue-500" />
                                        </div>
                                        <h4 className="text-lg font-bold text-navy mb-2">لا توجد فعاليات</h4>
                                        <p className="text-slate-500 mb-4">جدولك خالٍ حالياً. ابدأ بإضافة أحداث جديدة.</p>
                                        <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl">
                                            <Link to="/dashboard/tasks/events/new">
                                                <Plus className="ms-2 h-4 w-4" />
                                                إضافة حدث جديد
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {/* Success State */}
                                {!isLoading && !isError && events.map((event) => (
                                    <div key={event.id} className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group ${selectedEventIds.includes(event.id) ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 hover:border-blue-200'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-4 items-center">
                                                {isSelectionMode && (
                                                    <Checkbox
                                                        checked={selectedEventIds.includes(event.id)}
                                                        onCheckedChange={() => handleSelectEvent(event.id)}
                                                        className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                                    />
                                                )}
                                                <div className="w-16 h-16 rounded-2xl bg-white flex flex-col items-center justify-center shadow-sm border border-slate-100 text-center overflow-hidden">
                                                    <div className="bg-blue-500 text-white text-[10px] w-full py-0.5 font-bold">
                                                        {event.date && !isNaN(new Date(event.date).getTime()) ? new Date(event.date).toLocaleDateString('ar-SA', { month: 'short' }) : 'غير محدد'}
                                                    </div>
                                                    <div className="text-xl font-bold text-navy pt-1">
                                                        {event.date && !isNaN(new Date(event.date).getTime()) ? new Date(event.date).toLocaleDateString('en-US', { day: 'numeric' }) : '-'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-navy text-lg">{event.title}</h4>
                                                        <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">
                                                            {event.type}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-slate-500 text-sm">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {event.time}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {event.location}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy">
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => handleViewEvent(event.id)}>
                                                        <Eye className="h-4 w-4 ms-2" />
                                                        عرض التفاصيل
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {event.status !== 'completed' && (
                                                        <DropdownMenuItem onClick={() => handleCompleteEvent(event.id)}>
                                                            <CheckCircle className="h-4 w-4 ms-2" />
                                                            إكمال
                                                        </DropdownMenuItem>
                                                    )}
                                                    {event.status !== 'cancelled' && (
                                                        <DropdownMenuItem onClick={() => handleCancelEvent(event.id)}>
                                                            <XCircle className="h-4 w-4 ms-2" />
                                                            إلغاء
                                                        </DropdownMenuItem>
                                                    )}
                                                    {event.status !== 'completed' && event.status !== 'cancelled' && (
                                                        <DropdownMenuItem onClick={() => setPostponeEventId(event.id)}>
                                                            <CalendarClock className="h-4 w-4 ms-2" />
                                                            تأجيل
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteEvent(event.id)}
                                                        className="text-red-600 focus:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 ms-2" />
                                                        حذف
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                            <div className="flex items-center gap-4">
                                                {/* Attendees */}
                                                <div className="flex items-center gap-2">
                                                    <div className="flex -space-x-2">
                                                        {[...Array(Math.min(3, event.attendees))].map((_, i) => (
                                                            <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500">
                                                                <Users className="w-4 h-4" />
                                                            </div>
                                                        ))}
                                                        {event.attendees > 3 && (
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500">
                                                                +{event.attendees - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Event Date - Dual Language */}
                                                <div className="text-center">
                                                    <div className="text-xs text-slate-400 mb-1">موعد الحدث</div>
                                                    <div className="font-bold text-navy text-sm">{event.eventDateFormatted.arabic}</div>
                                                    <div className="text-xs text-slate-400">{event.eventDateFormatted.english}</div>
                                                </div>
                                                {/* Creation Date - Dual Language */}
                                                <div className="text-center">
                                                    <div className="text-xs text-slate-400 mb-1">تاريخ الإنشاء</div>
                                                    <div className="font-bold text-slate-600 text-sm">{event.createdAtFormatted.arabic}</div>
                                                    <div className="text-xs text-slate-400">{event.createdAtFormatted.english}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => handleRSVP(event.id, 'declined')} className="text-red-600 hover:bg-red-50 border-red-200">
                                                    اعتذار
                                                </Button>
                                                <Button size="sm" onClick={() => handleRSVP(event.id, 'accepted')} className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                                                    تأكيد الحضور
                                                </Button>
                                                <Link to={`/dashboard/tasks/events/${event.id}` as any}>
                                                    <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6 shadow-lg shadow-blue-500/20">
                                                        عرض التفاصيل
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 pt-0 text-center">
                                <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 w-full rounded-xl py-6">
                                    عرض جميع الفعاليات
                                    <ChevronLeft className="h-4 w-4 me-2" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* LEFT COLUMN (Widgets) */}
                    <TasksSidebar
                        context="events"
                        isSelectionMode={isSelectionMode}
                        onToggleSelectionMode={handleToggleSelectionMode}
                        selectedCount={selectedEventIds.length}
                        onDeleteSelected={handleDeleteSelected}
                    />
                </div>
            </Main>

            {/* Postpone Event Dialog */}
            <Dialog open={!!postponeEventId} onOpenChange={(open) => !open && setPostponeEventId(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>تأجيل الحدث</DialogTitle>
                        <DialogDescription>
                            حدد التاريخ والوقت الجديد للحدث
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">التاريخ الجديد</label>
                                <Input
                                    type="date"
                                    value={postponeDate}
                                    onChange={(e) => setPostponeDate(e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">الوقت الجديد</label>
                                <Input
                                    type="time"
                                    value={postponeTime}
                                    onChange={(e) => setPostponeTime(e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">سبب التأجيل (اختياري)</label>
                            <Textarea
                                placeholder="أدخل سبب التأجيل..."
                                value={postponeReason}
                                onChange={(e) => setPostponeReason(e.target.value)}
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPostponeEventId(null)}>
                            {t('events.postpone.cancel')}
                        </Button>
                        <Button
                            onClick={handlePostponeEvent}
                            disabled={!postponeDate || !postponeTime || postponeEventMutation.isPending}
                            className="bg-blue-500 hover:bg-blue-600"
                        >
                            {postponeEventMutation.isPending ? t('events.postpone.postponing') : t('events.postpone.postpone')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
