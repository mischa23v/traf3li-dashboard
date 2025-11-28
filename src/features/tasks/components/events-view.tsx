import { useState, useMemo } from 'react'
import { TasksSidebar } from './tasks-sidebar'
import {
    Calendar as CalendarIcon, MoreHorizontal, Plus,
    MapPin, Clock, Search, AlertCircle, ChevronLeft, Bell, Users
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
import { Link } from '@tanstack/react-router'
import { useEvents, useDeleteEvent, useRSVPEvent } from '@/hooks/useRemindersAndEvents'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

export function EventsView() {
    const [activeTab, setActiveTab] = useState('upcoming')
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedEventIds, setSelectedEventIds] = useState<string[]>([])

    // API filters
    const filters = useMemo(() => {
        const f: any = {}
        if (activeTab === 'upcoming') {
            f.upcoming = true
        } else if (activeTab === 'past') {
            f.past = true
        }
        return f
    }, [activeTab])

    // Fetch events
    const { data: eventsData, isLoading, isError, error, refetch } = useEvents(filters)
    const { mutateAsync: deleteEvent } = useDeleteEvent()
    const { mutate: rsvpEvent } = useRSVPEvent()

    // Transform API data
    const events = useMemo(() => {
        if (!eventsData?.events) return []

        return eventsData.events.map((event: any) => ({
            id: event._id,
            title: event.title || 'حدث بدون عنوان',
            date: event.startDate ? new Date(event.startDate).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'غير محدد',
            time: event.startDate ? new Date(event.startDate).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'غير محدد',
            location: event.location || 'عن بعد',
            type: event.type || 'meeting',
            status: event.status || 'scheduled',
            attendees: event.attendees?.length || 0,
            _id: event._id,
        }))
    }, [eventsData])

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

        if (confirm(`هل أنت متأكد من حذف ${selectedEventIds.length} حدث؟`)) {
            try {
                await Promise.all(selectedEventIds.map(id => deleteEvent(id)))
                toast.success(`تم حذف ${selectedEventIds.length} حدث بنجاح`)
                setIsSelectionMode(false)
                setSelectedEventIds([])
            } catch (error) {
                console.error("Failed to delete events", error)
                toast.error("حدث خطأ أثناء حذف بعض الأحداث")
            }
        }
    }

    const handleRSVP = (id: string, status: 'accepted' | 'declined') => {
        rsvpEvent({ id, status }, {
            onSuccess: () => {
                toast.success(status === 'accepted' ? 'تم تأكيد الحضور' : 'تم الاعتذار عن الحضور')
            }
        })
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'المهام', href: '/dashboard/tasks/list', isActive: false },
        { title: 'التذكيرات', href: '/dashboard/tasks/reminders', isActive: false },
        { title: 'الأحداث', href: '/dashboard/tasks/events', isActive: true },
    ]

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

                {/* HERO CARD */}
                <div className="bg-[#022c22] rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-emerald-900/20 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="relative z-10 max-w-lg">
                        <h2 className="text-3xl font-bold mb-4 leading-tight">جدول أعمالك وفعالياتك</h2>
                        <p className="text-emerald-200 text-lg mb-8 leading-relaxed">
                            نظم وقتك بفعالية. تابع اجتماعاتك وجلساتك وكل الأحداث المهمة في مكان واحد.
                        </p>
                        <div className="flex gap-3">
                            <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white h-12 px-8 rounded-xl font-bold shadow-lg shadow-blue-500/20 border-0">
                                <Link to="/dashboard/tasks/events/new">
                                    <Plus className="ml-2 h-5 w-5" />
                                    حدث جديد
                                </Link>
                            </Button>
                            <Button className="bg-white text-slate-900 hover:bg-slate-100 h-12 px-8 rounded-xl font-bold shadow-lg border-0 transition-all hover:scale-105">
                                <CalendarIcon className="ml-2 h-5 w-5" />
                                عرض التقويم
                            </Button>
                        </div>
                    </div>
                    {/* Abstract Visual Decoration */}
                    <div className="hidden md:block relative w-64 h-64">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
                        <div className="absolute inset-4 bg-blue-900 rounded-2xl border border-white/10 flex items-center justify-center transform rotate-6 shadow-2xl">
                            <CalendarIcon className="h-24 w-24 text-blue-400" />
                        </div>
                        <div className="absolute inset-4 bg-blue-900/80 rounded-2xl border border-white/10 flex items-center justify-center transform -rotate-6 backdrop-blur-sm">
                            <Clock className="h-24 w-24 text-indigo-400" />
                        </div>
                    </div>
                </div>

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* MAIN EVENTS LIST */}
                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                            <div className="p-6 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-navy text-xl">قائمة الفعاليات</h3>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => setActiveTab('upcoming')}
                                        className={activeTab === 'upcoming' ? "bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4" : "bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full px-4"}
                                    >
                                        القادمة
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => setActiveTab('past')}
                                        className={activeTab === 'past' ? "bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4" : "bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full px-4"}
                                    >
                                        السابقة
                                    </Button>
                                </div>
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
                                                <span>حدث خطأ أثناء تحميل الأحداث: {error?.message || 'خطأ غير معروف'}</span>
                                                <Button onClick={() => refetch()} variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                                                    إعادة المحاولة
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
                                                <Plus className="ml-2 h-4 w-4" />
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
                                                        {new Date(event.date).toLocaleDateString('ar-SA', { month: 'short' })}
                                                    </div>
                                                    <div className="text-xl font-bold text-navy pt-1">
                                                        {new Date(event.date).toLocaleDateString('en-US', { day: 'numeric' })}
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
                                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy">
                                                <MoreHorizontal className="h-5 w-5" />
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-2 space-x-reverse">
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
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => handleRSVP(event.id, 'declined')} className="text-red-600 hover:bg-red-50 border-red-200">
                                                    اعتذار
                                                </Button>
                                                <Button size="sm" onClick={() => handleRSVP(event.id, 'accepted')} className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                                                    تأكيد الحضور
                                                </Button>
                                                <Link to={`/dashboard/tasks/events/${event.id}` as any}>
                                                    <Button variant="ghost" size="sm">
                                                        التفاصيل
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
                                    <ChevronLeft className="h-4 w-4 mr-2" />
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
        </>
    )
}
