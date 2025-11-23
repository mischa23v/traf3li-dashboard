import {
    Clock, MapPin, MoreHorizontal, Plus, Calendar as CalendarIcon,
    Briefcase, Users, Video, Shield,
    ChevronLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function EventsDashboard() {
    // Mock Data for Events
    const events = [
        { id: '1', title: 'جلسة مرافعة - قضية 402', type: 'court', date: 'اليوم', time: '09:00 ص', location: 'المحكمة العامة - القاعة 4', attendees: ['أحمد المحامي', 'العميل'], status: 'upcoming' },
        { id: '2', title: 'اجتماع مجلس الإدارة', type: 'meeting', date: 'غداً', time: '02:00 م', location: 'المقر الرئيسي - قاعة الاجتماعات', attendees: ['مجلس الإدارة', 'المستشار القانوني'], status: 'confirmed' },
        { id: '3', title: 'ورشة عمل: التعديلات القانونية الجديدة', type: 'workshop', date: '24 نوفمبر', time: '10:00 ص', location: 'فندق الريتز كارلتون', attendees: ['الفريق القانوني'], status: 'registered' },
        { id: '4', title: 'مكالمة فيديو مع عميل دولي', type: 'online', date: '26 نوفمبر', time: '04:30 م', location: 'Zoom Meeting', attendees: ['العميل', 'الشريك المدير'], status: 'pending' },
    ]

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-['IBM_Plex_Sans_Arabic'] p-6 lg:p-8" dir="rtl">

            {/* MAIN GRID LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN (Widgets) */}
                <div className="space-y-8 lg:col-span-1">

                    {/* EVENTS STATS WIDGET */}
                    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 group hover:shadow-md transition-all duration-300">
                        <div className="p-6 pb-0 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-navy">ملخص الفعاليات</h3>
                            <div className="bg-blue-50 p-2 rounded-full">
                                <CalendarIcon className="h-5 w-5 text-blue-500" />
                            </div>
                        </div>
                        <div className="p-6 text-center">
                            <div className="relative w-40 h-40 mx-auto mb-6 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90 drop-shadow-lg">
                                    <circle cx="80" cy="80" r="70" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                                    <circle cx="80" cy="80" r="70" stroke="#3b82f6" strokeWidth="12" fill="transparent" strokeDasharray="439.8" strokeDashoffset="150" strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-bold text-navy">8</span>
                                    <span className="text-sm text-slate-400 mt-1">فعاليات هذا الأسبوع</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-slate-50 rounded-xl p-3">
                                    <div className="text-navy font-bold text-lg">3</div>
                                    <div className="text-xs text-slate-500">جلسات محكمة</div>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-3">
                                    <div className="text-navy font-bold text-lg">5</div>
                                    <div className="text-xs text-slate-500">اجتماعات</div>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 rounded-xl h-12 font-bold">
                                <Plus className="h-4 w-4 ml-2" />
                                إضافة فعالية سريعة
                            </Button>
                        </div>
                    </div>

                    {/* TODAY'S AGENDA WIDGET */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-navy text-lg">أجندة اليوم</h3>
                            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-3">نشط</Badge>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-4 relative pb-4 border-b border-slate-50 last:border-0">
                                <div className="w-14 text-center shrink-0">
                                    <div className="text-sm font-bold text-navy">09:00</div>
                                    <div className="text-xs text-slate-400">صباحاً</div>
                                </div>
                                <div className="flex-1 bg-blue-50 rounded-xl p-3 border-r-4 border-blue-500">
                                    <div className="font-bold text-navy text-sm mb-1">جلسة مرافعة</div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        المحكمة العامة
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4 relative pb-4 border-b border-slate-50 last:border-0">
                                <div className="w-14 text-center shrink-0">
                                    <div className="text-sm font-bold text-navy">02:00</div>
                                    <div className="text-xs text-slate-400">مساءً</div>
                                </div>
                                <div className="flex-1 bg-purple-50 rounded-xl p-3 border-r-4 border-purple-500">
                                    <div className="font-bold text-navy text-sm mb-1">غداء عمل</div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        مطعم الشرفة
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" className="w-full mt-2 text-slate-500 hover:text-navy">
                            عرض الجدول الكامل
                        </Button>
                    </div>

                </div>

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
                                <Button className="bg-blue-500 hover:bg-blue-600 text-white h-12 px-8 rounded-xl font-bold shadow-lg shadow-blue-500/20 border-0">
                                    <Plus className="ml-2 h-5 w-5" />
                                    فعالية جديدة
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
                                            <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg px-4">
                                                تفاصيل
                                            </Button>
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
        </div>
    )
}
