import { TasksSidebar } from './tasks-sidebar'
import {
    Clock, MapPin, MoreHorizontal, Plus, Calendar as CalendarIcon,
    Briefcase, Users, Video, Shield,
    ChevronLeft, Bell, Search
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

export function EventsView() {
    const events = [
        { id: '1', title: 'جلسة مرافعة - قضية 402', type: 'court', date: 'اليوم', time: '09:00 ص', location: 'المحكمة العامة - القاعة 4', attendees: ['أحمد المحامي', 'العميل'], status: 'upcoming' },
        { id: '2', title: 'اجتماع مجلس الإدارة', type: 'meeting', date: 'غداً', time: '02:00 م', location: 'المقر الرئيسي - قاعة الاجتماعات', attendees: ['مجلس الإدارة', 'المستشار القانوني'], status: 'confirmed' },
        { id: '3', title: 'ورشة عمل: التعديلات القانونية الجديدة', type: 'workshop', date: '24 نوفمبر', time: '10:00 ص', location: 'فندق الريتز كارلتون', attendees: ['الفريق القانوني'], status: 'registered' },
        { id: '4', title: 'مكالمة فيديو مع عميل دولي', type: 'online', date: '26 نوفمبر', time: '04:30 م', location: 'Zoom Meeting', attendees: ['العميل', 'الشريك المدير'], status: 'pending' },
    ]

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

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN (Widgets) */}
                    <TasksSidebar />

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* HERO CARD */}
                        <div className="bg-navy rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-navy/20 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="relative z-10 max-w-lg">
                                <h2 className="text-3xl font-bold mb-4 leading-tight">جدول الفعاليات والجلسات</h2>
                                <p className="text-blue-200 text-lg mb-8 leading-relaxed">
                                    نظّم وقتك بكفاءة. تابع جلسات المحكمة، الاجتماعات، والفعاليات القانونية في واجهة واحدة متكاملة.
                                </p>
                                <div className="flex gap-3">
                                    <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white h-12 px-8 rounded-xl font-bold shadow-lg shadow-blue-500/20 border-0">
                                        <Link to="/dashboard/tasks/events/new">
                                            <Plus className="ml-2 h-5 w-5" />
                                            فعالية جديدة
                                        </Link>
                                    </Button>
                                    <Button className="bg-white text-slate-900 hover:bg-slate-100 h-12 px-8 rounded-xl font-bold shadow-lg border-0 transition-all hover:scale-105">
                                        <CalendarIcon className="ml-2 h-5 w-5" />
                                        مزامنة التقويم
                                    </Button>
                                </div>
                            </div>
                            {/* Abstract Visual Decoration */}
                            <div className="hidden md:block relative w-64 h-64">
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
                                <div className="absolute inset-4 bg-navy rounded-2xl border border-white/10 flex items-center justify-center transform rotate-6 shadow-2xl">
                                    <CalendarIcon className="h-24 w-24 text-blue-400" />
                                </div>
                                <div className="absolute inset-4 bg-navy/80 rounded-2xl border border-white/10 flex items-center justify-center transform -rotate-6 backdrop-blur-sm">
                                    <Users className="h-24 w-24 text-purple-400" />
                                </div>
                            </div>
                        </div>

                        {/* MAIN EVENTS LIST */}
                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                            <div className="p-6 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-navy text-xl">الفعاليات القادمة</h3>
                                <div className="flex gap-2">
                                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4">الكل</Button>
                                    <Button size="sm" variant="ghost" className="text-slate-500 hover:text-navy rounded-full px-4">الجلسات</Button>
                                    <Button size="sm" variant="ghost" className="text-slate-500 hover:text-navy rounded-full px-4">الاجتماعات</Button>
                                </div>
                            </div>

                            <div className="p-4 space-y-4">
                                {events.map((event) => (
                                    <div key={event.id} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100 hover:border-blue-200 transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-4 items-center">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${event.type === 'court' ? 'bg-red-50 text-red-500' :
                                                    event.type === 'meeting' ? 'bg-purple-50 text-purple-500' :
                                                        event.type === 'online' ? 'bg-blue-50 text-blue-500' :
                                                            'bg-emerald-50 text-emerald-500'
                                                    }`}>
                                                    {event.type === 'court' ? <Shield className="h-6 w-6" /> :
                                                        event.type === 'meeting' ? <Users className="h-6 w-6" /> :
                                                            event.type === 'online' ? <Video className="h-6 w-6" /> :
                                                                <Briefcase className="h-6 w-6" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-navy text-lg">{event.title}</h4>
                                                        {event.status === 'upcoming' && (
                                                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 rounded-md px-2">قادم</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-500 text-sm flex items-center gap-2">
                                                        <Clock className="h-3 w-3" />
                                                        {event.date} - {event.time}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy">
                                                <MoreHorizontal className="h-5 w-5" />
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                            <div className="flex items-center gap-6">
                                                <div className="text-center">
                                                    <div className="text-xs text-slate-400 mb-1">الموقع</div>
                                                    <div className="font-bold text-navy flex items-center gap-1">
                                                        <MapPin className="h-3 w-3 text-slate-400" />
                                                        {event.location}
                                                    </div>
                                                </div>
                                                <div className="text-center hidden sm:block">
                                                    <div className="text-xs text-slate-400 mb-1">الحضور</div>
                                                    <div className="flex -space-x-2 space-x-reverse justify-center">
                                                        {event.attendees.map((attendee, i) => (
                                                            <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] text-slate-600 font-bold" title={attendee}>
                                                                {attendee.charAt(0)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link to={`/dashboard/tasks/events/${event.id}` as any}>
                                                    <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg px-4">
                                                        تفاصيل
                                                    </Button>
                                                </Link>
                                                <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6 shadow-lg shadow-blue-500/20">
                                                    انضمام
                                                </Button>
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
                </div>
            </Main>
        </>
    )
}
