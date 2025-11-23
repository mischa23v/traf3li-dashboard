import {
    Clock, AlertCircle, MoreHorizontal, Plus, FileText,
    Briefcase, User, Download, Smartphone, Shield, Zap,
    ChevronLeft, Bell, Calendar, CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function RemindersDashboard() {
    // Mock Data for Reminders
    const reminders = [
        { id: '1', title: 'انتهاء مهلة الاستئناف - قضية 402', type: 'deadline', date: 'اليوم', time: '14:00', priority: 'critical', status: 'pending' },
        { id: '2', title: 'تجديد رخصة المحاماة', type: 'admin', date: 'بعد يومين', time: '09:00', priority: 'high', status: 'pending' },
        { id: '3', title: 'سداد رسوم الخبراء', type: 'payment', date: '25 نوفمبر', time: '11:30', priority: 'medium', status: 'completed' },
        { id: '4', title: 'متابعة تنفيذ الحكم', type: 'followup', date: '28 نوفمبر', time: '10:00', priority: 'low', status: 'pending' },
    ]

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-['IBM_Plex_Sans_Arabic'] p-6 lg:p-8" dir="rtl">

            {/* MAIN GRID LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN (Widgets) */}
                <div className="space-y-8 lg:col-span-1">

                    {/* REMINDER STATS WIDGET */}
                    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 group hover:shadow-md transition-all duration-300">
                        <div className="p-6 pb-0 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-navy">حالة التذكيرات</h3>
                            <div className="bg-emerald-50 p-2 rounded-full">
                                <Bell className="h-5 w-5 text-emerald-500" />
                            </div>
                        </div>
                        <div className="p-6 text-center">
                            <div className="relative w-40 h-40 mx-auto mb-6 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90 drop-shadow-lg">
                                    <circle cx="80" cy="80" r="70" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                                    <circle cx="80" cy="80" r="70" stroke="#10b981" strokeWidth="12" fill="transparent" strokeDasharray="439.8" strokeDashoffset="110" strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-bold text-navy">12</span>
                                    <span className="text-sm text-slate-400 mt-1">تذكير نشط</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-slate-50 rounded-xl p-3">
                                    <div className="text-red-500 font-bold text-lg">3</div>
                                    <div className="text-xs text-slate-500">عاجلة</div>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-3">
                                    <div className="text-emerald-500 font-bold text-lg">9</div>
                                    <div className="text-xs text-slate-500">عادية</div>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full border-emerald-500 text-emerald-600 hover:bg-emerald-50 rounded-xl h-12 font-bold">
                                <CheckCircle2 className="h-4 w-4 ml-2" />
                                تحديد الكل كمقروء
                            </Button>
                        </div>
                    </div>

                    {/* UPCOMING CALENDAR WIDGET */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-navy text-lg">تقويم الأسبوع</h3>
                            <Badge className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-3">نوفمبر</Badge>
                        </div>
                        <div className="grid grid-cols-5 gap-2 text-center">
                            {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'].map((day, i) => (
                                <div key={i} className={`rounded-xl p-2 ${i === 1 ? 'bg-navy text-white shadow-lg shadow-navy/30' : 'hover:bg-slate-50'}`}>
                                    <div className={`text-[10px] mb-1 ${i === 1 ? 'text-blue-200' : 'text-slate-400'}`}>{day}</div>
                                    <div className="font-bold text-lg">{19 + i}</div>
                                    {i === 1 && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mx-auto mt-1"></div>}
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-navy text-sm">اجتماع الفريق</div>
                                    <div className="text-xs text-slate-400">02:00 م - غرفة الاجتماعات</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN (Main Content) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* HERO CARD */}
                    <div className="bg-navy rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-navy/20 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="relative z-10 max-w-lg">
                            <h2 className="text-3xl font-bold mb-4 leading-tight">نظام التذكيرات الذكي</h2>
                            <p className="text-blue-200 text-lg mb-8 leading-relaxed">
                                لا تفوت أي موعد مهم. نظامنا ينبهك بالمواعيد القانونية، الجلسات، والمهام الإدارية قبل وقت كافٍ.
                            </p>
                            <div className="flex gap-3">
                                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-8 rounded-xl font-bold shadow-lg shadow-emerald-500/20 border-0">
                                    <Plus className="ml-2 h-5 w-5" />
                                    تذكير جديد
                                </Button>
                                <Button className="bg-white text-slate-900 hover:bg-slate-100 h-12 px-8 rounded-xl font-bold shadow-lg border-0 transition-all hover:scale-105">
                                    <AlertCircle className="ml-2 h-5 w-5" />
                                    الإعدادات
                                </Button>
                            </div>
                        </div>
                        {/* Abstract Visual Decoration */}
                        <div className="hidden md:block relative w-64 h-64">
                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-blue-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
                            <div className="absolute inset-4 bg-navy rounded-2xl border border-white/10 flex items-center justify-center transform rotate-6 shadow-2xl">
                                <Bell className="h-24 w-24 text-emerald-400" />
                            </div>
                            <div className="absolute inset-4 bg-navy/80 rounded-2xl border border-white/10 flex items-center justify-center transform -rotate-6 backdrop-blur-sm">
                                <Clock className="h-24 w-24 text-blue-400" />
                            </div>
                        </div>
                    </div>

                    {/* MAIN REMINDERS LIST */}
                    <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                        <div className="p-6 pb-2 flex justify-between items-center">
                            <h3 className="font-bold text-navy text-xl">التذكيرات القادمة</h3>
                            <div className="flex gap-2">
                                <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4">الكل</Button>
                                <Button size="sm" variant="ghost" className="text-slate-500 hover:text-navy rounded-full px-4">القضائية</Button>
                                <Button size="sm" variant="ghost" className="text-slate-500 hover:text-navy rounded-full px-4">الإدارية</Button>
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
                            {reminders.map((reminder) => (
                                <div key={reminder.id} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100 hover:border-emerald-200 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-4 items-center">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${reminder.priority === 'critical' ? 'bg-red-50 text-red-500' :
                                                    reminder.priority === 'high' ? 'bg-orange-50 text-orange-500' :
                                                        'bg-blue-50 text-blue-500'
                                                }`}>
                                                {reminder.priority === 'critical' ? <AlertCircle className="h-6 w-6" /> : <Bell className="h-6 w-6" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-navy text-lg">{reminder.title}</h4>
                                                    {reminder.priority === 'critical' && (
                                                        <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0 rounded-md px-2">عاجل جداً</Badge>
                                                    )}
                                                </div>
                                                <p className="text-slate-500 text-sm flex items-center gap-2">
                                                    <Clock className="h-3 w-3" />
                                                    {reminder.date} - {reminder.time}
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
                                                <div className="text-xs text-slate-400 mb-1">النوع</div>
                                                <div className="font-bold text-navy">
                                                    {reminder.type === 'deadline' ? 'موعد نهائي' :
                                                        reminder.type === 'admin' ? 'إداري' :
                                                            reminder.type === 'payment' ? 'مالي' : 'متابعة'}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs text-slate-400 mb-1">الحالة</div>
                                                <div className={`font-bold ${reminder.status === 'completed' ? 'text-emerald-500' : 'text-slate-600'}`}>
                                                    {reminder.status === 'completed' ? 'مكتمل' : 'قيد الانتظار'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg px-4">
                                                تأجيل
                                            </Button>
                                            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20">
                                                إتمام
                                            </Button>
                                        </div>
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
            </div>
        </div>
    )
}
