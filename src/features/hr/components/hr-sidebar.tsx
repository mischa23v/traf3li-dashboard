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
    const [currentDate] = useState(new Date())

    const quickActions = [
        {
            label: 'إضافة موظف',
            href: '/dashboard/hr/employees/new',
            icon: Users,
            show: context === 'employees'
        },
        {
            label: 'طلب إجازة',
            href: '/dashboard/hr/leaves/new',
            icon: FileText,
            show: context === 'leaves'
        },
        {
            label: 'تسجيل حضور',
            href: '/dashboard/hr/attendance/new',
            icon: Clock,
            show: context === 'attendance'
        },
        {
            label: 'إنشاء راتب',
            href: '/dashboard/hr/salaries/new',
            icon: DollarSign,
            show: context === 'salaries'
        },
        {
            label: 'إنشاء مسير',
            href: '/dashboard/hr/payroll/new',
            icon: DollarSign,
            show: context === 'payroll'
        },
        {
            label: 'إنشاء تقييم',
            href: '/dashboard/hr/evaluations/new',
            icon: ClipboardCheck,
            show: context === 'evaluations'
        }
    ]

    // Calendar strip data
    const generateCalendarDays = () => {
        const days = []
        const today = new Date()
        for (let i = -2; i <= 4; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() + i)
            days.push({
                day: date.toLocaleDateString('ar-SA', { weekday: 'short' }),
                date: date.getDate(),
                isToday: i === 0,
                fullDate: date
            })
        }
        return days
    }

    const calendarDays = generateCalendarDays()

    return (
        <div className="space-y-6">
            {/* Quick Actions Widget */}
            <div className="bg-gradient-to-br from-emerald-900 to-slate-900 rounded-3xl p-6 shadow-xl shadow-emerald-900/20 ring-1 ring-white/10 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500/10 rounded-full blur-xl" />

                <div className="relative z-10">
                    <h3 className="text-lg font-semibold text-white mb-4">إجراءات سريعة</h3>

                    <div className="grid grid-cols-2 gap-3">
                        {quickActions.filter(a => a.show).map((action, index) => (
                            <Link key={index} to={action.href}>
                                <Button
                                    variant="ghost"
                                    className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10"
                                >
                                    <action.icon className="w-5 h-5" />
                                    <span className="text-xs">{action.label}</span>
                                </Button>
                            </Link>
                        ))}

                        <Button
                            variant="ghost"
                            onClick={onToggleSelectionMode}
                            className={cn(
                                "w-full h-auto py-4 flex flex-col items-center gap-2 rounded-xl border border-white/10",
                                isSelectionMode
                                    ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                                    : "bg-white/5 hover:bg-white/10 text-white"
                            )}
                        >
                            <CheckSquare className="w-5 h-5" />
                            <span className="text-xs">{isSelectionMode ? 'إلغاء التحديد' : 'تحديد'}</span>
                        </Button>

                        {isSelectionMode && selectedCount > 0 && (
                            <Button
                                variant="ghost"
                                onClick={onDeleteSelected}
                                className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl border border-red-500/30"
                            >
                                <Trash2 className="w-5 h-5" />
                                <span className="text-xs">حذف ({selectedCount})</span>
                            </Button>
                        )}

                        <Link to={`/dashboard/hr/${context}`}>
                            <Button
                                variant="ghost"
                                className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10"
                            >
                                <List className="w-5 h-5" />
                                <span className="text-xs">عرض الكل</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Calendar Widget */}
            <div className="bg-[#022c22] rounded-3xl p-6 shadow-lg shadow-emerald-900/20">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">التقويم</h3>
                    <span className="text-sm text-white/60">
                        {currentDate.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
                    </span>
                </div>

                {/* Calendar strip */}
                <div className="flex items-center justify-between gap-1 mb-6">
                    {calendarDays.map((day, index) => (
                        <div
                            key={index}
                            className={cn(
                                "flex flex-col items-center p-2 rounded-xl cursor-pointer transition-all",
                                day.isToday
                                    ? "bg-emerald-500 text-white"
                                    : "text-white/60 hover:bg-white/5"
                            )}
                        >
                            <span className="text-[10px] mb-1">{day.day}</span>
                            <span className={cn(
                                "text-sm font-semibold",
                                day.isToday && "text-white"
                            )}>
                                {day.date}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Mini timeline */}
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">بداية الدوام</p>
                            <p className="text-xs text-white/50">08:00 صباحاً</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">نهاية الدوام</p>
                            <p className="text-xs text-white/50">05:00 مساءً</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* HR Navigation Links */}
            <div className="bg-slate-900/50 rounded-3xl p-6 border border-white/5">
                <h3 className="text-lg font-semibold text-white mb-4">التنقل السريع</h3>
                <div className="space-y-2">
                    {[
                        { label: 'الموظفين', href: '/dashboard/hr/employees', icon: Users, active: context === 'employees' },
                        { label: 'الإجازات', href: '/dashboard/hr/leaves', icon: FileText, active: context === 'leaves' },
                        { label: 'الحضور', href: '/dashboard/hr/attendance', icon: Clock, active: context === 'attendance' },
                        { label: 'الرواتب', href: '/dashboard/hr/salaries', icon: DollarSign, active: context === 'salaries' },
                        { label: 'مسيرات الرواتب', href: '/dashboard/hr/payroll', icon: DollarSign, active: context === 'payroll' },
                        { label: 'التقييمات', href: '/dashboard/hr/evaluations', icon: ClipboardCheck, active: context === 'evaluations' },
                    ].map((item, index) => (
                        <Link key={index} to={item.href}>
                            <div className={cn(
                                "flex items-center gap-3 p-3 rounded-xl transition-all",
                                item.active
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : "text-white/60 hover:bg-white/5 hover:text-white"
                            )}>
                                <item.icon className="w-5 h-5" />
                                <span className="text-sm font-medium">{item.label}</span>
                                <ChevronRight className="w-4 h-4 mr-auto rtl:mr-0 rtl:ml-auto rotate-180 rtl:rotate-0" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
