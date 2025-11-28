import { useState, useMemo } from 'react'
import { TasksSidebar } from './tasks-sidebar'
import {
    Clock, MoreHorizontal, Plus,
    Calendar as CalendarIcon, Search, AlertCircle, ChevronLeft, Bell
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
import { useReminders, useDeleteReminder } from '@/hooks/useRemindersAndEvents'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

export function RemindersView() {
    const [activeTab, setActiveTab] = useState('upcoming')
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedReminderIds, setSelectedReminderIds] = useState<string[]>([])

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

    // Fetch reminders
    const { data: remindersData, isLoading, isError, error, refetch } = useReminders(filters)
    const { mutateAsync: deleteReminder } = useDeleteReminder()

    // Transform API data
    const reminders = useMemo(() => {
        if (!remindersData?.data) return []

        return remindersData.data.map((reminder: any) => ({
            id: reminder._id,
            title: reminder.title || reminder.description || 'تذكير بدون عنوان',
            date: reminder.reminderDate ? new Date(reminder.reminderDate).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'غير محدد',
            time: reminder.reminderDate ? new Date(reminder.reminderDate).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'غير محدد',
            priority: reminder.priority || 'medium',
            status: reminder.status || 'pending',
            _id: reminder._id,
        }))
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

    const handleDeleteSelected = async () => {
        if (selectedReminderIds.length === 0) return

        if (confirm(`هل أنت متأكد من حذف ${selectedReminderIds.length} تذكير؟`)) {
            try {
                // Loop delete since no bulk API yet
                await Promise.all(selectedReminderIds.map(id => deleteReminder(id)))
                toast.success(`تم حذف ${selectedReminderIds.length} تذكير بنجاح`)
                setIsSelectionMode(false)
                setSelectedReminderIds([])
            } catch (error) {
                console.error("Failed to delete reminders", error)
                toast.error("حدث خطأ أثناء حذف بعض التذكيرات")
            }
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
                        <h2 className="text-3xl font-bold mb-4 leading-tight">تذكيراتك المهمة</h2>
                        <p className="text-emerald-200 text-lg mb-8 leading-relaxed">
                            لا تفوت أي موعد مهم. تابع تذكيراتك الشخصية والمهنية وابقَ على اطلاع دائم بكل ما يهمك.
                        </p>
                        <div className="flex gap-3">
                            <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-8 rounded-xl font-bold shadow-lg shadow-emerald-500/20 border-0">
                                <Link to="/dashboard/tasks/reminders/new">
                                    <Plus className="ml-2 h-5 w-5" />
                                    تذكير جديد
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
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
                        <div className="absolute inset-4 bg-emerald-900 rounded-2xl border border-white/10 flex items-center justify-center transform rotate-6 shadow-2xl">
                            <Bell className="h-24 w-24 text-emerald-400" />
                        </div>
                        <div className="absolute inset-4 bg-emerald-900/80 rounded-2xl border border-white/10 flex items-center justify-center transform -rotate-6 backdrop-blur-sm">
                            <Clock className="h-24 w-24 text-teal-400" />
                        </div>
                    </div>
                </div>

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* MAIN REMINDERS LIST */}
                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                            <div className="p-6 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-navy text-xl">قائمة التذكيرات</h3>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => setActiveTab('upcoming')}
                                        className={activeTab === 'upcoming' ? "bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4" : "bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full px-4"}
                                    >
                                        القادمة
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => setActiveTab('past')}
                                        className={activeTab === 'past' ? "bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4" : "bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full px-4"}
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
                                                <div className="w-16 h-16 rounded-2xl bg-white flex flex-col items-center justify-center shadow-sm border border-slate-100 text-center overflow-hidden">
                                                    <div className="bg-emerald-500 text-white text-[10px] w-full py-0.5 font-bold">
                                                        {new Date(reminder.date).toLocaleDateString('ar-SA', { month: 'short' })}
                                                    </div>
                                                    <div className="text-xl font-bold text-navy pt-1">
                                                        {new Date(reminder.date).toLocaleDateString('en-US', { day: 'numeric' })}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-navy text-lg">{reminder.title}</h4>
                                                        <Badge variant="outline" className={`
                                                            ${reminder.priority === 'high' ? 'border-red-200 text-red-700 bg-red-50' :
                                                                reminder.priority === 'medium' ? 'border-amber-200 text-amber-700 bg-amber-50' :
                                                                    'border-emerald-200 text-emerald-700 bg-emerald-50'}
                                                        `}>
                                                            {reminder.priority === 'high' ? 'عالية' : reminder.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-slate-500 text-sm flex items-center gap-2">
                                                        <Clock className="h-3 w-3" />
                                                        {reminder.time}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy">
                                                <MoreHorizontal className="h-5 w-5" />
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                            <div className="flex items-center gap-2">
                                                {/* Additional info if needed */}
                                            </div>
                                            <Link to={`/dashboard/tasks/reminders/${reminder.id}` as any}>
                                                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20">
                                                    التفاصيل
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
        </>
    )
}
