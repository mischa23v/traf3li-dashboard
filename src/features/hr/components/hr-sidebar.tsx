import { useState } from 'react'
import {
    Clock, Bell, MapPin, Calendar as CalendarIcon,
    Plus, CheckSquare, Trash2, List, X, ChevronRight,
    Users, FileText, DollarSign, ClipboardCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

interface HRSidebarProps {
    context?: 'employees' | 'leaves' | 'attendance' | 'salaries' | 'payroll' | 'evaluations'
    isSelectionMode?: boolean
    onToggleSelectionMode?: () => void
    selectedCount?: number
    onDeleteSelected?: () => void
}

export function HRSidebar({
    context = 'employees',
    isSelectionMode = false,
    onToggleSelectionMode,
    selectedCount = 0,
    onDeleteSelected
}: HRSidebarProps) {
    const [activeTab, setActiveTab] = useState<'calendar' | 'notifications'>('calendar')

    const links: Record<string, { create: string; viewAll: string; icon: React.ElementType }> = {
        employees: {
            create: '/dashboard/hr/employees/new',
            viewAll: '/dashboard/hr/employees',
            icon: Users
        },
        leaves: {
            create: '/dashboard/hr/leaves/new',
            viewAll: '/dashboard/hr/leaves',
            icon: FileText
        },
        attendance: {
            create: '/dashboard/hr/attendance/new',
            viewAll: '/dashboard/hr/attendance',
            icon: ClipboardCheck
        },
        salaries: {
            create: '/dashboard/hr/salaries/new',
            viewAll: '/dashboard/hr/salaries',
            icon: DollarSign
        },
        payroll: {
            create: '/dashboard/hr/payroll/new',
            viewAll: '/dashboard/hr/payroll',
            icon: DollarSign
        },
        evaluations: {
            create: '/dashboard/hr/evaluations/new',
            viewAll: '/dashboard/hr/evaluations',
            icon: ClipboardCheck
        }
    }

    const currentLinks = links[context]

    const contextLabels: Record<string, { create: string; viewAll: string }> = {
        employees: { create: 'إضافة موظف', viewAll: 'جميع الموظفين' },
        leaves: { create: 'طلب إجازة', viewAll: 'جميع الإجازات' },
        attendance: { create: 'تسجيل حضور', viewAll: 'سجل الحضور' },
        salaries: { create: 'إضافة راتب', viewAll: 'جميع الرواتب' },
        payroll: { create: 'إنشاء مسير', viewAll: 'جميع المسيرات' },
        evaluations: { create: 'إنشاء تقييم', viewAll: 'جميع التقييمات' }
    }

    const labels = contextLabels[context]

    // HR-specific events
    const hrEvents = [
        { time: '09:00', period: 'صباحاً', title: 'اجتماع الموظفين', location: 'قاعة الاجتماعات', color: 'emerald' },
        { time: '11:00', period: 'صباحاً', title: 'مقابلة توظيف', location: 'المكتب الرئيسي', color: 'purple' },
        { time: '02:00', period: 'مساءً', title: 'تقييم أداء ربع سنوي', location: 'مكتب الموارد البشرية', color: 'blue' }
    ]

    return (
        <div className="space-y-8 lg:col-span-1">

            {/* QUICK ACTIONS WIDGET */}
            <div className="bg-gradient-to-br from-emerald-900 to-slate-900 rounded-3xl p-6 shadow-xl shadow-emerald-900/20 ring-1 ring-white/10 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>

                {/* Header */}
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <h3 className="font-bold text-lg text-white">إجراءات سريعة</h3>
                </div>

                {/* Content */}
                <div className="relative z-10 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Create Button - White + Green Text + Glow */}
                    <Button asChild className="bg-white hover:bg-emerald-50 text-emerald-600 h-auto py-6 flex flex-col items-center justify-center gap-2 rounded-3xl shadow-lg shadow-white/10 transition-all duration-300 hover:scale-[1.02] border-0">
                        <Link to={currentLinks.create}>
                            <Plus className="h-7 w-7" />
                            <span className="text-sm font-bold">{labels.create}</span>
                        </Link>
                    </Button>

                    {/* Select Button - White + Dark Text + Glow */}
                    <Button
                        variant="ghost"
                        className={cn(
                            "h-auto py-6 flex flex-col items-center justify-center gap-2 rounded-3xl transition-all duration-300 hover:scale-[1.02] shadow-lg",
                            isSelectionMode
                                ? "bg-emerald-100 text-emerald-800 ring-2 ring-emerald-400 shadow-emerald-500/20"
                                : "bg-white hover:bg-slate-50 text-emerald-950 shadow-white/10"
                        )}
                        onClick={onToggleSelectionMode}
                    >
                        {isSelectionMode ? <X className="h-6 w-6" /> : <CheckSquare className="h-6 w-6" />}
                        <span className="text-sm font-bold">{isSelectionMode ? 'إلغاء' : 'تحديد'}</span>
                    </Button>

                    {/* Delete Button - White + Red Text + Glow */}
                    <Button
                        variant="ghost"
                        className="bg-white hover:bg-red-50 text-red-500 hover:text-red-600 h-auto py-6 flex flex-col items-center justify-center gap-2 rounded-3xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-white/10"
                        onClick={onDeleteSelected}
                        disabled={!isSelectionMode || selectedCount === 0}
                    >
                        <Trash2 className="h-6 w-6" />
                        <span className="text-sm font-bold">
                            {selectedCount > 0 ? `حذف (${selectedCount})` : 'حذف'}
                        </span>
                    </Button>

                    {/* View All Button - White + Dark Text + Glow */}
                    <Button asChild variant="ghost" className="bg-white hover:bg-slate-50 text-emerald-950 h-auto py-6 flex flex-col items-center justify-center gap-2 rounded-3xl transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-white/10">
                        <Link to={currentLinks.viewAll}>
                            <List className="h-6 w-6" />
                            <span className="text-sm font-bold">{labels.viewAll}</span>
                        </Link>
                    </Button>
                </div>
            </div>

            {/* MERGED CALENDAR & AGENDA WIDGET */}
            <div className="bg-[#022c22] rounded-3xl p-6 shadow-lg shadow-emerald-900/20 group hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>

                {/* Decorative Lines */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>

                <div className="flex justify-between items-center mb-6 relative z-10">
                    <div className="flex bg-[#033a2d] p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('calendar')}
                            className={cn(
                                "px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200",
                                activeTab === 'calendar'
                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                    : "text-emerald-200 hover:text-white hover:bg-emerald-500/10"
                            )}
                        >
                            التقويم
                        </button>
                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={cn(
                                "px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200",
                                activeTab === 'notifications'
                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                    : "text-emerald-200 hover:text-white hover:bg-emerald-500/10"
                            )}
                        >
                            التنبيهات
                        </button>
                    </div>
                    {activeTab === 'calendar' && (
                        <Badge className="bg-emerald-500/20 text-emerald-100 border-0 rounded-full px-3 hover:bg-emerald-500/30">نوفمبر</Badge>
                    )}
                </div>

                {/* Inner White Container */}
                <div className="bg-[#f8fafc] rounded-2xl p-4 relative z-10 min-h-[300px] border border-white/5 shadow-inner">
                    {activeTab === 'calendar' ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Calendar Strip */}
                            <div className="grid grid-cols-5 gap-2 text-center mb-8">
                                {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'].map((day, i) => (
                                    <div key={i} className={`rounded-xl p-2 transition-all duration-200 cursor-pointer ${i === 1 ? 'bg-[#022c22] text-white shadow-lg shadow-emerald-900/20 scale-105' : 'hover:bg-white text-slate-500'}`}>
                                        <div className={`text-[10px] mb-1 ${i === 1 ? 'text-emerald-200' : ''}`}>{day}</div>
                                        <div className="font-bold text-lg">{19 + i}</div>
                                        {i === 1 && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mx-auto mt-1"></div>}
                                    </div>
                                ))}
                            </div>

                            {/* Timeline / Agenda */}
                            <div className="space-y-6 relative">
                                {/* Vertical Line */}
                                <div className="absolute top-2 bottom-2 right-[3.5rem] w-[2px] bg-slate-200"></div>

                                {hrEvents.map((event, i) => (
                                    <div key={i} className="flex gap-4 relative group">
                                        <div className="w-14 text-center shrink-0 pt-1">
                                            <div className={`text-sm font-bold text-slate-700 group-hover:text-${event.color}-600 transition-colors`}>{event.time}</div>
                                            <div className="text-[10px] text-slate-400">{event.period}</div>
                                        </div>
                                        <div className={`absolute right-[3.25rem] top-2 w-3 h-3 bg-${event.color}-500 rounded-full border-2 border-white shadow-sm z-10`}></div>
                                        <div className={`flex-1 bg-white rounded-xl p-3 border-r-4 border-${event.color}-500 shadow-sm hover:shadow-md transition-all`}>
                                            <div className="font-bold text-slate-800 text-sm mb-1">{event.title}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {event.location}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button variant="ghost" className="w-full mt-6 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 group">
                                <span>عرض الجدول الكامل</span>
                                <ChevronRight className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {[
                                { title: 'طلب إجازة جديد', desc: 'أحمد محمد طلب إجازة لمدة 3 أيام' },
                                { title: 'انتهاء فترة التجربة', desc: 'فترة تجربة خالد ستنتهي بعد 5 أيام' },
                                { title: 'موعد تقييم الأداء', desc: 'تقييم الأداء الربع سنوي غداً' }
                            ].map((notification, i) => (
                                <div key={i} className="flex gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:shadow-md transition-all cursor-pointer group">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{notification.title}</p>
                                        <p className="text-xs text-slate-500 mt-1">{notification.desc}</p>
                                    </div>
                                </div>
                            ))}
                            <Button variant="ghost" className="w-full text-xs text-slate-400 hover:text-emerald-600 hover:bg-emerald-50">
                                عرض كل التنبيهات
                            </Button>
                        </div>
                    )}
                </div>
            </div>


        </div>
    )
}
